$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $Root "backend"
$FrontendDir = Join-Path $Root "frontend"
$VenvDir = Join-Path $BackendDir "venv"
$VenvPython = Join-Path $VenvDir "Scripts\python.exe"
$BackendPort = 8001
$FrontendPort = 3000

function Write-Step($Message) {
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Require-Command($Name, $Hint) {
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "$Name not found. $Hint"
    }
}

function Stop-PortProcess($Port, $Label) {
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if (-not $connections) {
        return
    }

    $processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($processId in $processIds) {
        if (-not $processId) {
            continue
        }
        Write-Host "Stopping $Label process on port $Port (PID $processId)..." -ForegroundColor Yellow
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
}

function Ensure-Venv {
    if (-not (Test-Path $VenvPython)) {
        Write-Step "Creating backend virtual environment"
        Set-Location $BackendDir
        python -m venv venv
    }
}

function Ensure-BackendDependencies {
    Write-Step "Installing backend dependencies"
    & $VenvPython -m pip install --upgrade pip
    & $VenvPython -m pip install -r (Join-Path $Root "requirements.txt")
}

function Ensure-FrontendDependencies {
    Write-Step "Installing frontend dependencies"
    Set-Location $FrontendDir
    cmd /c npm install
}

function Start-Backend {
    Write-Step "Starting backend"
    $backendCommand = @"
Set-Location '$BackendDir'
\$env:PYTHONPATH = '$BackendDir'
& '$VenvPython' -m uvicorn app.main:app --host 127.0.0.1 --port $BackendPort --reload
"@
    Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $backendCommand | Out-Null
}

function Start-Frontend {
    Write-Step "Starting frontend"
    $frontendCommand = @"
Set-Location '$FrontendDir'
cmd /c npm run dev
"@
    Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $frontendCommand | Out-Null
}

Write-Step "Checking local tooling"
Require-Command "python" "Install Python 3.11+ and rerun."
Require-Command "npm" "Install Node.js 20+ and rerun."

Write-Step "Preparing environment"
Ensure-Venv
Ensure-BackendDependencies
Ensure-FrontendDependencies

Write-Step "Clearing local ports"
Stop-PortProcess -Port $BackendPort -Label "backend"
Stop-PortProcess -Port $FrontendPort -Label "frontend"

Start-Backend
Start-Frontend

Write-Host ""
Write-Host "PurveX is starting." -ForegroundColor Green
Write-Host "Frontend: http://localhost:$FrontendPort"
Write-Host "Backend:  http://127.0.0.1:$BackendPort"
Write-Host "Login:    admin / admin"
Write-Host ""
Write-Host "Run it with:" -ForegroundColor DarkGray
Write-Host "powershell -ExecutionPolicy Bypass -File .\start_purvex.ps1" -ForegroundColor DarkGray
