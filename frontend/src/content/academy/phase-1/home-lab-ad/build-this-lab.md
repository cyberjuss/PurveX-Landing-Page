<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>What does it actually take to stand up the environment you are about to investigate?</p>
</div>

### Overview

Everything in the other tabs — the departments, the access levels, the user directory — is not just something to memorize. It is a real Active Directory environment you can build yourself, on your own machine, using the two scripts below. Building it is worth doing. Setting up the accounts, groups, and structure yourself is how you actually learn what "normal" looks like in this environment, rather than simply reading a description of it.

**At a glance:**

* `Install-Forest.ps1` — one-time setup. Turns a blank Windows Server into the domain controller for `govtechfinancial.local`. Skip it if that domain already exists.
* `Build-Environment.ps1` — the script that does the real work. Creates every department, group, user, and workstation described in the tabs above, so the environment matches what you have already been studying. Safe to re-run any time.

### What You Will Need

* A Windows Server (2019 or later) you can use as a domain controller. A VM on your own hardware (Hyper-V, VirtualBox, VMware) works fine for this.
* An elevated (Administrator) PowerShell session on that server.
* About 15–20 minutes, plus a reboot partway through.

### Step 1 — Install the Domain (Skip If You Already Have One)

If your server is not yet a domain controller, download and run this first. It installs Active Directory Domain Services and promotes the server to the root of a new domain, `govtechfinancial.local`. It will ask for a recovery-mode password, then reboot automatically. Why it matters: without a domain to belong to, there is nowhere for the departments, users, and groups in the next step to actually live.

**What this script does:**

* Installs the AD DS (Active Directory Domain Services) Windows Server role
* Prompts you for a DSRM (Directory Services Restore Mode) recovery password — a separate password from any domain account, only used for AD recovery scenarios
* Promotes the server to the root of a brand-new forest: `govtechfinancial.local`, with DNS installed alongside it
* Reboots the server automatically once promotion finishes

[Download Install-Forest.ps1](/lab-scripts/Install-Forest.ps1)

You can also copy it straight from here:

<details class="ad-code">
<summary>Show Install-Forest.ps1 (copy/paste)</summary>
<div class="ad-code__bar">
<span class="ad-code__label">Install-Forest.ps1</span>
<button type="button" class="ad-code__copy" onclick="const code=this.closest('.ad-code').querySelector('code').innerText; navigator.clipboard.writeText(code); const b=this; b.textContent='Copied'; setTimeout(()=>{b.textContent='Copy';},1500);">Copy</button>
</div>
<pre><code>#Requires -RunAsAdministrator
&lt;#
.SYNOPSIS
    Promotes a clean Windows Server into the root domain controller for the
    govtechfinancial.local forest used by the "Think Like a SOC Analyst 101"
    home lab.

.DESCRIPTION
    One-time bootstrap step. Only run this on a fresh server that is not yet
    a domain controller and does not already belong to a domain. It installs
    the AD DS role and promotes the box to a new forest root domain.

    The server reboots automatically at the end of promotion. After reboot,
    log back in as govtechfinancial\Administrator and run
    Build-Environment.ps1 to create the OUs, groups, users, and workstation
    object described on the course's Home Lab page.

.NOTES
    You will be prompted for a Directory Services Restore Mode (DSRM)
    password. This is separate from any domain account password and is only
    used for AD recovery scenarios -- keep it, don't lose it.
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
    -Force:$true

# The server reboots automatically after this cmdlet completes.
</code></pre>
</details>

```powershell
./Install-Forest.ps1
```

### Step 2 — Build the Environment

After the reboot, log back in as `GOVTECHFINANCIAL\Administrator` and run this script. It creates every department, group, user, and the workstation object described in the other tabs on this page. Why it matters: this is the step that turns the org chart and user directory from a description into a live environment you can actually query and investigate.

**What this script does:**

* Creates two top-level OUs: `Departments` and `AccessLevels`
* Creates all 5 department OUs (IT, Compliance, Wealth Management, Operations, Finance and Accounting), each with its own `Users` sub-OU — IT also gets a `Workstations` sub-OU
* Creates all 9 security groups: one standard-access group per department, `IT Admins` (elevated), plus `Server Admins` and `Helpdesk` (the Level 2 and Level 3 access-level groups)
* Creates all 9 user accounts from the Full User Directory tab, in the right OU, with the right title and department, and adds each one to the right group(s)
* Pre-stages the `IT-WKS01` computer object
* Prompts once for an initial password — every account is forced to change it at next logon, so nobody actually keeps that password long-term
* Safe to run more than once: it only creates what's missing, and never resets or deletes anything that already exists

[Download Build-Environment.ps1](/lab-scripts/Build-Environment.ps1)

You can also copy it straight from here:

<details class="ad-code">
<summary>Show Build-Environment.ps1 (copy/paste)</summary>
<div class="ad-code__bar">
<span class="ad-code__label">Build-Environment.ps1</span>
<button type="button" class="ad-code__copy" onclick="const code=this.closest('.ad-code').querySelector('code').innerText; navigator.clipboard.writeText(code); const b=this; b.textContent='Copied'; setTimeout(()=>{b.textContent='Copy';},1500);">Copy</button>
</div>
<pre class="ad-code__pre--tall"><code>#Requires -RunAsAdministrator
#Requires -Modules ActiveDirectory
&lt;#
.SYNOPSIS
    Builds the GovTech Financial Active Directory environment described on
    the "Think Like a SOC Analyst 101" Home Lab page (Phase 1 -&gt; Home Lab --
    Active Directory) -- 5 departments, 9 users, 6 department/elevated
    groups, 2 custom access-level groups, and 1 workstation object.

.DESCRIPTION
    Run this on the domain controller (or any management host with the
    ActiveDirectory module and RSAT installed) after the govtechfinancial.local
    forest already exists -- see Install-Forest.ps1 for that one-time step.

    The script is idempotent: run it as many times as you want. Anything
    that already exists is left alone and just reported, not recreated or
    reset. That makes it safe to re-run after adding a new department or
    user to this script later.

    Structure created:

      govtechfinancial.local
      |-- OU=Departments
      |   |-- OU=IT
      |   |   |-- OU=Users        (Alex Rivera, Priya Nair)
      |   |   `-- OU=Workstations (IT-WKS01)
      |   |-- OU=Compliance
      |   |   `-- OU=Users        (Devon Brooks, Morgan Lee)
      |   |-- OU=WealthManagement
      |   |   `-- OU=Users        (Sam Whitfield, Jamie Torres)
      |   |-- OU=Operations
      |   |   `-- OU=Users        (Taylor Osei, Riley Kwan)
      |   `-- OU=FinanceAccounting
      |       `-- OU=Users        (Jordan Ellis)
      `-- OU=AccessLevels
          |-- Group: Server Admins   (Level 2 -- empty by default)
          `-- Group: Helpdesk        (Level 3 -- empty by default)

    Level 1 (Domain Admin) is the built-in "Domain Admins" group -- nothing
    to create there.

    Groups created: IT Users, IT Admins, Compliance Users,
    Wealth Management Users, Operations Users, Finance Accounting Users,
    Server Admins, Helpdesk (8 custom groups; Domain Admins is built-in,
    matching the site's "9 security groups" count).

    Note on the workstation name: the site lists it as "IT WKS01", but AD
    computer names can't contain spaces, so this script creates it as
    IT-WKS01. This only creates the computer object in AD (pre-staged, so
    it's ready for a real Windows machine to join the domain as IT-WKS01) --
    it does not build or join an actual physical/virtual machine.

.PARAMETER InitialPassword
    SecureString used as the initial password for every created user
    account. If omitted, you'll be prompted once. All accounts are created
    with "must change password at next logon" set, so nobody actually logs
    in with this password long-term.

.EXAMPLE
    ./Build-Environment.ps1

.EXAMPLE
    ./Build-Environment.ps1 -WhatIf
    Shows exactly what would be created without changing anything.
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
    param([string]$Name, [string]$ParentDN)
    $path = "OU=$Name,$ParentDN"
    $exists = $true
    try {
        Get-ADOrganizationalUnit -Identity $path -ErrorAction Stop | Out-Null
    }
    catch {
        $exists = $false
    }
    if ($exists) {
        Write-Host "  OU exists:   $path" -ForegroundColor DarkGray
    }
    elseif ($PSCmdlet.ShouldProcess($path, "Create OU")) {
        New-ADOrganizationalUnit -Name $Name -Path $ParentDN -ProtectedFromAccidentalDeletion $true
        Write-Host "  OU created:  $path" -ForegroundColor Green
    }
    return $path
}

function Ensure-Group {
    [CmdletBinding(SupportsShouldProcess = $true)]
    param([string]$Name, [string]$OUPath, [ValidateSet("Global", "DomainLocal", "Universal")][string]$Scope = "Global")
    if (Get-ADGroup -Filter "Name -eq '$Name'" -ErrorAction SilentlyContinue) {
        Write-Host "  Group exists: $Name" -ForegroundColor DarkGray
    }
    elseif ($PSCmdlet.ShouldProcess($Name, "Create security group")) {
        New-ADGroup -Name $Name -GroupScope $Scope -GroupCategory Security -Path $OUPath
        Write-Host "  Group created: $Name" -ForegroundColor Green
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

# ---------------------------------------------------------------------------
# 1. Top-level OUs
# ---------------------------------------------------------------------------
Write-Host "`n== Top-level OUs ==" -ForegroundColor Cyan
$departmentsOU  = Ensure-OU -Name "Departments"  -ParentDN $domainDN
$accessLevelsOU = Ensure-OU -Name "AccessLevels" -ParentDN $domainDN

# ---------------------------------------------------------------------------
# 2. Departments: OU + Users sub-OU + standard group
# ---------------------------------------------------------------------------
$departments = @(
    @{ Display = "IT";                      OU = "IT";                 Group = "IT Users" },
    @{ Display = "Compliance";               OU = "Compliance";         Group = "Compliance Users" },
    @{ Display = "Wealth Management";        OU = "WealthManagement";   Group = "Wealth Management Users" },
    @{ Display = "Operations";               OU = "Operations";         Group = "Operations Users" },
    @{ Display = "Finance and Accounting";   OU = "FinanceAccounting";  Group = "Finance Accounting Users" }
)

$deptOUPaths = @{}
foreach ($dept in $departments) {
    Write-Host "`n== Department: $($dept.Display) ==" -ForegroundColor Cyan
    $deptOU  = Ensure-OU -Name $dept.OU -ParentDN $departmentsOU
    $usersOU = Ensure-OU -Name "Users" -ParentDN $deptOU
    Ensure-Group -Name $dept.Group -OUPath $deptOU
    $deptOUPaths[$dept.Display] = @{ DeptOU = $deptOU; UsersOU = $usersOU }
}

# IT gets an extra Workstations OU and the elevated "IT Admins" group.
$itWorkstationsOU = Ensure-OU -Name "Workstations" -ParentDN $deptOUPaths["IT"].DeptOU
Ensure-Group -Name "IT Admins" -OUPath $deptOUPaths["IT"].DeptOU

# ---------------------------------------------------------------------------
# 3. Access-level groups (Level 1 is the built-in Domain Admins group)
# ---------------------------------------------------------------------------
Write-Host "`n== Access-level groups ==" -ForegroundColor Cyan
Ensure-Group -Name "Server Admins" -OUPath $accessLevelsOU   # Level 2
Ensure-Group -Name "Helpdesk"      -OUPath $accessLevelsOU   # Level 3
Write-Host "  (Level 1 / Domain Admin uses the built-in 'Domain Admins' group -- nothing to create)" -ForegroundColor DarkGray

# ---------------------------------------------------------------------------
# 4. Users
# ---------------------------------------------------------------------------
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

# ---------------------------------------------------------------------------
# 5. Workstation (pre-staged computer object only -- see note in header)
# ---------------------------------------------------------------------------
Write-Host "`n== Workstation ==" -ForegroundColor Cyan
$computerName = "IT-WKS01"
if (Get-ADComputer -Filter "Name -eq '$computerName'" -ErrorAction SilentlyContinue) {
    Write-Host "  Computer exists: $computerName" -ForegroundColor DarkGray
}
elseif ($PSCmdlet.ShouldProcess($computerName, "Pre-stage computer object")) {
    New-ADComputer -Name $computerName -SAMAccountName "$computerName$" -Path $itWorkstationsOU
    Write-Host "  Computer pre-staged: $computerName ($itWorkstationsOU)" -ForegroundColor Green
}

Write-Host "`nDone. Verify with: Get-ADOrganizationalUnit -Filter * | Where-Object DistinguishedName -like '*Departments*'" -ForegroundColor Cyan
</code></pre>
</details>

```powershell
./Build-Environment.ps1
```

To see exactly what the script is about to do before committing to it, run it with `-WhatIf` first:

```powershell
./Build-Environment.ps1 -WhatIf
```

### Step 3 — Verify It Built Correctly

Open Active Directory Users and Computers (or run these) and confirm you see all 5 departments, all 9 users in the right department with the right title, and `alex.rivera` in both `IT Users` and `IT Admins`:

```powershell
Get-ADOrganizationalUnit -Filter * | Sort-Object DistinguishedName

Get-ADUser -Filter * -SearchBase "OU=Departments,$((Get-ADDomain).DistinguishedName)" -Properties Title, Department |
    Select-Object Name, SamAccountName, Title, Department

Get-ADGroupMember -Identity "IT Admins"
```

A quick note on the workstation. The User Directory and Client Workstation tabs list it as "IT WKS01," but AD computer names cannot contain spaces, so the script creates the object as `IT-WKS01`. It is the same machine, just given a technically valid name.

Once this is built and verified, you have your own live copy of the environment every other tab on this page describes. This is what you will be investigating in the labs ahead.

<style>
.ad-code { margin: 1.25rem 0; border: 1px solid var(--pvrx-border-light); border-radius: 10px; overflow: hidden; }
.ad-code > summary { cursor: pointer; list-style: none; padding: 0.7rem 1rem; font-size: 0.85rem; font-weight: 650; color: #5546e0; background: var(--pvrx-surface-alt-light); }
.ad-code > summary::-webkit-details-marker { display: none; }
.ad-code > summary::before { content: "▸ "; }
.ad-code[open] > summary::before { content: "▾ "; }
.ad-code__bar { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.5rem 0.75rem; border-top: 1px solid var(--pvrx-border-light); background: #0c1220; }
.ad-code__label { font-family: var(--font-mono, ui-monospace, monospace); font-size: 0.78rem; color: #94a3b8; }
.ad-code__copy { font-size: 0.76rem; font-weight: 650; color: #e2e8f0; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.14); border-radius: 6px; padding: 0.3rem 0.65rem; cursor: pointer; }
.ad-code__copy:hover { background: rgba(255,255,255,0.16); }
.ad-code pre { margin: 0; border-radius: 0; }
.ad-code__pre--tall { max-height: 420px; overflow-y: auto; }
</style>
