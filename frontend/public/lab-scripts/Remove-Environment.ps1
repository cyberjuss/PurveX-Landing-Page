#Requires -RunAsAdministrator
#Requires -Modules ActiveDirectory
<#
.SYNOPSIS
    Removes everything Build-Environment.ps1 created so you can start over.

.DESCRIPTION
    Deletes the Departments, AccessLevels, and ServiceAccounts OUs and every
    user, group, and computer object inside them, including the optional
    challenge data. The domain, the forest, and built-in accounts are not
    touched. You are asked to confirm before anything is deleted.

.PARAMETER Force
    Skips the confirmation prompt.

.EXAMPLE
    ./Remove-Environment.ps1 -WhatIf
#>

[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = "High")]
param(
    [switch]$Force
)

Import-Module ActiveDirectory -ErrorAction Stop

$domainDN = (Get-ADDomain).DistinguishedName
$labOUs   = @("Departments", "AccessLevels", "ServiceAccounts")

foreach ($name in $labOUs) {
    $path = "OU=$name,$domainDN"
    $ou = Get-ADOrganizationalUnit -Filter "DistinguishedName -eq '$path'" -ErrorAction SilentlyContinue
    if (-not $ou) {
        Write-Host "  Not found, skipping: $path" -ForegroundColor DarkGray
        continue
    }

    if (-not $PSCmdlet.ShouldProcess($path, "Delete OU and everything inside it")) { continue }
    if (-not $Force -and -not $WhatIfPreference) {
        $answer = Read-Host "Delete $path and all of its contents? (y/N)"
        if ($answer -notmatch '^(y|yes)$') {
            Write-Host "  Skipped: $path" -ForegroundColor Yellow
            continue
        }
    }

    Get-ADOrganizationalUnit -SearchBase $path -SearchScope Subtree -Filter * |
        Set-ADObject -ProtectedFromAccidentalDeletion $false
    Remove-ADOrganizationalUnit -Identity $path -Recursive -Confirm:$false
    Write-Host "  Deleted: $path" -ForegroundColor Green
}

# Ticket INC-1050 plants a laptop in the default Computers container, outside the lab OUs.
$laptop = Get-ADComputer -Filter "Name -eq 'FIN-LT14'" -ErrorAction SilentlyContinue
if ($laptop -and $laptop.DistinguishedName -like "*,CN=Computers,$domainDN" -and $PSCmdlet.ShouldProcess($laptop.DistinguishedName, "Delete ticket laptop")) {
    Remove-ADComputer -Identity $laptop -Confirm:$false
    Write-Host "  Deleted: $($laptop.DistinguishedName)" -ForegroundColor Green
}

# Tickets INC-1052 to INC-1055 live outside Active Directory.
$zone = (Get-ADDomain).DNSRoot
if ($PSCmdlet.ShouldProcess("DNS, firewall, Group Policy and share tickets", "Remove")) {
    Get-DnsServerResourceRecord -ZoneName $zone -Name "files" -RRType A -ErrorAction SilentlyContinue |
        Remove-DnsServerResourceRecord -ZoneName $zone -Force -ErrorAction SilentlyContinue
    Get-NetFirewallRule -Group "PurveX Lab" -ErrorAction SilentlyContinue | Remove-NetFirewallRule -ErrorAction SilentlyContinue
    try { Import-Module GroupPolicy -ErrorAction Stop; Remove-GPO -Name "PurveX - Finance Screen Lock" -ErrorAction SilentlyContinue } catch {}
    Remove-SmbShare -Name "Shares" -Force -ErrorAction SilentlyContinue
    foreach ($item in @("C:\PurveX\Shares", "C:\PurveX\Quarantine", "C:\PurveX\tickets.txt")) {
        if (Test-Path -LiteralPath $item) { Remove-Item -LiteralPath $item -Recurse -Force -ErrorAction SilentlyContinue }
    }
    Write-Host "  Deleted: DNS, firewall, Group Policy and share tickets" -ForegroundColor Green
}

Write-Host "`nDone. Run Build-Environment.ps1 to rebuild the lab." -ForegroundColor Cyan
