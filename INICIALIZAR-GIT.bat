@echo off
title INICIALIZAR GIT E PREPARAR PARA GITHUB
color 0A

echo.
echo ════════════════════════════════════════════
echo    PREPARANDO PROJETO PARA GITHUB
echo ════════════════════════════════════════════
echo.

cd /d "%~dp0"

echo [1/4] Verificando se Git está instalado...
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git não está instalado!
    echo Instale em: https://git-scm.com/downloads
    pause
    exit /b 1
)
echo ✅ Git instalado

echo.
echo [2/4] Inicializando repositório Git...
if exist .git (
    echo ⚠️  Repositório Git já existe
) else (
    git init
    echo ✅ Repositório inicializado
)

echo.
echo [3/4] Adicionando arquivos...
git add .
echo ✅ Arquivos adicionados

echo.
echo [4/4] Fazendo commit inicial...
git commit -m "Initial commit: Convite de casamento Ingridy & Winicius"
if errorlevel 1 (
    echo ⚠️  Nenhuma mudança para commitar (ou já foi commitado)
) else (
    echo ✅ Commit criado
)

echo.
echo ════════════════════════════════════════════
echo    PRÓXIMOS PASSOS:
echo ════════════════════════════════════════════
echo.
echo 1. Crie um repositório no GitHub:
echo    https://github.com/new
echo.
echo 2. Depois execute:
echo    git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 3. Ou use o GitHub Desktop para fazer push
echo.
echo ════════════════════════════════════════════
echo.
pause

