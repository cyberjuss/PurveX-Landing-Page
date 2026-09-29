# False alarm: an after-hours group change that is actually an approved change.
# Emits a real 4728 for morgan.lee joining Compliance Users. The student should
# recognise it as approved and leave it. Undo removes it to restore baseline.
param([switch]$Undo)
$ErrorActionPreference = "Continue"
. "$PSScriptRoot\Incident-Common.ps1"
$sam = "morgan.lee"
$group = "Compliance Users"

if ($Undo) {
    Remove-ADGroupMember -Identity $group -Members $sam -Confirm:$false -ErrorAction SilentlyContinue
    return
}
if (Confirm-User $sam) { Add-ADGroupMember -Identity $group -Members $sam -ErrorAction SilentlyContinue }
