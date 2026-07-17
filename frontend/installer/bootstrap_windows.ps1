$ErrorActionPreference = "Stop"

$RepoUrl = "https://github.com/cyberjuss/PurveX.git"
$DefaultInstallDir = Join-Path $env:USERPROFILE "PurveX"

function Write-Step($Message) {
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Require-Command($Name, $Hint) {
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "$Name not found. $Hint"
    }
}

function Get-InstallDir {
    $inputValue = Read-Host "Install directory [$DefaultInstallDir]"
    if ([string]::IsNullOrWhiteSpace($inputValue)) {
        return $DefaultInstallDir
    }
    return $inputValue.Trim()
}

Write-Step "Checking local tooling"
Require-Command "git" "Install Git and rerun the installer."
Require-Command "python" "Install Python 3.11+ and rerun the installer."
Require-Command "npm" "Install Node.js 20+ and rerun the installer."

$InstallDir = Get-InstallDir

Write-Step "Preparing PurveX source"
if (-not (Test-Path $InstallDir)) {
    git clone $RepoUrl $InstallDir
} else {
    if (-not (Test-Path (Join-Path $InstallDir ".git"))) {
        throw "The install directory exists but is not a git checkout: $InstallDir"
    }
    Set-Location $InstallDir
    git pull --ff-only
}

$StartScript = Join-Path $InstallDir "start_purvex.ps1"
if (-not (Test-Path $StartScript)) {
    throw "Could not find start_purvex.ps1 in $InstallDir"
}

Write-Step "Launching PurveX"
Set-Location $InstallDir
powershell -ExecutionPolicy Bypass -File $StartScript
