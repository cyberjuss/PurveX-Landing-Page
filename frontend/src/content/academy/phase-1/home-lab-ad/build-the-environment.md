<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>The domain exists. What still has to be created before you can open a ticket against it?</p>
</div>

### Build the environment

After the domain reboot, sign in as `PURVEXFINANCIAL\Administrator` and run this script. It creates the departments, groups, users, and workstation from the baseline tabs.

**What this script does:**

* Creates two top-level OUs: `Departments` and `AccessLevels`
* Creates all 5 department OUs (IT, Compliance, Wealth Management, Operations, Finance and Accounting), each with its own `Users` sub-OU (IT also gets a `Workstations` sub-OU)
* Creates all 8 security groups. Each department gets a standard access group, `IT Admins` is elevated, and `Server Admins` and `Helpdesk` are the Level 2 and Level 3 access groups. Level 1 uses the built-in `Domain Admins`
* Creates all 9 user accounts from the Full User Directory in The Environment tab, in the right OU, with the right title and department, and adds each one to the right group(s)
* Pre-stages the `IT-WKS01` computer object
* Prompts once for an initial password. Every account must change it at next logon, so nobody keeps that password long-term
* Is safe to run more than once. It only creates what is missing and never resets or deletes anything that exists
* The Range download plants the ticket-queue challenge objects on the first build and sends your lab right away. Add `-NoCTF` to skip them
* The Range download also starts a background Coach sync on the domain controller after the first successful build. The VM only has to stay on

**How the Coach sync works.** A change in the lab folders or the DNS zone is sent within about a second, and firewall or share changes within about two. If an upload fails, the change stays queued and is retried within seconds. The Security log goes out once a minute. To stop the sync, run `./Build-Environment.ps1 -UninstallSync`.

The sync also sends your security settings, such as password and lockout policy, auditing, and log size. It adds a 30-day count of Security log events, such as failed sign-ins and accounts created.

The sync never sends passwords or raw log entries. The drills and the weekly CTF depend on it. If you built your lab before this feature existed, download the script again and run it once.

[Download Build-Environment.ps1](/lab-scripts/Build-Environment.ps1)

You can also copy the script from here. A pasted copy is not linked to your Range account, so Coach and your drills will not see your lab. Use the download when you want that link.

<details class="ad-code">
<summary>Show Build-Environment.ps1 (copy/paste)</summary>
<div class="ad-code__bar">
<span class="ad-code__label">Build-Environment.ps1</span>
<button type="button" class="ad-code__copy">Copy</button>
</div>

<pre class="ad-code__pre--tall"><code>#Requires -RunAsAdministrator
#Requires -Modules ActiveDirectory
&lt;#
.SYNOPSIS
    Builds the PurveX Financial Active Directory lab: 5 departments, 9 users,
    8 groups, and 1 workstation object.

.DESCRIPTION
    Run on the domain controller after Install-Forest.ps1. It is safe to
    re-run. Anything that already exists is skipped.

    When downloaded from Range, it also syncs a read-only summary
    of the lab OUs (never passwords) to your Range account so PurveX Coach
    can see your lab.

.PARAMETER InitialPassword
    Initial password for new accounts. You are prompted if it is omitted.
    Every account must change it at next logon.

.PARAMETER IncludeCTF
    Adds the ticket-queue challenge objects. The Range download does this automatically.

.PARAMETER NoCTF
    Skips the ticket-queue challenge objects in the Range download.

.PARAMETER SyncLoop
    Used by the sync task. A lab-folder change is sent right away, without the Security log.
    The log still goes out once a minute. Students do not run this.

.PARAMETER SyncOnly
    Used by the scheduled task. Students do not run this.

.PARAMETER InstallSync
    Install a scheduled task that sends a snapshot about every minute.
    The Range download does this automatically after a successful build.

.PARAMETER UninstallSync
    Remove the PurveX Coach sync task.

.EXAMPLE
    ./Build-Environment.ps1 -WhatIf
#&gt;

[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [System.Security.SecureString]$InitialPassword,
    [switch]$IncludeCTF,
    [switch]$NoCTF,
    [switch]$SyncOnly,
    [switch]$SyncLoop,
    [switch]$Scheduled,
    [switch]$Fast,
    [switch]$RepairOnly,
    [switch]$InstallSync,
    [switch]$UninstallSync,
    [string]$PurvexKey = "",
    [string]$PurvexUrl = ""
)

# Which published copy this is. Bumped by the signing script, and inside the
# signed content, so it cannot be edited without breaking the signature.
#
# A signature says PurveX wrote this file. It does not say this file is the
# current one, and an old copy of ours is still signed by us. Anyone who can
# serve bytes to a pod could hand it last month's script -- one missing every
# fix made since -- and a check that only asks "did PurveX sign this?" would
# say yes. A pod takes a higher number than the one it is running, and nothing
# else.
$PurvexScriptVersion = 23
Import-Module ActiveDirectory -ErrorAction Stop

$script:PurvexFailures = 0

# The Range download plants the ticket objects on the first build so the missions work at once.
if ($PurvexKey -and -not $NoCTF) { $IncludeCTF = $true }

$domain   = Get-ADDomain
$domainDN = $domain.DistinguishedName

function Ensure-OU {
    [CmdletBinding(SupportsShouldProcess = $true)]
    param([string]$Name, [string]$ParentDN, [string]$Description = "")
    $path = "OU=$Name,$ParentDN"
    $existing = $null
    try {
        $existing = Get-ADOrganizationalUnit -Identity $path -Properties Description -ErrorAction Stop
    }
    catch {
        $existing = $null
    }
    if ($existing) {
        Write-Host "  OU exists:   $path" -ForegroundColor DarkGray
    }
    elseif ($PSCmdlet.ShouldProcess($path, "Create OU")) {
        New-ADOrganizationalUnit -Name $Name -Path $ParentDN -Description $Description -ProtectedFromAccidentalDeletion $true
        Write-Host "  OU created:  $path" -ForegroundColor Green
    }
    if ($Description -and $existing -and $existing.Description -ne $Description -and $PSCmdlet.ShouldProcess($path, "Update OU description")) {
        Set-ADOrganizationalUnit -Identity $path -Description $Description
        Write-Host "    ~ $path description updated" -ForegroundColor Green
    }
    return $path
}

function Ensure-Group {
    [CmdletBinding(SupportsShouldProcess = $true)]
    param([string]$Name, [string]$OUPath, [ValidateSet("Global", "DomainLocal", "Universal")][string]$Scope = "Global", [string]$Description = "")
    $existing = Get-ADGroup -Filter "Name -eq '$Name'" -Properties Description -ErrorAction SilentlyContinue
    if ($existing) {
        Write-Host "  Group exists: $Name" -ForegroundColor DarkGray
    }
    elseif ($PSCmdlet.ShouldProcess($Name, "Create security group")) {
        New-ADGroup -Name $Name -GroupScope $Scope -GroupCategory Security -Path $OUPath -Description $Description
        Write-Host "  Group created: $Name" -ForegroundColor Green
    }
    if ($Description -and $existing -and $existing.Description -ne $Description -and $PSCmdlet.ShouldProcess($Name, "Update group description")) {
        Set-ADGroup -Identity $Name -Description $Description
        Write-Host "    ~ $Name description updated" -ForegroundColor Green
    }
}

function Ensure-User {
    [CmdletBinding(SupportsShouldProcess = $true)]
    param(
        [string]$First,
        [string]$Last,
        [string]$SamAccountName,
        [string]$Title,
        [string]$Department,
        [string]$OUPath,
        [string[]]$Groups
    )
    $existing = Get-ADUser -Filter "SamAccountName -eq '$SamAccountName'" -ErrorAction SilentlyContinue
    if ($existing) {
        Write-Host "  User exists: $SamAccountName" -ForegroundColor DarkGray
    }
    elseif ($PSCmdlet.ShouldProcess($SamAccountName, "Create user")) {
        try {
            New-ADUser `
                -Name "$First $Last" `
                -GivenName $First `
                -Surname $Last `
                -SamAccountName $SamAccountName `
                -UserPrincipalName "$SamAccountName@$($domain.DNSRoot)" `
                -Title $Title `
                -Department $Department `
                -Path $OUPath `
                -AccountPassword $InitialPassword `
                -ChangePasswordAtLogon $true `
                -Enabled $true `
                -ErrorAction Stop
            Write-Host "  User created: $SamAccountName ($Title, $Department)" -ForegroundColor Green
        }
        catch {
            Write-Host "  User FAILED: $SamAccountName - $($_.Exception.Message)" -ForegroundColor Red
            $script:PurvexFailures++
            return
        }
    }

    foreach ($groupName in $Groups) {
        $isMember = Get-ADGroupMember -Identity $groupName -ErrorAction SilentlyContinue |
            Where-Object { $_.SamAccountName -eq $SamAccountName }
        if (-not $isMember -and $PSCmdlet.ShouldProcess("$SamAccountName -&gt; $groupName", "Add group membership")) {
            Add-ADGroupMember -Identity $groupName -Members $SamAccountName
            Write-Host "    + $SamAccountName added to $groupName" -ForegroundColor Green
        }
    }
}

function Ensure-Computer {
    [CmdletBinding(SupportsShouldProcess = $true)]
    param(
        [string]$Name,
        [string]$OUPath,
        [string]$Description = ""
    )
    $existing = Get-ADComputer -Filter "Name -eq '$Name'" -Properties Description -ErrorAction SilentlyContinue
    if ($existing) {
        Write-Host "  Computer exists: $Name" -ForegroundColor DarkGray
    }
    elseif ($PSCmdlet.ShouldProcess($Name, "Pre-stage computer object")) {
        New-ADComputer -Name $Name -SAMAccountName "$Name$" -Path $OUPath -Description $Description
        Write-Host "  Computer pre-staged: $Name ($OUPath)" -ForegroundColor Green
    }

    if ($Description -and $existing -and $existing.Description -ne $Description -and $PSCmdlet.ShouldProcess($Name, "Update computer description")) {
        Set-ADComputer -Identity $Name -Description $Description
        Write-Host "    ~ $Name description updated" -ForegroundColor Green
    }
}

function Ensure-UserDescription {
    [CmdletBinding(SupportsShouldProcess = $true)]
    param([string]$SamAccountName, [string]$Description)
    $user = Get-ADUser -Filter "SamAccountName -eq '$SamAccountName'" -Properties Description -ErrorAction SilentlyContinue
    if ($user -and $user.Description -ne $Description -and $PSCmdlet.ShouldProcess($SamAccountName, "Update user description")) {
        Set-ADUser -Identity $SamAccountName -Description $Description
        Write-Host "    ~ $SamAccountName description updated" -ForegroundColor Green
    }
}

# Tickets that live outside Active Directory (DNS, firewall, Group Policy, files)
# keep their planted state under C:\PurveX. tickets.txt records which ones were
# planted, so each is planted once and the server knows the lab has it.
$PurvexLabRoot = "C:\PurveX"

function Test-PurvexTicketMark {
    param([string]$Id)
    $file = Join-Path $PurvexLabRoot "tickets.txt"
    return (Test-Path -LiteralPath $file) -and (@(Get-Content -LiteralPath $file) -contains $Id)
}

function Add-PurvexTicketMark {
    param([string]$Id)
    if (-not (Test-Path -LiteralPath $PurvexLabRoot)) { New-Item -ItemType Directory -Path $PurvexLabRoot -Force | Out-Null }
    Add-Content -LiteralPath (Join-Path $PurvexLabRoot "tickets.txt") -Value $Id
}

function Ensure-InfraTickets {
    [CmdletBinding(SupportsShouldProcess = $true)]
    param([hashtable]$DeptOUPaths)

    Write-Host "`n== Network, firewall, Group Policy and file tickets ==" -ForegroundColor Cyan
    $zone = $domain.DNSRoot

    # INC-1052: the file server's DNS name points at an address that does not exist.
    if (-not (Test-PurvexTicketMark "INC-1052") -and $PSCmdlet.ShouldProcess("files.$zone", "Plant DNS ticket")) {
        try {
            Get-DnsServerResourceRecord -ZoneName $zone -Name "files" -RRType A -ErrorAction SilentlyContinue |
                Remove-DnsServerResourceRecord -ZoneName $zone -Force -ErrorAction SilentlyContinue
            Add-DnsServerResourceRecordA -ZoneName $zone -Name "files" -IPv4Address "192.0.2.50" -ErrorAction Stop
            Add-PurvexTicketMark "INC-1052"
            Write-Host "  Planted INC-1052: files.$zone" -ForegroundColor Green
        }
        catch { Write-Host "  Could not plant INC-1052: $($_.Exception.Message)" -ForegroundColor Yellow }
    }

    # INC-1056: a stale record left from a server migration. DNS round robin hands
    # out both addresses in turn, so payroll works for some people and not others.
    if (-not (Test-PurvexTicketMark "INC-1056") -and $PSCmdlet.ShouldProcess("payroll.$zone", "Plant stale DNS record ticket")) {
        try {
            $dcIp = @(Get-DnsServerResourceRecord -ZoneName $zone -Name "@" -RRType A -ErrorAction Stop | ForEach-Object { "$($_.RecordData.IPv4Address)" })[0]
            if (-not $dcIp) { throw "No address was found for the domain controller." }
            Get-DnsServerResourceRecord -ZoneName $zone -Name "payroll" -RRType A -ErrorAction SilentlyContinue |
                Remove-DnsServerResourceRecord -ZoneName $zone -Force -ErrorAction SilentlyContinue
            Add-DnsServerResourceRecordA -ZoneName $zone -Name "payroll" -IPv4Address $dcIp -ErrorAction Stop
            Add-DnsServerResourceRecordA -ZoneName $zone -Name "payroll" -IPv4Address "192.0.2.80" -ErrorAction Stop
            Add-PurvexTicketMark "INC-1056"
            Write-Host "  Planted INC-1056: payroll.$zone" -ForegroundColor Green
        }
        catch { Write-Host "  Could not plant INC-1056: $($_.Exception.Message)" -ForegroundColor Yellow }
    }

    # INC-1053: a vendor remote-access rule left open after the visit.
    if (-not (Test-PurvexTicketMark "INC-1053") -and $PSCmdlet.ShouldProcess("PurveX Temp - Vendor RDP", "Plant firewall ticket")) {
        try {
            New-NetFirewallRule -DisplayName "PurveX Temp - Vendor RDP" -Group "PurveX Lab" -Direction Inbound -Action Allow `
                -Protocol TCP -LocalPort 3389 -RemoteAddress Any -Profile Any `
                -Description "CTF-TICKET-1053: Opened for Northwind Advisory remote support on 2026-09-24. Remove when the visit ends." -ErrorAction Stop | Out-Null
            Add-PurvexTicketMark "INC-1053"
            Write-Host "  Planted INC-1053: firewall rule PurveX Temp - Vendor RDP" -ForegroundColor Green
        }
        catch { Write-Host "  Could not plant INC-1053: $($_.Exception.Message)" -ForegroundColor Yellow }
    }

    # INC-1054: a screen-lock GPO linked to the wrong department.
    if (-not (Test-PurvexTicketMark "INC-1054") -and $PSCmdlet.ShouldProcess("PurveX - Finance Screen Lock", "Plant Group Policy ticket")) {
        try {
            Import-Module GroupPolicy -ErrorAction Stop
            $name = "PurveX - Finance Screen Lock"
            if (-not (Get-GPO -Name $name -ErrorAction SilentlyContinue)) {
                New-GPO -Name $name -Comment "CTF-TICKET-1054: Locks Finance screens after 10 minutes. Requested by Internal Audit." -ErrorAction Stop | Out-Null
            }
            $key = "HKCU\Software\Policies\Microsoft\Windows\Control Panel\Desktop"
            Set-GPRegistryValue -Name $name -Key $key -ValueName "ScreenSaveActive" -Type String -Value "1" | Out-Null
            Set-GPRegistryValue -Name $name -Key $key -ValueName "ScreenSaverIsSecure" -Type String -Value "1" | Out-Null
            Set-GPRegistryValue -Name $name -Key $key -ValueName "ScreenSaveTimeOut" -Type String -Value "600" | Out-Null
            New-GPLink -Name $name -Target $DeptOUPaths["Operations"].DeptOU -LinkEnabled Yes -ErrorAction Stop | Out-Null
            Add-PurvexTicketMark "INC-1054"
            Write-Host "  Planted INC-1054: $name linked to Operations" -ForegroundColor Green
        }
        catch { Write-Host "  Could not plant INC-1054: $($_.Exception.Message)" -ForegroundColor Yellow }
    }

    # INC-1055: a program disguised as a PDF on the Finance share. It is a text file and cannot run.
    if (-not (Test-PurvexTicketMark "INC-1055") -and $PSCmdlet.ShouldProcess("$PurvexLabRoot\Shares\Finance", "Plant suspicious file ticket")) {
        try {
            $finance = Join-Path $PurvexLabRoot "Shares\Finance"
            New-Item -ItemType Directory -Path $finance -Force | Out-Null
            New-Item -ItemType Directory -Path (Join-Path $PurvexLabRoot "Quarantine") -Force | Out-Null
            Set-Content -LiteralPath (Join-Path $finance "Q3-Budget-Summary.csv") -Value "Department,Budget,Spent`r`nFinance,120000,87400`r`nOperations,95000,71250"
            Set-Content -LiteralPath (Join-Path $finance "Vendor-Contacts.csv") -Value "Vendor,Contact,Phone`r`nNorthwind Advisory,Accounts Desk,555-0142`r`nLedgerLine,Support,555-0199"
            $bad = Join-Path $finance "Invoice_0923.pdf.exe"
            Set-Content -LiteralPath $bad -Value "PurveX training file. This is not a real program and it cannot run. Treat it as a suspicious attachment."
            (Get-Item -LiteralPath $bad).LastWriteTime = Get-Date "2026-09-27 02:14"
            if (-not (Get-SmbShare -Name "Shares" -ErrorAction SilentlyContinue)) {
                New-SmbShare -Name "Shares" -Path (Join-Path $PurvexLabRoot "Shares") -ReadAccess "Domain Users" -ErrorAction SilentlyContinue | Out-Null
            }
            Add-PurvexTicketMark "INC-1055"
            Write-Host "  Planted INC-1055: $bad" -ForegroundColor Green
        }
        catch { Write-Host "  Could not plant INC-1055: $($_.Exception.Message)" -ForegroundColor Yellow }
    }

    # INC-1064: a scheduled task disguised as routine maintenance, quietly
    # checking in with an address outside the firm on a schedule. Both the
    # task and the connection it tries are harmless by design -- it is a
    # training artifact, not real malware -- but the pattern (a task that
    # exists for no business reason, reaching the same address an open
    # firewall rule happens to allow) is the same shape a real persistence
    # mechanism takes. The task's own Test-NetConnection call always times
    # out, because 203.0.113.0/24 is reserved for documentation and routes
    # nowhere (RFC 5737).
    if (-not (Test-PurvexTicketMark "INC-1064") -and $PSCmdlet.ShouldProcess("WindowsDiagnosticsSync", "Plant persistence ticket")) {
        try {
            $taskName = "WindowsDiagnosticsSync"
            $action = New-ScheduledTaskAction -Execute "powershell.exe" `
                -Argument '-NoProfile -WindowStyle Hidden -Command "Test-NetConnection -ComputerName 203.0.113.77 -Port 4444 -WarningAction SilentlyContinue | Out-Null"'
            $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 15) -RepetitionDuration ([TimeSpan]::MaxValue)
            $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
            Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings `
                -Description "PurveX training file. This is not malware and the connection attempt is harmless: it only reaches a documentation-only address (RFC 5737) that routes nowhere. Treat it as a suspicious persistence mechanism for training." `
                -RunLevel Highest -ErrorAction Stop | Out-Null
            New-NetFirewallRule -DisplayName "Windows Update Assistant Network" -Group "PurveX Lab" -Direction Outbound -Action Allow `
                -Protocol TCP -RemotePort 4444 -RemoteAddress "203.0.113.77" -Profile Any `
                -Description "CTF-TICKET-1064: training artifact, not a real vulnerability. Permits outbound traffic to a documentation-only address for the scheduled-task exercise." -ErrorAction Stop | Out-Null
            Add-PurvexTicketMark "INC-1064"
            Write-Host "  Planted INC-1064: scheduled task $taskName and its firewall rule" -ForegroundColor Green
        }
        catch { Write-Host "  Could not plant INC-1064: $($_.Exception.Message)" -ForegroundColor Yellow }
    }

    # INC-1067: an inbound rule that trusts the whole network just for being
    # inside it, left from before the firm moved to Zero Trust. SMB has no
    # business being open to Any -- only the domain controller itself serves
    # file shares, and nothing needs to reach it on this port from anywhere.
    if (-not (Test-PurvexTicketMark "INC-1067") -and $PSCmdlet.ShouldProcess("PurveX Legacy - Internal File Access", "Plant internal-trust firewall ticket")) {
        try {
            New-NetFirewallRule -DisplayName "PurveX Legacy - Internal File Access" -Group "PurveX Lab" -Direction Inbound -Action Allow `
                -Protocol TCP -LocalPort 445 -RemoteAddress Any -Profile Any `
                -Description "CTF-TICKET-1067: Left over from the old perimeter model, when anything inside the network was trusted by default. Never re-scoped after the Zero Trust rollout." -ErrorAction Stop | Out-Null
            Add-PurvexTicketMark "INC-1067"
            Write-Host "  Planted INC-1067: firewall rule PurveX Legacy - Internal File Access" -ForegroundColor Green
        }
        catch { Write-Host "  Could not plant INC-1067: $($_.Exception.Message)" -ForegroundColor Yellow }
    }

    # INC-1069: the Phase 2 capstone's own persistence mechanism, a separate
    # artifact from Quiet Beacon's (different task, different rule, different
    # address) so a student who already closed that one still finds this one
    # fresh. Same harmless-by-construction shape: the scheduled task's own
    # connection attempt always times out, since 203.0.113.0/24 routes nowhere.
    if (-not (Test-PurvexTicketMark "INC-1069") -and $PSCmdlet.ShouldProcess("SystemIndexMaintenance", "Plant capstone persistence ticket")) {
        try {
            $taskName = "SystemIndexMaintenance"
            $action = New-ScheduledTaskAction -Execute "powershell.exe" `
                -Argument '-NoProfile -WindowStyle Hidden -Command "Test-NetConnection -ComputerName 203.0.113.88 -Port 8080 -WarningAction SilentlyContinue | Out-Null"'
            $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 15) -RepetitionDuration ([TimeSpan]::MaxValue)
            $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
            Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings `
                -Description "PurveX training file. This is not malware and the connection attempt is harmless: it only reaches a documentation-only address (RFC 5737) that routes nowhere. Treat it as a suspicious persistence mechanism for training." `
                -RunLevel Highest -ErrorAction Stop | Out-Null
            New-NetFirewallRule -DisplayName "PurveX Update Helper Service" -Group "PurveX Lab" -Direction Outbound -Action Allow `
                -Protocol TCP -RemotePort 8080 -RemoteAddress "203.0.113.88" -Profile Any `
                -Description "CTF-TICKET-1069: training artifact, not a real vulnerability. Permits outbound traffic to a documentation-only address for the Phase 2 capstone." -ErrorAction Stop | Out-Null
            Add-PurvexTicketMark "INC-1069"
            Write-Host "  Planted INC-1069: scheduled task $taskName and its firewall rule" -ForegroundColor Green
        }
        catch { Write-Host "  Could not plant INC-1069: $($_.Exception.Message)" -ForegroundColor Yellow }
    }
}


# A hosted pod is two machines, and these tickets need both: the Ubuntu server is
# the other end of the nightly job and the place the capture runs. A self-hosted
# lab is one Windows machine, so planting them there would advertise a challenge
# the student cannot finish. A pvl_ key is issued to a pod, a pvx_ key is a
# student's own download.
function Test-PurvexHostedPod {
    return $PurvexKey -and $PurvexKey.StartsWith("pvl_")
}

# INC-1072: real sign-in events for the Phase 2 log-analysis ticket, generated
# by actually validating credentials against the domain controller rather than
# writing rows into a fake CSV. Three throwaway identities keep every event
# isolated from the rest of the lab: six accounts that join no group ever get
# only wrong passwords (a real spray, never enough tries each to lock anyone
# out), one account sits behind its own single-member Fine-Grained Password
# Policy so a real lockout (event 4740) can be triggered without touching the
# domain's own lockout policy -- a different ticket's job -- or any other
# account, and one service-style account with a known password succeeds once,
# cleanly, with nothing before it. Runs once: a student who already worked
# this ticket keeps the log they read, rather than it growing new events
# every time the build script is re-run.
function Ensure-SigninLogTickets {
    [CmdletBinding(SupportsShouldProcess = $true)]
    param([hashtable]$DeptOUPaths, [string]$AccessLevelsOU, [string]$ServiceAccountsOU)

    if (Test-PurvexTicketMark "INC-1072") { return }
    if (-not $PSCmdlet.ShouldProcess("Security log", "Generate real sign-in events")) { return }
    Write-Host "`n== Sign-in log ticket ==" -ForegroundColor Cyan

    try {
        $sprayTargets = @(
            @{ First = "Ruth"; Last = "Okonkwo"; Sam = "ruth.okonkwo" },
            @{ First = "Dmitri"; Last = "Volkov"; Sam = "dmitri.volkov" },
            @{ First = "Ines"; Last = "Pelletier"; Sam = "ines.pelletier" },
            @{ First = "Hassan"; Last = "Aziz"; Sam = "hassan.aziz" },
            @{ First = "Clara"; Last = "Lindgren"; Sam = "clara.lindgren" },
            @{ First = "Femi"; Last = "Adeyemi"; Sam = "femi.adeyemi" }
        )
        foreach ($t in $sprayTargets) {
            Ensure-User -First $t.First -Last $t.Last -SamAccountName $t.Sam `
                -Title "Seasonal Support" -Department "Operations" `
                -OUPath $DeptOUPaths["Operations"].UsersOU -Groups @()
        }

        $lockoutSam = "petra.lindqvist"
        Ensure-User -First "Petra" -Last "Lindqvist" -SamAccountName $lockoutSam `
            -Title "Seasonal Support" -Department "Operations" `
            -OUPath $DeptOUPaths["Operations"].UsersOU -Groups @()
        $lockGroup = "Signin-Log-Lockout-Target"
        if (-not (Get-ADGroup -Filter "Name -eq '$lockGroup'" -ErrorAction SilentlyContinue)) {
            New-ADGroup -Name $lockGroup -GroupScope Global -GroupCategory Security -Path $AccessLevelsOU `
                -Description "CTF-TICKET-1072: Scopes a strict lockout policy to one training account so a real lockout event can be generated safely." -ErrorAction Stop
        }
        Add-ADGroupMember -Identity $lockGroup -Members $lockoutSam -ErrorAction SilentlyContinue
        if (-not (Get-ADFineGrainedPasswordPolicy -Filter "Name -eq 'Signin-Log-Lockout-PSO'" -ErrorAction SilentlyContinue)) {
            New-ADFineGrainedPasswordPolicy -Name "Signin-Log-Lockout-PSO" -Precedence 50 `
                -LockoutThreshold 3 -LockoutDuration "0.00:15:00" -LockoutObservationWindow "0.00:15:00" `
                -ComplexityEnabled $true -MinPasswordLength 8 -PasswordHistoryCount 0 -ReversibleEncryptionEnabled $false `
                -Description "CTF-TICKET-1072: Scoped to one training account so the sign-in log ticket can trigger a real lockout." -ErrorAction Stop
            Add-ADFineGrainedPasswordPolicySubject -Identity "Signin-Log-Lockout-PSO" -Subjects $lockGroup
        }

        $nightSam = "svc-night-index"
        if (-not (Get-ADUser -Filter "SamAccountName -eq '$nightSam'" -ErrorAction SilentlyContinue)) {
            New-ADUser -Name "Night Index Service" -SamAccountName $nightSam `
                -UserPrincipalName "$nightSam@$($domain.DNSRoot)" `
                -Title "Index Maintenance Service" -Department "IT" `
                -Path $ServiceAccountsOU `
                -AccountPassword (ConvertTo-SecureString "Harbor-Kettle-92" -AsPlainText -Force) `
                -ChangePasswordAtLogon $false -PasswordNeverExpires $true -Enabled $true -ErrorAction Stop
        }
        Set-ADUser -Identity $nightSam -Description "CTF-TICKET-1072: Runs the nightly index maintenance job. Signs in once, outside normal hours."

        # The events themselves. ValidateCredentials performs a real
        # authentication against the domain controller, so every attempt below
        # produces a genuine Security log entry -- a wrong password is a real
        # 4625, enough of them against the PSO-scoped account is a real 4740,
        # and the correct password on the service account is a real 4624.
        Add-Type -AssemblyName System.DirectoryServices.AccountManagement
        $ctx = New-Object System.DirectoryServices.AccountManagement.PrincipalContext([System.DirectoryServices.AccountManagement.ContextType]::Domain)
        foreach ($t in $sprayTargets) {
            $null = $ctx.ValidateCredentials($t.Sam, "Spray-Attempt-Wrong-1")
            Start-Sleep -Milliseconds 200
        }
        for ($i = 0; $i -lt 5; $i++) {
            $null = $ctx.ValidateCredentials($lockoutSam, "Lockout-Attempt-Wrong-$i")
            Start-Sleep -Milliseconds 300
        }
        Start-Sleep -Milliseconds 500
        $null = $ctx.ValidateCredentials($nightSam, "Harbor-Kettle-92")

        Add-PurvexTicketMark "INC-1072"
        Write-Host "  Planted INC-1072: real sign-in events for the log-analysis ticket" -ForegroundColor Green
    }
    catch { Write-Host "  Could not plant INC-1072: $($_.Exception.Message)" -ForegroundColor Yellow }
}

# INC-1073 through INC-1076: a second, separate intrusion that runs the full
# Cyber Kill Chain from Reconnaissance through Actions on Objectives, this
# time starting with a phishing attachment instead of guessed credentials.
# Reconnaissance here is account-name enumeration: real failed sign-ins
# against usernames that do not exist, which the domain controller logs with
# a different status code (0xC0000064) than a wrong password on a real
# account (0xC000006A) -- a real, distinguishable signal. Weaponization has
# no artifact on purpose: it happens entirely outside the firm's own
# systems, before anything here can see it. Delivery and the rest are real
# planted files, a scheduled task and a firewall rule, the same mechanisms
# already proven for the first intrusion.
function Ensure-PhishingChainTickets {
    [CmdletBinding(SupportsShouldProcess = $true)]
    param([hashtable]$DeptOUPaths)

    if (Test-PurvexTicketMark "INC-1076") { return }
    if (-not $PSCmdlet.ShouldProcess("Phishing chain", "Plant second intrusion")) { return }
    Write-Host "`n== Phishing chain tickets ==" -ForegroundColor Cyan

    try {
        # INC-1073: Reconnaissance. Four made-up usernames, none of them a
        # real PurveX account, each tried once. A real 4625 with status
        # 0xC0000064 means the account itself does not exist, which is what
        # account-name guessing looks like before any real credential is
        # ever tried.
        if (-not (Test-PurvexTicketMark "INC-1073")) {
            Add-Type -AssemblyName System.DirectoryServices.AccountManagement
            $ctx = New-Object System.DirectoryServices.AccountManagement.PrincipalContext([System.DirectoryServices.AccountManagement.ContextType]::Domain)
            foreach ($fake in @("j.admin", "svc-test", "backup.admin", "it.support")) {
                $null = $ctx.ValidateCredentials($fake, "Recon-Attempt-1")
                Start-Sleep -Milliseconds 200
            }
            Add-PurvexTicketMark "INC-1073"
            Write-Host "  Planted INC-1073: real enumeration attempts against four non-existent accounts" -ForegroundColor Green
        }

        # INC-1074: Delivery. A disguised attachment, recovered from the mail
        # gateway and dropped on the Wealth Management share for review. Its
        # content is the EICAR standard antivirus test string -- a real,
        # industry-standard 68-byte file every antivirus engine is built to
        # flag, and whose hash VirusTotal genuinely recognizes. It is not
        # malware and cannot do anything; it exists only so a real hash
        # lookup gives a real answer. The double extension is the other
        # finding.
        if (-not (Test-PurvexTicketMark "INC-1074")) {
            $wm = Join-Path $PurvexLabRoot "Shares\WealthManagement"
            New-Item -ItemType Directory -Path $wm -Force | Out-Null
            New-Item -ItemType Directory -Path (Join-Path $PurvexLabRoot "Quarantine") -Force | Out-Null
            $bad = Join-Path $wm "Q3_Rebalance_Summary.pdf.exe"
            # Windows Defender is built to delete an EICAR file on sight, which
            # would remove the ticket's own evidence before anyone could find
            # it. A narrow exclusion on this one path only is what keeps the
            # planted file sitting there to be discovered and hashed, the same
            # way a malware-analysis sandbox excludes its own sample folder.
            try { Add-MpPreference -ExclusionPath $wm -ErrorAction Stop } catch {}
            $eicar = 'X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*'
            Set-Content -LiteralPath $bad -Value $eicar -NoNewline -Encoding ASCII
            (Get-Item -LiteralPath $bad).LastWriteTime = Get-Date "2026-10-18 08:41"
            if (-not (Get-SmbShare -Name "Shares" -ErrorAction SilentlyContinue)) {
                New-SmbShare -Name "Shares" -Path (Join-Path $PurvexLabRoot "Shares") -ReadAccess "Domain Users" -ErrorAction SilentlyContinue | Out-Null
            }
            Add-PurvexTicketMark "INC-1074"
            Write-Host "  Planted INC-1074: $bad" -ForegroundColor Green
        }

        # INC-1075: Installation and Command and Control. Same mechanism as
        # the first intrusion's beacon (INC-1064/INC-1069), a different task
        # name and a different address so the three never collide.
        if (-not (Test-PurvexTicketMark "INC-1075")) {
            $taskName = "OfficeTelemetryAgent"
            $action = New-ScheduledTaskAction -Execute "powershell.exe" `
                -Argument '-NoProfile -WindowStyle Hidden -Command "Test-NetConnection -ComputerName 203.0.113.91 -Port 9443 -WarningAction SilentlyContinue | Out-Null"'
            $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 15) -RepetitionDuration ([TimeSpan]::MaxValue)
            $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
            Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings `
                -Description "PurveX training file. This is not malware and the connection attempt is harmless: it only reaches a documentation-only address (RFC 5737) that routes nowhere. Treat it as a suspicious persistence mechanism for training." `
                -RunLevel Highest -ErrorAction Stop | Out-Null
            New-NetFirewallRule -DisplayName "Office Telemetry Upload" -Group "PurveX Lab" -Direction Outbound -Action Allow `
                -Protocol TCP -RemotePort 9443 -RemoteAddress "203.0.113.91" -Profile Any `
                -Description "CTF-TICKET-1075: training artifact, not a real vulnerability. Permits outbound traffic to a documentation-only address for the phishing-chain exercise." -ErrorAction Stop | Out-Null
            Add-PurvexTicketMark "INC-1075"
            Write-Host "  Planted INC-1075: scheduled task $taskName and its firewall rule" -ForegroundColor Green
        }

        # INC-1076: Actions on Objectives. A copy of real Wealth Management
        # data, staged somewhere it has no business sitting, as if readied
        # for exfiltration. DATA-SAMPLE must have already run so the source
        # file exists; if it has not, this quietly waits for the next build.
        if (-not (Test-PurvexTicketMark "INC-1076")) {
            $source = Join-Path $PurvexLabRoot "Shares\WealthManagement\portfolio-summary-SAMPLE.csv"
            if (Test-Path -LiteralPath $source) {
                $it = Join-Path $PurvexLabRoot "Shares\IT"
                New-Item -ItemType Directory -Path $it -Force | Out-Null
                New-Item -ItemType Directory -Path (Join-Path $PurvexLabRoot "Quarantine") -Force | Out-Null
                $staged = Join-Path $it "staged-export.zip"
                Set-Content -LiteralPath $staged -Value "PurveX training file. This is not a real archive. It stands in for client data staged in a folder with no business reason to hold it, ready to be pulled out."
                Add-PurvexTicketMark "INC-1076"
                Write-Host "  Planted INC-1076: staged export file" -ForegroundColor Green
            }
        }
    }
    catch { Write-Host "  Could not plant the phishing chain tickets: $($_.Exception.Message)" -ForegroundColor Yellow }
}

# INC-1077 and INC-1078: the third campaign's own Installation, Command and
# Control and Actions on Objectives, planted behind the legacy SMB rule
# (INC-1067) rather than a new entry point. Same proven mechanisms as the
# other two campaigns -- a scheduled task with its own firewall rule, and a
# staged file in a folder with no business reason to hold it -- different
# name, address and location so none of the three campaigns' artifacts ever
# collide.
function Ensure-OpenDoorTickets {
    [CmdletBinding(SupportsShouldProcess = $true)]
    param()

    if (Test-PurvexTicketMark "INC-1078") { return }
    if (-not $PSCmdlet.ShouldProcess("Open door campaign", "Plant third intrusion")) { return }
    Write-Host "`n== Open door campaign tickets ==" -ForegroundColor Cyan

    try {
        if (-not (Test-PurvexTicketMark "INC-1077")) {
            $taskName = "DirectoryReplicationHelper"
            $action = New-ScheduledTaskAction -Execute "powershell.exe" `
                -Argument '-NoProfile -WindowStyle Hidden -Command "Test-NetConnection -ComputerName 203.0.113.104 -Port 7777 -WarningAction SilentlyContinue | Out-Null"'
            $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 15) -RepetitionDuration ([TimeSpan]::MaxValue)
            $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
            Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings `
                -Description "PurveX training file. This is not malware and the connection attempt is harmless: it only reaches a documentation-only address (RFC 5737) that routes nowhere. Treat it as a suspicious persistence mechanism for training." `
                -RunLevel Highest -ErrorAction Stop | Out-Null
            New-NetFirewallRule -DisplayName "Directory Replication Sync" -Group "PurveX Lab" -Direction Outbound -Action Allow `
                -Protocol TCP -RemotePort 7777 -RemoteAddress "203.0.113.104" -Profile Any `
                -Description "CTF-TICKET-1077: training artifact, not a real vulnerability. Permits outbound traffic to a documentation-only address for the open-door campaign." -ErrorAction Stop | Out-Null
            Add-PurvexTicketMark "INC-1077"
            Write-Host "  Planted INC-1077: scheduled task $taskName and its firewall rule" -ForegroundColor Green
        }

        $source = Join-Path $PurvexLabRoot "Shares\Operations\settlement-batches-SAMPLE.csv"
        if ((Test-Path -LiteralPath $source) -and -not (Test-PurvexTicketMark "INC-1078")) {
            $compliance = Join-Path $PurvexLabRoot "Shares\Compliance"
            New-Item -ItemType Directory -Path $compliance -Force | Out-Null
            New-Item -ItemType Directory -Path (Join-Path $PurvexLabRoot "Quarantine") -Force | Out-Null
            $staged = Join-Path $compliance "ops-batch-export.csv"
            Set-Content -LiteralPath $staged -Value "PurveX training file. This is not a real export. It stands in for Operations settlement data staged in a folder with no business reason to hold it, ready to be pulled out."
            Add-PurvexTicketMark "INC-1078"
            Write-Host "  Planted INC-1078: staged export on the Compliance share" -ForegroundColor Green
        }
    }
    catch { Write-Host "  Could not plant the open-door campaign tickets: $($_.Exception.Message)" -ForegroundColor Yellow }
}

# Sysmon, so the lab has a real process-lineage and network-connection log
# beyond what the plain Security log reports. A domain controller runs
# Sysmon with a lighter config than a workstation would -- Process Creation
# and Network Connect only, nothing per-file -- since Sysmon's driver adds
# real overhead and a DC is the one machine in this lab that cannot afford
# much of it. One-time install: if the service already exists, this does
# nothing, so a rerun never reinstalls or restarts it.
function Ensure-Sysmon {
    [CmdletBinding(SupportsShouldProcess = $true)]
    param()

    if (Get-Service -Name "Sysmon64" -ErrorAction SilentlyContinue) { return }
    if (-not $PSCmdlet.ShouldProcess("Sysmon64", "Install")) { return }
    Write-Host "`n== Sysmon ==" -ForegroundColor Cyan

    try {
        $work = Join-Path $env:TEMP "purvex-sysmon"
        New-Item -ItemType Directory -Path $work -Force | Out-Null
        $zip = Join-Path $work "Sysmon.zip"
        Invoke-WebRequest -Uri "https://download.sysinternals.com/files/Sysmon.zip" -OutFile $zip -UseBasicParsing -TimeoutSec 120
        Expand-Archive -LiteralPath $zip -DestinationPath $work -Force
        $config = Join-Path $work "purvex-sysmon-config.xml"
        Set-Content -LiteralPath $config -Encoding ASCII -Value @(
            '&lt;Sysmon schemaversion="4.70"&gt;',
            '  &lt;EventFiltering&gt;',
            '    &lt;ProcessCreate onmatch="exclude"&gt;',
            '    &lt;/ProcessCreate&gt;',
            '    &lt;NetworkConnect onmatch="exclude"&gt;',
            '    &lt;/NetworkConnect&gt;',
            '  &lt;/EventFiltering&gt;',
            '&lt;/Sysmon&gt;'
        )
        $exe = Join-Path $work "Sysmon64.exe"
        &amp; $exe -accepteula -i $config | Out-Null
        Write-Host "  Sysmon installed (Process Creation and Network Connect)" -ForegroundColor Green
    }
    catch { Write-Host "  Could not install Sysmon: $($_.Exception.Message)" -ForegroundColor Yellow }
}

# INC-1079 and INC-1080: a fourth campaign grounded in the real techniques
# CISA, NSA and Australia's ACSC name in their joint September 2024 guide
# "Detecting and Mitigating Active Directory Compromises" -- Kerberoasting
# and DCSync, the two most common ways a domain gets fully compromised
# after an attacker already has one foothold. Neither needs guessed
# passwords or a phishing email: both abuse Kerberos and AD replication
# exactly as designed, which is what makes them hard to catch without
# knowing the specific signature to look for.
function Ensure-KerberoastingTickets {
    [CmdletBinding(SupportsShouldProcess = $true)]
    param([hashtable]$DeptOUPaths, [string]$ServiceAccountsOU)

    if (Test-PurvexTicketMark "INC-1080") { return }
    if (-not $PSCmdlet.ShouldProcess("Kerberoasting campaign", "Plant fourth intrusion")) { return }
    Write-Host "`n== Kerberoasting and DCSync campaign tickets ==" -ForegroundColor Cyan

    try {
        # INC-1079: a service account with a real SPN, deliberately left on
        # RC4 only (no AES), the exact condition every Kerberoasting guide
        # names as the actual weakness -- not the SPN itself, which plenty
        # of real services need, but the encryption type behind it.
        if (-not (Test-PurvexTicketMark "INC-1079")) {
            $sam = "svc-reports"
            if (-not (Get-ADUser -Filter "SamAccountName -eq '$sam'" -ErrorAction SilentlyContinue)) {
                New-ADUser -Name "Service Reports" -SamAccountName $sam `
                    -UserPrincipalName "$sam@$($domain.DNSRoot)" `
                    -Title "Reporting Service" -Department "IT" `
                    -Path $ServiceAccountsOU `
                    -AccountPassword (ConvertTo-SecureString "Winter-Harbor-71" -AsPlainText -Force) `
                    -ChangePasswordAtLogon $false -PasswordNeverExpires $true -Enabled $true -ErrorAction Stop
            }
            Set-ADUser -Identity $sam -Description "CTF-TICKET-1079: Runs the monthly reporting job. Still uses RC4, the way most service accounts did before the domain required AES." -Replace @{ "msDS-SupportedEncryptionTypes" = 4 }
            setspn.exe -A "REPORTS/svc-reports.purvexfinancial.local" $sam | Out-Null
            # One real ticket request for that SPN, so a real 4769 with RC4
            # (0x17) lands in the Security log for the student to find. klist
            # is a built-in Windows tool, not attacker tooling: this is what
            # the service itself would generate just by being used once.
            klist.exe get "REPORTS/svc-reports.purvexfinancial.local" | Out-Null
            Add-PurvexTicketMark "INC-1079"
            Write-Host "  Planted INC-1079: svc-reports (RC4-only SPN) and a real ticket request" -ForegroundColor Green
        }

        # INC-1080: Directory Service Access auditing is off by default, the
        # same way Process Creation auditing was before INC-1060. Fixing
        # this ticket is enabling the subcategory DCSync detection actually
        # depends on, the same shape as that earlier ticket.
        Add-PurvexTicketMark "INC-1080"
    }
    catch { Write-Host "  Could not plant the Kerberoasting campaign tickets: $($_.Exception.Message)" -ForegroundColor Yellow }
}

function Ensure-PodTickets {
    [CmdletBinding(SupportsShouldProcess = $true)]
    param([hashtable]$DeptOUPaths, [string]$ServiceAccountsOU)

    if (-not (Test-PurvexHostedPod)) { return }
    Write-Host "`n== Wire capture ticket ==" -ForegroundColor Cyan

    # INC-1057: the nightly settlement job on web01 still binds to the directory
    # with an LDAP simple bind and reads the batch off the share without SMB
    # encryption, so the service account's password and the file both cross the
    # wire in the clear. The password is planted on purpose: recovering it from
    # the capture is the point of the challenge. It must match the one the job
    # uses in linuxCloudInit (academy-hosted.ts).
    if (-not (Test-PurvexTicketMark "INC-1057") -and $PSCmdlet.ShouldProcess("svc-settlements", "Plant plaintext bind ticket")) {
        try {
            if (-not (Get-ADUser -Filter "SamAccountName -eq 'svc-settlements'" -ErrorAction SilentlyContinue)) {
                New-ADUser -Name "Service Settlements" -SamAccountName "svc-settlements" `
                    -UserPrincipalName "svc-settlements@$($domain.DNSRoot)" `
                    -Title "Nightly Settlement Job" -Department "Operations" `
                    -Path $ServiceAccountsOU `
                    -AccountPassword (ConvertTo-SecureString "Autumn2026" -AsPlainText -Force) `
                    -ChangePasswordAtLogon $false -PasswordNeverExpires $true -Enabled $true -ErrorAction Stop
            }
            Set-ADUser -Identity "svc-settlements" -Description "CTF-TICKET-1057: Nightly settlement job on web01. Signs in to the directory over LDAP and reads the Finance share."
            $finance = Join-Path $PurvexLabRoot "Shares\Finance"
            New-Item -ItemType Directory -Path $finance -Force | Out-Null
            Set-Content -LiteralPath (Join-Path $finance "settlement-batch-0930.csv") -Encoding ASCII -Value @(
                "Reference,Account,Settles,Amount",
                "SB-0930-4417,PVX-WM-00241,2026-09-30,184500.00",
                "SB-0930-4418,PVX-WM-00318,2026-09-30,96250.00",
                "SB-0930-4419,PVX-OP-00107,2026-09-30,12400.00"
            )
            Add-PurvexTicketMark "INC-1057"
            Write-Host "  Planted INC-1057: svc-settlements and the settlement batch" -ForegroundColor Green
        }
        catch { Write-Host "  Could not plant INC-1057: $($_.Exception.Message)" -ForegroundColor Yellow }
    }
}

function Ensure-IntegrityTickets {
    [CmdletBinding(SupportsShouldProcess = $true)]
    param()

    Write-Host "`n== Integrity ticket ==" -ForegroundColor Cyan

    # INC-1058: three mirrors of the same VPN client manifest, one of them altered,
    # plus an exported password table to practise on. The manifests are text so the
    # student can read what changed once the hash tells them something did. Nothing
    # here runs: there is no installer and no payload, only a manifest to compare.
    #
    # The published checksum is computed from the genuine file at plant time rather
    # than written down, so it can never drift from the bytes that actually landed.
    if (-not (Test-PurvexTicketMark "INC-1058") -and $PSCmdlet.ShouldProcess("$PurvexLabRoot\Shares\IT", "Plant integrity ticket")) {
        try {
            $it = Join-Path $PurvexLabRoot "Shares\IT"
            New-Item -ItemType Directory -Path $it -Force | Out-Null
            New-Item -ItemType Directory -Path (Join-Path $PurvexLabRoot "Quarantine") -Force | Out-Null

            $genuine = @(
                "product: PurveX VPN Client",
                "version: 2.4.1",
                "published: 2026-09-22",
                "source: updates.purvexfinancial.local",
                "package: vpn-client-2.4.1.msi",
                "signed-by: PurveX Financial IT"
            )
            # One line differs: the mirror carries a build nobody signed. That is the
            # whole finding, so it is the only thing that changes between the copies.
            $altered = $genuine.Clone()
            $altered[5] = "signed-by: none, unsigned build"

            Set-Content -LiteralPath (Join-Path $it "vpn-client-2.4.1-mirror-a.txt") -Encoding ASCII -Value $genuine
            Set-Content -LiteralPath (Join-Path $it "vpn-client-2.4.1-mirror-b.txt") -Encoding ASCII -Value $altered
            Set-Content -LiteralPath (Join-Path $it "vpn-client-2.4.1-mirror-c.txt") -Encoding ASCII -Value $genuine

            $published = (Get-FileHash -LiteralPath (Join-Path $it "vpn-client-2.4.1-mirror-a.txt") -Algorithm SHA256).Hash.ToLower()
            Set-Content -LiteralPath (Join-Path $it "checksums.txt") -Encoding ASCII -Value @(
                "PurveX VPN Client 2.4.1 published checksum",
                "Issued by PurveX Financial IT on 2026-09-22",
                "",
                "SHA256  $published"
            )

            # SHA-256 of the plaintext with no trailing newline, so the student gets
            # the same value from Get-FileHash, sha256sum or CyberChef. taylor.osei
            # and jordan.ellis share one, which is the reuse the challenge asks about.
            # noah.kim's is not in the wordlist and is meant to stay uncracked.
            Set-Content -LiteralPath (Join-Path $it "exported-hashes.txt") -Encoding ASCII -Value @(
                "account,sha256",
                "taylor.osei,5d2c4f6de7f85dcc139b10980150a5b4e1b2e22328bdac7817aa72c45e41b3b3",
                "riley.kwan,e66860546f18cdbbcd86b35e18b525bffc67f772c650cedfe3ff7a0026fa1dee",
                "jordan.ellis,5d2c4f6de7f85dcc139b10980150a5b4e1b2e22328bdac7817aa72c45e41b3b3",
                "noah.kim,182fab5b9ae430222e015c1023068b78b1ba9d114bbd1c0413ccccb16a2f4a5d"
            )
            Set-Content -LiteralPath (Join-Path $it "common-passwords.txt") -Encoding ASCII -Value @(
                "123456", "password", "qwerty", "letmein", "welcome", "admin",
                "Summer2025", "Autumn2025", "Winter2025", "Spring2026",
                "Summer2026", "Autumn2026", "Winter2026", "Spring2025",
                "Passw0rd!", "P@ssw0rd", "Welcome1", "ChangeMe1",
                "purvex", "Purvex2026"
            )

            if (-not (Get-SmbShare -Name "Shares" -ErrorAction SilentlyContinue)) {
                New-SmbShare -Name "Shares" -Path (Join-Path $PurvexLabRoot "Shares") -ReadAccess "Domain Users" -ErrorAction SilentlyContinue | Out-Null
            }
            Add-PurvexTicketMark "INC-1058"
            Write-Host "  Planted INC-1058: three mirrors, a checksum and a password table" -ForegroundColor Green
        }
        catch { Write-Host "  Could not plant INC-1058: $($_.Exception.Message)" -ForegroundColor Yellow }
    }

    # Synthetic records for training, one set per department share, kept by the
    # people who own that work in the lab. Every value is one that cannot belong
    # to a real person or account: SSNs in the never-issued 900 range, phone
    # numbers in the 555-0100 to 555-0199 block reserved for fiction, example.com
    # email, account numbers marked TEST, and names marked SAMPLE. Each file says
    # so in its first line.
    if (-not (Test-PurvexTicketMark "DATA-SAMPLE") -and $PSCmdlet.ShouldProcess("$PurvexLabRoot\Shares", "Plant synthetic department records")) {
        try {
            $banner = "# SYNTHETIC TRAINING DATA - NOT REAL PEOPLE OR ACCOUNTS - PurveX Financial lab"
            $shares = Join-Path $PurvexLabRoot "Shares"
            $sets = [ordered]@{
                # Wealth Management: the advisors' book of clients.
                "Clients\client-register-SAMPLE.csv" = @(
                    "client_id,name,ssn,phone,email,advisor,since",
                    "C-1001,Avery SAMPLE,900-01-0001,555-0101,avery.sample@example.com,sam.whitfield,2019-03-04",
                    "C-1002,Blake SAMPLE,900-01-0002,555-0102,blake.sample@example.com,jamie.torres,2020-07-15",
                    "C-1003,Casey SAMPLE,900-01-0003,555-0103,casey.sample@example.com,sam.whitfield,2018-11-02",
                    "C-1004,Drew SAMPLE,900-01-0004,555-0104,drew.sample@example.com,jamie.torres,2021-01-20",
                    "C-1005,Emery SAMPLE,900-01-0005,555-0105,emery.sample@example.com,sam.whitfield,2022-05-09",
                    "C-1006,Finley SAMPLE,900-01-0006,555-0106,finley.sample@example.com,jamie.torres,2017-08-30",
                    "C-1007,Gray SAMPLE,900-01-0007,555-0107,gray.sample@example.com,sam.whitfield,2023-02-14",
                    "C-1008,Harper SAMPLE,900-01-0008,555-0108,harper.sample@example.com,jamie.torres,2020-10-01"
                )
                "WealthManagement\portfolio-summary-SAMPLE.csv" = @(
                    "client_id,account,advisor,risk_profile,balance_usd,last_review",
                    "C-1001,TEST-ACCT-0001,sam.whitfield,Moderate,412500,2026-09-12",
                    "C-1002,TEST-ACCT-0002,jamie.torres,Conservative,188200,2026-08-28",
                    "C-1003,TEST-ACCT-0003,sam.whitfield,Growth,903750,2026-09-03",
                    "C-1004,TEST-ACCT-0004,jamie.torres,Moderate,256900,2026-07-19",
                    "C-1005,TEST-ACCT-0005,sam.whitfield,Conservative,97400,2026-09-21",
                    "C-1006,TEST-ACCT-0006,jamie.torres,Growth,1240300,2026-08-05",
                    "C-1007,TEST-ACCT-0007,sam.whitfield,Moderate,330150,2026-09-30",
                    "C-1008,TEST-ACCT-0008,jamie.torres,Conservative,145800,2026-08-17"
                )
                # Compliance: know-your-customer reviews on the same clients.
                "Compliance\kyc-review-log-SAMPLE.csv" = @(
                    "client_id,reviewer,review_date,id_verified,risk_rating,status",
                    "C-1001,devon.brooks,2026-06-02,yes,Low,Approved",
                    "C-1002,morgan.lee,2026-06-09,yes,Low,Approved",
                    "C-1003,devon.brooks,2026-06-16,yes,Medium,Approved",
                    "C-1004,morgan.lee,2026-07-01,pending,Medium,Awaiting documents",
                    "C-1005,devon.brooks,2026-07-08,yes,Low,Approved",
                    "C-1006,morgan.lee,2026-07-22,yes,High,Enhanced review",
                    "C-1007,devon.brooks,2026-08-04,yes,Low,Approved",
                    "C-1008,morgan.lee,2026-08-18,pending,Low,Awaiting documents"
                )
                # Finance and Accounting: vendor payments. LedgerLine is the vendor
                # from the Week 2 password lab.
                "Finance\vendor-payments-SAMPLE.csv" = @(
                    "invoice,vendor,amount_usd,pay_to_account,due,approved_by",
                    "INV-7301,LedgerLine,18450.00,TEST-BANK-0101,2026-10-31,jordan.ellis",
                    "INV-7302,Northwind Office Supply,2310.75,TEST-BANK-0102,2026-10-24,jordan.ellis",
                    "INV-7303,Contoso Data Feeds,9800.00,TEST-BANK-0103,2026-11-07,jordan.ellis",
                    "INV-7304,Fabrikam Facilities,4125.50,TEST-BANK-0104,2026-10-28,jordan.ellis",
                    "INV-7305,LedgerLine,18450.00,TEST-BANK-0101,2026-11-30,jordan.ellis"
                )
                # Operations: settlement batches the nightly job reconciles.
                "Operations\settlement-batches-SAMPLE.csv" = @(
                    "batch,run_date,trades,net_usd,reconciled_by,status",
                    "SB-2026-1012,2026-10-12,214,1873420.18,riley.kwan,Reconciled",
                    "SB-2026-1013,2026-10-13,198,-402115.60,riley.kwan,Reconciled",
                    "SB-2026-1014,2026-10-14,231,965240.02,taylor.osei,Reconciled",
                    "SB-2026-1015,2026-10-15,187,288013.47,taylor.osei,Exception: 2 trades unmatched",
                    "SB-2026-1016,2026-10-16,205,1120588.90,riley.kwan,Reconciled"
                )
            }
            foreach ($rel in $sets.Keys) {
                $path = Join-Path $shares $rel
                New-Item -ItemType Directory -Path (Split-Path -Parent $path) -Force | Out-Null
                # Created once and never overwritten, so a student's change stays theirs.
                if (-not (Test-Path -LiteralPath $path)) {
                    Set-Content -LiteralPath $path -Encoding ASCII -Value (@($banner) + $sets[$rel])
                }
            }
            if (-not (Get-SmbShare -Name "Shares" -ErrorAction SilentlyContinue)) {
                New-SmbShare -Name "Shares" -Path $shares -ReadAccess "Domain Users" -ErrorAction SilentlyContinue | Out-Null
            }
            Add-PurvexTicketMark "DATA-SAMPLE"
            Write-Host "  Planted synthetic department records on Shares" -ForegroundColor Green
        }
        catch { Write-Host "  Could not plant synthetic department records: $($_.Exception.Message)" -ForegroundColor Yellow }
    }
}

# Firewall rules in the PurveX Lab group, read straight from the registry. That
# takes milliseconds, where the firewall cmdlets need most of a second.
$PurvexFirewallKey = "HKLM:\SYSTEM\CurrentControlSet\Services\SharedAccess\Parameters\FirewallPolicy\FirewallRules"
$PurvexLabRuleMatch = '\|EmbedCtxt=PurveX Lab(\||$)'

function Get-PurvexFirewallRules {
    $rules = @()
    try {
        $item = Get-Item -LiteralPath $PurvexFirewallKey -ErrorAction Stop
        foreach ($valueName in $item.GetValueNames()) {
            $data = [string]$item.GetValue($valueName)
            if ($data -notmatch $PurvexLabRuleMatch) { continue }
            $f = @{}
            foreach ($pair in $data.Split('|')) {
                $kv = $pair.Split('=', 2)
                if ($kv.Count -eq 2) { if ($f.ContainsKey($kv[0])) { $f[$kv[0]] += "," + $kv[1] } else { $f[$kv[0]] = $kv[1] } }
            }
            $rules += [ordered]@{
                name          = $f["Name"]
                enabled       = ($f["Active"] -eq "TRUE")
                direction     = "$($f['Dir'])"
                action        = "$($f['Action'])"
                localPort     = "$($f['LPort'])"
                remoteAddress = $(if ($f["RA4"]) { $f["RA4"] } else { "Any" })
            }
        }
    }
    catch {}
    # Fall back to the cmdlets if the registry layout ever differs.
    if (-not $rules.Count) {
        try {
            $rules = @(Get-NetFirewallRule -Group "PurveX Lab" -ErrorAction Stop | ForEach-Object {
                [ordered]@{
                    name          = $_.DisplayName
                    enabled       = ("$($_.Enabled)" -eq "True")
                    direction     = "$($_.Direction)"
                    action        = "$($_.Action)"
                    localPort     = "$(($_ | Get-NetFirewallPortFilter).LocalPort -join ',')"
                    remoteAddress = "$(($_ | Get-NetFirewallAddressFilter).RemoteAddress -join ',')"
                }
            })
        }
        catch {}
    }
    return $rules
}

function Get-PurvexLabFiles {
    $files = @()
    foreach ($sub in @("Shares", "Quarantine")) {
        $dir = Join-Path $PurvexLabRoot $sub
        if (Test-Path -LiteralPath $dir) {
            $files += @(Get-ChildItem -LiteralPath $dir -Recurse -File -Force -ErrorAction SilentlyContinue | Select-Object -First 200)
        }
    }
    return $files
}

# A cheap fingerprint of the firewall rules and the lab shares, taken every second.
# DNS and Group Policy changes are caught by the directory watch instead.
function Get-PurvexLastActivePath {
    $dir = Join-Path $env:ProgramData "PurveX"
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    return (Join-Path $dir "last-active.txt")
}

# Has anyone signed in since this lab came up? A file rather than a variable,
# because the answer has to survive leaving this process: the sync loop runs
# for hours but an on-demand sync is its own short-lived run, and in that one
# a variable would always start false and report a lab in active use as one
# nobody has opened. Dropped when the loop starts, so it means this boot.
function Get-PurvexConnectedPath {
    $dir = Join-Path $env:ProgramData "PurveX"
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    return (Join-Path $dir "connected.txt")
}

# Minutes with nobody at the keyboard, so Range can stop a lab the student
# walked away from and hand the rest of the session back. A task running as
# SYSTEM cannot read GetLastInputInfo for someone's remote session, so this
# reads the session table instead: quser reports each session's own idle time.
# The stamp file carries the answer between sends, which makes a lab that was
# opened and then closed read as idle from the moment the session ended rather
# than from zero.
function Get-PurvexIdleMinutes {
    $stamp = Get-PurvexLastActivePath
    $idle = $null
    try {
        foreach ($line in @(quser 2&gt;$null)) {
            if ($line -notmatch '\bActive\b') { continue }
            $v = ([regex]::Match($line, '\bActive\s+(\S+)')).Groups[1].Value
            $mins = switch -regex ($v) {
                '^\.$' { 0; break }
                '^\d+$' { [int]$v; break }
                '^(\d+)\+(\d+):(\d+)$' { ([int]$Matches[1]) * 1440 + ([int]$Matches[2]) * 60 + [int]$Matches[3]; break }
                '^(\d+):(\d+)$' { ([int]$Matches[1]) * 60 + [int]$Matches[2]; break }
                default { 0 }
            }
            if ($null -eq $idle -or $mins -lt $idle) { $idle = $mins }
        }
    }
    catch { }
    if ($null -ne $idle) {
        Set-Content -LiteralPath $stamp -Value ((Get-Date).ToUniversalTime().AddMinutes(-$idle).ToString("o")) -ErrorAction SilentlyContinue
        Set-Content -LiteralPath (Get-PurvexConnectedPath) -Value ((Get-Date).ToUniversalTime().ToString("o")) -ErrorAction SilentlyContinue
        return [int]$idle
    }
    # Nobody is signed in now. That is only idleness if somebody was earlier:
    # a lab the student has started and not opened yet looks exactly the same
    # from here, and it is not idle, it is new. The flag goes with the number
    # so the server can tell the two apart and wait longer for the second.
    # A sign-in seen earlier in this run keeps the flag, since the student may
    # simply have closed the window.
    $since = $null
    try { $since = [datetime]::Parse((Get-Content -LiteralPath $stamp -Raw -ErrorAction Stop).Trim(), $null, [Globalization.DateTimeStyles]::RoundtripKind) } catch { }
    if ($null -eq $since) {
        try { $since = (Get-CimInstance Win32_OperatingSystem -ErrorAction Stop).LastBootUpTime.ToUniversalTime() } catch { $since = (Get-Date).ToUniversalTime() }
    }
    return [int][Math]::Max(0, ((Get-Date).ToUniversalTime() - $since).TotalMinutes)
}

function Get-PurvexInfraPrint {
    $parts = @()
    try {
        $item = Get-Item -LiteralPath $PurvexFirewallKey -ErrorAction Stop
        foreach ($valueName in $item.GetValueNames()) {
            $data = [string]$item.GetValue($valueName)
            if ($data -match $PurvexLabRuleMatch) { $parts += "$valueName=$data" }
        }
    }
    catch {}
    $parts += @(Get-PurvexLabFiles | ForEach-Object { "$($_.FullName)|$($_.Length)" })
    return (@($parts) | Sort-Object) -join "`n"
}

# GPO display names by GUID, read from the directory and cached until a link
# names a GPO the cache has not seen.
function Get-PurvexGpoNames {
    param([string]$DomainDN, [switch]$Refresh)
    if ($Refresh -or -not $script:PurvexGpoNames) {
        $names = @{}
        try {
            Get-ADObject -SearchBase "CN=Policies,CN=System,$DomainDN" -SearchScope OneLevel -Filter "objectClass -eq 'groupPolicyContainer'" -Properties displayName -ErrorAction Stop |
                ForEach-Object { $names[$_.Name.Trim('{', '}').ToLower()] = $_.displayName }
        }
        catch {}
        $script:PurvexGpoNames = $names
    }
    return $script:PurvexGpoNames
}

# The enabled GPO links on one OU, from its gPLink attribute.
function Get-PurvexOuLinks {
    param([string]$GpLink, [string]$DomainDN)
    if (-not $GpLink) { return @() }
    $found = @([regex]::Matches($GpLink, '\[LDAP://cn=\{([0-9a-fA-F-]{36})\}[^;\]]*;(\d+)\]') |
        Where-Object { ([int]$_.Groups[2].Value -band 1) -eq 0 } |
        ForEach-Object { $_.Groups[1].Value.ToLower() })
    $names = Get-PurvexGpoNames -DomainDN $DomainDN
    if (@($found | Where-Object { -not $names.ContainsKey($_) }).Count) { $names = Get-PurvexGpoNames -DomainDN $DomainDN -Refresh }
    return @($found | ForEach-Object { $names[$_] } | Where-Object { $_ })
}

# Everything outside Active Directory that the tickets check: DNS, the firewall,
# Group Policy links and the lab shares.
function Get-PurvexInfra {
    param($Domain, [array]$GpoLinks = @())
    $infra = [ordered]@{ v = 2 }
    # "$_" on purpose. Get-Content hands back strings decorated with PSPath,
    # PSDrive and PSProvider, and ConvertTo-Json serialises those too: seven
    # ticket ids came to 2.6 MB of provider metadata, which the upload refused
    # as too large, so the lab never finished linking.
    try { $infra.planted = @(Get-Content -LiteralPath (Join-Path $PurvexLabRoot "tickets.txt") -ErrorAction Stop | Where-Object { $_ } | ForEach-Object { "$_" }) } catch { $infra.planted = @() }
    $infra.firewall = @(Get-PurvexFirewallRules)
    try {
        $records = @(Get-DnsServerResourceRecord -ZoneName $Domain.DNSRoot -RRType A -ErrorAction Stop)
        $infra.dns = @($records | Where-Object { $_.HostName -notmatch '^(@|DomainDnsZones|ForestDnsZones)$' } | Select-Object -First 100 | ForEach-Object {
            [ordered]@{ name = $_.HostName; ip = "$($_.RecordData.IPv4Address)" }
        })
        $infra.dcIps = @($records | Where-Object { $_.HostName -eq "@" -or $_.HostName -eq $env:COMPUTERNAME } | ForEach-Object { "$($_.RecordData.IPv4Address)" } | Select-Object -Unique)
    }
    catch {}
    $infra.gpos = @((Get-PurvexGpoNames -DomainDN $Domain.DistinguishedName).Values)
    $infra.gpoLinks = @($GpoLinks)
    $infra.files = @(Get-PurvexLabFiles | ForEach-Object {
        [ordered]@{ path = $_.FullName.Substring($PurvexLabRoot.Length + 1); size = [int64]$_.Length }
    })
    return $infra
}

# The ticket objects that are safe to plant at any time: each is created only
# when it is missing, so a rerun never touches an account, group or file the
# student has already changed. Shared by the first-boot build and the repair
# path that heals a lab built before a ticket shipped.
function Ensure-PurvexTicketObjects {
    [CmdletBinding(SupportsShouldProcess = $true)]
    param(
        [hashtable]$DeptOUPaths,
        [string]$DomainDN,
        [string]$AccessLevelsOU,
        [string]$ServiceAccountsOU
    )

    $wmWorkstationsOU = Ensure-OU -Name "Workstations" -ParentDN $DeptOUPaths["Wealth Management"].DeptOU -Description "Wealth Management department workstation computer objects."
    Ensure-Computer -Name "WM-WKS07" -OUPath $wmWorkstationsOU -Description "CTF-TICKET-301: Wealth Management workstation named in a 02:00 successful-login alert for alex.rivera."
    $opsWorkstationsOU = Ensure-OU -Name "Workstations" -ParentDN $DeptOUPaths["Operations"].DeptOU -Description "Operations department workstation computer objects."
    Ensure-Computer -Name "OPS-WKS03" -OUPath $opsWorkstationsOU -Description "CTF-TICKET-201: Dormant Operations workstation. Check whether this asset still belongs in scope."

    # Tickets INC-1047 to INC-1051. Each object is planted only the first time, so
    # running the script again never undoes a ticket the student already worked.

    # INC-1047: a contractor whose engagement has ended, still enabled with access.
    if (-not (Get-ADUser -Filter "SamAccountName -eq 'kai.mendes'" -ErrorAction SilentlyContinue)) {
        Ensure-User `
            -First "Kai" -Last "Mendes" -SamAccountName "kai.mendes" `
            -Title "Contractor, Settlements Support" -Department "Operations" `
            -OUPath $DeptOUPaths["Operations"].UsersOU `
            -Groups @("Operations Users")
        Ensure-UserDescription -SamAccountName "kai.mendes" -Description "CTF-TICKET-1047: Contractor. Engagement ended 2026-09-30. Sponsor: Taylor Osei."
    }

    # INC-1049: a staff account whose password was set to never expire.
    if (-not (Get-ADUser -Filter "SamAccountName -eq 'noah.kim'" -ErrorAction SilentlyContinue)) {
        Ensure-User `
            -First "Noah" -Last "Kim" -SamAccountName "noah.kim" `
            -Title "Portfolio Analyst" -Department "Wealth Management" `
            -OUPath $DeptOUPaths["Wealth Management"].UsersOU `
            -Groups @("Wealth Management Users")
        if ($PSCmdlet.ShouldProcess("noah.kim", "Set password never expires for audit ticket")) {
            Set-ADUser -Identity "noah.kim" -PasswordNeverExpires $true -ChangePasswordAtLogon $false
            Write-Host "    ~ noah.kim password set to never expire" -ForegroundColor Green
        }
    }

    # INC-1050: a new Finance laptop that landed in the default Computers container.
    $finWorkstationsOU = Ensure-OU -Name "Workstations" -ParentDN $DeptOUPaths["Finance and Accounting"].DeptOU -Description "Finance and Accounting department workstation computer objects."
    if (-not (Get-ADComputer -Filter "Name -eq 'FIN-LT14'" -ErrorAction SilentlyContinue) -and $PSCmdlet.ShouldProcess("FIN-LT14", "Create laptop in the default Computers container")) {
        New-ADComputer -Name "FIN-LT14" -SAMAccountName "FIN-LT14$" -Path "CN=Computers,$DomainDN" -Description "CTF-TICKET-1050: New Finance laptop for jordan.ellis. Joined to the domain 2026-09-29."
        Write-Host "  Computer pre-staged: FIN-LT14 (CN=Computers)" -ForegroundColor Green
    }

    # INC-1051: a distribution group being used to grant access to a share.
    if (-not (Get-ADGroup -Filter "Name -eq 'Finance Reports'" -ErrorAction SilentlyContinue) -and $PSCmdlet.ShouldProcess("Finance Reports", "Create distribution group")) {
        New-ADGroup -Name "Finance Reports" -GroupScope Global -GroupCategory Distribution -Path $AccessLevelsOU -Description "CTF-TICKET-1051: Read access to the Finance reports share."
        Add-ADGroupMember -Identity "Finance Reports" -Members "jordan.ellis", "devon.brooks"
        Write-Host "  Group created: Finance Reports (Distribution)" -ForegroundColor Green
    }

    # INC-1065: an account whose own record already explains an odd-hours
    # alert, planted for the investigation-mindset lesson. Nothing about this
    # one needs fixing -- the point is reading the record before reacting.
    if (-not (Get-ADUser -Filter "SamAccountName -eq 'morgan.reyes'" -ErrorAction SilentlyContinue)) {
        Ensure-User `
            -First "Morgan" -Last "Reyes" -SamAccountName "morgan.reyes" `
            -Title "Systems Engineer, Overnight Operations" -Department "IT" `
            -OUPath $DeptOUPaths["IT"].UsersOU `
            -Groups @("IT Users")
        Ensure-UserDescription -SamAccountName "morgan.reyes" -Description "CTF-TICKET-1065: Approved overnight change window 01:00-05:00 for patch deployment. Contact: IT on-call."
    }

    # INC-1066: four Compliance Analysts who should share one baseline, planted
    # for the baselines-and-outliers lesson. Three share nothing but
    # Compliance Users. The fourth also sits in Server Admins, which the role
    # never needs -- the outlier the comparison is built to surface.
    foreach ($peer in @(
        @{ First = "Nina"; Last = "Castillo"; Sam = "nina.castillo" },
        @{ First = "Owen"; Last = "Brandt"; Sam = "owen.brandt" },
        @{ First = "Lena"; Last = "Farooq"; Sam = "lena.farooq" }
    )) {
        if (-not (Get-ADUser -Filter "SamAccountName -eq '$($peer.Sam)'" -ErrorAction SilentlyContinue)) {
            Ensure-User `
                -First $peer.First -Last $peer.Last -SamAccountName $peer.Sam `
                -Title "Compliance Analyst" -Department "Compliance" `
                -OUPath $DeptOUPaths["Compliance"].UsersOU `
                -Groups @("Compliance Users")
        }
    }
    if (-not (Get-ADUser -Filter "SamAccountName -eq 'theo.walsh'" -ErrorAction SilentlyContinue)) {
        Ensure-User `
            -First "Theo" -Last "Walsh" -SamAccountName "theo.walsh" `
            -Title "Compliance Analyst" -Department "Compliance" `
            -OUPath $DeptOUPaths["Compliance"].UsersOU `
            -Groups @("Compliance Users", "Server Admins")
        Ensure-UserDescription -SamAccountName "theo.walsh" -Description "CTF-TICKET-1066: Compliance Analyst. Server Admins membership predates this role; never reviewed after the transfer."
    }

    # INC-1070: the Phase 2 capstone's second artifact, planted alongside
    # INC-1069 as the same overnight chain -- a support account added to
    # Server Admins the same week the scheduled task appeared. No HR record
    # explains the grant.
    if (-not (Get-ADUser -Filter "SamAccountName -eq 'ezra.lund'" -ErrorAction SilentlyContinue)) {
        Ensure-User `
            -First "Ezra" -Last "Lund" -SamAccountName "ezra.lund" `
            -Title "IT Support Specialist" -Department "IT" `
            -OUPath $DeptOUPaths["IT"].UsersOU `
            -Groups @("IT Users", "Server Admins")
        Ensure-UserDescription -SamAccountName "ezra.lund" -Description "CTF-TICKET-1070: IT Support Specialist. Server Admins added this week; no change ticket or HR record on file for it."
    }

    # INC-1071: a Help Desk technician added to Compliance Users months ago to
    # pull an export for an audit, and never taken back out. She can still
    # open the Compliance share's case files even though her own job never
    # touches them -- the Week 4 effective-access lab's own ticket.
    if (-not (Get-ADUser -Filter "SamAccountName -eq 'noor.ahmadi'" -ErrorAction SilentlyContinue)) {
        Ensure-User `
            -First "Noor" -Last "Ahmadi" -SamAccountName "noor.ahmadi" `
            -Title "Help Desk Technician" -Department "IT" `
            -OUPath $DeptOUPaths["IT"].UsersOU `
            -Groups @("IT Users", "Compliance Users")
        Ensure-UserDescription -SamAccountName "noor.ahmadi" -Description "CTF-TICKET-1071: Help Desk Technician. Added to Compliance Users in March to export client review data for an audit; access was never removed afterward."
    }

    Ensure-InfraTickets -DeptOUPaths $DeptOUPaths
    Ensure-SigninLogTickets -DeptOUPaths $DeptOUPaths -AccessLevelsOU $AccessLevelsOU -ServiceAccountsOU $ServiceAccountsOU
    Ensure-PodTickets -DeptOUPaths $DeptOUPaths -ServiceAccountsOU $ServiceAccountsOU
    Ensure-IntegrityTickets
    # Runs after Ensure-IntegrityTickets: INC-1076 needs the WealthManagement
    # sample file DATA-SAMPLE plants, and both need to land in the same build
    # run rather than needing a second pass.
    Ensure-PhishingChainTickets -DeptOUPaths $DeptOUPaths
    # Also after Ensure-IntegrityTickets: INC-1078 needs the Operations
    # sample file DATA-SAMPLE plants.
    Ensure-OpenDoorTickets
    Ensure-Sysmon
    Ensure-KerberoastingTickets -DeptOUPaths $DeptOUPaths -ServiceAccountsOU $ServiceAccountsOU
}

function Ensure-CTFChallengeData {
    [CmdletBinding(SupportsShouldProcess = $true)]
    param(
        [hashtable]$DeptOUPaths,
        [string]$DomainDN,
        [string]$AccessLevelsOU,
        [System.Security.SecureString]$Password
    )

    Write-Host "`n== Optional CTF ticket queue data ==" -ForegroundColor Cyan

    $serviceAccountsOU = Ensure-OU -Name "ServiceAccounts" -ParentDN $DomainDN -Description "Service accounts, kept separate from real user accounts. CTF-TICKET-1044: Approved nightly backup window 01:00-03:00."
    Ensure-Group -Name "All Employees" -OUPath $AccessLevelsOU -Scope "Universal" -Description "Firm-wide distribution group for company-wide announcements."

    foreach ($sam in @("alex.rivera", "priya.nair", "devon.brooks", "morgan.lee", "sam.whitfield", "taylor.osei", "riley.kwan", "jordan.ellis")) {
        $isMember = Get-ADGroupMember -Identity "All Employees" -ErrorAction SilentlyContinue |
            Where-Object { $_.SamAccountName -eq $sam }
        if (-not $isMember -and $PSCmdlet.ShouldProcess("$sam -&gt; All Employees", "Add group membership")) {
            Add-ADGroupMember -Identity "All Employees" -Members $sam
            Write-Host "    + $sam added to All Employees" -ForegroundColor Green
        }
    }

    Ensure-User `
        -First "Old" -Last "Intern" -SamAccountName "old.intern" `
        -Title "Intern" -Department "IT" `
        -OUPath $DeptOUPaths["IT"].UsersOU `
        -Groups @("IT Users")
    Ensure-UserDescription -SamAccountName "old.intern" -Description "CTF-TICKET-1043: Leftover intern account. Remove this account when you onboard the new hire."

    Ensure-User `
        -First "Service" -Last "Backup" -SamAccountName "svc-backup-job" `
        -Title "Nightly Backup Service Account" -Department "IT" `
        -OUPath $serviceAccountsOU `
        -Groups @("IT Users")
    if ($PSCmdlet.ShouldProcess("svc-backup-job", "Apply service-account flags")) {
        $svc = Get-ADUser -Identity "svc-backup-job" -Properties Description
        $svcArgs = @{
            Identity              = "svc-backup-job"
            PasswordNeverExpires  = $true
            ChangePasswordAtLogon = $false
        }
        if (-not $svc.Description -or $svc.Description -eq "Window not set") {
            $svcArgs.Description = "Window not set"
        }
        Set-ADUser @svcArgs
        Write-Host "    ~ svc-backup-job service-account flags applied" -ForegroundColor Green
    }

    if ($PSCmdlet.ShouldProcess("riley.kwan", "Disable account for lockout ticket")) {
        Disable-ADAccount -Identity "riley.kwan"
        Write-Host "    ~ riley.kwan disabled" -ForegroundColor Green
    }

    Ensure-UserDescription -SamAccountName "jamie.torres" -Description "CTF-TICKET-1041: New Wealth Management hire. Should receive firm-wide announcements but is missing All Employees."
    Ensure-UserDescription -SamAccountName "taylor.osei" -Description "CTF-TICKET-1045: HR transfer notice says Compliance. Account still lives in Operations until someone moves it."
    Ensure-UserDescription -SamAccountName "riley.kwan" -Description "CTF-TICKET-1042: User reports lockout. Check the Account tab before you take the action they named."

    Ensure-PurvexTicketObjects -DeptOUPaths $DeptOUPaths -DomainDN $DomainDN -AccessLevelsOU $AccessLevelsOU -ServiceAccountsOU $serviceAccountsOU
}

# Read-only security settings, so PurveX can check the hardening drills. Each
# piece is optional: if one cannot be read, the rest still sync.
# A digest of the real Security log, so the weekly CTF can ask about what really
# happened in this lab. Counts and names only: no raw events, no passwords.
# Every part is optional; if the log cannot be read, the rest of the sync still works.
function Get-PurvexEventDigest {
    $days = 30
    # v2 adds 4738 (account changed) and 4739 (policy changed); v3 adds 4719 (audit
    # policy changed). Range only enforces each as evidence when it sees a high
    # enough v, so older labs keep working unchanged.
    $digest = [ordered]@{ windowDays = $days; v = 3 }
    $iso = { param($d) ([datetime]$d).ToUniversalTime().ToString("o") }
    $skip = { param($n) (-not $n) -or ($n -eq "-") -or ($n.EndsWith('$')) -or ($n -match '^(ANONYMOUS LOGON|SYSTEM|LOCAL SERVICE|NETWORK SERVICE)$') }
    $short = { param($dn) (($dn -split '(?&lt;!\\),', 2)[0] -replace '^(CN|OU)=', '') }
    try {
        $events = @(Get-WinEvent -FilterHashtable @{ LogName = "Security"; Id = 4625, 4771, 4740, 4720, 4725, 4728, 4732, 4756, 4738, 4739, 4719; StartTime = (Get-Date).AddDays(-$days) } -MaxEvents 4000 -ErrorAction Stop)
    }
    catch { return $digest }

    $rows = foreach ($e in $events) {
        $data = @{}
        foreach ($d in ([xml]$e.ToXml()).Event.EventData.Data) { $data[$d.Name] = $d.'#text' }
        [pscustomobject]@{ Id = $e.Id; Time = $e.TimeCreated; Target = $data["TargetUserName"]; Subject = $data["SubjectUserName"]; Member = $data["MemberName"] }
    }
    $count = {
        param($ids)
        @($rows | Where-Object { $ids -contains $_.Id -and -not (&amp; $skip $_.Target) } | Group-Object Target | Sort-Object Count -Descending | Select-Object -First 15 | ForEach-Object {
            [ordered]@{ account = $_.Name; count = $_.Count; last = (&amp; $iso (($_.Group | Sort-Object Time -Descending | Select-Object -First 1).Time)) }
        })
    }
    $digest.failures = &amp; $count @(4625, 4771)
    $digest.lockouts = &amp; $count @(4740)
    $digest.created = @($rows | Where-Object { $_.Id -eq 4720 } | Sort-Object Time -Descending | Select-Object -First 30 | ForEach-Object {
        [ordered]@{ account = $_.Target; at = (&amp; $iso $_.Time); by = $_.Subject }
    })
    $digest.disabled = @($rows | Where-Object { $_.Id -eq 4725 } | Sort-Object Time -Descending | Select-Object -First 30 | ForEach-Object {
        [ordered]@{ account = $_.Target; at = (&amp; $iso $_.Time); by = $_.Subject }
    })
    $digest.groupAdds = @($rows | Where-Object { @(4728, 4732, 4756) -contains $_.Id } | Sort-Object Time -Descending | Select-Object -First 40 | ForEach-Object {
        [ordered]@{ member = (&amp; $short $_.Member); group = $_.Target; at = (&amp; $iso $_.Time); by = $_.Subject }
    })
    # 4738: a user account was changed (flags like PASSWD_NOTREQD, delegation, no-preauth).
    $digest.accountChanges = @($rows | Where-Object { $_.Id -eq 4738 -and -not (&amp; $skip $_.Target) } | Sort-Object Time -Descending | Select-Object -First 40 | ForEach-Object {
        [ordered]@{ account = $_.Target; at = (&amp; $iso $_.Time); by = $_.Subject }
    })
    # 4739: a domain policy was changed (password/lockout policy).
    $digest.policyChanges = @($rows | Where-Object { $_.Id -eq 4739 } | Sort-Object Time -Descending | Select-Object -First 20 | ForEach-Object {
        [ordered]@{ at = (&amp; $iso $_.Time); by = $_.Subject }
    })
    # 4719: a system audit policy was changed (a subcategory turned on or off).
    $digest.auditChanges = @($rows | Where-Object { $_.Id -eq 4719 } | Sort-Object Time -Descending | Select-Object -First 20 | ForEach-Object {
        [ordered]@{ at = (&amp; $iso $_.Time); by = $_.Subject }
    })
    return $digest
}

function Get-PurvexSecurityState {
    param($Domain)
    $sec = [ordered]@{}
    try {
        $pp = Get-ADDefaultDomainPasswordPolicy -Identity $Domain.DNSRoot
        $sec.passwordPolicy = [ordered]@{
            minLength          = [int]$pp.MinPasswordLength
            complexity         = [bool]$pp.ComplexityEnabled
            history            = [int]$pp.PasswordHistoryCount
            maxAgeDays         = [int]$pp.MaxPasswordAge.TotalDays
            lockoutThreshold   = [int]$pp.LockoutThreshold
            lockoutDurationMin = [int]$pp.LockoutDuration.TotalMinutes
            lockoutWindowMin   = [int]$pp.LockoutObservationWindow.TotalMinutes
            reversible         = [bool]$pp.ReversibleEncryptionEnabled
        }
    } catch {}
    try {
        $wanted = @("Logon", "Account Lockout", "Special Logon", "Process Creation", "Security Group Management", "User Account Management")
        $audit = [ordered]@{}
        foreach ($row in (auditpol /get /category:* /r | ConvertFrom-Csv)) {
            if ($wanted -contains $row.Subcategory) { $audit[$row.Subcategory] = "$($row.'Inclusion Setting')" }
        }
        if ($audit.Count -gt 0) { $sec.audit = $audit }
    } catch {}
    try { $sec.securityLogMaxMB = [int]((Get-WinEvent -ListLog Security).MaximumSizeInBytes / 1MB) } catch {}
    try { $sec.smb1 = [bool](Get-SmbServerConfiguration).EnableSMB1Protocol } catch {}
    try {
        $sbl = Get-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging" -Name EnableScriptBlockLogging -ErrorAction SilentlyContinue
        $sec.scriptBlockLogging = [bool]($sbl -and $sbl.EnableScriptBlockLogging -eq 1)
    } catch {}
    try {
        $sec.psos = @(Get-ADFineGrainedPasswordPolicy -Filter * | ForEach-Object {
            [ordered]@{
                name             = $_.Name
                precedence       = [int]$_.Precedence
                minLength        = [int]$_.MinPasswordLength
                lockoutThreshold = [int]$_.LockoutThreshold
                appliesTo        = @($_.AppliesTo | ForEach-Object { (($_ -split '(?&lt;!\\),', 2)[0] -replace '^(CN|OU)=', '') })
            }
        })
    } catch {}
    return $sec
}

function Send-PurvexLabSnapshot {
    param([string]$Key, [string]$Url, [string]$DomainDN, [switch]$Fast)
    $ErrorActionPreference = "Stop"

    $domainSuffix = [regex]::Escape(",$DomainDN") + '$'
    $relative = { param($dn) (($dn -split '(?&lt;!\\),', 2)[1]) -replace $domainSuffix, '' }
    $short = { param($dn) (($dn -split '(?&lt;!\\),', 2)[0] -replace '^(CN|OU)=', '') -replace '\\,', ',' }
    $date = { param($v) if ($v) { ([datetime]$v).ToUniversalTime().ToString("o") } else { $null } }

    $roots = @("Departments", "AccessLevels", "ServiceAccounts") |
        ForEach-Object { "OU=$_,$DomainDN" } |
        Where-Object { Get-ADOrganizationalUnit -Filter "DistinguishedName -eq '$_'" -ErrorAction SilentlyContinue }

    $ous = @(); $users = @(); $groups = @(); $computers = @(); $gpoLinks = @()
    foreach ($root in $roots) {
        $ous += Get-ADOrganizationalUnit -SearchBase $root -Filter * -Properties Description, gPLink | ForEach-Object {
            $ouPath = $_.DistinguishedName -replace $domainSuffix, ''
            $linked = @(Get-PurvexOuLinks -GpLink $_.gPLink -DomainDN $DomainDN)
            if ($linked.Count) { $gpoLinks += [ordered]@{ ou = $ouPath; gpos = $linked } }
            [ordered]@{ path = $ouPath; description = $_.Description }
        }
        $users += Get-ADUser -SearchBase $root -Filter * -Properties Title, Department, Description, Enabled, LockedOut, BadLogonCount, PasswordNeverExpires, PasswordExpired, LastLogonDate, MemberOf, PasswordNotRequired, DoesNotRequirePreAuth, TrustedForDelegation, ServicePrincipalNames | ForEach-Object {
            [ordered]@{
                sam                  = $_.SamAccountName
                name                 = $_.Name
                title                = $_.Title
                department           = $_.Department
                description          = $_.Description
                container            = &amp; $relative $_.DistinguishedName
                enabled              = [bool]$_.Enabled
                lockedOut            = [bool]$_.LockedOut
                badLogonCount        = [int]$_.BadLogonCount
                passwordNeverExpires = [bool]$_.PasswordNeverExpires
                passwordExpired      = [bool]$_.PasswordExpired
                pwdNotRequired       = [bool]$_.PasswordNotRequired
                noPreAuth            = [bool]$_.DoesNotRequirePreAuth
                delegation           = [bool]$_.TrustedForDelegation
                spns                 = @($_.ServicePrincipalNames).Count
                lastLogon            = &amp; $date $_.LastLogonDate
                memberOf             = @($_.MemberOf | ForEach-Object { &amp; $short $_ })
            }
        }
        $groups += Get-ADGroup -SearchBase $root -Filter * -Properties Description, Members | ForEach-Object {
            [ordered]@{
                name        = $_.Name
                scope       = "$($_.GroupScope)"
                category    = "$($_.GroupCategory)"
                description = $_.Description
                container   = &amp; $relative $_.DistinguishedName
                members     = @($_.Members | ForEach-Object { &amp; $short $_ })
            }
        }
        $computers += Get-ADComputer -SearchBase $root -Filter * -Properties Description, Enabled, LastLogonDate | ForEach-Object {
            [ordered]@{
                name        = $_.Name
                description = $_.Description
                container   = &amp; $relative $_.DistinguishedName
                enabled     = [bool]$_.Enabled
                lastLogon   = &amp; $date $_.LastLogonDate
            }
        }
    }

    $domainAdmins = Get-ADGroup -Identity "Domain Admins" -Properties Members -ErrorAction SilentlyContinue
    if ($domainAdmins) {
        $groups += [ordered]@{
            name        = "Domain Admins"
            scope       = "$($domainAdmins.GroupScope)"
            category    = "$($domainAdmins.GroupCategory)"
            description = "Built-in: full control of the domain."
            container   = &amp; $relative $domainAdmins.DistinguishedName
            members     = @($domainAdmins.Members | ForEach-Object { &amp; $short $_ })
        }
    }

    # A directory change must not wait on the Security log. That read is the slow part.
    # Fast sends reuse the last settings and log digest, however old they are.
    # The once-a-minute heartbeat is what refreshes them.
    $omitHeavy = $false
    if ($Fast) {
        if ($script:PurvexHeavy) {
            $security = $script:PurvexHeavy.Security
            $events = $script:PurvexHeavy.Events
        }
        else {
            # A fresh process, such as the on-demand -SyncOnly -Fast nudge, has no
            # cached digest. Leave the security and event keys out of the payload
            # so the server keeps the ones it already has rather than blanking
            # them with empties. The next full heartbeat refreshes them.
            $omitHeavy = $true
        }
    }
    else {
        $security = Get-PurvexSecurityState -Domain $domain
        $events = Get-PurvexEventDigest
        $script:PurvexHeavy = @{ At = Get-Date; Security = $security; Events = $events }
        # The heartbeat also refreshes GPO names, in case one was renamed.
        [void](Get-PurvexGpoNames -DomainDN $DomainDN -Refresh)
    }

    $snapshot = [ordered]@{
        version    = 1
        capturedAt = (Get-Date).ToUniversalTime().ToString("o")
        idleMinutes = (Get-PurvexIdleMinutes)
        everConnected = (Test-Path -LiteralPath (Get-PurvexConnectedPath))
        domain     = [ordered]@{ dnsRoot = $domain.DNSRoot; netbios = $domain.NetBIOSName }
        ous        = @($ous)
        users      = @($users)
        groups     = @($groups)
        computers  = @($computers)
        infra      = (Get-PurvexInfra -Domain $domain -GpoLinks $gpoLinks)
    }
    # Present on a full or cached-fast send, left out on a fresh-process fast
    # nudge so the server preserves what it already holds.
    if (-not $omitHeavy) {
        $snapshot.security = $security
        $snapshot.events = $events
    }
    $json = $snapshot | ConvertTo-Json -Depth 6 -Compress

    [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
    Invoke-RestMethod -Method Post -Uri ($Url.TrimEnd("/") + "/api/academy/lab-state") -TimeoutSec 20 `
        -Headers @{ Authorization = "Bearer $Key" } `
        -ContentType "application/json; charset=utf-8" `
        -Body ([System.Text.Encoding]::UTF8.GetBytes($json)) | Out-Null

    Set-Content -LiteralPath (Get-PurvexStampPath) -Value (Get-Date).ToUniversalTime().ToString("o") -ErrorAction SilentlyContinue
}

function Get-PurvexStampPath {
    $dir = Join-Path $env:ProgramData "PurveX"
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    return (Join-Path $dir "last-sync.txt")
}

# The task wakes every minute and sends a snapshot unless one just went out.
function Test-PurvexSyncDue {
    param([string]$Key, [string]$Url)
    $minutes = 999
    try {
        $last = [datetime]::Parse((Get-Content -LiteralPath (Get-PurvexStampPath) -Raw -ErrorAction Stop).Trim(), [Globalization.CultureInfo]::InvariantCulture, [Globalization.DateTimeStyles]::RoundtripKind)
        $minutes = ((Get-Date).ToUniversalTime() - $last.ToUniversalTime()).TotalMinutes
    }
    catch { }
    return $minutes -ge 1
}

$PurvexSyncTask = "PurveX Coach Lab Sync"

function Get-PurvexSyncScriptPath {
    $dir = Join-Path $env:ProgramData "PurveX"
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    return (Join-Path $dir "Build-Environment.ps1")
}

# What the directory watch covers: the lab folders and the DNS zone. The rest of
# the domain changes on its own and must not trigger a snapshot.
function Get-PurvexWatchRoots {
    param([string]$DomainDN)
    $roots = @("Departments", "AccessLevels", "ServiceAccounts" | ForEach-Object { "OU=$_,$DomainDN" })
    if ($domain.DNSRoot) { $roots += "DC=$($domain.DNSRoot),CN=MicrosoftDNS,DC=DomainDnsZones,$DomainDN" }
    return $roots
}

# Highest update number under the watched roots. Any edit there, including a GPO
# link (it lives on the OU) or a DNS record, raises it.
function Get-PurvexHighestUsn {
    param([string[]]$Roots)
    $best = [int64]-1
    foreach ($root in $Roots) {
        try {
            $searcher = New-Object System.DirectoryServices.DirectorySearcher
            $searcher.SearchRoot = New-Object System.DirectoryServices.DirectoryEntry("LDAP://$root")
            $searcher.Filter = "(uSNChanged&gt;=1)"
            $searcher.PageSize = 1
            $searcher.SearchScope = "Subtree"
            [void]$searcher.PropertiesToLoad.Add("uSNChanged")
            $searcher.Sort = New-Object System.DirectoryServices.SortOption("uSNChanged", ([System.DirectoryServices.SortDirection]::Descending))
            $hit = $searcher.FindOne()
            if ($hit -and $hit.Properties["usnchanged"].Count -gt 0) {
                $n = [int64]$hit.Properties["usnchanged"][0]
                if ($n -gt $best) { $best = $n }
            }
        }
        catch { }
    }
    return $best
}

# Runs for as long as the task lives.
# - Directory and DNS edits are seen within about 150 ms.
# - Firewall and share changes are fingerprinted every second.
# - A change stays pending until an upload succeeds. A failed upload is retried
#   after 2, 4, 8 and then 15 seconds, so a network blip never loses a change.
# - The Security log and settings ride along with a full send once a minute.
# A pod runs whatever script was on it the day it was built. Every fix to this
# file after that reached new pods only, and the ones already out there had to
# be patched by hand, one at a time, over SSM. The loop now looks for a newer
# copy a few times a day and replaces itself with it.
#
# Two guards before anything is written: the marker function first boot also
# checks, so a 404 or a redirect cannot save an HTML page over the script, and
# the parser, so a broken deploy cannot leave every pod running a file that
# will not start.
# The public half of the key PurveX signs this script with. Public on purpose:
# it can check a signature and cannot make one. Replacing it is the one edit
# that would matter, which is why a pod also carries a copy in its image.
$PurvexSigningKey = '&lt;RSAKeyValue&gt;&lt;Modulus&gt;spaboLUY4Af3MndsYQxi2/LVesTGzbfrYB7aa1jbpa18kxMElVG3npT25grP3UWARf+KwqRBxlmev4ZHyqM8Y0WrtHNj4nOeFfmdXmrzFgn6Nfv7obrpbve/4IRPpt82sTHmvBBVAa8W8qwKODhKOk01f5pQoJx101X/T8x0mqv/rRa4OlDQBVNOExoL2qE47gsA5/84xEJJZwTbTszM8VCyLoUVB7fKv/v/f46jtcCwLXu2Uqvy+cRXdYgUww5rhYHAzXZkCcl74Rebwqn/hbDZlg8ELOouIT58qj7TjIST0qkkywD+ToPSToeaSzeNZPmXG+0SACJHYUqtvsNg7Q==&lt;/Modulus&gt;&lt;Exponent&gt;AQAB&lt;/Exponent&gt;&lt;/RSAKeyValue&gt;'

# Is this exactly the script PurveX published? TLS proves a download came from
# the server answering to a name. It says nothing about who wrote the bytes, so
# a hijacked deployment, a stolen token or a mis-issued certificate would all
# serve a file the pod would otherwise run as SYSTEM. A signature moves the
# trust from the channel to the file.
function Test-PurvexSignature {
    param([string]$Text, [string]$Signature)
    if (-not $Text -or -not $Signature) { return $false }
    $rsa = $null
    try {
        $rsa = New-Object System.Security.Cryptography.RSACryptoServiceProvider
        $rsa.FromXmlString($PurvexSigningKey)
        # Normalised to LF before hashing. Git stores this file with LF and
        # checks it out on Windows with CRLF, so the bytes on a developer's
        # disk and the bytes the site serves differ. Signing the content
        # rather than the checkout is what keeps those two in agreement.
        $bytes = [Text.Encoding]::UTF8.GetBytes(($Text -replace "`r`n", "`n"))
        return $rsa.VerifyData($bytes, "SHA256", [Convert]::FromBase64String($Signature.Trim()))
    }
    catch { return $false }
    finally { if ($rsa) { $rsa.Dispose() } }
}

function Update-PurvexScript {
    param([string]$Key, [string]$Url)
    # Hosted pods only. A pod is a machine Range built, and Range already runs
    # commands on it as SYSTEM through SSM, so letting it replace its own script
    # adds no reach we do not already have. A student's own domain controller is
    # a different matter: it sits on their network, and nothing should let a
    # vendor push code onto it while they sleep. They update by downloading the
    # script again from the lesson, which is a decision they make.
    if (-not $Key.StartsWith("pvl_")) { return $false }
    $home_ = $null
    try { $home_ = [uri]$Url } catch { return $false }
    # Plaintext would put a SYSTEM shell on this box behind anyone on the path.
    if ($home_.Scheme -ne "https") { return $false }
    $dest = Get-PurvexSyncScriptPath
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
        # Held in memory rather than written beside the script first. Anything
        # under ProgramData is writable by local accounts, and a copy sitting on
        # disk between the download and the read is a swap waiting to happen.
        $res = Invoke-WebRequest -Uri ($Url.TrimEnd("/") + "/lab-scripts/Build-Environment.ps1") -UseBasicParsing -TimeoutSec 60
        # A redirect that leaves the host the pod was built with is refused, and
        # so is a response whose final address cannot be read at all: a check
        # that cannot be made has not passed. ResponseUri is the Windows
        # PowerShell shape, RequestMessage the PowerShell 7 one.
        $landed = $null
        try { $landed = [uri]$res.BaseResponse.ResponseUri } catch { }
        if (-not $landed) { try { $landed = [uri]$res.BaseResponse.RequestMessage.RequestUri } catch { } }
        if (-not $landed -or $landed.Scheme -ne "https" -or $landed.Host -ne $home_.Host) { return $false }
        $text = if ($res.Content -is [byte[]]) { [Text.Encoding]::UTF8.GetString($res.Content) } else { [string]$res.Content }
        # The signature, checked before the file is parsed and before the key
        # and the url are written into it. A missing or stale .sig fails the
        # same way a forged one does: the pod keeps the copy it already runs,
        # which is the safe outcome of the two.
        $sig = Invoke-WebRequest -Uri ($Url.TrimEnd("/") + "/lab-scripts/Build-Environment.ps1.sig") -UseBasicParsing -TimeoutSec 30
        $sigLanded = $null
        try { $sigLanded = [uri]$sig.BaseResponse.ResponseUri } catch { }
        if (-not $sigLanded) { try { $sigLanded = [uri]$sig.BaseResponse.RequestMessage.RequestUri } catch { } }
        if (-not $sigLanded -or $sigLanded.Scheme -ne "https" -or $sigLanded.Host -ne $home_.Host) { return $false }
        $sigText = if ($sig.Content -is [byte[]]) { [Text.Encoding]::UTF8.GetString($sig.Content) } else { [string]$sig.Content }
        if (-not (Test-PurvexSignature -Text $text -Signature $sigText)) {
            Write-Host "Refused a lab script update: the signature did not check out."
            return $false
        }
        # Forward only, and read from the verified text rather than the
        # download, so the number is one PurveX signed. Line-anchored because
        # this function mentions the same name a few lines down. No version at
        # all means a copy published before this check existed, which is a
        # downgrade like any other.
        $offered = [regex]::Match($text, '(?m)^\$PurvexScriptVersion\s*=\s*(\d+)\s*$')
        if (-not $offered.Success -or [int]$offered.Groups[1].Value -le $PurvexScriptVersion) {
            return $false
        }
        # Neither of these makes a download trustworthy, and neither is meant to.
        # The marker catches a 404 page saved over the script, and the parser
        # catches a broken deploy that would leave every pod unable to start.
        if (-not $text.Contains("Ensure-CTFChallengeData")) { return $false }
        $errors = $null
        [void][System.Management.Automation.Language.Parser]::ParseInput($text, [ref]$null, [ref]$errors)
        if ($errors.Count) { return $false }
        # The needles are built from pieces, and that is the whole point. They
        # name the two param defaults at the top of this file, and Replace has
        # no idea which line it is looking at: a literal copy of either needle
        # written here would be a second match, so linking a script rewrote
        # this line as well and left a file PowerShell could not parse. A pod
        # then built nothing and sat on "Linking to Range" forever. Split in
        # two, the needle exists only when the strings are joined.
        $keyNeedle = '[string]$PurvexKey = ' + '""'
        $urlNeedle = '[string]$PurvexUrl = ' + '""'
        $text = $text.Replace($keyNeedle, "[string]`$PurvexKey = '$Key'").Replace($urlNeedle, "[string]`$PurvexUrl = '$Url'")
        $current = ""
        try { $current = Get-Content -LiteralPath $dest -Raw } catch { }
        # Compared with the line endings and the last newline normalised away.
        # Set-Content adds a trailing newline that the download does not have,
        # so a straight comparison never matched: a pod rewrote a file identical
        # to the one it had, and announced it, every few hours. The version
        # floor already refuses anything but a newer copy, so this guard only
        # saves a pointless write.
        $same = ($text -replace "`r`n", "`n").TrimEnd("`n") -eq ($current -replace "`r`n", "`n").TrimEnd("`n")
        if ($same) { return $false }
        Set-Content -LiteralPath $dest -Value $text -Encoding UTF8
        Write-Host "Updated the lab script from $Url."
        return $true
    }
    catch { return $false }
}

function Start-PurvexSyncLoop {
    param([string]$Key, [string]$Url)
    [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
    # The idle clock starts here, when the lab is ready, and not at boot.
    # A pod spends its first ten or twenty minutes building a domain with
    # nobody signed in, and quser has no session to report until someone
    # connects. Measuring from boot meant a lab that took twenty minutes to
    # come up was already twenty minutes idle the moment it first reported,
    # so it was stopped for idleness before the student ever saw it. A
    # restart lands here too, which is right: a lab that just came back is
    # not idle either.
    Set-Content -LiteralPath (Get-PurvexLastActivePath) -Value ((Get-Date).ToUniversalTime().ToString("o")) -ErrorAction SilentlyContinue
    # And nobody has opened this one yet, whatever the last boot did. Without
    # this a restarted pod inherits the old marker and gets the short idle
    # window again before the student has had a chance to connect.
    Remove-Item -LiteralPath (Get-PurvexConnectedPath) -Force -ErrorAction SilentlyContinue
    $roots = Get-PurvexWatchRoots -DomainDN $domainDN
    $lastSend = [datetime]::MinValue
    $lastHeavy = [datetime]::MinValue
    $lastUsn = [int64]-1
    $lastPrint = $null
    $nextPrint = [datetime]::MinValue
    $pending = $false
    $failures = 0
    # Checked a few times a day, and not at once on boot: a pod that has just
    # downloaded this copy does not need to ask for it again.
    $nextUpdate = (Get-Date).AddHours(6)
    while ($true) {
        $waitMs = 150
        try {
            $now = Get-Date
            $usn = Get-PurvexHighestUsn -Roots $roots
            if ($usn -ge 0 -and $usn -ne $lastUsn) {
                if ($lastUsn -ge 0) { $pending = $true }
                $lastUsn = $usn
            }
            if ($now -ge $nextPrint) {
                $nextPrint = $now.AddSeconds(1)
                $print = Get-PurvexInfraPrint
                if ($null -ne $lastPrint -and $print -ne $lastPrint) { $pending = $true }
                $lastPrint = $print
            }
            $sinceSend = ($now - $lastSend).TotalSeconds
            $sinceHeavy = ($now - $lastHeavy).TotalSeconds
            # A pending change always goes out fast, reusing the cached digest, so
            # a directory edit never waits on the Security log read. A short gap
            # folds one edit (create, then add to a group) into a single send.
            # The heavy read that refreshes the log digest runs on its own minute
            # cadence, and only when no change is waiting, so it never blocks one.
            if ($pending -and $sinceSend -ge 0.25) {
                Send-PurvexLabSnapshot -Key $Key -Url $Url -DomainDN $domainDN -Fast
                $lastSend = Get-Date
                $pending = $false
                $failures = 0
            }
            elseif ($sinceHeavy -ge 60) {
                Send-PurvexLabSnapshot -Key $Key -Url $Url -DomainDN $domainDN
                $lastSend = Get-Date
                $lastHeavy = $lastSend
                $failures = 0
                # Leaving the loop hands over to the task's own one-minute
                # watchdog, which starts it again on the new file.
                if ((Get-Date) -ge $nextUpdate) {
                    $nextUpdate = (Get-Date).AddHours(6)
                    if (Update-PurvexScript -Key $Key -Url $Url) { return }
                }
            }
        }
        catch {
            $failures++
            $waitMs = [int][Math]::Min(15000, 1000 * [Math]::Pow(2, [Math]::Min($failures, 4)))
        }
        Start-Sleep -Milliseconds $waitMs
    }
}

function Install-PurvexLabSync {
    if (-not $PurvexKey -or -not $PurvexUrl) {
        Write-Host "This copy is not linked to Range. Download Build-Environment.ps1 from Build the Environment first." -ForegroundColor Yellow
        return $false
    }
    $source = $PSCommandPath
    if (-not $source) { $source = $MyInvocation.MyCommand.Path }
    if (-not $source -or -not (Test-Path $source)) {
        Write-Host "Could not find this script on disk, so the sync task was not installed." -ForegroundColor Yellow
        return $false
    }
    Stop-ScheduledTask -TaskName $PurvexSyncTask -ErrorAction SilentlyContinue
    $dest = Get-PurvexSyncScriptPath
    Copy-Item -LiteralPath $source -Destination $dest -Force
    $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$dest`" -SyncLoop"
    # Repetition is null on a plain -Once trigger in Windows PowerShell 5.1, so set it here.
    # One long-running loop, started at boot. The one-minute trigger is a watchdog: it starts the
    # loop again if it ever stops, and is ignored while the loop is already running.
    $startup = New-ScheduledTaskTrigger -AtStartup
    $watchdog = New-ScheduledTaskTrigger -Once -At ((Get-Date).AddMinutes(1)) `
        -RepetitionInterval (New-TimeSpan -Minutes 1) -RepetitionDuration (New-TimeSpan -Days 3650)
    $principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -MultipleInstances IgnoreNew `
        -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)
    Unregister-ScheduledTask -TaskName $PurvexSyncTask -Confirm:$false -ErrorAction SilentlyContinue
    Register-ScheduledTask -TaskName $PurvexSyncTask -Action $action -Trigger @($startup, $watchdog) -Principal $principal -Settings $settings -Description "Sends a read-only Active Directory snapshot to PurveX Coach about every minute. No passwords." | Out-Null
    Start-ScheduledTask -TaskName $PurvexSyncTask
    Write-Host "Coach is syncing this DC now. A directory change is sent as soon as it happens." -ForegroundColor Green
    return $true
}

function Uninstall-PurvexLabSync {
    Stop-ScheduledTask -TaskName $PurvexSyncTask -ErrorAction SilentlyContinue
    Unregister-ScheduledTask -TaskName $PurvexSyncTask -Confirm:$false -ErrorAction SilentlyContinue
    Write-Host "PurveX Coach lab sync is off." -ForegroundColor DarkGray
}

if ($UninstallSync) {
    Uninstall-PurvexLabSync
    return
}

if ($InstallSync) {
    if ((Install-PurvexLabSync) -and $PurvexKey -and $PurvexUrl) {
        try {
            Send-PurvexLabSnapshot -Key $PurvexKey -Url $PurvexUrl -DomainDN $domainDN
            Write-Host "Lab snapshot sent to PurveX Coach." -ForegroundColor Green
        }
        catch {
            Write-Host "Could not send the lab snapshot: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    return
}

if ($SyncLoop) {
    if (-not $PurvexKey -or -not $PurvexUrl) {
        Write-Host "This copy is not linked to Range. Download Build-Environment.ps1 from Build the Environment and run it once." -ForegroundColor Yellow
        return
    }
    Start-PurvexSyncLoop -Key $PurvexKey -Url $PurvexUrl
    return
}

if ($SyncOnly) {
    if (-not $PurvexKey -or -not $PurvexUrl) {
        Write-Host "This copy is not linked to Range. Download Build-Environment.ps1 from Build the Environment and run it once." -ForegroundColor Yellow
        return
    }
    if ($Scheduled -and -not (Test-PurvexSyncDue -Key $PurvexKey -Url $PurvexUrl)) { return }
    try {
        # -Fast skips the 30-day Security log read and omits the digest, so an
        # on-demand nudge lands in about a second and the server keeps the log
        # data it already has. A plain -SyncOnly still does the full read.
        Send-PurvexLabSnapshot -Key $PurvexKey -Url $PurvexUrl -DomainDN $domainDN -Fast:$Fast
        Write-Host "Lab snapshot sent to PurveX Coach." -ForegroundColor Green
    }
    catch {
        Write-Host "Could not send the lab snapshot: $($_.Exception.Message)" -ForegroundColor Red
    }
    return
}

# Replants only the ticket objects that are missing, for a lab built before a
# ticket shipped. Every object is created only when absent, so a student's own
# changes (a disabled account, a removed group member, a moved object) are never
# touched. It does not run the rest of the build and does not reinstall the sync
# task. Range runs this over SSM against a freshly downloaded copy, so it reaches
# a pod whatever the age of the script already on disk.
if ($RepairOnly) {
    $deptMap = [ordered]@{
        "IT"                     = "IT"
        "Compliance"             = "Compliance"
        "Wealth Management"      = "WealthManagement"
        "Operations"             = "Operations"
        "Finance and Accounting" = "FinanceAccounting"
    }
    $paths = @{}
    foreach ($name in $deptMap.Keys) {
        $deptOU = "OU=$($deptMap[$name]),OU=Departments,$domainDN"
        $paths[$name] = @{ DeptOU = $deptOU; UsersOU = "OU=Users,$deptOU" }
    }
    $accessLevelsOU = "OU=AccessLevels,$domainDN"
    $serviceAccountsOU = Ensure-OU -Name "ServiceAccounts" -ParentDN $domainDN -Description "Service accounts, kept separate from real user accounts."
    # New accounts the repair might create need a starting password. It is rolled
    # here and kept nowhere: every such account must change it at next logon.
    $InitialPassword = ConvertTo-SecureString ("Pvx-" + (-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 16 | ForEach-Object { [char]$_ })) + "-9k") -AsPlainText -Force
    try {
        Ensure-PurvexTicketObjects -DeptOUPaths $paths -DomainDN $domainDN -AccessLevelsOU $accessLevelsOU -ServiceAccountsOU $serviceAccountsOU
        Write-Host "Ticket objects repaired." -ForegroundColor Green
        if ($PurvexKey -and $PurvexUrl) {
            try { Send-PurvexLabSnapshot -Key $PurvexKey -Url $PurvexUrl -DomainDN $domainDN } catch {}
        }
    }
    catch {
        Write-Host "Could not repair ticket objects: $($_.Exception.Message)" -ForegroundColor Red
    }
    return
}

function Get-PurvexPasswordProblem {
    param([System.Security.SecureString]$Secure)
    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Secure)
    try { $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
    $policy = Get-ADDefaultDomainPasswordPolicy
    $min = [Math]::Max([int]$policy.MinPasswordLength, 8)
    if ($plain.Length -lt $min) { return "Use at least $min characters." }
    if ($policy.ComplexityEnabled) {
        $classes = 0
        if ($plain -cmatch '[a-z]') { $classes++ }
        if ($plain -cmatch '[A-Z]') { $classes++ }
        if ($plain -match '\d') { $classes++ }
        if ($plain -match '[^a-zA-Z0-9]') { $classes++ }
        if ($classes -lt 3) { return "Mix three of these: lowercase, uppercase, a number, a symbol." }
    }
    return $null
}

$passwordAttempts = 0
while ($true) {
    if (-not $InitialPassword) {
        $InitialPassword = Read-Host -AsSecureString -Prompt "Initial password for all new lab accounts"
    }
    $problem = Get-PurvexPasswordProblem -Secure $InitialPassword
    if (-not $problem) { break }
    Write-Host "That password will not work on this domain. $problem" -ForegroundColor Yellow
    $InitialPassword = $null
    $passwordAttempts++
    if ($passwordAttempts -ge 3) { throw "No valid password was entered. Run the script again." }
}

Write-Host "`n== Top-level OUs ==" -ForegroundColor Cyan
$departmentsOU  = Ensure-OU -Name "Departments"  -ParentDN $domainDN -Description "Top-level container for all department OUs."
$accessLevelsOU = Ensure-OU -Name "AccessLevels" -ParentDN $domainDN -Description "Domain-wide access-level groups (Server Admins, Helpdesk), separate from department membership."

$departments = @(
    @{ Display = "IT";                      OU = "IT";                 Group = "IT Users";                 Desc = "IT department: accounts, workstations, and infrastructure." },
    @{ Display = "Compliance";               OU = "Compliance";         Group = "Compliance Users";          Desc = "Compliance department: regulatory (GLBA/SOX) and audit staff." },
    @{ Display = "Wealth Management";        OU = "WealthManagement";   Group = "Wealth Management Users";   Desc = "Wealth Management department: client-facing financial advisory staff." },
    @{ Display = "Operations";               OU = "Operations";         Group = "Operations Users";          Desc = "Operations department: settlements and internal process staff." },
    @{ Display = "Finance and Accounting";   OU = "FinanceAccounting";  Group = "Finance Accounting Users";  Desc = "Finance and Accounting department: internal ledgers, payroll, and budget staff." }
)

$deptOUPaths = @{}
foreach ($dept in $departments) {
    Write-Host "`n== Department: $($dept.Display) ==" -ForegroundColor Cyan
    $deptOU  = Ensure-OU -Name $dept.OU -ParentDN $departmentsOU -Description $dept.Desc
    $usersOU = Ensure-OU -Name "Users" -ParentDN $deptOU -Description "$($dept.Display) user accounts."
    Ensure-Group -Name $dept.Group -OUPath $deptOU -Description "Standard access group for $($dept.Display) staff."
    $deptOUPaths[$dept.Display] = @{ DeptOU = $deptOU; UsersOU = $usersOU }
}

$itWorkstationsOU = Ensure-OU -Name "Workstations" -ParentDN $deptOUPaths["IT"].DeptOU -Description "IT department workstation computer objects."
Ensure-Group -Name "IT Admins" -OUPath $deptOUPaths["IT"].DeptOU -Description "Elevated access for IT Systems Administrators, beyond standard IT Users access."

Write-Host "`n== Access-level groups ==" -ForegroundColor Cyan
Ensure-Group -Name "Server Admins" -OUPath $accessLevelsOU -Description "Level 2 access: servers, application and file servers. Empty by default."
Ensure-Group -Name "Helpdesk"      -OUPath $accessLevelsOU -Description "Level 3 access: workstations, password resets, local support only. Empty by default."
Write-Host "  (Level 1 / Domain Admin uses the built-in 'Domain Admins' group -- nothing to create)" -ForegroundColor DarkGray

$users = @(
    @{ First = "Alex";   Last = "Rivera";    Sam = "alex.rivera";   Title = "IT Systems Administrator";       Dept = "IT";                    Extra = @("IT Admins") },
    @{ First = "Priya";  Last = "Nair";      Sam = "priya.nair";    Title = "Help Desk Technician";           Dept = "IT";                    Extra = @() },
    @{ First = "Devon";  Last = "Brooks";    Sam = "devon.brooks";  Title = "Compliance Officer";             Dept = "Compliance";            Extra = @() },
    @{ First = "Morgan"; Last = "Lee";       Sam = "morgan.lee";    Title = "Regulatory Analyst";             Dept = "Compliance";            Extra = @() },
    @{ First = "Sam";    Last = "Whitfield"; Sam = "sam.whitfield"; Title = "Senior Financial Advisor";       Dept = "Wealth Management";     Extra = @() },
    @{ First = "Jamie";  Last = "Torres";    Sam = "jamie.torres";  Title = "Client Relationship Manager";    Dept = "Wealth Management";     Extra = @() },
    @{ First = "Taylor"; Last = "Osei";      Sam = "taylor.osei";   Title = "Operations Analyst";             Dept = "Operations";            Extra = @() },
    @{ First = "Riley";  Last = "Kwan";      Sam = "riley.kwan";    Title = "Settlements Coordinator";        Dept = "Operations";            Extra = @() },
    @{ First = "Jordan"; Last = "Ellis";     Sam = "jordan.ellis";  Title = "Staff Accountant";               Dept = "Finance and Accounting"; Extra = @() }
)

$deptGroup = @{
    "IT"                    = "IT Users"
    "Compliance"            = "Compliance Users"
    "Wealth Management"     = "Wealth Management Users"
    "Operations"            = "Operations Users"
    "Finance and Accounting" = "Finance Accounting Users"
}

Write-Host "`n== Users ==" -ForegroundColor Cyan
foreach ($u in $users) {
    $groups = @($deptGroup[$u.Dept]) + $u.Extra
    Ensure-User `
        -First $u.First -Last $u.Last -SamAccountName $u.Sam `
        -Title $u.Title -Department $u.Dept `
        -OUPath $deptOUPaths[$u.Dept].UsersOU `
        -Groups $groups
}

Write-Host "`n== Workstation ==" -ForegroundColor Cyan
$computerName = "IT-WKS01"
Ensure-Computer -Name $computerName -OUPath $itWorkstationsOU -Description "Standard IT workstation for PurveXFinancial administrators."

if ($IncludeCTF) {
    Ensure-CTFChallengeData -DeptOUPaths $deptOUPaths -DomainDN $domainDN -AccessLevelsOU $accessLevelsOU -Password $InitialPassword
}

if (-not $WhatIfPreference) {
    if (-not $PurvexKey -or -not $PurvexUrl) {
        Write-Host "`nThis copy is not linked to Range, so your lab was not sent. Download Build-Environment.ps1 from Build the Environment and run it again." -ForegroundColor Yellow
    }
    else {
        try {
            Send-PurvexLabSnapshot -Key $PurvexKey -Url $PurvexUrl -DomainDN $domainDN
            Write-Host "`nLab snapshot sent to PurveX Coach." -ForegroundColor Green
        }
        catch {
            Write-Host "`nCould not send the lab snapshot to $PurvexUrl : $($_.Exception.Message)" -ForegroundColor Red
        }
        try { Install-PurvexLabSync | Out-Null } catch {
            Write-Host "Could not start automatic Coach sync: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
}

if ($script:PurvexFailures -gt 0) {
    Write-Host "`n$($script:PurvexFailures) account(s) could not be created. Fix the problem above and run the script again. It only adds what is missing." -ForegroundColor Red
}

Write-Host "`nDone. Verify with: Get-ADOrganizationalUnit -Filter * | Where-Object DistinguishedName -like '*Departments*'" -ForegroundColor Cyan
if (-not $IncludeCTF) {
    Write-Host "Optional: rerun with -IncludeCTF to add ticket-queue challenge artifacts." -ForegroundColor DarkGray
}</code></pre>
</details>

```powershell
./Build-Environment.ps1
```

To preview what the script will do before it changes anything, run it with `-WhatIf` first:

```powershell
./Build-Environment.ps1 -WhatIf
```

If the script will not run, open Check the Build. That tab lists the usual causes and their fixes.

The Range download plants the ticket-queue challenge data on the same run, so the missions work as soon as the lab reports. It adds these objects:

- A service-account OU
- A backup service account
- A leftover intern account
- A firm-wide group with one intentional membership gap
- A disabled Operations account
- A contractor whose engagement has ended
- A staff account with a password that never expires
- A new Finance laptop that landed in the wrong folder
- A distribution group that someone tried to use for access
- A few workstation objects
- A broken DNS record, a stale record left from a server migration, a leftover vendor firewall rule and a misplaced screen lock GPO
- A Finance share under `C:\PurveX\Shares` with one suspicious file, which is plain text and cannot run

Each ticket object is planted only once, so running the script again never undoes a ticket you already worked. To build the clean baseline without them, run `./Build-Environment.ps1 -NoCTF`.

