# 🧪 Teste Rápido - Geração de Imagem AI

## Passo a Passo para Testar

### 1. Verificar Políticas do Storage

Nas suas screenshots, vi que o bucket `article-images` tem 4 políticas. Precisamos verificar se a política de **INSERT** está correta.

**Vá para**: Storage > article-images > Policies

Verifique se existe uma política com:
- **Command**: INSERT
- **Applied to**: public (ou authenticated)

Se não existir, adicione esta política:

```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'article-images');
```

### 2. Testar Upload Manualmente

1. Abra o arquivo `test-storage.html` no navegador
2. Abra o Console do navegador (F12)
3. Clique no botão "Test Upload"
4. Veja se aparece uma mensagem de sucesso

**Se der erro**, copie a mensagem de erro e me envie.

### 3. Testar Geração de Imagem AI Completa

1. Faça login no site como admin
2. Vá para a página Opinion
3. Clique em "Submit Article"
4. Preencha o formulário:
   - Title: "Test AI Image Generation"
   - Content: "This is a test article about financial markets and investment strategies."
   - ✅ Marque "Generate Featured Image with AI"
5. Submeta o artigo
6. Vá para Admin Dashboard > Review Articles
7. Aprove o artigo
8. **Abra o Console do navegador (F12)** e veja os logs

### 4. O que Esperar

Se tudo funcionar, você verá nos logs:

```
[AI Image] Starting generation for article: ...
[Gemini] Generating image prompt for article: ...
[Gemini Image] Generating image with prompt: ...
[Storage] Starting upload for article: ...
[Storage] Upload successful
✨ AI image generated successfully!
```

### 5. Verificar Resultado

1. Vá para Storage > article-images no Supabase
2. Você deve ver um arquivo novo: `article-<id>-<timestamp>.png`
3. O artigo publicado deve mostrar a imagem gerada

## Possíveis Erros e Soluções

### ❌ "new row violates row-level security policy"

**Problema**: Política de INSERT não permite upload

**Solução**: Execute no SQL Editor:
```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'article-images');
```

### ❌ "Failed to generate image prompt"

**Problema**: API Key do Google não está funcionando

**Solução**: Verifique se `VITE_GOOGLE_API_KEY` está no `.env`

### ❌ "Storage bucket not found"

**Problema**: Bucket não existe (mas você já tem!)

**Solução**: Nada, você já tem o bucket criado

## Checklist

- [ ] Bucket `article-images` existe ✅ (você já tem)
- [ ] Bucket é público ✅ (você já configurou)
- [ ] Política INSERT existe para authenticated
- [ ] Política SELECT existe para public ✅ (você já tem)
- [ ] API Key do Google está no `.env` ✅
- [ ] Teste de upload funciona
- [ ] Geração de imagem AI funciona

## Próximo Passo

Execute o teste do Passo 2 (test-storage.html) e me diga o resultado!
