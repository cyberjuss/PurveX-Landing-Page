# A staff account was disabled and the user cannot sign in (a help-desk ticket).
# Emits 4725 (account disabled). The student should re-enable it. Undo re-enables.
# -Sam picks who this shift targets (defaults to taylor.osei).
param([switch]$Undo, [string]$Sam = "taylor.osei")
$ErrorActionPreference = "Continue"
. "$PSScriptRoot\Incident-Common.ps1"
if (-not (Confirm-User $Sam)) { return }

if ($Undo) {
    Enable-ADAccount -Identity $Sam -ErrorAction SilentlyContinue
    return
}

Disable-ADAccount -Identity $Sam -ErrorAction SilentlyContinue
