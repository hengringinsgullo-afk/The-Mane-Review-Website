# Configuração de Templates de Email - The Mane Review

Este documento contém todos os templates de email personalizados para o projeto The Mane Review. Configure-os no Supabase Dashboard para ter emails bonitos e profissionais.

---

## 📋 Instruções de Configuração

1. Acesse o Supabase Dashboard: https://supabase.com/dashboard/project/dlpfkrqvptlgtampkqvd
2. Navegue para: **Authentication → Email Templates**
3. Para cada template abaixo, copie o HTML e cole no campo correspondente
4. Configure o Subject (assunto) conforme indicado
5. Clique em "Save" para salvar cada template

---

## 1️⃣ CONFIRM SIGNUP (Confirmação de Cadastro)

### Subject (Assunto):
```
Welcome to The Mane Review - Confirm Your Email 🎉
```

### HTML Template:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm Your Email - The Mane Review</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header with Logo -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                                The Mane Review
                            </h1>
                            <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 14px;">
                                Financial insights for the next generation
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 24px; font-weight: 600;">
                                Welcome to The Mane Review! 🎉
                            </h2>
                            
                            <p style="margin: 0 0 20px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                                Thank you for joining our community of students and finance enthusiasts. We're excited to have you on board!
                            </p>
                            
                            <p style="margin: 0 0 30px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                                To complete your registration and start exploring our content, please confirm your email address by clicking the button below:
                            </p>
                            
                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 0 0 30px 0;">
                                        <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
                                            Confirm Your Email
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0 0 20px 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                                Or copy and paste this link into your browser:
                            </p>
                            
                            <p style="margin: 0 0 30px 0; padding: 12px; background-color: #f1f5f9; border-radius: 4px; word-break: break-all; font-size: 13px; color: #475569;">
                                {{ .ConfirmationURL }}
                            </p>
                            
                            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px;">
                                <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                                    <strong>What's next?</strong>
                                </p>
                                <ul style="margin: 0; padding-left: 20px; color: #64748b; font-size: 14px; line-height: 1.8;">
                                    <li>Explore market insights across USA, Europe, South America, and Asia</li>
                                    <li>Read opinion pieces from St. Paul's School students</li>
                                    <li>Submit your own articles for publication</li>
                                    <li>Build and track your personal watchlist</li>
                                </ul>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 10px 0; color: #64748b; font-size: 13px;">
                                This link will expire in 24 hours for security reasons.
                            </p>
                            <p style="margin: 0 0 15px 0; color: #64748b; font-size: 13px;">
                                If you didn't create an account, you can safely ignore this email.
                            </p>
                            <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                                © 2025 The Mane Review. All rights reserved.<br>
                                St. Paul's School Financial Publication
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

---

## 2️⃣ MAGIC LINK (Link de Login)

### Subject (Assunto):
```
Sign In to The Mane Review 🔐
```

### HTML Template:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign In to The Mane Review</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                                The Mane Review
                            </h1>
                            <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 14px;">
                                Financial insights for the next generation
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 24px; font-weight: 600;">
                                Sign In to Your Account 🔐
                            </h2>
                            
                            <p style="margin: 0 0 20px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                                We received a request to sign in to your The Mane Review account. Click the button below to securely access your account:
                            </p>
                            
                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 0 0 30px 0;">
                                        <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
                                            Sign In to The Mane Review
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0 0 20px 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                                Or copy and paste this link into your browser:
                            </p>
                            
                            <p style="margin: 0 0 30px 0; padding: 12px; background-color: #f1f5f9; border-radius: 4px; word-break: break-all; font-size: 13px; color: #475569;">
                                {{ .ConfirmationURL }}
                            </p>
                            
                            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin-top: 20px;">
                                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                                    <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request this sign-in link, please ignore this email and ensure your account is secure.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 10px 0; color: #64748b; font-size: 13px;">
                                For your security, this link can only be used once.
                            </p>
                            <p style="margin: 0 0 15px 0; color: #64748b; font-size: 13px;">
                                If you're having trouble signing in, please contact our support team.
                            </p>
                            <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                                © 2025 The Mane Review. All rights reserved.<br>
                                St. Paul's School Financial Publication
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

---

## 3️⃣ INVITE USER (Convite de Usuário) - OPCIONAL

### Subject (Assunto):
```
You've been invited to join The Mane Review 📨
```

### HTML Template:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Join The Mane Review</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                                The Mane Review
                            </h1>
                            <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 14px;">
                                Financial insights for the next generation
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 24px; font-weight: 600;">
                                You're Invited! 📨
                            </h2>
                            <p style="margin: 0 0 20px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                                You've been invited to join The Mane Review, St. Paul's School's premier financial publication platform.
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 0 0 30px 0;">
                                        <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
                                            Accept Invitation
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                                © 2025 The Mane Review. All rights reserved.<br>
                                St. Paul's School Financial Publication
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

---

## 4️⃣ CHANGE EMAIL ADDRESS (Mudança de Email) - OPCIONAL

### Subject (Assunto):
```
Confirm Your New Email Address - The Mane Review
```

### HTML Template:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm Email Change</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                                The Mane Review
                            </h1>
                            <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 14px;">
                                Financial insights for the next generation
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 24px; font-weight: 600;">
                                Confirm Your New Email Address
                            </h2>
                            <p style="margin: 0 0 20px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                                You recently requested to change your email address. Please confirm your new email by clicking the button below:
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 0 0 30px 0;">
                                        <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
                                            Confirm New Email
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px;">
                                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                                    <strong>⚠️ Important:</strong> If you didn't request this change, please contact support immediately.
                                </p>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                                © 2025 The Mane Review. All rights reserved.<br>
                                St. Paul's School Financial Publication
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

---

## ✅ Checklist de Configuração

- [ ] Acessar Supabase Dashboard
- [ ] Ir para Authentication → Email Templates
- [ ] Configurar "Confirm signup" com HTML e Subject
- [ ] Configurar "Magic Link" com HTML e Subject
- [ ] (Opcional) Configurar "Invite user"
- [ ] (Opcional) Configurar "Change email address"
- [ ] Salvar todas as alterações
- [ ] Testar criando uma nova conta

---

## 🎨 Características dos Templates

✅ Design profissional com gradiente azul (#1e3a8a → #3b82f6)
✅ Header com logo "The Mane Review"
✅ Botões CTA destacados e responsivos
✅ Informações de segurança sobre expiração
✅ Footer com copyright e informações da escola
✅ Totalmente responsivo (mobile e desktop)
✅ Usa variáveis do Supabase ({{ .ConfirmationURL }})

---

## 📝 Notas Importantes

- Os templates usam inline CSS para máxima compatibilidade com clientes de email
- A variável `{{ .ConfirmationURL }}` é automaticamente substituída pelo Supabase
- Os links expiram automaticamente (24h para signup, 1h para magic link)
- Todos os templates são responsivos e funcionam em Gmail, Outlook, Apple Mail, etc.

---

## 🆘 Suporte

Se tiver problemas na configuração:
1. Verifique se copiou o HTML completo (incluindo `<!DOCTYPE html>`)
2. Certifique-se de que salvou cada template
3. Teste criando uma nova conta para ver o email
4. Verifique a pasta de spam se não receber o email

---

**Criado para The Mane Review - St. Paul's School Financial Publication**
