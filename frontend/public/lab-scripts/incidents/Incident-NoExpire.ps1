# A staff account is set so its password never expires. On a normal user that
# defeats password rotation and is a common finding an attacker leaves behind.
# Emits a real 4738 (account changed). The student clears the flag so the password
# expires on schedule again. Undo clears it too.
# -Sam picks who this shift targets (defaults to sam.whitfield).
param([switch]$Undo, [string]$Sam = "sam.whitfield")
$ErrorActionPreference = "Continue"
. "$PSScriptRoot\Incident-Common.ps1"
if (-not (Confirm-User $Sam)) { return }

if ($Undo) {
    Set-ADUser -Identity $Sam -PasswordNeverExpires $false -ErrorAction SilentlyContinue
    return
}

Set-ADUser -Identity $Sam -PasswordNeverExpires $true -ErrorAction SilentlyContinue
