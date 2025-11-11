# 🚀 Como Colocar Online da Sua Máquina

## ⚡ Início Rápido (5 minutos)

### 1. Instalar ngrok

**Opção A: Download Manual**
1. Acesse: https://ngrok.com/download
2. Baixe `ngrok.exe` para Windows
3. Coloque na pasta do projeto ou adicione ao PATH

**Opção B: Chocolatey (se tiver)**
```powershell
choco install ngrok
```

### 2. Criar Conta no ngrok (Grátis)

1. Acesse: https://dashboard.ngrok.com/signup
2. Crie uma conta (é grátis!)
3. Copie seu **Authtoken** do dashboard
4. Configure no terminal:

```powershell
ngrok config add-authtoken SEU_TOKEN_AQUI
```

### 3. Executar o Script

Execute o arquivo `iniciar-publico.bat` na pasta do projeto:

```powershell
.\iniciar-publico.bat
```

### 4. Copiar o Link Público

O ngrok vai mostrar algo como:

```
Forwarding   https://abc123.ngrok-free.app -> http://localhost:8080
```

**Copie esse link e compartilhe com seus convidados!**

---

## 📋 O que o Script Faz

1. ✅ Verifica se o Go está instalado
2. ✅ Verifica se o ngrok está instalado
3. ✅ Inicia o servidor Go na porta 8080
4. ✅ Cria um túnel público com ngrok
5. ✅ Gera um link HTTPS público

---

## ⚠️ Importante

### Mantenha o Computador Ligado
- O servidor precisa estar rodando na sua máquina
- Se desligar o computador, o site fica offline
- Mantenha a janela do ngrok aberta

### Link Temporário (Plano Gratuito)
- O link muda a cada vez que reinicia o ngrok
- Para link fixo, você precisa do plano pago ($8/mês)
- Ou use Cloudflare Tunnel (grátis e com link fixo)

### Internet
- Sua conexão precisa estar ativa
- Se a internet cair, o site fica offline

---

## 🔧 Solução de Problemas

### "ngrok não encontrado"
- Instale o ngrok: https://ngrok.com/download
- Ou coloque `ngrok.exe` na pasta do projeto

### "Go não encontrado"
- Instale o Go: https://golang.org/dl/
- Certifique-se de que está no PATH

### "Porta 8080 já em uso"
- Feche outros programas usando a porta 8080
- Ou mude a porta no `main.go`

### "Link não funciona"
- Verifique se o servidor Go está rodando
- Verifique se o ngrok está ativo
- Teste localmente: http://localhost:8080

---

## 🎯 Próximos Passos

1. **Teste localmente primeiro:**
   ```powershell
   go run main.go
   ```
   Acesse: http://localhost:8080

2. **Depois use o ngrok:**
   ```powershell
   ngrok http 8080
   ```

3. **Compartilhe o link HTTPS com seus convidados!**

---

## 💡 Dicas

### Link Fixo com ngrok (Pago)
- Plano básico: $8/mês
- Link fixo: `https://convite-casamento.ngrok.io`
- Domínio personalizado disponível

### Link Fixo com Cloudflare Tunnel (Grátis)
- Use Cloudflare Tunnel (veja `HOSPEDAR-LOCAL.md`)
- Link fixo grátis
- Mais complexo de configurar

### Manter Servidor Rodando 24/7
- Use NSSM para criar serviço do Windows
- Configure para iniciar com o Windows
- Veja `HOSPEDAR-LOCAL.md` para detalhes

---

## 📞 Precisa de Ajuda?

Consulte o arquivo `HOSPEDAR-LOCAL.md` para:
- Configurações avançadas
- Outras opções (Cloudflare Tunnel, Serveo)
- Manter servidor rodando 24/7
- Configurar domínio próprio

---

**Boa sorte! 🎉**

