# 🎯 COMECE AQUI - Configuração Rápida

## O Que Você Precisa Fazer AGORA

### 1️⃣ Obter APENAS 1 Coisa do Google

Você precisa de **APENAS 1 API KEY**! ✨

### 2️⃣ Onde Pegar

#### API Key (única chave para tudo):
1. Vá em: https://aistudio.google.com/app/apikey
2. Clique em "Create API Key"
3. Copie a chave (ex: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)

**Esta chave funciona para AMBOS os modelos!**

### 3️⃣ Arquivo .env (JÁ CRIADO!)

✅ O arquivo `.env` já existe!
✅ Sua API Key já está configurada!
✅ Suas credenciais Supabase já estão configuradas!

**Você só precisa habilitar as APIs agora!**

### 4️⃣ Habilitar API (APENAS 1!)

1. Vá em: https://console.cloud.google.com/apis/library
2. Procure e habilite:
   - ✅ **Generative Language API** (é só essa!)

### 5️⃣ Criar Bucket no Supabase

1. Vá em: https://supabase.com/dashboard
2. Storage > New Bucket
3. Nome: `article-images`
4. Marque como **público**

### 6️⃣ Reiniciar o Servidor

```bash
# Pare o servidor (Ctrl+C)
npm run dev
```

## ✅ Pronto!

Agora você pode:
1. Submeter um artigo
2. Marcar "Generate Featured Image with AI"
3. Aprovar como admin
4. Ver a imagem sendo gerada automaticamente!

---

## 📚 Precisa de Mais Detalhes?

Leia o guia completo: **`GOOGLE_AI_SETUP_GUIDE.md`**

## 🎨 Modelos Usados

- **Gemini 2.5 Flash Lite Preview**: Cria o prompt otimizado
- **Gemini 2.5 Flash Image**: Gera a imagem

## 💰 Quanto Custa?

- **Desenvolvimento**: GRÁTIS (limites generosos)
- **Produção**: ~$0.04 por imagem gerada

---

**Dúvidas?** Veja os logs no console do navegador (F12) 🔍
