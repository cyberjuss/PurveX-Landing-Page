<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>What does it actually take to stand up the environment you are about to investigate?</p>
</div>

### Overview

The other tabs cover the departments, the access levels, and the user directory. They are not just something to memorize. They describe a real Active Directory environment you can build on your own machine with the two scripts below. Building it yourself is how you learn what "normal" looks like here. By the end of this tab, you will have your own live copy of GovTechFinancial running and ready to investigate.

**At a glance:**

* `Install-Forest.ps1`: one-time setup that turns a blank Windows Server into the domain controller for `govtechfinancial.local`. Skip it if that domain already exists.
* `Build-Environment.ps1` does the real work. It creates every department, group, user, and workstation described above so the environment matches what you have been studying. It is safe to re-run any time.

**What you will need:**

* A Windows Server (2019 or later) you can use as a domain controller. A VM on your own hardware (Hyper-V, VirtualBox, VMware) works fine for this.
* An elevated (Administrator) PowerShell session on that server.
* About 15–20 minutes, plus a reboot partway through.

### Step 1 — Install the Domain (Skip If You Already Have One)

If your server is not yet a domain controller, download and run this first. It installs Active Directory Domain Services and promotes the server to the root of a new domain, `govtechfinancial.local`. It asks for a recovery-mode password and then reboots automatically. Without a domain, the departments, users, and groups in the next step have nowhere to live.

**What this script does:**

* Installs the AD DS (Active Directory Domain Services) Windows Server role
* Prompts you for a DSRM (Directory Services Restore Mode) recovery password. It is separate from any domain account password and is used only for AD recovery
* Promotes the server to the root of a new forest called `govtechfinancial.local`, with DNS installed alongside it
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
    govtechfinancial.local.

.DESCRIPTION
    Run once on a fresh server that is not yet a domain controller. It installs
    AD DS and creates the forest. You are prompted for a DSRM recovery password.
    The server reboots when promotion finishes. After the reboot, run
    Build-Environment.ps1.
#&gt;

[CmdletBinding()]
param(
    [string]$DomainName = "govtechfinancial.local",
    [string]$DomainNetbiosName = "GOVTECHFINANCIAL"
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

### Step 2 — Build the Environment

After the reboot, log back in as `GOVTECHFINANCIAL\Administrator` and run this script. It creates every department, group, user, and the workstation object described in the other tabs. This step turns the org chart and user directory from a description into a live environment you can query and investigate.

**What this script does:**

* Creates two top-level OUs: `Departments` and `AccessLevels`
* Creates all 5 department OUs (IT, Compliance, Wealth Management, Operations, Finance and Accounting), each with its own `Users` sub-OU (IT also gets a `Workstations` sub-OU)
* Creates all 9 security groups. Each department gets a standard access group, `IT Admins` is elevated, and `Server Admins` and `Helpdesk` are the Level 2 and Level 3 access groups
* Creates all 9 user accounts from the Full User Directory in The Environment tab, in the right OU, with the right title and department, and adds each one to the right group(s)
* Pre-stages the `IT-WKS01` computer object
* Prompts once for an initial password. Every account must change it at next logon, so nobody keeps that password long-term
* Is safe to run more than once. It only creates what is missing and never resets or deletes anything that exists
* Optional: add `-IncludeCTF` to plant ticket-queue challenge objects after the clean baseline is built

[Download Build-Environment.ps1](/lab-scripts/Build-Environment.ps1)

You can also copy the clean baseline version from here. Use the downloadable script above when you want the optional `-IncludeCTF` ticket data.

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
    Builds the GovTech Financial Active Directory lab: 5 departments, 9 users,
    8 groups, and 1 workstation object.

.DESCRIPTION
    Run on the domain controller after Install-Forest.ps1. It is safe to
    re-run. Anything that already exists is skipped.

.PARAMETER InitialPassword
    Initial password for new accounts. You are prompted if it is omitted.
    Every account must change it at next logon.

.EXAMPLE
    ./Build-Environment.ps1 -WhatIf
#&gt;

[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [System.Security.SecureString]$InitialPassword
)

Import-Module ActiveDirectory -ErrorAction Stop

if (-not $InitialPassword) {
    $InitialPassword = Read-Host -AsSecureString -Prompt "Initial password for all new lab accounts"
}

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
            -Enabled $true
        Write-Host "  User created: $SamAccountName ($Title, $Department)" -ForegroundColor Green
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
Ensure-Computer -Name $computerName -OUPath $itWorkstationsOU -Description "Standard IT workstation for GovTechFinancial administrators."

Write-Host "`nDone. Verify with: Get-ADOrganizationalUnit -Filter * | Where-Object DistinguishedName -like '*Departments*'" -ForegroundColor Cyan</code></pre>
</details>

```powershell
./Build-Environment.ps1
```

To see exactly what the script is about to do before committing to it, run it with `-WhatIf` first:

```powershell
./Build-Environment.ps1 -WhatIf
```

If the script will not run, see **If the Script Will Not Run** at the end of this tab for the three most common causes and their fixes.

To add the optional ticket-queue challenge data, run the same script with the CTF switch:

```powershell
./Build-Environment.ps1 -IncludeCTF
```

This adds a service-account OU, a backup service account, a firm-wide group with one intentional membership gap, and a few workstation/user descriptions that back the Ticket Queue challenge. Use this after you understand the clean baseline.

### Step 3 — Verify It Built, or Reset It

**Verify.** Open Active Directory Users and Computers (or run these) and confirm you see all 5 departments, all 9 users in the right department with the right title, and `alex.rivera` in both `IT Users` and `IT Admins`:

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

Once built and verified, you have your own live copy of the environment every other tab describes. This is what you will investigate in the labs ahead.

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
