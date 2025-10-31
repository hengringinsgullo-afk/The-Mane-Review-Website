# Como Verificar se os Dados São Reais do Alpha Vantage

## ⚠️ Status Atual

**Os dados exibidos são SIMULADOS (fallback)**, não da API real do Alpha Vantage.

## 🔍 Como Identificar Dados Reais vs Simulados

### Na Interface:
- **Badge "Real" (verde)**: Dados vêm da API Alpha Vantage ✅
- **Badge "Simulado" (cinza)**: Dados são gerados localmente ⚠️
- **Sem badge**: Ainda carregando ou erro

### No Console do Navegador (F12):
- **`[ALPHA VANTAGE] ✅ Real data received`**: Dados reais
- **`[ALPHA VANTAGE] ❌ No API key available`**: Usando fallback (sem chave)
- **`[ALPHA VANTAGE] ⚠️ Rate limit reached`**: Usando fallback (limite atingido)
- **`[FALLBACK] ⚠️ Using simulated data`**: Dados simulados

## 🔧 Como Configurar a API Real

### Passo 1: Obter Chave da Alpha Vantage

1. Acesse: https://www.alphavantage.co/support/#api-key
2. Preencha o formulário (é gratuito)
3. Você receberá uma chave como: `ABC123XYZ456DEF789`

### Passo 2: Configurar no Supabase

#### Opção A: Via Vault (Recomendado)

1. Acesse: https://supabase.com/dashboard/project/dlpfkrqvptlgtampkqvd/settings/secrets
2. Clique em "Add Secret"
3. Nome: `ALPHA_VANTAGE_API_KEY`
4. Valor: Cole sua chave da Alpha Vantage
5. Salve

#### Opção B: Via Banco de Dados

Execute este SQL no Supabase SQL Editor:

```sql
UPDATE public.app_secrets 
SET value = 'SUA_CHAVE_REAL_AQUI',
    updated_at = NOW()
WHERE name = 'AlphaAdvantage';

-- Verificar se foi atualizado corretamente
SELECT 
  name,
  CASE 
    WHEN value = 'AlphaAdvantage' THEN '❌ INCORRETO'
    WHEN LENGTH(value) < 10 THEN '❌ MUITO CURTO'
    WHEN LENGTH(value) >= 10 THEN '✅ PARECE VÁLIDO'
    ELSE '❓ DESCONHECIDO'
  END as status,
  LENGTH(value) as key_length
FROM public.app_secrets 
WHERE name = 'AlphaAdvantage';
```

**IMPORTANTE**: Substitua `'SUA_CHAVE_REAL_AQUI'` pela sua chave real!

### Passo 3: Fazer Deploy da Edge Function (se necessário)

Se você modificou a Edge Function, faça deploy:

```bash
cd src/supabase/functions/stock-data
supabase functions deploy stock-data --project-ref dlpfkrqvptlgtampkqvd
```

### Passo 4: Testar

1. Recarregue a página do Watchlist
2. Abra o Console do Navegador (F12)
3. Procure por logs `[ALPHA VANTAGE]`
4. Verifique se aparece badge "Real" (verde) nos símbolos

## 📊 Diferenças Entre Dados Reais e Simulados

### Dados Reais (Alpha Vantage):
- ✅ Preços consistentes (cache de 5 minutos)
- ✅ Dados refletem o mercado atual
- ✅ Volume real de negociações
- ✅ Mudanças de preço baseadas em dados reais
- ⚠️ Pode falhar se API estiver indisponível
- ⚠️ Limite de 5 chamadas/minuto (free tier)

### Dados Simulados (Fallback):
- ⚠️ Preços variam aleatoriamente a cada recarregamento
- ⚠️ Volume gerado aleatoriamente
- ⚠️ Mudanças de preço simuladas (±3% de variação)
- ✅ Sempre disponível (não depende de API externa)
- ✅ Sem limites de rate

## 🎯 Limites da API Gratuita

- **500 chamadas por dia**
- **5 chamadas por minuto**
- A Edge Function tem cache de 5 minutos para economizar chamadas
- Rate limiting automático

## 🔍 Verificação Final

Depois de configurar, verifique:

1. **No Console**: Procure por `[ALPHA VANTAGE] ✅ Real data received`
2. **Na UI**: Deve aparecer badge "Real" (verde) nos símbolos
3. **Teste de Preço**: Recarregue a página - preços devem ser **consistentes** (mesmos valores por 5 minutos)

## 🆘 Troubleshooting

### "No API key available"
- Verifique se a chave está configurada no Vault ou em `app_secrets`
- Confirme que o valor não é apenas "AlphaAdvantage"

### "Rate limit reached"
- Você atingiu o limite de 5 chamadas/minuto
- Aguarde 1 minuto e tente novamente
- Os dados serão cacheados por 5 minutos

### Badge "Simulado" sempre aparece
- A chave pode estar incorreta
- Verifique os logs no console do navegador
- Verifique os logs da Edge Function no Supabase Dashboard

---

**Última atualização**: Os logs agora mostram claramente quando dados são reais ou simulados. Verifique o console do navegador para diagnóstico.

