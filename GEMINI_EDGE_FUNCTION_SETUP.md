# Configuração da Edge Function Gemini Image

## ✅ Problema Resolvido

A API key do Google não está mais sendo incluída no bundle JavaScript do cliente. Todas as chamadas para a API do Gemini agora passam por uma Edge Function do Supabase, mantendo a API key segura no servidor.

## 📋 Como Configurar

### 1. Deploy da Edge Function

Primeiro, faça o deploy da edge function:

```bash
supabase functions deploy gemini-image
```

### 2. Configurar a API Key no Supabase

✅ **A API key já está configurada!** A edge function procura por `VITE_GOOGLE_API_KEY` (que você já tem configurada) ou `GOOGLE_API_KEY` como alternativa.

Se você já tem `VITE_GOOGLE_API_KEY` configurada no Supabase como secret, está tudo pronto! A edge function vai usar automaticamente.

**Verificar se está configurada:**
- Via Dashboard: https://supabase.com/dashboard/project/dlpfkrqvptlgtampkqvd/settings/functions
- Verifique se `VITE_GOOGLE_API_KEY` está nas secrets do projeto

**Se precisar configurar via CLI:**
```bash
supabase secrets set VITE_GOOGLE_API_KEY=sua_chave_aqui --project-ref dlpfkrqvptlgtampkqvd
```

### 3. Remover VITE_GOOGLE_API_KEY do Netlify (Opcional)

A variável `VITE_GOOGLE_API_KEY` não é mais necessária no Netlify, pois não será mais usada no código do cliente. Você pode removê-la das variáveis de ambiente do Netlify para manter tudo limpo, mas não é obrigatório - ela simplesmente não será usada.

## 🎯 Endpoints Disponíveis

A edge function `gemini-image` expõe os seguintes endpoints:

- `POST /functions/v1/gemini-image/prompt` - Gera apenas o prompt da imagem
- `POST /functions/v1/gemini-image/image` - Gera a imagem a partir de um prompt
- `POST /functions/v1/gemini-image/generate` - Workflow completo (prompt + imagem)

## ✅ Próximos Passos

1. Faça o deploy da edge function
2. Configure a API key no Supabase
3. Faça um novo deploy no Netlify
4. O deploy deve passar sem problemas de detecção de segredos!

