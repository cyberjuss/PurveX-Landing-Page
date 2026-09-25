<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>What does it actually take to stand up the environment you are about to investigate?</p>
</div>

### Overview

The other tabs describe the departments, the access levels, and the user directory. Those objects only exist in your lab after you run the two scripts below.

Building it yourself is how you see what normal looks like here. Until the scripts finish you are reading a chart. After they finish you have a live copy of PurveX Financial you can open, query, and check a ticket against.

By the end of this tab you should be able to open Active Directory Users and Computers and find the same departments and accounts the other tabs named. If you cannot the lab is not built yet. Do not start a challenge on a half-built directory.

**At a glance:**

* `Install-Forest.ps1` is one-time setup. It turns a blank Windows Server into the domain controller for `purvexfinancial.local`. Skip it if that domain already exists.
* `Build-Environment.ps1` does the real work. It creates every department, group, user, and workstation described above so the environment matches what you have been studying. It is safe to re-run any time.

**What you will need:**

* A Windows Server (2019 or later) you can use as a domain controller. A VM on your own hardware (Hyper-V, VirtualBox, VMware) works fine for this.
* An elevated (Administrator) PowerShell session on that server.
* About 15–20 minutes, plus a reboot partway through.

### Step 1. Install the Domain (Skip If You Already Have One)

If your server is not yet a domain controller, download and run this first. It installs Active Directory Domain Services and promotes the server to the root of a new domain, `purvexfinancial.local`. It asks for a recovery-mode password and then reboots automatically. Without a domain, the departments, users, and groups in the next step have nowhere to live.

**Before you run it.** Download the script with the link below while you are signed in. That copy is linked to your account, which is how Coach and your drills see your lab. When it asks for the initial password, choose one your domain will accept: at least 8 characters with three of these, lowercase, uppercase, a number, and a symbol. The script checks the password before it creates anything and asks again if it will not work.

**What you should see at the end.** Two green lines mean your lab is connected:

* `Lab snapshot sent to PurveX Coach.`
* `Coach is syncing this DC now. A directory change is sent as soon as it happens.`

**What this script does:**

* Installs the AD DS (Active Directory Domain Services) Windows Server role
* Prompts you for a DSRM (Directory Services Restore Mode) recovery password. It is separate from any domain account password and is used only for AD recovery
* Promotes the server to the root of a new forest called `purvexfinancial.local`, with DNS installed alongside it
* Reboots the server automatically once promotion finishes

[Download Install-Forest.ps1](/lab-scripts/Install-Forest.ps1)

You can also copy it straight from here:

<details class="ad-code">
<summary>Show Install-Forest.ps1 (copy/paste)</summary>
<div class="ad-code__bar">
<span class="ad-code__label">Install-Forest.ps1</span>
<button type="button" class="ad-code__copy">Copy</button>
</div>

<pre><code>#Requires -RunAsAdministrator
&lt;#
.SYNOPSIS
    Promotes a clean Windows Server to the root domain controller of
    purvexfinancial.local.

.DESCRIPTION
    Run once on a fresh server that is not yet a domain controller. It installs
    AD DS and creates the forest. You are prompted for a DSRM recovery password.
    The server reboots when promotion finishes. After the reboot, run
    Build-Environment.ps1.
#&gt;

[CmdletBinding()]
param(
    [string]$DomainName = "purvexfinancial.local",
    [string]$DomainNetbiosName = "PURVEXFINANCIAL"
)

$ErrorActionPreference = "Stop"

Write-Host "Installing AD DS role..." -ForegroundColor Cyan
Install-WindowsFeature -Name AD-Domain-Services -IncludeManagementTools

Write-Host "Promoting this server to a new forest root domain: $DomainName" -ForegroundColor Cyan
Write-Host "You will be prompted for a DSRM (recovery mode) password." -ForegroundColor Yellow

Install-ADDSForest `
    -DomainName $DomainName `
    -DomainNetbiosName $DomainNetbiosName `
    -InstallDns:$true `
    -SafeModeAdministratorPassword (Read-Host -AsSecureString -Prompt "DSRM password") `
    -Force:$true</code></pre>
</details>

```powershell
./Install-Forest.ps1
```

### Step 2. Build the Environment

After the reboot, log back in as `PURVEXFINANCIAL\Administrator` and run this script. It creates every department, group, user, and the workstation object described in the other tabs. This step turns the org chart and user directory from a description into a live environment you can query and investigate.

**What this script does:**

* Creates two top-level OUs: `Departments` and `AccessLevels`
* Creates all 5 department OUs (IT, Compliance, Wealth Management, Operations, Finance and Accounting), each with its own `Users` sub-OU (IT also gets a `Workstations` sub-OU)
* Creates all 9 security groups. Each department gets a standard access group, `IT Admins` is elevated, and `Server Admins` and `Helpdesk` are the Level 2 and Level 3 access groups
* Creates all 9 user accounts from the Full User Directory in The Environment tab, in the right OU, with the right title and department, and adds each one to the right group(s)
* Pre-stages the `IT-WKS01` computer object
* Prompts once for an initial password. Every account must change it at next logon, so nobody keeps that password long-term
* Is safe to run more than once. It only creates what is missing and never resets or deletes anything that exists
* The Academy download plants the ticket-queue challenge objects on the first build and sends your lab straight away. Add `-NoCTF` to skip them
* The Academy download starts a background Coach sync on the domain controller after the first successful build. It sends a snapshot as soon as the directory changes, and once a minute when nothing changes. The VM only has to stay on. To stop it: `./Build-Environment.ps1 -UninstallSync`.
* The sync now also sends your security settings (password and lockout policy, auditing, log size) and a 30-day count of Security log events, such as failed sign-ins and accounts created. It never sends passwords or raw log entries. Your drills and the weekly CTF use it, so download the script again and run it once to get it.

[Download Build-Environment.ps1](/lab-scripts/Build-Environment.ps1)

You can also copy the current script from here. A pasted copy is not linked to your Academy account, so Coach and your drills will not see your lab. Use the download above for that.

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

    When downloaded from PurveX Academy, it also syncs a read-only summary
    of the lab OUs (never passwords) to your Academy account so PurveX Coach
    can see your lab.

.PARAMETER InitialPassword
    Initial password for new accounts. You are prompted if it is omitted.
    Every account must change it at next logon.

.PARAMETER IncludeCTF
    Adds the ticket-queue challenge objects. The Academy download does this automatically.

.PARAMETER NoCTF
    Skips the ticket-queue challenge objects in the Academy download.

.PARAMETER SyncLoop
    Used by the sync task. It sends a snapshot as soon as the directory changes, and
    once a minute when nothing changes. Students do not run this.

.PARAMETER SyncOnly
    Used by the scheduled task. Students do not run this.

.PARAMETER InstallSync
    Install a scheduled task that sends a snapshot about every minute.
    The Academy download does this automatically after a successful build.

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
    [switch]$InstallSync,
    [switch]$UninstallSync,
    [string]$PurvexKey = "",
    [string]$PurvexUrl = ""
)

Import-Module ActiveDirectory -ErrorAction Stop

$script:PurvexFailures = 0

# The Academy download plants the ticket objects on the first build so the missions work at once.
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

    $wmWorkstationsOU = Ensure-OU -Name "Workstations" -ParentDN $DeptOUPaths["Wealth Management"].DeptOU -Description "Wealth Management department workstation computer objects."
    Ensure-Computer -Name "WM-WKS07" -OUPath $wmWorkstationsOU -Description "CTF-TICKET-301: Wealth Management workstation named in a 02:00 successful-login alert for alex.rivera."
    $opsWorkstationsOU = Ensure-OU -Name "Workstations" -ParentDN $DeptOUPaths["Operations"].DeptOU -Description "Operations department workstation computer objects."
    Ensure-Computer -Name "OPS-WKS03" -OUPath $opsWorkstationsOU -Description "CTF-TICKET-201: Dormant Operations workstation. Check whether this asset still belongs in scope."
}

# Read-only security settings, so PurveX can check the hardening drills. Each
# piece is optional: if one cannot be read, the rest still sync.
# A digest of the real Security log, so the weekly CTF can ask about what really
# happened in this lab. Counts and names only: no raw events, no passwords.
# Every part is optional; if the log cannot be read, the rest of the sync still works.
function Get-PurvexEventDigest {
    $days = 30
    $digest = [ordered]@{ windowDays = $days }
    $iso = { param($d) ([datetime]$d).ToUniversalTime().ToString("o") }
    $skip = { param($n) (-not $n) -or ($n -eq "-") -or ($n.EndsWith('$')) -or ($n -match '^(ANONYMOUS LOGON|SYSTEM|LOCAL SERVICE|NETWORK SERVICE)$') }
    $short = { param($dn) (($dn -split '(?&lt;!\\),', 2)[0] -replace '^(CN|OU)=', '') }
    try {
        $events = @(Get-WinEvent -FilterHashtable @{ LogName = "Security"; Id = 4625, 4771, 4740, 4720, 4725, 4728, 4732, 4756; StartTime = (Get-Date).AddDays(-$days) } -MaxEvents 4000 -ErrorAction Stop)
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

    $ous = @(); $users = @(); $groups = @(); $computers = @()
    foreach ($root in $roots) {
        $ous += Get-ADOrganizationalUnit -SearchBase $root -Filter * -Properties Description | ForEach-Object {
            [ordered]@{ path = ($_.DistinguishedName -replace $domainSuffix, ''); description = $_.Description }
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

    # Fast sends reuse the slow parts (settings and the 30-day log digest) for up to a minute.
    if ($Fast -and $script:PurvexHeavy -and ((Get-Date) - $script:PurvexHeavy.At).TotalSeconds -lt 60) {
        $security = $script:PurvexHeavy.Security
        $events = $script:PurvexHeavy.Events
    }
    else {
        $security = Get-PurvexSecurityState -Domain $domain
        $events = Get-PurvexEventDigest
        $script:PurvexHeavy = @{ At = Get-Date; Security = $security; Events = $events }
    }

    $snapshot = [ordered]@{
        version    = 1
        capturedAt = (Get-Date).ToUniversalTime().ToString("o")
        domain     = [ordered]@{ dnsRoot = $domain.DNSRoot; netbios = $domain.NetBIOSName }
        ous        = @($ous)
        users      = @($users)
        groups     = @($groups)
        computers  = @($computers)
        security   = $security
        events     = $events
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

# Highest update number in the lab folders only. The rest of the domain changes on its own
# and must not trigger a snapshot.
function Get-PurvexHighestUsn {
    param([string]$DomainDN)
    $best = [int64]-1
    foreach ($name in @("Departments", "AccessLevels", "ServiceAccounts")) {
        try {
            $searcher = New-Object System.DirectoryServices.DirectorySearcher
            $searcher.SearchRoot = New-Object System.DirectoryServices.DirectoryEntry("LDAP://OU=$name,$DomainDN")
            $searcher.Filter = "(uSNChanged>=1)"
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

# Runs for as long as the task lives. A directory change sends a snapshot immediately.
# If nothing changes, one snapshot a minute still goes out. A failed directory read never
# turns into a burst of uploads.
function Start-PurvexSyncLoop {
    param([string]$Key, [string]$Url)
    [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
    $lastSend = [datetime]::MinValue
    $lastUsn = [int64]-1
    while ($true) {
        $waitMs = 1000
        try {
            $age = ((Get-Date) - $lastSend).TotalSeconds
            $usn = Get-PurvexHighestUsn -DomainDN $domainDN
            $due = $age -ge 60
            $changed = ($usn -ge 0) -and ($age -ge 2) -and (($lastUsn -lt 0) -or ($usn -ne $lastUsn))
            if ($changed -or $due) {
                Send-PurvexLabSnapshot -Key $Key -Url $Url -DomainDN $domainDN -Fast
                $lastSend = Get-Date
                if ($usn -ge 0) { $lastUsn = $usn }
            }
        }
        catch { $waitMs = 15000 }
        Start-Sleep -Milliseconds $waitMs
    }
}

function Install-PurvexLabSync {
    if (-not $PurvexKey -or -not $PurvexUrl) {
        Write-Host "This copy is not linked to PurveX Academy. Download Build-Environment.ps1 from Build This Lab first." -ForegroundColor Yellow
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
        Write-Host "This copy is not linked to PurveX Academy. Download Build-Environment.ps1 from Build This Lab and run it once." -ForegroundColor Yellow
        return
    }
    Start-PurvexSyncLoop -Key $PurvexKey -Url $PurvexUrl
    return
}

if ($SyncOnly) {
    if (-not $PurvexKey -or -not $PurvexUrl) {
        Write-Host "This copy is not linked to PurveX Academy. Download Build-Environment.ps1 from Build This Lab and run it once." -ForegroundColor Yellow
        return
    }
    if ($Scheduled -and -not (Test-PurvexSyncDue -Key $PurvexKey -Url $PurvexUrl)) { return }
    try {
        Send-PurvexLabSnapshot -Key $PurvexKey -Url $PurvexUrl -DomainDN $domainDN
        Write-Host "Lab snapshot sent to PurveX Coach." -ForegroundColor Green
    }
    catch {
        Write-Host "Could not send the lab snapshot: $($_.Exception.Message)" -ForegroundColor Red
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
        Write-Host "`nThis copy is not linked to PurveX Academy, so your lab was not sent. Download Build-Environment.ps1 from Build This Lab and run it again." -ForegroundColor Yellow
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

To see exactly what the script is about to do before committing to it, run it with `-WhatIf` first:

```powershell
./Build-Environment.ps1 -WhatIf
```

If the script will not run, see **If the Script Will Not Run** at the end of this tab for the three most common causes and their fixes.

The Academy download also plants the ticket-queue challenge data on the same run, so the missions work as soon as the lab reports. It adds a service-account OU, a backup service account, a leftover intern account, a firm-wide group with one intentional membership gap, a disabled Operations account, and a few workstation objects. To build the clean baseline without it, run `./Build-Environment.ps1 -NoCTF`.

### Step 3. Verify It Built, or Reset It

**Verify.** Do not trust the script output alone. Open Active Directory Users and Computers (or run these) and confirm you see all 5 departments, all 9 users in the right department with the right title, and `alex.rivera` in both `IT Users` and `IT Admins`. If any of that is missing, the lab is not ready.

```powershell
Get-ADOrganizationalUnit -Filter * | Sort-Object DistinguishedName

Get-ADUser -Filter * -SearchBase "OU=Departments,$((Get-ADDomain).DistinguishedName)" -Properties Title, Department |
    Select-Object Name, SamAccountName, Title, Department

Get-ADGroupMember -Identity "IT Admins"
```

A note on the workstation. The Environment tab lists it as "IT WKS01," but AD computer names cannot contain spaces, so the script creates the object as `IT-WKS01`. It is the same machine with a valid name.


**Reset.** If you want a completely fresh start, run the cleanup script on the domain controller. It deletes the `Departments`, `AccessLevels`, and `ServiceAccounts` OUs and every user, group, and computer object inside them, including the optional challenge data. The domain itself, the forest, and the built-in accounts are not touched. It asks you to confirm before deleting anything.

```powershell
./Remove-Environment.ps1
```

Add `-WhatIf` to preview what would be deleted, or `-Force` to skip the confirmation prompt. Afterward, run `Build-Environment.ps1` again to rebuild the lab.

[Download Remove-Environment.ps1](/lab-scripts/Remove-Environment.ps1)

Once built and verified, you have your own live copy of the environment every other tab describes. That is the baseline. Challenges start from here.

### If the Script Will Not Run

Three errors account for almost every "it will not run" report. Each is easy to fix once you know which one you are looking at.

<div class="ad-trouble">
<div class="ad-trouble__item">
<span class="ad-trouble__label">Not running as Administrator</span>
<img src="/academy/lab-scripts/run-as-admin-error.png" alt="PowerShell error: the script cannot be run because it contains a &quot;#requires&quot; statement for running as Administrator" class="ad-trouble__img" />
<p>Close this window. Open the Start menu, search PowerShell, right-click it, and choose <strong>Run as Administrator</strong>. Then <code>cd</code> back to your Downloads folder and run the script again.</p>
</div>

<div class="ad-trouble__item">
<span class="ad-trouble__label">File is blocked (downloaded from the internet)</span>
<p>Windows flags files downloaded through a browser. Unblock it before running:</p>
<div class="ad-code">
<div class="ad-code__bar">
<span class="ad-code__label">PowerShell</span>
<button type="button" class="ad-code__copy">Copy</button>
</div>
<pre><code>Unblock-File -Path .\Build-Environment.ps1</code></pre>
</div>
</div>

<div class="ad-trouble__item">
<span class="ad-trouble__label">The script says it is not linked to PurveX Academy</span>
<p>You ran a copy that does not carry your account key, such as a saved or pasted copy. Sign in, open this tab, and click <strong>Download Build-Environment.ps1</strong> once. Do not right-click and save. If a red message appears under the link, read it, sign in again, and click the link once more. Then run the new file. It only adds what is missing.</p>
</div>

<div class="ad-trouble__item">
<span class="ad-trouble__label">The password does not meet the requirement</span>
<p>The domain rejected the initial password. The script now checks it first and asks again. Choose at least 8 characters with three of these: lowercase, uppercase, a number, a symbol. Any accounts that failed show a red line and are added the next time you run the script.</p>
</div>

<div class="ad-trouble__item">
<span class="ad-trouble__label">Running scripts is disabled on this system</span>
<p>PowerShell blocks unsigned scripts by default. This allows them for your own user account only:</p>
<div class="ad-code">
<div class="ad-code__bar">
<span class="ad-code__label">PowerShell</span>
<button type="button" class="ad-code__copy">Copy</button>
</div>
<pre><code>Set-ExecutionPolicy -Scope CurrentUser RemoteSigned</code></pre>
</div>
</div>
</div>

Run into all three in the same session, in that order: elevate first, unblock the file, then relax the execution policy. Each is a one-time fix per machine.
