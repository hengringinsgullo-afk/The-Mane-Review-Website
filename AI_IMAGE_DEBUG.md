# 🔍 AI Image Generation - Debug Guide

## Status Atual

✅ Google AI API configurada e funcionando
✅ Bucket `article-images` criado no Supabase
✅ Bucket configurado como público
⚠️ Políticas de acesso podem estar incompletas

## Teste Realizado

Testamos a API do Google Gemini e confirmamos que:
- ✅ Modelo `gemini-2.5-flash-lite-preview-09-2025` funciona (geração de prompts)
- ✅ Modelo `gemini-2.5-flash-image` funciona (geração de imagens)
- ✅ API Key está válida e funcionando
- ✅ Imagens são geradas em formato PNG base64

## Possível Problema

As políticas de storage no Supabase podem não estar permitindo o upload de imagens por usuários autenticados.

## Solução

### Passo 1: Verificar Políticas Atuais

1. Vá para: https://supabase.com/dashboard/project/dlpfkrqvptlgtampkqvd/storage/policies
2. Clique no bucket `article-images`
3. Verifique se existem as seguintes políticas:
   - ✅ INSERT para usuários autenticados
   - ✅ SELECT para público
   - ✅ UPDATE para usuários autenticados (opcional)
   - ✅ DELETE para usuários autenticados (opcional)

### Passo 2: Adicionar Políticas Faltantes

Execute o arquivo `add-storage-policies.sql` no SQL Editor do Supabase:

```sql
-- Policy 1: Allow authenticated users to INSERT (upload) images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'article-images'
);

-- Policy 2: Allow public SELECT (read) access
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'article-images'
);
```

### Passo 3: Testar Upload

1. Abra o arquivo `test-storage.html` no navegador
2. Clique em "Test Upload"
3. Verifique se o upload funciona

Se funcionar, o problema está resolvido!

### Passo 4: Testar Geração de Imagem AI

1. Faça login como admin
2. Vá para Admin Dashboard > Review Articles
3. Submeta um artigo de teste com "Generate Featured Image with AI" marcado
4. Aprove o artigo
5. Verifique os logs do console do navegador

## Logs Esperados

Quando funcionar corretamente, você verá:

```
[AI Image] Starting generation for article: <article-id>
[Gemini] Generating image prompt for article: <title>
[Gemini] Generated image prompt: <prompt>
[Gemini Image] Generating image with prompt: <prompt>
[Gemini Image] Image generated successfully
[AI Image] Image generated, uploading to storage...
[Storage] Starting upload for article: <article-id>
[Storage] Blob created, size: <bytes> bytes
[Storage] Uploading to bucket article-images, filename: <filename>
[Storage] Upload successful: <data>
[Storage] Public URL: <url>
[AI Image] Generation completed successfully
```

## Troubleshooting

### Erro: "new row violates row-level security policy"
- **Causa**: Política de INSERT não existe ou está incorreta
- **Solução**: Execute o SQL do Passo 2

### Erro: "Failed to generate image"
- **Causa**: Problema com a API do Google
- **Solução**: Verifique se a API Key está correta no `.env`

### Erro: "Storage bucket not found"
- **Causa**: Bucket não existe
- **Solução**: Crie o bucket `article-images` no Supabase Storage

### Imagem não aparece após upload
- **Causa**: Bucket não é público ou política SELECT está faltando
- **Solução**: 
  1. Marque o bucket como público
  2. Adicione política SELECT para público

## Arquivos de Teste

- `test-gemini.js` - Testa a API do Google Gemini
- `test-storage.html` - Testa o upload para Supabase Storage
- `add-storage-policies.sql` - SQL para adicionar políticas necessárias

## Próximos Passos

1. ✅ Verificar políticas no Supabase
2. ✅ Adicionar políticas faltantes
3. ✅ Testar upload com `test-storage.html`
4. ✅ Testar geração completa de imagem AI
5. ✅ Verificar se imagens aparecem nos artigos publicados
