# Runs on the image builder through EC2 user data, once per boot, in stages:
#   0: install AD DS and create purvexfinancial.local (the server restarts)
#   1: build PurveX Financial with the ticket-queue objects, tune for speed, shut down
# build-image.ps1 fills in the __PLACEHOLDERS__, prints the RANGE: progress lines
# from the serial console, and saves the stopped server as the lab image.

$ErrorActionPreference = "Stop"
$dir = "C:\ProgramData\PurveX"
New-Item -ItemType Directory -Path $dir -Force | Out-Null
Start-Transcript -Path "$dir\image-setup.log" -Append

# Progress goes to the log and to the serial console, which AWS shows as the console output.
function Say([string]$Text) {
    $line = "RANGE: $(Get-Date -Format 'HH:mm:ss') $Text"
    Write-Host $line
    try {
        $port = New-Object System.IO.Ports.SerialPort "COM1", 115200
        $port.Open()
        $port.WriteLine($line)
        $port.Close()
    }
    catch { }
}

$stageFile = "$dir\image-stage.txt"
$stage = if (Test-Path $stageFile) { (Get-Content $stageFile -Raw).Trim() } else { "0" }
Say "setup stage $stage"

if ($stage -eq "0") {
    try {
        Install-WindowsFeature -Name AD-Domain-Services -IncludeManagementTools | Out-Null
        Set-Content -Path $stageFile -Value "1"
        Say "creating the purvexfinancial.local forest; the server restarts next"
        Stop-Transcript
        Install-ADDSForest `
            -DomainName "purvexfinancial.local" `
            -DomainNetbiosName "PURVEXFINANCIAL" `
            -InstallDns:$true `
            -SafeModeAdministratorPassword (ConvertTo-SecureString '__DSRM_PASSWORD__' -AsPlainText -Force) `
            -Force:$true
    }
    catch { Say "FAILED in stage 0: $($_.Exception.Message)" }
    # The server restarts on its own. User data runs again after the restart.
    exit
}

if ($stage -eq "1") {
    try {
        # Active Directory needs a few minutes after the first domain boot.
        for ($i = 0; $i -lt 60; $i++) {
            try { Import-Module ActiveDirectory -ErrorAction Stop; Get-ADDomain -ErrorAction Stop | Out-Null; break }
            catch { Start-Sleep -Seconds 10 }
        }
        Say "Active Directory is up"

        # The domain controller is now the server's DNS. Send outside names to the AWS resolver,
        # which the lab firewall does not filter, so labs can reach Range without opening port 53.
        Set-DnsServerForwarder -IPAddress 169.254.169.253 -UseRootHint $false
        Clear-DnsClientCache
        Resolve-DnsName purvex.io -Type A -ErrorAction Stop | Out-Null
        Say "DNS resolves outside names through the AWS resolver"

        # The same public script students download, kept unlinked in the image.
        # Each student's lab links its own copy on first boot.
        New-Item -ItemType Directory -Path "$dir\image" -Force | Out-Null
        [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri '__SCRIPT_URL__' -OutFile "$dir\image\Build-Environment.ps1" -UseBasicParsing
        Say "downloaded Build-Environment.ps1"

        # Shift incident scripts, fired later by Range through SSM. Baked into the image.
        $incidentBase = '__SCRIPT_URL__'.Replace("Build-Environment.ps1", "incidents")
        $incidentDir = "$dir\incidents"
        New-Item -ItemType Directory -Path $incidentDir -Force | Out-Null
        foreach ($f in @("Incident-Common.ps1", "Incident-Lockout.ps1", "Incident-Spray.ps1", "Incident-RogueAdmin.ps1", "Incident-ApprovedChange.ps1", "Incident-Compromise.ps1", "Incident-WeakPolicy.ps1", "Incident-Disable.ps1", "Incident-PreAuth.ps1", "Incident-AccessRequest.ps1", "Incident-Offboarding.ps1", "Incident-PwdNotReq.ps1", "Incident-Delegation.ps1")) {
            try { Invoke-WebRequest -Uri "$incidentBase/$f" -OutFile "$incidentDir\$f" -UseBasicParsing } catch { Say "could not download $f" }
        }
        Say "downloaded incident scripts"

        $initial = ConvertTo-SecureString '__INITIAL_PASSWORD__' -AsPlainText -Force
        # The build script handles its own errors and reports what it skipped.
        $ErrorActionPreference = "Continue"
        & "$dir\image\Build-Environment.ps1" -IncludeCTF -InitialPassword $initial
        $ErrorActionPreference = "Stop"
        $users = (Get-ADUser -Filter * -SearchBase "OU=Departments,$((Get-ADDomain).DistinguishedName)").Count
        Say "built PurveX Financial ($users department accounts)"

        # Speed: no Server Manager at sign-in, no automatic updates (the image is rebuilt monthly),
        # Defender scans never scheduled (real-time protection stays on).
        # New-Item -Force on a registry key that exists tries to recreate it, so only create missing keys.
        foreach ($key in "HKLM:\SOFTWARE\Microsoft\ServerManager", "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU") {
            if (-not (Test-Path $key)) { New-Item -Path $key -Force | Out-Null }
        }
        Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\ServerManager" -Name "DoNotOpenServerManagerAtLogon" -Value 1 -Type DWord
        Get-ScheduledTask -TaskName "ServerManager" -ErrorAction SilentlyContinue | Disable-ScheduledTask | Out-Null
        Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU" -Name "NoAutoUpdate" -Value 1 -Type DWord
        Set-Service -Name wuauserv -StartupType Disabled -ErrorAction SilentlyContinue
        Stop-Service -Name wuauserv -Force -ErrorAction SilentlyContinue
        Set-MpPreference -ScanScheduleDay 8 -DisableCatchupFullScan $true -DisableCatchupQuickScan $true -ErrorAction SilentlyContinue

        # Remote desktop on (the gateway connects over it), and hibernation for fast resume.
        Set-ItemProperty -Path "HKLM:\System\CurrentControlSet\Control\Terminal Server" -Name "fDenyTSConnections" -Value 0
        Enable-NetFirewallRule -DisplayGroup "Remote Desktop" -ErrorAction SilentlyContinue
        powercfg.exe /hibernate on
        Say "tuned for speed"

        Remove-Item -Path $stageFile -Force
        Say "IMAGE READY: resetting EC2Launch so each lab runs its own first-boot script, then shutting down"
        Stop-Transcript
        & "$env:ProgramFiles\Amazon\EC2Launch\EC2Launch.exe" reset --clean
        shutdown.exe /s /t 15 /f
    }
    catch {
        # Stay running so the log can be read. build-image.ps1 reports the failure.
        Say "FAILED in stage 1: $($_.Exception.Message)"
    }
}
