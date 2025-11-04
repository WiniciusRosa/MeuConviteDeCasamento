package main

import (
	"encoding/csv"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"net/smtp"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// Tipo customizado para aceitar string ou número
type FlexibleValue struct {
	value string
}

func (fv *FlexibleValue) UnmarshalJSON(data []byte) error {
	log.Printf("[FlexibleValue] UnmarshalJSON chamado com dados: %s", string(data))
	
	// Tentar como string primeiro
	var s string
	if err := json.Unmarshal(data, &s); err == nil {
		log.Printf("[FlexibleValue] ✅ Decodificado como string: %s", s)
		fv.value = s
		return nil
	}
	
	// Tentar como número
	var f float64
	if err := json.Unmarshal(data, &f); err == nil {
		formatted := strings.ReplaceAll(fmt.Sprintf("%.2f", f), ".", ",")
		log.Printf("[FlexibleValue] ✅ Decodificado como número: %.2f -> %s", f, formatted)
		fv.value = formatted
		return nil
	}
	
	log.Printf("[FlexibleValue] ⚠️ Não conseguiu decodificar, usando valor padrão")
	fv.value = "0,00"
	return nil
}

func (fv *FlexibleValue) String() string {
	if fv.value == "" {
		return "0,00"
	}
	return fv.value
}

type RSVPRequest struct {
	Nome       string        `json:"nome"`
	Email      string        `json:"email"`
	Acompanha  string        `json:"acompanha"`
	ConvidadoNome string     `json:"convidado_nome"`
	Mensagem   string        `json:"mensagem"`
	Presentes  string        `json:"presentes"`
	ValorPresentes string    `json:"valor_presentes"` // Sempre será string após conversão
}

// Método para obter valor_presentes como string formatada
func (r *RSVPRequest) GetValorPresentesString() string {
	if r.ValorPresentes == "" {
		return "0,00"
	}
	return strings.ReplaceAll(r.ValorPresentes, ".", ",")
}

type APIResponse struct {
	OK      bool   `json:"ok"`
	Message string `json:"message"`
}

func main() {
	log.Println("═══════════════════════════════════════════")
	log.Println("  SERVIDOR DE CONVITE DE CASAMENTO")
	log.Println("  Versão: 2025-11-03 10:45 (com UseNumber e conversão manual)")
	log.Println("═══════════════════════════════════════════")
	log.Println("")
	
	// API
	http.HandleFunc("/api/rsvp", handleRSVP)
	http.HandleFunc("/api/qr", handleQR)
	// Static files (frontend)
	fs := http.FileServer(http.Dir("."))
	http.Handle("/", fs)
	addr := ":8080"
	log.Printf("✅ Servidor iniciado em %s\n", addr)
	log.Printf("🌐 Abra: http://localhost%s/\n", addr)
	log.Println("")
	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatal(err)
	}
}

func handleRSVP(w http.ResponseWriter, r *http.Request) {
	log.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
	log.Printf("[RSVP] Nova requisição recebida - Método: %s, IP: %s", r.Method, getIP(r))
	log.Println("[RSVP] ✅ Versão: 2025-11-03 10:45 (UseNumber + conversão manual)")
	
	if r.Method != http.MethodPost {
		log.Printf("[RSVP] ❌ Método não permitido: %s", r.Method)
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	
	defer r.Body.Close()
	
	// Ler body primeiro para debug
	bodyBytes, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Printf("[RSVP] ❌ Erro ao ler body: %v", err)
		writeJSON(w, http.StatusBadRequest, APIResponse{OK: false, Message: "Erro ao ler requisição"})
		return
	}
	
	log.Printf("[RSVP] Body recebido (tamanho: %d bytes): %s", len(bodyBytes), string(bodyBytes))
	
	// Usar decoder com UseNumber para evitar conversão automática para float64
	decoder := json.NewDecoder(strings.NewReader(string(bodyBytes)))
	decoder.UseNumber()
	
	log.Println("[RSVP] Decodificando JSON com UseNumber...")
	var req RSVPRequest
	
	// Criar um map temporário para processar
	var tempData map[string]interface{}
	if err := decoder.Decode(&tempData); err != nil {
		log.Printf("[RSVP] ❌ Erro ao decodificar JSON: %v", err)
		log.Printf("[RSVP] Body que causou erro: %s", string(bodyBytes))
		writeJSON(w, http.StatusBadRequest, APIResponse{OK: false, Message: "JSON inválido"})
		return
	}
	
	log.Println("[RSVP] Processando valor_presentes...")
	// Converter valor_presentes manualmente
	if vp, exists := tempData["valor_presentes"]; exists {
		var vpStr string
		switch v := vp.(type) {
		case string:
			vpStr = strings.ReplaceAll(v, ".", ",")
			log.Printf("[RSVP] valor_presentes como string: %s -> %s", v, vpStr)
		case json.Number:
			// json.Number pode ser convertido diretamente
			f, _ := v.Float64()
			vpStr = strings.ReplaceAll(fmt.Sprintf("%.2f", f), ".", ",")
			log.Printf("[RSVP] valor_presentes como número: %v -> %s", v, vpStr)
		case float64:
			vpStr = strings.ReplaceAll(fmt.Sprintf("%.2f", v), ".", ",")
			log.Printf("[RSVP] valor_presentes como float64: %v -> %s", v, vpStr)
		default:
			log.Printf("[RSVP] ⚠️ Tipo inesperado: %T, valor: %v", v, v)
			vpStr = "0,00"
		}
		tempData["valor_presentes"] = vpStr
	} else {
		tempData["valor_presentes"] = "0,00"
	}
	
	// Converter de volta para JSON e depois para struct
	jsonBytes, err := json.Marshal(tempData)
	if err != nil {
		log.Printf("[RSVP] ❌ Erro ao converter para JSON: %v", err)
		writeJSON(w, http.StatusBadRequest, APIResponse{OK: false, Message: "Erro ao processar dados"})
		return
	}
	
	log.Println("[RSVP] Decodificando na struct final...")
	if err := json.Unmarshal(jsonBytes, &req); err != nil {
		log.Printf("[RSVP] ❌ Erro ao decodificar na struct: %v", err)
		log.Printf("[RSVP] JSON processado: %s", string(jsonBytes))
		writeJSON(w, http.StatusBadRequest, APIResponse{OK: false, Message: "JSON inválido"})
		return
	}
	
	log.Printf("[RSVP] Dados recebidos:")
	log.Printf("[RSVP] - Nome: %s", req.Nome)
	log.Printf("[RSVP] - Email: %s", req.Email)
	log.Printf("[RSVP] - Acompanha: %s", req.Acompanha)
	log.Printf("[RSVP] - Convidado: %s", req.ConvidadoNome)
	log.Printf("[RSVP] - Mensagem: %s", func() string {
		if len(req.Mensagem) > 50 {
			return req.Mensagem[:50] + "..."
		}
		return req.Mensagem
	}())
	log.Printf("[RSVP] - Presentes: %s", req.Presentes)
	log.Printf("[RSVP] - Valor: %s", req.GetValorPresentesString())
	
	log.Println("[RSVP] Validando dados...")
	if err := validateRSVP(req); err != nil {
		log.Printf("[RSVP] ❌ Erro na validação: %v", err)
		writeJSON(w, http.StatusUnprocessableEntity, APIResponse{OK: false, Message: err.Error()})
		return
	}
	log.Println("[RSVP] ✅ Validação OK")
	
	log.Println("[RSVP] Salvando no CSV...")
	if err := saveRSVP(req, getIP(r)); err != nil {
		log.Printf("[RSVP] ❌ Erro ao salvar RSVP: %v", err)
		log.Printf("[RSVP] Tipo do erro: %T", err)
		writeJSON(w, http.StatusInternalServerError, APIResponse{OK: false, Message: "Falha ao salvar, tente novamente."})
		return
	}
	log.Println("[RSVP] ✅ RSVP salvo com sucesso")
	
	// Enviar email (não bloqueia a resposta se falhar)
	go func() {
		log.Println("")
		log.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
		log.Println("[EMAIL] ⚡ Goroutine de envio de email iniciada...")
		log.Println("[EMAIL] Aguardando 500ms antes de enviar...")
		time.Sleep(500 * time.Millisecond) // Pequeno delay para garantir que a resposta já foi enviada
		
		if err := sendEmailNotification(req); err != nil {
			log.Println("")
			log.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
			log.Printf("[EMAIL] ❌❌❌ FALHA CRÍTICA NO ENVIO DO EMAIL ❌❌❌")
			log.Printf("[EMAIL] Erro: %v", err)
			log.Println("[EMAIL] ⚠️  O RSVP foi salvo no CSV, mas o email NÃO foi enviado!")
			log.Println("[EMAIL] Verifique os logs acima para detalhes do erro.")
			log.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
			log.Println("")
		} else {
			log.Println("[EMAIL] ✅✅✅ EMAIL ENVIADO COM SUCESSO! ✅✅✅")
			log.Println("")
		}
	}()
	
	log.Println("[RSVP] ✅ Resposta enviada com sucesso")
	log.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
	writeJSON(w, http.StatusOK, APIResponse{OK: true, Message: "Confirmação registrada com sucesso!"})
}

func validateRSVP(req RSVPRequest) error {
	if strings.TrimSpace(req.Nome) == "" {
		return errors.New("Informe seu nome completo.")
	}
	if strings.TrimSpace(req.Email) == "" {
		return errors.New("Informe seu e-mail.")
	}
	if !strings.Contains(req.Email, "@") || !strings.Contains(req.Email, ".") {
		return errors.New("E-mail inválido.")
	}
	if req.Acompanha == "" {
		req.Acompanha = "nao"
	}
	return nil
}

func saveRSVP(req RSVPRequest, ip string) error {
	log.Println("[CSV] Criando diretório 'data' se não existir...")
	if err := os.MkdirAll("data", 0755); err != nil {
		log.Printf("[CSV] ❌ Erro ao criar diretório 'data': %v", err)
		return fmt.Errorf("erro ao criar diretório: %v", err)
	}
	log.Println("[CSV] ✅ Diretório 'data' verificado")
	
	filePath := filepath.Join("data", "rsvps.csv")
	log.Printf("[CSV] Caminho do arquivo: %s", filePath)
	
	fileExists := fileExists(filePath)
	log.Printf("[CSV] Arquivo existe: %v", fileExists)
	
	log.Println("[CSV] Abrindo arquivo para escrita...")
	f, err := os.OpenFile(filePath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		log.Printf("[CSV] ❌ Erro ao abrir arquivo: %v", err)
		return fmt.Errorf("erro ao abrir arquivo: %v", err)
	}
	log.Println("[CSV] ✅ Arquivo aberto com sucesso")
	
	defer func() {
		if err := f.Close(); err != nil {
			log.Printf("[CSV] ⚠️ Erro ao fechar arquivo: %v", err)
		}
	}()
	
	w := csv.NewWriter(f)
	defer func() {
		w.Flush()
		if err := w.Error(); err != nil {
			log.Printf("[CSV] ❌ Erro ao fazer flush: %v", err)
		}
	}()
	
	if !fileExists {
		log.Println("[CSV] Criando cabeçalho do CSV...")
		if err := w.Write([]string{"timestamp", "ip", "nome", "email", "acompanha", "convidado_nome", "mensagem", "presentes", "valor_presentes"}); err != nil {
			log.Printf("[CSV] ❌ Erro ao escrever cabeçalho: %v", err)
			return fmt.Errorf("erro ao escrever cabeçalho: %v", err)
		}
		log.Println("[CSV] ✅ Cabeçalho criado")
	}
	
	row := []string{
		time.Now().Format(time.RFC3339),
		ip,
		strings.TrimSpace(req.Nome),
		strings.TrimSpace(strings.ToLower(req.Email)),
		strings.TrimSpace(req.Acompanha),
		strings.TrimSpace(req.ConvidadoNome),
		strings.ReplaceAll(strings.TrimSpace(req.Mensagem), "\n", " "),
		strings.TrimSpace(req.Presentes),
		req.GetValorPresentesString(),
	}
	
	log.Println("[CSV] Escrevendo linha no CSV...")
	if err := w.Write(row); err != nil {
		log.Printf("[CSV] ❌ Erro ao escrever linha: %v", err)
		return fmt.Errorf("erro ao escrever linha: %v", err)
	}
	log.Println("[CSV] ✅ Linha escrita com sucesso")
	return nil
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func getIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		parts := strings.Split(xff, ",")
		return strings.TrimSpace(parts[0])
	}
	return strings.Split(r.RemoteAddr, ":")[0]
}

func fileExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

// Configurações de email (lê de variáveis de ambiente)
func getEmailConfig() (from, password, to, smtpHost, smtpPort string) {
	from = strings.TrimSpace(os.Getenv("EMAIL_FROM"))
	password = strings.TrimSpace(os.Getenv("EMAIL_PASSWORD"))
	to = strings.TrimSpace(os.Getenv("EMAIL_TO"))
	smtpHost = strings.TrimSpace(os.Getenv("SMTP_HOST"))
	smtpPort = strings.TrimSpace(os.Getenv("SMTP_PORT"))
	
	// Remover espaços da senha (senha de app Gmail não deve ter espaços)
	password = strings.ReplaceAll(password, " ", "")
	
	// Valores padrão se não configurado
	if from == "" {
		from = "chatgay157@gmail.com"
	}
	if password == "" {
		password = "uorrrlociprlzzqp"
		// Remover espaços também do padrão
		password = strings.ReplaceAll(password, " ", "")
	}
	if to == "" {
		to = "devwinicius@gmail.com"
	}
	if smtpHost == "" {
		smtpHost = "smtp.gmail.com"
	}
	if smtpPort == "" {
		smtpPort = "587"
	}
	
	return
}

func sendEmailNotification(req RSVPRequest) error {
	log.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
	log.Println("[EMAIL] Iniciando envio de notificação...")
	
	from, password, to, smtpHost, smtpPort := getEmailConfig()
	
	log.Printf("[EMAIL] Configurações carregadas:")
	log.Printf("[EMAIL] - De: %s", from)
	log.Printf("[EMAIL] - Para: %s", to)
	log.Printf("[EMAIL] - SMTP: %s:%s", smtpHost, smtpPort)
	log.Printf("[EMAIL] - Senha configurada: %s", func() string {
		if password == "" {
			return "NÃO CONFIGURADA"
		}
		// Mostrar apenas primeiros 4 caracteres por segurança
		if len(password) > 4 {
			return password[:4] + "*** (comprimento: " + fmt.Sprintf("%d", len(password)) + " caracteres)"
		}
		return "***"
	}())
	
	// Verificar se as configurações estão válidas
	if from == "" || password == "" || to == "" {
		errMsg := "Configurações de email incompletas"
		log.Printf("[EMAIL] ❌ ERRO: %s", errMsg)
		log.Printf("[EMAIL] - EMAIL_FROM: '%s' (vazio: %v)", from, from == "")
		log.Printf("[EMAIL] - EMAIL_PASSWORD: '%s' (vazio: %v)", func() string {
			if password == "" {
				return ""
			}
			return password[:4] + "***"
		}(), password == "")
		log.Printf("[EMAIL] - EMAIL_TO: '%s' (vazio: %v)", to, to == "")
		log.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
		return fmt.Errorf(errMsg)
	}
	
	log.Printf("[EMAIL] ✅ Todas as configurações estão válidas")
	
	// Montar corpo do email
	acompanhaTexto := "Não"
	if req.Acompanha == "sim" {
		acompanhaTexto = "Sim"
		if req.ConvidadoNome != "" {
			acompanhaTexto += fmt.Sprintf(" (Convidado: %s)", req.ConvidadoNome)
		}
	}
	
	valorPresentesStr := req.GetValorPresentesString()
	valorPresentes := valorPresentesStr
	if valorPresentes == "" || valorPresentes == "0" || valorPresentes == "0,00" {
		valorPresentes = "R$ 0,00"
	} else {
		// Garantir formato correto (R$ XXX,XX)
		if !strings.Contains(valorPresentes, ",") {
			valorPresentes = valorPresentes + ",00"
		}
		valorPresentes = "R$ " + valorPresentes
	}
	
	subject := fmt.Sprintf("Nova Confirmação de Presença - %s", req.Nome)
	body := fmt.Sprintf(`Nova confirmação de presença recebida!

Dados do convidado:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nome: %s
Email: %s
Vai com acompanhante: %s
`, req.Nome, req.Email, acompanhaTexto)
	
	if req.Mensagem != "" {
		body += fmt.Sprintf("Mensagem: %s\n", req.Mensagem)
	}
	
	if req.Presentes != "" {
		body += fmt.Sprintf("\nPresentes selecionados:\n%s\n", req.Presentes)
		body += fmt.Sprintf("Valor total: %s\n", valorPresentes)
	}
	
	body += "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
	body += fmt.Sprintf("Data/Hora: %s\n", time.Now().Format("02/01/2006 15:04:05"))
	
	log.Println("[EMAIL] Montando mensagem...")
	// Preparar mensagem
	msg := []byte(fmt.Sprintf("From: %s\r\n", from) +
		fmt.Sprintf("To: %s\r\n", to) +
		fmt.Sprintf("Subject: %s\r\n", subject) +
		"Content-Type: text/plain; charset=UTF-8\r\n" +
		"\r\n" +
		body)
	log.Printf("[EMAIL] Mensagem montada (tamanho: %d bytes)", len(msg))
	
	log.Println("[EMAIL] Criando autenticação SMTP...")
	// Autenticação SMTP
	auth := smtp.PlainAuth("", from, password, smtpHost)
	
	log.Printf("[EMAIL] Tentando conectar ao servidor SMTP: %s:%s", smtpHost, smtpPort)
	log.Printf("[EMAIL] Endereço SMTP completo: %s:%s", smtpHost, smtpPort)
	
	// Enviar email
	addr := fmt.Sprintf("%s:%s", smtpHost, smtpPort)
	log.Printf("[EMAIL] Tentando enviar email via smtp.SendMail...")
	err := smtp.SendMail(addr, auth, from, []string{to}, msg)
	if err != nil {
		log.Printf("[EMAIL] ❌ ERRO ao enviar email: %v", err)
		log.Printf("[EMAIL] Detalhes do erro:")
		log.Printf("[EMAIL] - Tipo: %T", err)
		log.Printf("[EMAIL] - Mensagem: %s", err.Error())
		
		// Verificar tipo de erro comum
		if strings.Contains(err.Error(), "535") || strings.Contains(err.Error(), "authentication") {
			log.Printf("[EMAIL] ⚠️  ERRO DE AUTENTICAÇÃO!")
			log.Printf("[EMAIL] Verifique se:")
			log.Printf("[EMAIL]   1. A senha está correta (sem espaços)")
			log.Printf("[EMAIL]   2. É uma 'App Password' do Gmail (não a senha normal)")
			log.Printf("[EMAIL]   3. A conta tem 'Less secure app access' habilitado ou usa 2FA com App Password")
		}
		if strings.Contains(err.Error(), "connection") || strings.Contains(err.Error(), "timeout") {
			log.Printf("[EMAIL] ⚠️  ERRO DE CONEXÃO!")
			log.Printf("[EMAIL] Verifique se:")
			log.Printf("[EMAIL]   1. O servidor SMTP está correto: %s:%s", smtpHost, smtpPort)
			log.Printf("[EMAIL]   2. Há conexão com internet")
			log.Printf("[EMAIL]   3. Firewall/antivírus não está bloqueando")
		}
		
		log.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
		return fmt.Errorf("erro ao enviar email: %v", err)
	}
	
	log.Printf("[EMAIL] ✅ Email enviado com sucesso para %s", to)
	log.Printf("[EMAIL] Assunto: %s", subject)
	log.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
	return nil
}

func handleQR(w http.ResponseWriter, r *http.Request) {
	log.Println("[QR] Requisição de QR code recebida")
	
	data := r.URL.Query().Get("data")
	size := r.URL.Query().Get("size")
	
	if size == "" {
		size = "200"
	}
	
	if data == "" {
		log.Println("[QR] ❌ Dados não fornecidos")
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Dados não fornecidos"))
		return
	}
	
	log.Printf("[QR] Gerando QR code para dados (tamanho: %s)", len(data))
	
	// Buscar QR code de API externa e retornar como proxy
	qrURL := fmt.Sprintf("https://api.qrserver.com/v1/create-qr-code/?size=%sx%s&data=%s", 
		size, size, data)
	
	log.Printf("[QR] Buscando QR code de: %s", qrURL)
	
	// Fazer requisição HTTP para obter a imagem
	resp, err := http.Get(qrURL)
	if err != nil {
		log.Printf("[QR] ❌ Erro ao buscar QR code: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(fmt.Sprintf("Erro ao gerar QR code: %v", err)))
		return
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		log.Printf("[QR] ❌ Status code inesperado: %d", resp.StatusCode)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Erro ao gerar QR code"))
		return
	}
	
	// Copiar headers da resposta
	w.Header().Set("Content-Type", resp.Header.Get("Content-Type"))
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	
	log.Println("[QR] ✅ QR code gerado com sucesso, enviando para cliente...")
	
	// Copiar imagem diretamente
	_, err = io.Copy(w, resp.Body)
	if err != nil {
		log.Printf("[QR] ❌ Erro ao copiar imagem: %v", err)
		return
	}
	
	log.Println("[QR] ✅ QR code enviado completamente")
}
