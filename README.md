# 💒 Convite de Casamento - Ingridy & Winicius

Landing page moderna e elegante para convite de casamento com sistema de RSVP, seleção de presentes e pagamento via Pix.

## 🌟 Funcionalidades

- ✨ Design moderno e responsivo
- 📅 Contador regressivo até a data do casamento
- 🎁 Seleção de presentes com cálculo automático
- 💳 Geração de código Pix dinâmico (Copia e Cola + QR Code)
- 📝 Sistema de confirmação de presença (RSVP)
- 📧 Notificações por email
- 📱 Totalmente responsivo para mobile, tablet e desktop

## 🚀 Como Executar Localmente

### Pré-requisitos

- Go 1.20 ou superior
- Navegador moderno

### Passos

1. Clone o repositório:
```bash
git clone <seu-repositorio>
cd convite
```

2. Configure as variáveis de ambiente (opcional, para email):
```bash
# Windows
set EMAIL_FROM=seu-email@gmail.com
set EMAIL_PASSWORD=sua-senha-de-app
set EMAIL_TO=destinatario@gmail.com
set SMTP_HOST=smtp.gmail.com
set SMTP_PORT=587

# Linux/Mac
export EMAIL_FROM=seu-email@gmail.com
export EMAIL_PASSWORD=sua-senha-de-app
export EMAIL_TO=destinatario@gmail.com
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
```

3. Execute o servidor:
```bash
go run main.go
```

4. Acesse no navegador:
```
http://localhost:8080
```

## 📦 Estrutura do Projeto

```
convite/
├── main.go              # Servidor Go (backend)
├── index.html           # Página principal
├── styles.css           # Estilos CSS
├── script.js            # JavaScript do frontend
├── pix-component.js     # Componente de geração Pix
├── images/              # Imagens e memes dos presentes
├── go.mod               # Dependências Go
└── README.md            # Este arquivo
```

## 🔧 Configuração

### Pix

Configure as chaves Pix em `script.js`:
```javascript
window.PIX_KEY = '06418675142';  // Sua chave Pix
window.PIX_MERCHANT = 'WINICIUS SILVA ROSA';  // Nome do recebedor
window.PIX_CITY = 'CUIABA';  // Cidade
```

### Email

Para receber notificações de RSVP por email, configure as variáveis de ambiente (veja seção "Como Executar Localmente").

**Nota:** Para Gmail, você precisa usar uma "App Password" em vez da senha normal:
1. Acesse: https://myaccount.google.com/apppasswords
2. Crie uma senha de app para "Mail"
3. Use essa senha de 16 caracteres (sem espaços)

## 🌐 Deploy/Hospedagem

### Opção 1: Vercel (Recomendado para Frontend)

1. Instale o Vercel CLI:
```bash
npm i -g vercel
```

2. Faça deploy:
```bash
vercel
```

3. Para o backend Go, use uma das opções abaixo.

### Opção 2: Railway (Backend Go)

1. Acesse: https://railway.app
2. Conecte seu repositório GitHub
3. Configure as variáveis de ambiente
4. Railway detectará automaticamente que é um projeto Go

### Opção 3: Render (Backend Go)

1. Acesse: https://render.com
2. Conecte seu repositório
3. Selecione "Web Service"
4. Configure:
   - Build Command: `go build -o main main.go`
   - Start Command: `./main`

### Opção 4: Fly.io (Backend Go)

1. Instale o Fly CLI
2. Execute:
```bash
fly launch
fly deploy
```

## 📝 Dados Salvos

Os RSVPs são salvos em arquivos CSV com o formato:
- `rsvp_YYYY-MM-DD.csv`

**⚠️ IMPORTANTE:** Adicione `rsvp_*.csv` ao `.gitignore` para não versionar dados sensíveis.

## 🎨 Personalização

- **Cores:** Edite as variáveis CSS em `styles.css`
- **Textos:** Edite diretamente em `index.html`
- **Presentes:** Edite a seção `#presentes` em `index.html`
- **Data do casamento:** Edite em `index.html` (hero section) e `script.js` (countdown)

## 📄 Licença

Este projeto é privado e pessoal.

## 👨‍💻 Desenvolvido por

Winicius Rosa

---

**Data do Casamento:** 22/11/2025  
**Com amor, Ingridy & Winicius** 💕

