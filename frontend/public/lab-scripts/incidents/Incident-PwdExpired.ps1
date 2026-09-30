# A staff member's password has expired and they cannot sign in (a help-desk
# ticket). Setting pwdLastSet to 0 forces "must change at next logon" and emits a
# real 4738 (account changed). The student resets the password to restore access.
# Undo sets a fresh password so the account is usable again.
# -Sam picks who this shift targets (defaults to jordan.ellis).
param([switch]$Undo, [string]$Sam = "jordan.ellis", [string]$Password = "PurveX-Lab-2026!")
$ErrorActionPreference = "Continue"
. "$PSScriptRoot\Incident-Common.ps1"
if (-not (Confirm-User $Sam)) { return }

if ($Undo) {
    Set-ADAccountPassword -Identity $Sam -Reset -NewPassword (ConvertTo-SecureString $Password -AsPlainText -Force) -ErrorAction SilentlyContinue
    Set-ADUser -Identity $Sam -ChangePasswordAtLogon $false -ErrorAction SilentlyContinue
    return
}

# pwdLastSet = 0 marks the password expired: the user must change it at next logon.
Set-ADUser -Identity $Sam -Replace @{ pwdLastSet = 0 } -ErrorAction SilentlyContinue
