# Deploy Gemini Metadata Edge Function

## O que foi corrigido?

✅ **Problema**: A API key do Google estava exposta no frontend, causando erro de segurança no build da Netlify.

✅ **Solução**: Movemos a geração de título/tags para uma Edge Function do Supabase (igual à geração de imagem), mantendo a API key segura no servidor.

## Como fazer o deploy da Edge Function

### Opção 1: Via Supabase CLI (Recomendado)

```bash
# 1. Certifique-se de ter o Supabase CLI instalado
npm install -g supabase

# 2. Faça login no Supabase
supabase login

# 3. Link com seu projeto
supabase link --project-ref dlpfkrqvptlgtampkqvd

# 4. Deploy da função
supabase functions deploy gemini-metadata
```

### Opção 2: Via Dashboard do Supabase

1. Acesse: https://supabase.com/dashboard/project/dlpfkrqvptlgtampkqvd/functions
2. Clique em "Create a new function"
3. Nome: `gemini-metadata`
4. Copie o conteúdo de `src/supabase/functions/gemini-metadata/index.ts`
5. Cole no editor
6. Clique em "Deploy function"

### Opção 3: Via Script (Linux/Mac)

```bash
chmod +x deploy-metadata-function.sh
./deploy-metadata-function.sh
```

## Verificar se funcionou

Após o deploy, teste a função:

```bash
curl -X POST \
  'https://dlpfkrqvptlgtampkqvd.supabase.co/functions/v1/gemini-metadata' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "articleBody": "This is a test article about financial markets and investing strategies for the modern investor.",
    "region": "USA",
    "category": "Opinion"
  }'
```

## O que mudou?

### Antes (❌ Inseguro):
- API key exposta no frontend via `import.meta.env`
- Chamadas diretas ao Gemini API do navegador
- Netlify detectava e bloqueava o build

### Depois (✅ Seguro):
- API key segura no servidor (Edge Function)
- Chamadas via Supabase Edge Function
- Mesma arquitetura da geração de imagem
- Build passa sem problemas

## Arquivos modificados

1. ✅ `src/lib/gemini-content-service.ts` - Agora usa Edge Function
2. ✅ `src/supabase/functions/gemini-metadata/index.ts` - Nova Edge Function
3. ✅ Commit e push feitos com sucesso

## Próximos passos

1. Faça o deploy da Edge Function (escolha uma das opções acima)
2. Teste a geração de título/tags no formulário de submissão
3. Verifique se o build da Netlify passa agora

## Modelo usado

A Edge Function usa o modelo: `gemini-2.0-flash-thinking-exp-01-21`

Se quiser mudar para `gemini-2.5-flash-lite-preview-09-2025`, edite a linha 5 do arquivo:
`src/supabase/functions/gemini-metadata/index.ts`
