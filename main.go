package main

import (
	"encoding/csv"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type RSVPRequest struct {
	Nome       string `json:"nome"`
	Email      string `json:"email"`
	Acompanha  string `json:"acompanha"`
	ConvidadoNome string `json:"convidado_nome"`
	Mensagem   string `json:"mensagem"`
	Presentes  string `json:"presentes"`
	ValorPresentes string `json:"valor_presentes"`
}

type APIResponse struct {
	OK      bool   `json:"ok"`
	Message string `json:"message"`
}

func main() {
	// API
	http.HandleFunc("/api/rsvp", handleRSVP)
	// Static files (frontend)
	fs := http.FileServer(http.Dir("."))
	http.Handle("/", fs)
	addr := ":8080"
	log.Printf("Servidor iniciado em %s\n", addr)
	log.Printf("Abra: http://localhost%s/\n", addr)
	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatal(err)
	}
}

func handleRSVP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	defer r.Body.Close()
	var req RSVPRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, APIResponse{OK: false, Message: "JSON inválido"})
		return
	}
	if err := validateRSVP(req); err != nil {
		writeJSON(w, http.StatusUnprocessableEntity, APIResponse{OK: false, Message: err.Error()})
		return
	}
	if err := saveRSVP(req, getIP(r)); err != nil {
		log.Println("erro salvando RSVP:", err)
		writeJSON(w, http.StatusInternalServerError, APIResponse{OK: false, Message: "Falha ao salvar, tente novamente."})
		return
	}
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
	if err := os.MkdirAll("data", 0755); err != nil {
		return err
	}
	filePath := filepath.Join("data", "rsvps.csv")
	fileExists := fileExists(filePath)
	f, err := os.OpenFile(filePath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		return err
	}
	defer f.Close()
	w := csv.NewWriter(f)
	defer w.Flush()
	if !fileExists {
		if err := w.Write([]string{"timestamp", "ip", "nome", "email", "acompanha", "convidado_nome", "mensagem", "presentes", "valor_presentes"}); err != nil {
			return err
		}
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
		strings.TrimSpace(req.ValorPresentes),
	}
	return w.Write(row)
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
