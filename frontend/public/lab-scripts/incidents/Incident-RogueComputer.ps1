# An unrecognized computer account appears in the IT Workstations OU with no asset
# record -- a machine an attacker may have joined to the domain. The student
# contains it by disabling the computer account (keeping it as evidence) rather
# than deleting it outright. Undo removes the object.
# -Name is the rogue machine name (defaults to WKS-TEMP7).
param([switch]$Undo, [string]$Name = "WKS-TEMP7")
$ErrorActionPreference = "Continue"
Import-Module ActiveDirectory -ErrorAction Stop
$domainDN = (Get-ADDomain).DistinguishedName
$ou = "OU=Workstations,OU=IT,OU=Departments,$domainDN"

$existing = Get-ADComputer -Filter "Name -eq '$Name'" -ErrorAction SilentlyContinue

if ($Undo) {
    if ($existing) { Remove-ADComputer -Identity $existing.DistinguishedName -Confirm:$false -ErrorAction SilentlyContinue }
    return
}

if (-not $existing) {
    try {
        New-ADComputer -Name $Name -SAMAccountName "$Name$" -Path $ou -Enabled $true `
            -Description "Unregistered machine account. No matching asset record." -ErrorAction Stop
    }
    catch { }
}
else {
    Enable-ADAccount -Identity $existing.DistinguishedName -ErrorAction SilentlyContinue
}
