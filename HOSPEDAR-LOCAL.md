# 🚀 Hospedar Convite de Casamento na Sua Máquina

Este guia explica como tornar seu servidor local acessível publicamente sem usar serviços de hospedagem.

## 📋 Opção 1: Usando ngrok (Mais Fácil e Rápido)

### Passo 1: Instalar ngrok

1. Acesse: https://ngrok.com/download
2. Baixe o ngrok para Windows
3. Extraia o arquivo `ngrok.exe` em uma pasta (ex: `C:\ngrok\`)
4. Ou use via linha de comando:

```powershell
# Usando Chocolatey (se tiver instalado)
choco install ngrok

# Ou baixe manualmente do site
```

### Passo 2: Criar Conta no ngrok (Gratuito)

1. Acesse: https://dashboard.ngrok.com/signup
2. Crie uma conta gratuita
3. Copie seu **Authtoken** do dashboard
4. Configure o token:

```powershell
ngrok config add-authtoken SEU_TOKEN_AQUI
```

### Passo 3: Iniciar o Servidor Go

Abra um terminal na pasta do projeto e execute:

```powershell
go run main.go
```

O servidor vai iniciar na porta `8080` (ou a porta configurada).

### Passo 4: Criar Túnel com ngrok

Abra **outro terminal** e execute:

```powershell
ngrok http 8080
```

Você verá algo como:

```
Forwarding   https://abc123.ngrok-free.app -> http://localhost:8080
```

### Passo 5: Usar o Link Público

Copie o link `https://abc123.ngrok-free.app` e compartilhe com seus convidados!

**⚠️ IMPORTANTE:**
- O link muda a cada vez que você reinicia o ngrok (no plano gratuito)
- Para ter um link fixo, você precisa do plano pago do ngrok
- Mantenha os dois terminais abertos (servidor Go + ngrok)

---

## 📋 Opção 2: Usando Cloudflare Tunnel (Link Fixo e Gratuito)

### Passo 1: Instalar cloudflared

1. Acesse: https://github.com/cloudflare/cloudflared/releases
2. Baixe `cloudflared-windows-amd64.exe`
3. Renomeie para `cloudflared.exe`
4. Coloque em uma pasta no PATH ou na pasta do projeto

### Passo 2: Fazer Login no Cloudflare

```powershell
cloudflared tunnel login
```

Isso vai abrir o navegador para você fazer login.

### Passo 3: Criar um Túnel

```powershell
cloudflared tunnel create convite-casamento
```

### Passo 4: Configurar o Túnel

Crie um arquivo `config.yaml` na pasta do projeto:

```yaml
tunnel: CONVITE-CASAMENTO-ID
credentials-file: C:\Users\winic\.cloudflared\ID.json

ingress:
  - hostname: convite.seu-dominio.com
    service: http://localhost:8080
  - service: http_status:404
```

### Passo 5: Rodar o Túnel

```powershell
cloudflared tunnel run convite-casamento
```

---

## 📋 Opção 3: Script Automatizado (Recomendado)

Crie um arquivo `iniciar-publico.bat` na pasta do projeto:

```batch
@echo off
echo ========================================
echo   CONVITE DE CASAMENTO - SERVIDOR PUBLICO
echo ========================================
echo.

echo Iniciando servidor Go...
start "Servidor Go" cmd /k "go run main.go"

echo.
echo Aguardando servidor iniciar...
timeout /t 3 /nobreak > nul

echo.
echo Iniciando ngrok...
echo.
echo ========================================
echo   LINK PUBLICO APARECERA ABAIXO
echo ========================================
echo.

ngrok http 8080

pause
```

**Para usar:**
1. Execute `iniciar-publico.bat`
2. Aguarde o ngrok mostrar o link público
3. Copie e compartilhe o link

---

## 📋 Opção 4: Usar Serveo (Sem Instalação)

### Passo 1: Iniciar Servidor Go

```powershell
go run main.go
```

### Passo 2: Criar Túnel com SSH

```powershell
ssh -R 80:localhost:8080 serveo.net
```

**Limitações:**
- Link muda a cada conexão
- Pode ser instável
- Não é recomendado para produção

---

## 🔧 Configurações Avançadas

### Manter Servidor Rodando 24/7

#### Opção A: Usar Task Scheduler do Windows

1. Abra "Agendador de Tarefas"
2. Crie uma nova tarefa
3. Configure para iniciar:
   - **Programa:** `go.exe`
   - **Argumentos:** `run main.go`
   - **Iniciar em:** `C:\caminho\para\convite`
4. Configure para iniciar quando o computador ligar

#### Opção B: Usar NSSM (Non-Sucking Service Manager)

1. Baixe NSSM: https://nssm.cc/download
2. Instale como serviço do Windows:

```powershell
nssm install ConviteCasamento "C:\Go\bin\go.exe" "run main.go"
nssm set ConviteCasamento AppDirectory "C:\caminho\para\convite"
nssm start ConviteCasamento
```

### Configurar Firewall do Windows

1. Abra "Firewall do Windows Defender"
2. Clique em "Permitir um aplicativo"
3. Adicione `go.exe` ou a porta `8080`

### Usar Domínio Próprio (com ngrok)

1. Compre um domínio (ex: `meucasamento.com`)
2. Configure DNS para apontar para o ngrok
3. Use o plano pago do ngrok para link fixo

---

## ⚠️ Considerações Importantes

### Segurança:
- ✅ Mantenha o servidor atualizado
- ✅ Use HTTPS (ngrok e Cloudflare Tunnel já fornecem)
- ✅ Não exponha credenciais no código
- ✅ Use variáveis de ambiente para senhas

### Performance:
- ⚠️ Sua conexão de internet precisa estar sempre ativa
- ⚠️ O computador precisa ficar ligado 24/7
- ⚠️ Se sua internet cair, o site fica offline

### Limitações:
- ❌ Link do ngrok free muda a cada reinício
- ❌ Servidor para se o computador desligar
- ❌ Depende da sua conexão de internet

---

## 🚀 Início Rápido (Recomendado)

1. **Instale o ngrok:**
   ```powershell
   choco install ngrok
   # ou baixe de https://ngrok.com/download
   ```

2. **Configure o token:**
   ```powershell
   ngrok config add-authtoken SEU_TOKEN
   ```

3. **Execute o script:**
   ```powershell
   .\iniciar-publico.bat
   ```

4. **Copie o link público e compartilhe!**

---

## 📞 Suporte

Se tiver problemas:
1. Verifique se o servidor Go está rodando (porta 8080)
2. Verifique se o firewall não está bloqueando
3. Verifique os logs do ngrok/cloudflared
4. Teste o servidor localmente: http://localhost:8080

---

**Boa sorte! 🎉**

