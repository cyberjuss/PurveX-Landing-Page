#Requires -RunAsAdministrator
#Requires -Modules ActiveDirectory
<#
.SYNOPSIS
    Builds the GovTech Financial Active Directory lab: 5 departments, 9 users,
    8 groups, and 1 workstation object.

.DESCRIPTION
    Run on the domain controller after Install-Forest.ps1. It is safe to
    re-run. Anything that already exists is skipped.

.PARAMETER InitialPassword
    Initial password for new accounts. You are prompted if it is omitted.
    Every account must change it at next logon.

.PARAMETER IncludeCTF
    Adds the optional ticket-queue challenge objects.

.EXAMPLE
    ./Build-Environment.ps1 -WhatIf
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

    $serviceAccountsOU = Ensure-OU -Name "ServiceAccounts" -ParentDN $DomainDN -Description "Service accounts, kept separate from real user accounts."
    Ensure-Group -Name "All Employees" -OUPath $AccessLevelsOU -Scope "Universal" -Description "Firm-wide distribution group for company-wide announcements."

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

    $wmWorkstationsOU = Ensure-OU -Name "Workstations" -ParentDN $DeptOUPaths["Wealth Management"].DeptOU -Description "Wealth Management department workstation computer objects."
    Ensure-Computer -Name "WM-WKS07" -OUPath $wmWorkstationsOU -Description "CTF-TICKET-301: Wealth Management workstation named in a 02:00 successful-login alert for alex.rivera."
    $opsWorkstationsOU = Ensure-OU -Name "Workstations" -ParentDN $DeptOUPaths["Operations"].DeptOU -Description "Operations department workstation computer objects."
    Ensure-Computer -Name "OPS-WKS03" -OUPath $opsWorkstationsOU -Description "CTF-TICKET-201: Dormant Operations workstation. Check whether this asset still belongs in scope."
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

if ($IncludeCTF) {
    Ensure-CTFChallengeData -DeptOUPaths $deptOUPaths -DomainDN $domainDN -AccessLevelsOU $accessLevelsOU -Password $InitialPassword
}

Write-Host "`nDone. Verify with: Get-ADOrganizationalUnit -Filter * | Where-Object DistinguishedName -like '*Departments*'" -ForegroundColor Cyan
if (-not $IncludeCTF) {
    Write-Host "Optional: rerun with -IncludeCTF to add ticket-queue challenge artifacts." -ForegroundColor DarkGray
}
