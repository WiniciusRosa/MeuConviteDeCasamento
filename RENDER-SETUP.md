# 🚀 Configuração do Render

## Passo a Passo para Deploy no Render

### 1. Adicionar arquivo `render.yaml` ao repositório

O arquivo `render.yaml` já foi criado. Certifique-se de que ele está commitado:

```bash
git add render.yaml
git commit -m "Add Render configuration"
git push
```

### 2. No Render Dashboard

1. Acesse: https://dashboard.render.com
2. Clique em **"New +"** > **"Web Service"**
3. Conecte seu repositório GitHub
4. Selecione o repositório: `MeuConviteDeCasamento`

### 3. Configurações

O Render vai detectar automaticamente o `render.yaml`, mas você pode configurar manualmente:

**Nome:** `convite-casamento` (ou qualquer nome)

**Environment:** `Go`

**Build Command:**
```
go build -o main main.go
```

**Start Command:**
```
./main
```

**Plan:** Free (ou pago se preferir)

### 4. Variáveis de Ambiente

Adicione as seguintes variáveis de ambiente no Render:

1. Clique em **"Environment"** na sidebar do seu serviço
2. Adicione cada variável:

```
EMAIL_FROM = seu-email@gmail.com
EMAIL_PASSWORD = sua-senha-de-app-gmail
EMAIL_TO = destinatario@gmail.com
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
```

**Importante:** 
- Para Gmail, use uma **App Password**, não a senha normal
- Acesse: https://myaccount.google.com/apppasswords

### 5. Deploy

1. Clique em **"Manual Deploy"** > **"Deploy latest commit"**
2. Aguarde o build completar
3. Render vai gerar uma URL como: `https://convite-casamento.onrender.com`

### 6. Verificar Logs

Se houver problemas, verifique os logs:
- Clique em **"Logs"** na sidebar do serviço
- Procure por erros

## ⚠️ Problemas Comuns

### "Build failed"
- Verifique se o `render.yaml` está no repositório
- Verifique se o `go.mod` está correto
- Veja os logs para o erro específico

### "Publish directory does not exist"
- Isso acontece quando o Render tenta usar configuração de frontend
- O `render.yaml` resolve isso configurando como serviço Go

### "Port already in use"
- O código já está configurado para usar a variável `PORT` do Render
- Não precisa mudar nada

### Site não carrega
- Verifique se o deploy foi bem-sucedido
- Verifique os logs
- Teste a URL gerada

## ✅ Após Deploy Bem-Sucedido

Você terá uma URL pública como:
```
https://convite-casamento-xxxx.onrender.com
```

**Compartilhe essa URL com seus convidados!**

## 📝 Notas

- O plano Free do Render coloca o site em "sleep" após 15 minutos de inatividade
- A primeira requisição após sleep pode demorar ~30 segundos para "acordar"
- Para evitar isso, considere o plano pago ou use outro serviço

---

**Boa sorte! 🎉**

