# A service account is quietly added to IT Admins overnight. Emits a real 4728.
# Undo removes it. The account is left disabled so it is contained but keeps as evidence.
param([switch]$Undo, [string]$Password = "PurveX-Lab-2026!")
$ErrorActionPreference = "Continue"
. "$PSScriptRoot\Incident-Common.ps1"
$sam = "svc.helpdesk"
$group = "IT Admins"

if ($Undo) {
    Remove-ADGroupMember -Identity $group -Members $sam -Confirm:$false -ErrorAction SilentlyContinue
    return
}

if (-not (Confirm-User $sam)) {
    $it = Get-ADOrganizationalUnit -Filter "Name -eq 'IT'" -SearchBase (Get-ADDomain).DistinguishedName -ErrorAction SilentlyContinue | Select-Object -First 1
    $path = if ($it) { "OU=Users,$($it.DistinguishedName)" } else { (Get-ADDomain).UsersContainer }
    try {
        New-ADUser -Name "svc.helpdesk" -SamAccountName $sam -AccountPassword (ConvertTo-SecureString $Password -AsPlainText -Force) `
            -Enabled $false -Description "Unmanaged service account" -Path $path -ErrorAction Stop
    }
    catch { }
}
Add-ADGroupMember -Identity $group -Members $sam -ErrorAction SilentlyContinue
