# 🚀 Script de Instalação Rápida

Este documento contém scripts prontos para facilitar a instalação do sistema nos 20 clientes.

---

## 📝 Script PowerShell - Instalação Automática

### Para Administrador Executar em Cada Cliente

Salve como: `instalar-sistema-fichas.ps1`

```powershell
# =====================================
# Script de Instalação - Sistema de Fichas
# =====================================

param(
    [Parameter(Mandatory=$true)]
    [string]$ServidorIP = "192.168.1.100",
    
    [string]$PastaInstalacao = "C:\SistemaFichas"
)

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  INSTALAÇÃO - SISTEMA DE FICHAS" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 1. Criar pasta de instalação
Write-Host "[1/5] Criando pasta de instalação..." -ForegroundColor Yellow
if (!(Test-Path $PastaInstalacao)) {
    New-Item -ItemType Directory -Path $PastaInstalacao | Out-Null
    Write-Host "✅ Pasta criada: $PastaInstalacao" -ForegroundColor Green
} else {
    Write-Host "✅ Pasta já existe: $PastaInstalacao" -ForegroundColor Green
}

# 2. Copiar arquivos do servidor
Write-Host "`n[2/5] Copiando arquivos do servidor..." -ForegroundColor Yellow
$ServidorPath = "\\$ServidorIP\SistemaFichas\dist"

if (Test-Path $ServidorPath) {
    Copy-Item -Path "$ServidorPath\*" -Destination $PastaInstalacao -Recurse -Force
    Write-Host "✅ Arquivos copiados com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ Erro: Não foi possível acessar $ServidorPath" -ForegroundColor Red
    Write-Host "   Verifique se a pasta está compartilhada no servidor" -ForegroundColor Yellow
    exit 1
}

# 3. Criar arquivo de configuração
Write-Host "`n[3/5] Criando arquivo de configuração..." -ForegroundColor Yellow
$ConfigPath = "$PastaInstalacao\config"

if (!(Test-Path $ConfigPath)) {
    New-Item -ItemType Directory -Path $ConfigPath | Out-Null
}

$ConfigContent = @"
{
  "apiURL": "http://$ServidorIP:8000",
  "wsURL": "ws://$ServidorIP:8000",
  "timeout": 10000,
  "retries": 3,
  "description": "Configuração da API Central - Sistema de Fichas",
  "version": "1.0.0",
  "updated": "$(Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')"
}
"@

$ConfigContent | Out-File -FilePath "$ConfigPath\api-config.json" -Encoding UTF8
Write-Host "✅ Configuração criada com IP: $ServidorIP" -ForegroundColor Green

# 4. Criar atalho na área de trabalho
Write-Host "`n[4/5] Criando atalho na área de trabalho..." -ForegroundColor Yellow
$WshShell = New-Object -comObject WScript.Shell
$Desktop = [System.Environment]::GetFolderPath('Desktop')
$Shortcut = $WshShell.CreateShortcut("$Desktop\Sistema de Fichas.lnk")
$Shortcut.TargetPath = "$PastaInstalacao\index.html"
$Shortcut.IconLocation = "$PastaInstalacao\favicon.ico,0"
$Shortcut.Description = "Sistema de Fichas - Gestão de Pedidos"
$Shortcut.Save()
Write-Host "✅ Atalho criado na área de trabalho" -ForegroundColor Green

# 5. Testar conexão
Write-Host "`n[5/5] Testando conexão com o servidor..." -ForegroundColor Yellow
try {
    $Response = Invoke-WebRequest -Uri "http://$ServidorIP:8000/health" -TimeoutSec 5 -UseBasicParsing
    if ($Response.StatusCode -eq 200) {
        Write-Host "✅ Conexão com servidor OK!" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Aviso: Não foi possível conectar ao servidor" -ForegroundColor Yellow
    Write-Host "   Verifique se a API está rodando em http://$ServidorIP:8000" -ForegroundColor Yellow
}

# Finalização
Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "  ✅ INSTALAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Resumo:" -ForegroundColor White
Write-Host "   Pasta: $PastaInstalacao" -ForegroundColor Gray
Write-Host "   Servidor: http://$ServidorIP:8000" -ForegroundColor Gray
Write-Host "   Atalho: Área de Trabalho" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 Para iniciar: Clique duas vezes no atalho 'Sistema de Fichas'" -ForegroundColor Cyan
Write-Host ""

# Perguntar se quer abrir agora
$Resposta = Read-Host "Deseja abrir o sistema agora? (S/N)"
if ($Resposta -eq "S" -or $Resposta -eq "s") {
    Start-Process "$PastaInstalacao\index.html"
}
```

---

## 🔧 Como Usar o Script

### 1. No Servidor:

1. Compartilhar a pasta `dist`:
   ```powershell
   # PowerShell como Admin
   New-SmbShare -Name "SistemaFichas" -Path "C:\sistemas-fichas-desktop\dist" -ReadAccess "Everyone"
   ```

2. Verificar IP do servidor:
   ```powershell
   Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*"}
   ```

### 2. Em Cada Cliente:

1. Copiar o script `instalar-sistema-fichas.ps1` para o cliente

2. Abrir PowerShell como **Administrador**

3. Executar:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
   .\instalar-sistema-fichas.ps1 -ServidorIP "192.168.1.100"
   ```

4. Aguardar conclusão

5. Clicar no atalho criado! ✅

---

## 📦 Script em Lote (Batch)

Para quem prefere `.bat`:

Salve como: `instalar.bat`

```batch
@echo off
chcp 65001 >nul
echo =====================================
echo   INSTALAÇÃO - SISTEMA DE FICHAS
echo =====================================
echo.

set /p SERVIDOR_IP="Digite o IP do servidor (ex: 192.168.1.100): "
set PASTA_INSTALACAO=C:\SistemaFichas

echo.
echo [1/4] Criando pasta de instalação...
if not exist "%PASTA_INSTALACAO%" (
    mkdir "%PASTA_INSTALACAO%"
    echo ✓ Pasta criada: %PASTA_INSTALACAO%
) else (
    echo ✓ Pasta já existe
)

echo.
echo [2/4] Copiando arquivos...
xcopy "\\%SERVIDOR_IP%\SistemaFichas\*" "%PASTA_INSTALACAO%\" /E /I /Y /Q
if %ERRORLEVEL% EQU 0 (
    echo ✓ Arquivos copiados com sucesso!
) else (
    echo ✗ Erro ao copiar arquivos. Verifique o IP do servidor.
    pause
    exit /b 1
)

echo.
echo [3/4] Criando configuração...
if not exist "%PASTA_INSTALACAO%\config" mkdir "%PASTA_INSTALACAO%\config"

(
echo {
echo   "apiURL": "http://%SERVIDOR_IP%:8000",
echo   "wsURL": "ws://%SERVIDOR_IP%:8000",
echo   "timeout": 10000,
echo   "retries": 3
echo }
) > "%PASTA_INSTALACAO%\config\api-config.json"
echo ✓ Configuração criada

echo.
echo [4/4] Criando atalho...
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\Sistema de Fichas.lnk'); $Shortcut.TargetPath = '%PASTA_INSTALACAO%\index.html'; $Shortcut.Save()"
echo ✓ Atalho criado

echo.
echo =====================================
echo   ✓ INSTALAÇÃO CONCLUÍDA!
echo =====================================
echo.
echo Para iniciar: Clique no atalho "Sistema de Fichas"
echo.
pause
```

---

## 🌐 Configuração Via GPO (Group Policy)

Para ambientes com Active Directory:

### 1. Criar script de logon:

`\\servidor\scripts\configurar-fichas.ps1`

```powershell
$ServidorIP = "192.168.1.100"
$ConfigPath = "C:\Users\$env:USERNAME\AppData\Local\SistemaFichas\config"

if (!(Test-Path $ConfigPath)) {
    New-Item -ItemType Directory -Path $ConfigPath -Force | Out-Null
}

$Config = @{
    apiURL = "http://$ServidorIP:8000"
    wsURL = "ws://$ServidorIP:8000"
    timeout = 10000
    retries = 3
} | ConvertTo-Json

$Config | Out-File -FilePath "$ConfigPath\api-config.json" -Encoding UTF8 -Force
```

### 2. Aplicar via GPO:

1. Group Policy Management → Criar nova GPO
2. User Configuration → Windows Settings → Scripts → Logon
3. Adicionar script: `configurar-fichas.ps1`
4. Aplicar na OU dos usuários

---

## 🧪 Script de Teste

Teste se tudo está funcionando:

`testar-instalacao.ps1`

```powershell
$ServidorIP = Read-Host "IP do servidor"
$ConfigFile = "C:\SistemaFichas\config\api-config.json"

Write-Host "`nTestando instalação..." -ForegroundColor Cyan

# Teste 1: Arquivo de config existe?
if (Test-Path $ConfigFile) {
    Write-Host "✓ Arquivo de configuração encontrado" -ForegroundColor Green
    $Config = Get-Content $ConfigFile | ConvertFrom-Json
    Write-Host "  API: $($Config.apiURL)" -ForegroundColor Gray
} else {
    Write-Host "✗ Arquivo de configuração não encontrado" -ForegroundColor Red
    exit 1
}

# Teste 2: Servidor responde?
try {
    $Response = Invoke-WebRequest -Uri "http://$ServidorIP:8000/health" -TimeoutSec 5 -UseBasicParsing
    Write-Host "✓ Servidor respondendo (HTTP $($Response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "✗ Servidor não responde" -ForegroundColor Red
}

# Teste 3: Atalho existe?
if (Test-Path "$env:USERPROFILE\Desktop\Sistema de Fichas.lnk") {
    Write-Host "✓ Atalho criado na área de trabalho" -ForegroundColor Green
} else {
    Write-Host "✗ Atalho não encontrado" -ForegroundColor Yellow
}

Write-Host "`n✓ Teste concluído!" -ForegroundColor Cyan
```

---

## 📋 Checklist de Implantação

```
Servidor:
  [ ] IP fixo configurado
  [ ] Firewall porta 8000 liberada
  [ ] API rodando
  [ ] Pasta compartilhada (\\SERVIDOR\SistemaFichas)
  [ ] Permissões de leitura para todos

Cada Cliente (repetir 20x):
  [ ] Script de instalação executado
  [ ] Atalho criado
  [ ] Teste de conexão passou
  [ ] Sistema abre corretamente
  [ ] Console mostra "✅ Configuração carregada"

Teste Final:
  [ ] Criar pedido no Cliente 1
  [ ] Verificar se aparece instantaneamente nos outros 19
  [ ] ✅ Sistema funcionando!
```

---

*Este script automatiza 90% do processo de instalação!* 🚀

