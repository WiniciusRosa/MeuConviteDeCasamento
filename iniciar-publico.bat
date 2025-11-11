@echo off
chcp 65001 > nul
echo ========================================
echo   CONVITE DE CASAMENTO - SERVIDOR PUBLICO
echo ========================================
echo.

echo [1/3] Verificando se o Go está instalado...
where go > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Erro: Go não encontrado no PATH
    echo    Por favor, instale o Go: https://golang.org/dl/
    pause
    exit /b 1
)
echo ✅ Go encontrado

echo.
echo [2/3] Verificando se o ngrok está instalado...
where ngrok > nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Erro: ngrok não encontrado no PATH
    echo.
    echo    Por favor, instale o ngrok:
    echo    1. Acesse: https://ngrok.com/download
    echo    2. Baixe e extraia o ngrok.exe
    echo    3. Adicione ao PATH ou coloque na pasta do projeto
    echo.
    echo    Ou instale via Chocolatey: choco install ngrok
    pause
    exit /b 1
)
echo ✅ ngrok encontrado

echo.
echo [3/3] Iniciando servidor Go na porta 8080...
echo.
start "Servidor Go - Convite de Casamento" cmd /k "title Servidor Go - Convite de Casamento && echo Iniciando servidor... && go run main.go"

echo.
echo Aguardando servidor iniciar (3 segundos)...
timeout /t 3 /nobreak > nul

echo.
echo ========================================
echo   INICIANDO TUNEL PUBLICO (ngrok)
echo ========================================
echo.
echo ⚠️  IMPORTANTE:
echo    - Mantenha esta janela aberta
echo    - O link público aparecerá abaixo
echo    - Compartilhe o link HTTPS com seus convidados
echo    - Para link fixo, use ngrok com authtoken (grátis)
echo.
echo 💡 Dica: Se ainda não configurou o ngrok:
echo    1. Acesse: https://dashboard.ngrok.com/signup
echo    2. Crie uma conta gratuita
echo    3. Execute: ngrok config add-authtoken SEU_TOKEN
echo.
echo ========================================
echo.

ngrok http 8080 --log=stdout

pause

