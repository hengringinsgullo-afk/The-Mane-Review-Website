# Como Configurar a API da Alpha Vantage Corretamente

## 🔍 Problema Identificado

A Edge Function `stock-data` está funcionando, mas está usando dados de fallback porque o secret `AlphaAdvantage` na tabela `app_secrets` contém o valor `"AlphaAdvantage"` (o nome) em vez da chave real da API.

## ✅ Status Atual

- ✅ Edge Function `stock-data` está deployada e funcionando
- ✅ Health check: OK (rate_limit_remaining: 5)
- ✅ Endpoint respondendo corretamente
- ❌ API Key incorreta (valor = "AlphaAdvantage" em vez da chave real)
- ❌ Usando dados de fallback em vez de dados reais

## 🔧 Solução: Atualizar a API Key

### Passo 1: Obter sua chave da Alpha Vantage

Se você ainda não tem uma chave:
1. Acesse: https://www.alphavantage.co/support/#api-key
2. Preencha o formulário para obter uma chave gratuita
3. Você receberá uma chave como: `ABC123XYZ456` (exemplo)

### Passo 2: Atualizar o secret no banco de dados

Execute este SQL no Supabase SQL Editor:

```sql
UPDATE public.app_secrets 
SET value = 'SUA_CHAVE_REAL_AQUI',
    updated_at = NOW()
WHERE name = 'AlphaAdvantage';

-- Verificar se foi atualizado
SELECT name, 
       LENGTH(value) as key_length,
       CASE 
         WHEN value = 'AlphaAdvantage' THEN '❌ AINDA ERRADO'
         WHEN LENGTH(value) > 10 THEN '✅ CONFIGURADO'
         ELSE '❌ INVÁLIDO'
       END as status
FROM public.app_secrets 
WHERE name = 'AlphaAdvantage';
```

**IMPORTANTE**: Substitua `'SUA_CHAVE_REAL_AQUI'` pela sua chave real da Alpha Vantage!

### Passo 3: Testar a API

Depois de atualizar, teste se está funcionando:

```bash
# Health check
curl "https://dlpfkrqvptlgtampkqvd.supabase.co/functions/v1/stock-data/health" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRscGZrcnF2cHRsZ3RhbXBrcXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMzM3MzUsImV4cCI6MjA3MzcwOTczNX0.IuZBEKMBV1lXinuxB31zmNjGa79fsCk5ujFU4VIUfoo"

# Buscar cotação da Apple
curl "https://dlpfkrqvptlgtampkqvd.supabase.co/functions/v1/stock-data/quote/AAPL" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRscGZrcnF2cHRsZ3RhbXBrcXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMzM3MzUsImV4cCI6MjA3MzcwOTczNX0.IuZBEKMBV1lXinuxB31zmNjGa79fsCk5ujFU4VIUfoo"
```

## 📊 Como Saber se Está Usando Dados Reais

### Dados de Fallback (simulados):
- Preços variam aleatoriamente a cada requisição
- Sempre retorna dados, mesmo sem internet
- `marketCap`, `peRatio`, `dividendYield` são valores aproximados

### Dados Reais da Alpha Vantage:
- Preços são consistentes (cache de 5 minutos)
- Dados refletem o mercado real
- Pode retornar erro se API estiver indisponível

## 🎯 Alternativa: Usar Vault Secrets

Vejo que você tem um secret `ALPHA_VANTAGE_API_KEY` no Vault do Supabase. Para usar esse em vez da tabela `app_secrets`, você precisaria modificar a Edge Function para ler de `Deno.env.get('ALPHA_VANTAGE_API_KEY')` em vez de chamar `get_secret()`.

Mas a solução mais simples é atualizar o valor na tabela `app_secrets` como mostrado acima.

## 📝 Limites da API Gratuita

- **500 chamadas por dia**
- **5 chamadas por minuto**
- A Edge Function tem rate limiting automático
- Cache de 5 minutos para economizar chamadas

## 🔍 Verificação Final

Depois de configurar, verifique no console do navegador (F12) quando acessar o site:
- Abra a página de Watchlist ou Markets
- Veja no console se aparecem logs de "Fetching real data" ou "using fallback"
- Os preços devem ser consistentes entre recarregamentos (cache de 5 minutos)

---

## 🆘 Troubleshooting

### "API error for AAPL, using fallback"
- Sua chave pode estar incorreta
- Você pode ter atingido o limite de chamadas
- Verifique se a chave está ativa em alphavantage.co

### "No API key available, using fallback"
- O secret não foi atualizado corretamente
- Execute o UPDATE SQL novamente

### "Rate limit reached, using fallback"
- Você fez mais de 5 chamadas no último minuto
- Aguarde 1 minuto e tente novamente
- Isso é normal e protege sua conta

---

**Status da Configuração Atual:**
- ✅ Edge Function deployada
- ✅ Endpoints funcionando
- ❌ API Key precisa ser configurada
- ⏳ Aguardando configuração da chave real
