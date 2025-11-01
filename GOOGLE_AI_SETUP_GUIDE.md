# 🚀 Guia Completo de Configuração do Google AI

Este guia explica EXATAMENTE como configurar as APIs do Google para geração de imagens AI nos artigos.

## 📋 O Que Você Precisa

Você precisará de **2 coisas** do Google:

1. **1 API Key** (uma única chave serve para tudo)
2. **1 Project ID** (ID do seu projeto no Google Cloud)

## 🔑 Passo 1: Obter a API Key do Google AI

### Opção A: Google AI Studio (Recomendado - Mais Fácil)

1. Acesse: https://aistudio.google.com/app/apikey
2. Faça login com sua conta Google Developer
3. Clique em **"Create API Key"** ou **"Get API Key"**
4. Escolha um projeto existente ou crie um novo
5. **COPIE A CHAVE** - ela aparece apenas uma vez!
6. Guarde em local seguro

### Opção B: Google Cloud Console (Mais Controle)

1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto ou selecione um existente
3. Vá em **APIs & Services** > **Credentials**
4. Clique em **+ CREATE CREDENTIALS** > **API Key**
5. **COPIE A CHAVE**
6. (Opcional) Clique em **RESTRICT KEY** para adicionar restrições de segurança

## 🏗️ Passo 2: Obter o Project ID

1. No Google Cloud Console: https://console.cloud.google.com/
2. No topo da página, você verá o nome do projeto
3. Clique no nome do projeto
4. Na janela que abre, você verá:
   - **Project name**: Nome amigável
   - **Project ID**: Este é o que você precisa! (ex: `my-project-123456`)
5. **COPIE O PROJECT ID**

## 🔧 Passo 3: Habilitar as APIs Necessárias

Você precisa habilitar 2 APIs no seu projeto:

### 3.1 Habilitar Gemini API

1. Acesse: https://console.cloud.google.com/apis/library
2. Procure por **"Generative Language API"**
3. Clique em **ENABLE** (Ativar)
4. Aguarde alguns segundos

### 3.2 Habilitar Vertex AI (para Imagen)

1. Ainda em: https://console.cloud.google.com/apis/library
2. Procure por **"Vertex AI API"**
3. Clique em **ENABLE** (Ativar)
4. Aguarde alguns segundos

## 📝 Passo 4: Configurar o Projeto

### 4.1 Criar arquivo .env

No diretório raiz do projeto, crie um arquivo chamado `.env`:

```bash
# No terminal (Windows PowerShell):
New-Item -Path ".env" -ItemType File

# Ou simplesmente crie um arquivo .env manualmente
```

### 4.2 Adicionar as Variáveis

Abra o arquivo `.env` e adicione:

```env
# Sua API Key do Google (a mesma para tudo)
VITE_GOOGLE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Seu Project ID do Google Cloud
VITE_GOOGLE_PROJECT_ID=my-project-123456

# Suas credenciais do Supabase (já deve ter)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ IMPORTANTE:**
- Substitua os valores de exemplo pelos seus valores reais
- NÃO compartilhe este arquivo
- NÃO faça commit deste arquivo no Git (já está no .gitignore)

## 🪣 Passo 5: Configurar Supabase Storage

1. Acesse seu projeto no Supabase: https://supabase.com/dashboard
2. Vá em **Storage** no menu lateral
3. Clique em **New Bucket**
4. Configure:
   - **Name**: `article-images`
   - **Public bucket**: ✅ Marque como público
   - **File size limit**: 50 MB (ou mais se preferir)
5. Clique em **Create Bucket**

### 5.1 Configurar Políticas de Acesso

1. Clique no bucket `article-images`
2. Vá na aba **Policies**
3. Clique em **New Policy**
4. Selecione **For full customization**
5. Configure:

**Policy for SELECT (Read):**
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'article-images' );
```

**Policy for INSERT (Upload):**
```sql
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'article-images' 
  AND auth.role() = 'authenticated'
);
```

## 🧪 Passo 6: Testar a Configuração

### 6.1 Reiniciar o Servidor

```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente
npm run dev
```

### 6.2 Verificar no Console

Abra o console do navegador (F12) e procure por:
- ✅ `Google API Key not found` - NÃO deve aparecer
- ✅ Sem erros de API

### 6.3 Testar Submissão

1. Faça login no site
2. Vá em **Opinion** > **Submit Article**
3. Preencha o formulário
4. ✅ Marque **"Generate Featured Image with AI"**
5. Submeta o artigo
6. Como admin, aprove o artigo
7. Aguarde a geração da imagem (pode levar 30-60 segundos)

## 🎯 Modelos Utilizados

### Modelo 1: Gemini 2.5 Flash Lite Preview
- **Nome**: `gemini-2.5-flash-lite-preview-09-2025`
- **Função**: Analisa o artigo e cria um prompt otimizado
- **Input**: Título, conteúdo, categoria, região
- **Output**: Prompt detalhado para geração de imagem

### Modelo 2: Gemini 2.5 Flash Image
- **Nome**: `gemini-2.5-flash-image`
- **Função**: Gera a imagem baseada no prompt
- **Input**: Prompt do Modelo 1
- **Output**: Imagem PNG em 16:9

## 💰 Custos Estimados

### Google AI Studio (Grátis)
- **Gemini**: Grátis até 1500 requisições/dia
- **Imagen**: Grátis até 100 imagens/dia
- Perfeito para desenvolvimento e testes

### Google Cloud (Produção)
- **Gemini**: ~$0.00001 por requisição
- **Imagen**: ~$0.04 por imagem
- Exemplo: 100 artigos/mês = ~$4.00/mês

## 🔒 Segurança

### Proteger sua API Key

1. **Nunca** faça commit do arquivo `.env`
2. **Nunca** compartilhe sua API Key publicamente
3. Configure restrições na API Key:
   - Acesse: https://console.cloud.google.com/apis/credentials
   - Clique na sua API Key
   - Em **API restrictions**, selecione:
     - ✅ Generative Language API
     - ✅ Vertex AI API
   - Em **Application restrictions**, configure:
     - **HTTP referrers** (para web)
     - Adicione: `http://localhost:*/*` (desenvolvimento)
     - Adicione: `https://seu-dominio.com/*` (produção)

### Monitorar Uso

1. Acesse: https://console.cloud.google.com/apis/dashboard
2. Veja o uso de cada API
3. Configure alertas de billing:
   - https://console.cloud.google.com/billing/alerts

## 🐛 Troubleshooting

### Erro: "API Key not found"
- ✅ Verifique se o arquivo `.env` existe
- ✅ Verifique se a variável está escrita corretamente: `VITE_GOOGLE_API_KEY`
- ✅ Reinicie o servidor de desenvolvimento

### Erro: "Project ID not configured"
- ✅ Adicione `VITE_GOOGLE_PROJECT_ID` no `.env`
- ✅ Verifique se o Project ID está correto (sem espaços)
- ✅ Reinicie o servidor

### Erro: "API not enabled"
- ✅ Habilite Generative Language API
- ✅ Habilite Vertex AI API
- ✅ Aguarde 1-2 minutos após habilitar

### Erro: "Permission denied"
- ✅ Verifique se a API Key tem permissões corretas
- ✅ Verifique se o billing está ativado no projeto
- ✅ Verifique se as APIs estão habilitadas

### Erro: "Quota exceeded"
- ✅ Você atingiu o limite gratuito
- ✅ Ative o billing no Google Cloud
- ✅ Ou aguarde o reset diário (meia-noite PST)

### Imagem não aparece
- ✅ Verifique se o bucket `article-images` existe
- ✅ Verifique se o bucket é público
- ✅ Verifique as políticas de acesso
- ✅ Veja o console do navegador para erros

## 📚 Links Úteis

- **Google AI Studio**: https://aistudio.google.com/
- **Google Cloud Console**: https://console.cloud.google.com/
- **Vertex AI Docs**: https://cloud.google.com/vertex-ai/docs
- **Imagen Docs**: https://cloud.google.com/vertex-ai/docs/generative-ai/image/overview
- **Supabase Dashboard**: https://supabase.com/dashboard

## ✅ Checklist Final

Antes de usar em produção, verifique:

- [ ] API Key configurada no `.env`
- [ ] Project ID configurado no `.env`
- [ ] Generative Language API habilitada
- [ ] Vertex AI API habilitada
- [ ] Billing ativado no Google Cloud (para produção)
- [ ] Bucket `article-images` criado no Supabase
- [ ] Bucket configurado como público
- [ ] Políticas de acesso configuradas
- [ ] Servidor reiniciado após configurar `.env`
- [ ] Teste realizado com sucesso

## 🎉 Pronto!

Agora você está pronto para gerar imagens AI incríveis para seus artigos!

Se tiver dúvidas, verifique:
1. Console do navegador (F12)
2. Logs do servidor
3. Google Cloud Console > Logs Explorer
4. Supabase Dashboard > Logs

---

**Dica Pro**: Configure alertas de billing no Google Cloud para evitar surpresas! 💡
