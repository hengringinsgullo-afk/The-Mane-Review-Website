# Como Fazer Redeploy da Edge Function para Usar ALPHA_VANTAGE_API_KEY

## 🔍 Problema

A chave `ALPHA_VANTAGE_API_KEY` já está configurada no Supabase Vault desde 17 de setembro, mas a Edge Function pode não estar acessando ela porque precisa ser redeployada para pegar as variáveis de ambiente atualizadas.

## ✅ Solução: Redeploy da Edge Function

### Opção 1: Via Supabase CLI (Recomendado)

```bash
# 1. Certifique-se de estar no diretório do projeto
cd "C:\Users\roney\WebstormProjects\The Mane Review Website shared 1"

# 2. Faça login no Supabase (se ainda não fez)
npx supabase login

# 3. Link o projeto (se ainda não fez)
npx supabase link --project-ref dlpfkrqvptlgtampkqvd

# 4. Faça deploy da Edge Function
npx supabase functions deploy stock-data --project-ref dlpfkrqvptlgtampkqvd
```

### Opção 2: Via Supabase Dashboard

1. Acesse: https://supabase.com/dashboard/project/dlpfkrqvptlgtampkqvd/functions
2. Encontre a função `stock-data`
3. Clique em "Redeploy" ou "Deploy"
4. Aguarde o deploy completar

### Opção 3: Via GitHub/GitLab (se configurado)

Se você tem CI/CD configurado, faça commit e push das mudanças:

```bash
git add src/supabase/functions/stock-data/index.ts
git commit -m "Update Edge Function to use ALPHA_VANTAGE_API_KEY from Vault"
git push
```

## 🔍 Verificar se Está Funcionando

### 1. Teste o Endpoint de Health

Após o redeploy, teste o endpoint:

```bash
curl "https://dlpfkrqvptlgtampkqvd.supabase.co/functions/v1/stock-data/health" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRscGZrcnF2cHRsZ3RhbXBrcXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMzM3MzUsImV4cCI6MjA3MzcwOTczNX0.IuZBEKMBV1lXinuxB31zmNjGa79fsCk5ujFU4VIUfoo"
```

Você deve ver algo como:

```json
{
  "status": "ok",
  "timestamp": "2025-01-30T...",
  "cache_entries": 0,
  "rate_limit_remaining": 5,
  "api_key": {
    "configured": true,
    "source": "vault",
    "vault_exists": true,
    "vault_length": 16,
    "key_length": 16
  }
}
```

### 2. Verifique os Logs

No Supabase Dashboard:
1. Vá para: Edge Functions → `stock-data` → Logs
2. Procure por: `[API KEY] ✅ Using ALPHA_VANTAGE_API_KEY from Supabase Vault`
3. Se aparecer isso, a chave está sendo usada corretamente!

### 3. Teste na UI

1. Acesse a página de Watchlist
2. Adicione um símbolo (ex: PETR4.SA)
3. Verifique se aparece badge "Real" (verde) ao lado do símbolo
4. No console do navegador (F12), procure por: `[ALPHA VANTAGE] ✅ Real data received`

## 📝 Notas Importantes

- **Variáveis de Ambiente**: Edge Functions do Supabase só têm acesso às variáveis de ambiente do Vault após o deploy
- **Cache**: Se a chave estava funcionando antes mas parou, pode ser cache. Aguarde alguns minutos ou limpe o cache
- **Secrets do Vault**: Certifique-se de que o secret está no Vault e não apenas na tabela `app_secrets`

## 🆘 Troubleshooting

### Ainda mostra "source": "none"

1. Verifique se o secret está realmente no Vault:
   - Dashboard → Settings → Secrets
   - Deve aparecer `ALPHA_VANTAGE_API_KEY`

2. Verifique se o nome está correto:
   - Deve ser exatamente `ALPHA_VANTAGE_API_KEY` (case-sensitive)

3. Faça redeploy novamente após verificar

### Ainda mostra "source": "app_secrets"

- Isso significa que a chave do Vault não foi encontrada
- Verifique se o secret está configurado corretamente no Vault
- Faça redeploy após configurar

### Logs mostram "[API KEY] ❌ No valid API key found"

- O secret pode estar vazio ou com valor inválido
- Verifique o valor do secret no Vault
- Certifique-se de que o valor é a chave real da Alpha Vantage (não apenas "AlphaAdvantage")

---

**Última atualização**: O código agora verifica o Vault primeiro e mostra detalhes no endpoint `/health` sobre a origem da chave.

