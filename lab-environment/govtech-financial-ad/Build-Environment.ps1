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

.EXAMPLE
    ./Build-Environment.ps1

.EXAMPLE
    ./Build-Environment.ps1 -WhatIf
    Shows exactly what would be created without changing anything.
#>

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
    if (Get-ADOrganizationalUnit -Filter "DistinguishedName -eq '$path'" -ErrorAction SilentlyContinue) {
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
