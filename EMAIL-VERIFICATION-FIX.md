# Como Resolver o Problema de Email de Verificação

## ✅ Correção Aplicada

Já corrigi o código para incluir `emailRedirectTo` na função `signUp`. Agora o código está configurando a URL de redirect corretamente.

## ⚠️ Ação Necessária no Supabase Dashboard

Os emails estão sendo enviados (vejo nos logs: `mail.send`), mas o link pode não funcionar se a URL não estiver na lista de URLs permitidas.

### Passo 1: Configurar Redirect URLs

1. Acesse: https://supabase.com/dashboard/project/dlpfkrqvptlgtampkqvd/auth/url-configuration
2. Em **Redirect URLs**, adicione estas URLs:
   ```
   http://localhost:3000/auth?verified=true
   http://localhost:3000/**
   https://your-production-domain.com/auth?verified=true
   https://your-production-domain.com/**
   ```
3. Em **Site URL**, configure:
   - Desenvolvimento: `http://localhost:3000`
   - Produção: `https://seu-dominio.com`
4. Clique em **Save**

### Passo 2: Verificar Configurações de Email

1. Acesse: https://supabase.com/dashboard/project/dlpfkrqvptlgtampkqvd/auth/providers
2. Verifique se **Email** está habilitado
3. Verifique se **Enable email confirmations** está marcado
4. Em **Email OTP Expiration**, configure para 3600 segundos (1 hora)

### Passo 3: Verificar Templates de Email

1. Acesse: https://supabase.com/dashboard/project/dlpfkrqvptlgtampkqvd/auth/templates
2. Verifique se o template **Confirm signup** está configurado
3. O template deve conter: `{{ .ConfirmationURL }}`

## 🔍 Verificações Adicionais

### Por que o email pode não estar chegando:

1. **Caixa de Spam**: Verifique a pasta de spam/lixo eletrônico
2. **Rate Limiting**: O Supabase tem limite de 4 emails/hora no plano gratuito
3. **Email já confirmado**: Se o usuário já existe, pode não enviar novo email
4. **Bloqueio de Email**: Alguns provedores bloqueiam emails do Supabase

### Teste Rápido:

1. Tente criar uma conta com um email diferente
2. Verifique os logs do Supabase:
   - Dashboard → Logs → Auth
   - Procure por `mail.send` e `user_confirmation_requested`
3. Se aparecer `mail.send` mas não receber o email, o problema é de entrega

## 📝 Código Corrigido

O código agora está assim:

```typescript
const { data, error } = await client.auth.signUp({
  email,
  password,
  options: {
    data: metadata,
    emailRedirectTo: redirectUrl  // ✅ Agora configurado!
  }
});
```

## 🎯 Próximos Passos

1. Configure as Redirect URLs no Dashboard (PASSO 1 acima)
2. Teste criando uma nova conta
3. Verifique se o email chega (incluindo spam)
4. Se não chegar, verifique os logs do Supabase para ver se há erros

---

**Nota**: Se ainda não funcionar após configurar as Redirect URLs, pode ser necessário configurar um SMTP customizado ou verificar se há bloqueios de firewall/provedor de email.

