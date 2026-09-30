# An IAM "mover" task: a user transferred departments, so their access must move
# with them -- out of the old department group and into the new one. Inject just
# makes sure the baseline holds (in the old group, not the new). The student
# removes the old access and grants the new. Undo restores the baseline.
# -Sam is the user; -From and -To are department OU short names (IT, Compliance,
# WealthManagement, Operations, FinanceAccounting).
param([switch]$Undo, [string]$Sam = "devon.brooks", [string]$From = "Compliance", [string]$To = "Operations")
$ErrorActionPreference = "Continue"
. "$PSScriptRoot\Incident-Common.ps1"
if (-not (Confirm-User $Sam)) { return }

$groupFor = @{
    "IT"               = "IT Users"
    "Compliance"       = "Compliance Users"
    "WealthManagement" = "Wealth Management Users"
    "Operations"       = "Operations Users"
    "FinanceAccounting" = "Finance Accounting Users"
}
$fromGroup = $groupFor[$From]
$toGroup = $groupFor[$To]
if (-not $fromGroup -or -not $toGroup) { return }

if ($Undo) {
    Add-ADGroupMember -Identity $fromGroup -Members $Sam -ErrorAction SilentlyContinue
    Remove-ADGroupMember -Identity $toGroup -Members $Sam -Confirm:$false -ErrorAction SilentlyContinue
    return
}

# Baseline: in the old group, not yet in the new one.
Add-ADGroupMember -Identity $fromGroup -Members $Sam -ErrorAction SilentlyContinue
Remove-ADGroupMember -Identity $toGroup -Members $Sam -Confirm:$false -ErrorAction SilentlyContinue
