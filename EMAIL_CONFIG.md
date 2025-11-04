# Configuração de Email

Para receber emails com as confirmações de presença, você precisa configurar as variáveis de ambiente.

## Opção 1: Gmail (Recomendado)

### Passo 1: Criar App Password no Gmail

1. Acesse: https://myaccount.google.com/
2. Vá em **Segurança**
3. Ative a **Verificação em duas etapas** (se ainda não estiver ativa)
4. Procure por **Senhas de app**
5. Clique em **Selecionar app** → Escolha **E-mail**
6. Clique em **Selecionar dispositivo** → Escolha **Outro** → Digite "Convite Casamento"
7. Clique em **Gerar**
8. **COPIE A SENHA** (16 caracteres sem espaços)

### Passo 2: Configurar variáveis de ambiente no Windows

Crie um arquivo `start.bat` na pasta `convite` com o seguinte conteúdo:

```batch
@echo off
set EMAIL_FROM=chatgay157@gmail.com
set EMAIL_PASSWORD=uorr rloc iprl zzqp
set EMAIL_TO=devwinicius@gmail.com
set SMTP_HOST=smtp.gmail.com
set SMTP_PORT=587

go run main.go
```

**Substitua:**
- `seuemail@gmail.com` pelo seu email Gmail
- `senha_app_gerada_aqui` pela senha de app que você copiou (16 caracteres)

## Opção 2: Outlook/Hotmail

```batch
@echo off
set EMAIL_FROM=seuemail@outlook.com
set EMAIL_PASSWORD=sua_senha
set EMAIL_TO=seuemail@outlook.com
set SMTP_HOST=smtp-mail.outlook.com
set SMTP_PORT=587

go run main.go
```

## Opção 3: Outros provedores SMTP

Você pode usar qualquer servidor SMTP. Configure:

- `EMAIL_FROM`: Email de origem (de onde será enviado)
- `EMAIL_PASSWORD`: Senha do email
- `EMAIL_TO`: Email de destino (para onde você quer receber)
- `SMTP_HOST`: Servidor SMTP (ex: smtp.gmail.com, smtp-mail.outlook.com)
- `SMTP_PORT`: Porta SMTP (geralmente 587 para TLS)

## Testando

1. Execute o servidor com as variáveis configuradas
2. Faça uma confirmação de presença pelo site
3. Verifique sua caixa de entrada (e spam)

## Importante

- **Nunca compartilhe sua senha de app**
- Para Gmail, sempre use **Senha de App**, não a senha normal da conta
- Os emails são enviados de forma assíncrona (não bloqueia a resposta ao usuário)

