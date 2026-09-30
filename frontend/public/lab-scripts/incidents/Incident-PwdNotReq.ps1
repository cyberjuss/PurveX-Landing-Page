# An account is flagged PASSWD_NOTREQD, so it can sign in with a blank password.
# The student should clear the flag. Undo clears it too (restores baseline).
# -Sam picks who this shift targets (defaults for a standalone run).
param([switch]$Undo, [string]$Sam = "priya.nair")
$ErrorActionPreference = "Continue"
. "$PSScriptRoot\Incident-Common.ps1"
if (-not (Confirm-User $Sam)) { return }

if ($Undo) {
    Set-ADUser -Identity $Sam -PasswordNotRequired $false -ErrorAction SilentlyContinue
    return
}

Set-ADUser -Identity $Sam -PasswordNotRequired $true -ErrorAction SilentlyContinue
