# A standard user is added to Domain Admins -- full control of the domain -- with
# no change ticket. Emits a real 4728. The student contains it by removing the
# account from Domain Admins without deleting it. Undo removes it too.
# -Sam picks who this shift targets (defaults to taylor.osei).
param([switch]$Undo, [string]$Sam = "taylor.osei")
$ErrorActionPreference = "Continue"
. "$PSScriptRoot\Incident-Common.ps1"
if (-not (Confirm-User $Sam)) { return }
$group = "Domain Admins"

if ($Undo) {
    Remove-ADGroupMember -Identity $group -Members $Sam -Confirm:$false -ErrorAction SilentlyContinue
    return
}

Add-ADGroupMember -Identity $group -Members $Sam -ErrorAction SilentlyContinue
