# A new user account appears in the directory with no HR record -- a backdoor an
# attacker created to keep access. Emits a real 4720 (account created). The student
# contains it by disabling the account (keeping it as evidence) rather than
# deleting it. Undo removes the object.
# -Name is the rogue account (defaults to svc.update).
param([switch]$Undo, [string]$Name = "svc.update", [string]$Password = "PurveX-Lab-2026!")
$ErrorActionPreference = "Continue"
. "$PSScriptRoot\Incident-Common.ps1"
$domainDN = (Get-ADDomain).DistinguishedName
$ou = "OU=Users,OU=IT,OU=Departments,$domainDN"

$existing = Get-ADUser -Filter "SamAccountName -eq '$Name'" -ErrorAction SilentlyContinue

if ($Undo) {
    if ($existing) { Remove-ADUser -Identity $existing.DistinguishedName -Confirm:$false -ErrorAction SilentlyContinue }
    return
}

if (-not $existing) {
    try {
        New-ADUser -Name $Name -SamAccountName $Name -AccountPassword (ConvertTo-SecureString $Password -AsPlainText -Force) `
            -Enabled $true -Description "Unmanaged account. No HR record." -Path $ou -ErrorAction Stop
    }
    catch { }
}
else {
    Enable-ADAccount -Identity $existing.DistinguishedName -ErrorAction SilentlyContinue
}
