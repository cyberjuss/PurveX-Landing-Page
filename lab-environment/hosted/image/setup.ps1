# Runs on the image builder through EC2 user data, once per boot, in stages:
#   0: install AD DS and create purvexfinancial.local (the server restarts)
#   1: build PurveX Financial with the ticket-queue objects, tune for speed, shut down
# build-image.ps1 fills in the __PLACEHOLDERS__ and saves the stopped server as the lab image.

$ErrorActionPreference = "Stop"
$dir = "C:\ProgramData\PurveX"
New-Item -ItemType Directory -Path $dir -Force | Out-Null
Start-Transcript -Path "$dir\image-setup.log" -Append
$stageFile = "$dir\image-stage.txt"
$stage = if (Test-Path $stageFile) { (Get-Content $stageFile -Raw).Trim() } else { "0" }
Write-Host "Image setup, stage $stage"

if ($stage -eq "0") {
    Install-WindowsFeature -Name AD-Domain-Services -IncludeManagementTools | Out-Null
    Set-Content -Path $stageFile -Value "1"
    Stop-Transcript
    Install-ADDSForest `
        -DomainName "purvexfinancial.local" `
        -DomainNetbiosName "PURVEXFINANCIAL" `
        -InstallDns:$true `
        -SafeModeAdministratorPassword (ConvertTo-SecureString '__DSRM_PASSWORD__' -AsPlainText -Force) `
        -Force:$true
    # The server restarts on its own. User data runs again after the restart.
    exit
}

if ($stage -eq "1") {
    # Active Directory needs a few minutes after the first domain boot.
    for ($i = 0; $i -lt 60; $i++) {
        try { Import-Module ActiveDirectory -ErrorAction Stop; Get-ADDomain -ErrorAction Stop | Out-Null; break }
        catch { Start-Sleep -Seconds 10 }
    }

    # The same public script students download, kept unlinked in the image.
    # Each student's lab links its own copy on first boot.
    New-Item -ItemType Directory -Path "$dir\image" -Force | Out-Null
    [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri '__SCRIPT_URL__' -OutFile "$dir\image\Build-Environment.ps1" -UseBasicParsing
    $initial = ConvertTo-SecureString '__INITIAL_PASSWORD__' -AsPlainText -Force
    # The build script handles its own errors and reports what it skipped.
    $ErrorActionPreference = "Continue"
    & "$dir\image\Build-Environment.ps1" -IncludeCTF -InitialPassword $initial
    $ErrorActionPreference = "Stop"

    # Speed: no Server Manager at sign-in, no automatic updates (the image is rebuilt monthly),
    # Defender scans never scheduled (real-time protection stays on).
    New-Item -Path "HKLM:\SOFTWARE\Microsoft\ServerManager" -Force | Out-Null
    Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\ServerManager" -Name "DoNotOpenServerManagerAtLogon" -Value 1 -Type DWord
    Get-ScheduledTask -TaskName "ServerManager" -ErrorAction SilentlyContinue | Disable-ScheduledTask | Out-Null
    New-Item -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU" -Force | Out-Null
    Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU" -Name "NoAutoUpdate" -Value 1 -Type DWord
    Set-Service -Name wuauserv -StartupType Disabled
    Stop-Service -Name wuauserv -Force -ErrorAction SilentlyContinue
    Set-MpPreference -ScanScheduleDay 8 -DisableCatchupFullScan $true -DisableCatchupQuickScan $true -ErrorAction SilentlyContinue

    # Remote desktop on (the gateway connects over it), and hibernation for fast resume.
    Set-ItemProperty -Path "HKLM:\System\CurrentControlSet\Control\Terminal Server" -Name "fDenyTSConnections" -Value 0
    Enable-NetFirewallRule -DisplayGroup "Remote Desktop" -ErrorAction SilentlyContinue
    powercfg.exe /hibernate on

    Remove-Item -Path $stageFile -Force
    Write-Host "Image setup finished. Resetting EC2Launch so each lab runs its own first-boot script, then shutting down."
    Stop-Transcript
    & "$env:ProgramFiles\Amazon\EC2Launch\EC2Launch.exe" reset --clean
    shutdown.exe /s /t 15 /f
}
