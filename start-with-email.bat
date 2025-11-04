@echo off
REM ============================================
REM Configure suas credenciais de email abaixo
REM ============================================

set EMAIL_FROM=chatgay157@gmail.com
set EMAIL_PASSWORD=uorrrlociprlzzqp
set EMAIL_TO=devwinicius@gmail.com
set SMTP_HOST=smtp.gmail.com
set SMTP_PORT=587

REM ============================================
REM Não modifique abaixo desta linha
REM ============================================

echo.
echo Configuracao de Email:
echo - De: %EMAIL_FROM%
echo - Para: %EMAIL_TO%
echo - SMTP: %SMTP_HOST%:%SMTP_PORT%
echo.
echo Iniciando servidor...
echo.

go run main.go

pause

