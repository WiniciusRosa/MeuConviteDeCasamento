# 🚀 Guia de Deploy

Este guia explica como fazer o deploy do projeto para deixá-lo público e acessível.

## 📋 Passo a Passo

### 1. Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. Nome do repositório: `convite-casamento` (ou outro nome)
3. Descrição: "Convite de casamento Ingridy & Winicius"
4. Marque como **Público** (para ter link público)
5. **NÃO** marque "Initialize with README" (já temos um)
6. Clique em "Create repository"

### 2. Inicializar Git no Projeto

Abra o terminal na pasta `convite` e execute:

```bash
# Inicializar Git
git init

# Adicionar todos os arquivos
git add .

# Fazer primeiro commit
git commit -m "Initial commit: Convite de casamento"

# Adicionar repositório remoto (substitua SEU_USUARIO pelo seu usuário GitHub)
git remote add origin https://github.com/SEU_USUARIO/convite-casamento.git

# Renomear branch para main (se necessário)
git branch -M main

# Enviar para GitHub
git push -u origin main
```

### 3. Configurar Deploy

#### Opção A: Frontend + Backend juntos (Vercel + Railway)

**Frontend (Vercel):**
1. Acesse: https://vercel.com
2. Clique em "Add New Project"
3. Conecte seu repositório GitHub
4. Configure:
   - Framework Preset: "Other"
   - Build Command: (deixe vazio)
   - Output Directory: `.`
   - Install Command: (deixe vazio)
5. Adicione variável de ambiente:
   - `VITE_API_URL` = URL do backend (você terá depois)

**Backend (Railway):**
1. Acesse: https://railway.app
2. Clique em "New Project" > "Deploy from GitHub repo"
3. Selecione seu repositório
4. Railway detectará automaticamente que é Go
5. Configure variáveis de ambiente:
   - `EMAIL_FROM`
   - `EMAIL_PASSWORD`
   - `EMAIL_TO`
   - `SMTP_HOST`
   - `SMTP_PORT`
6. Railway gerará uma URL (ex: `https://seu-projeto.railway.app`)
7. Use essa URL no frontend como `VITE_API_URL`

#### Opção B: Tudo em um (Render.com)

1. Acesse: https://render.com
2. Clique em "New" > "Web Service"
3. Conecte seu repositório GitHub
4. Configure:
   - Name: `convite-casamento`
   - Environment: `Go`
   - Build Command: `go build -o main main.go`
   - Start Command: `./main`
   - Plan: Free (ou pago, se preferir)
5. Adicione variáveis de ambiente
6. Render gerará uma URL pública

### 4. Atualizar URLs no Frontend

Se você usar opções separadas (frontend + backend), atualize o `script.js`:

```javascript
// Substituir fetch('/api/rsvp', ...) por:
const API_URL = process.env.VITE_API_URL || 'https://seu-backend.railway.app';
fetch(`${API_URL}/api/rsvp`, ...)
```

### 5. Link Público

Após o deploy, você terá um link público:
- **Frontend (Vercel):** `https://seu-projeto.vercel.app`
- **Backend (Railway):** `https://seu-projeto.railway.app`
- **Tudo junto (Render):** `https://seu-projeto.onrender.com`

## 🔒 Segurança

### ⚠️ IMPORTANTE - Antes de fazer commit:

1. **Verifique o `.gitignore`** - certifique-se de que arquivos sensíveis não serão commitados:
   - `rsvp_*.csv` (dados de convidados)
   - `start-with-email.bat` (senhas)
   - `.env` (se criar)

2. **Remova credenciais hardcoded** - Se houver senhas no código, remova antes de commitar.

3. **Use variáveis de ambiente** - Todas as credenciais devem estar em variáveis de ambiente.

## 📱 Compartilhar o Link

Após o deploy, compartilhe o link público com seus convidados:
- Adicione no convite físico
- Envie por WhatsApp
- Compartilhe nas redes sociais

## 🆘 Problemas Comuns

### "CORS Error"
Se o frontend e backend estiverem em domínios diferentes, configure CORS no `main.go`:
```go
w.Header().Set("Access-Control-Allow-Origin", "*")
```

### "Email não funciona"
- Verifique variáveis de ambiente
- Use App Password do Gmail (não senha normal)
- Verifique logs do servidor

### "Pix não gera QR Code"
- Verifique se a biblioteca `qrcode.js` está carregando
- Veja console do navegador (F12) para erros

## 📞 Suporte

Se tiver problemas, verifique:
1. Logs do servidor (terminal)
2. Console do navegador (F12)
3. Logs da plataforma de deploy (Railway/Render/Vercel)

---

**Boa sorte com o casamento! 💕**

