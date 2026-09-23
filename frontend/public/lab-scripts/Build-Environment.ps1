#Requires -RunAsAdministrator
#Requires -Modules ActiveDirectory
<#
.SYNOPSIS
    Builds the GovTech Financial Active Directory environment described on
    the "Think Like a SOC Analyst 101" Home Lab page (Phase 1 -> Home Lab --
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

.PARAMETER IncludeCTF
    Adds optional ticket-queue challenge artifacts: a service-account OU,
    a backup service account, extra workstation objects, an all-employees
    group with one intentional gap, and ticket descriptions for students
    to investigate. Leave this off when you want only the clean baseline.

.EXAMPLE
    ./Build-Environment.ps1

.EXAMPLE
    ./Build-Environment.ps1 -IncludeCTF
    Builds the baseline environment and plants the optional challenge data.

.EXAMPLE
    ./Build-Environment.ps1 -WhatIf
    Shows exactly what would be created without changing anything.
#>

[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [System.Security.SecureString]$InitialPassword,
    [switch]$IncludeCTF
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
        if (-not $isMember -and $PSCmdlet.ShouldProcess("$SamAccountName -> $groupName", "Add group membership")) {
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

    $serviceAccountsOU = Ensure-OU -Name "ServiceAccounts" -ParentDN $DomainDN
    Ensure-Group -Name "All Employees" -OUPath $AccessLevelsOU -Scope "Universal"

    foreach ($sam in @("alex.rivera", "priya.nair", "devon.brooks", "morgan.lee", "sam.whitfield", "taylor.osei", "riley.kwan", "jordan.ellis")) {
        $isMember = Get-ADGroupMember -Identity "All Employees" -ErrorAction SilentlyContinue |
            Where-Object { $_.SamAccountName -eq $sam }
        if (-not $isMember -and $PSCmdlet.ShouldProcess("$sam -> All Employees", "Add group membership")) {
            Add-ADGroupMember -Identity "All Employees" -Members $sam
            Write-Host "    + $sam added to All Employees" -ForegroundColor Green
        }
    }

    Ensure-User `
        -First "Casey" -Last "Reed" -SamAccountName "casey.reed" `
        -Title "Help Desk Technician" -Department "IT" `
        -OUPath $DeptOUPaths["IT"].UsersOU `
        -Groups @("IT Users")
    Ensure-UserDescription -SamAccountName "casey.reed" -Description "CTF-TICKET-105: New Help Desk hire. Mirror Priya Nair's actual group membership; do not trust job title alone."

    Ensure-User `
        -First "Service" -Last "Backup" -SamAccountName "svc-backup-job" `
        -Title "Nightly Backup Service Account" -Department "IT" `
        -OUPath $serviceAccountsOU `
        -Groups @("IT Users")
    if ($PSCmdlet.ShouldProcess("svc-backup-job", "Apply service-account flags")) {
        Set-ADUser -Identity "svc-backup-job" `
            -Description "CTF-TICKET-202: Runs the nightly backup job on IT-WKS01. Expected use: 01:00-03:00 only." `
            -PasswordNeverExpires $true `
            -ChangePasswordAtLogon $false
        Write-Host "    ~ svc-backup-job service-account flags applied" -ForegroundColor Green
    }

    Ensure-UserDescription -SamAccountName "jamie.torres" -Description "CTF-TICKET-101: New Wealth Management hire. Should receive firm-wide announcements but is missing one non-department group."
    Ensure-UserDescription -SamAccountName "taylor.osei" -Description "CTF-TICKET-203: HR transfer notice says Compliance, but this account still needs OU verification before policy follows."
    Ensure-UserDescription -SamAccountName "riley.kwan" -Description "CTF-TICKET-102: User reports lockout after repeated failed attempts. Decide unlock vs reset based on whether the password is remembered."

    $wmWorkstationsOU = Ensure-OU -Name "Workstations" -ParentDN $DeptOUPaths["Wealth Management"].DeptOU
    Ensure-Computer -Name "WM-WKS07" -OUPath $wmWorkstationsOU -Description "CTF-TICKET-301: Wealth Management workstation named in a 02:00 successful-login alert for alex.rivera."
    Ensure-Computer -Name "OPS-WKS03" -OUPath (Ensure-OU -Name "Workstations" -ParentDN $DeptOUPaths["Operations"].DeptOU) -Description "CTF-TICKET-201: Dormant Operations workstation. Check whether this asset still belongs in scope."
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
Ensure-Computer -Name $computerName -OUPath $itWorkstationsOU -Description "Standard IT workstation for GovTechFinancial administrators."

if ($IncludeCTF) {
    Ensure-CTFChallengeData -DeptOUPaths $deptOUPaths -DomainDN $domainDN -AccessLevelsOU $accessLevelsOU -Password $InitialPassword
}

Write-Host "`nDone. Verify with: Get-ADOrganizationalUnit -Filter * | Where-Object DistinguishedName -like '*Departments*'" -ForegroundColor Cyan
if (-not $IncludeCTF) {
    Write-Host "Optional: rerun with -IncludeCTF to add ticket-queue challenge artifacts." -ForegroundColor DarkGray
}
