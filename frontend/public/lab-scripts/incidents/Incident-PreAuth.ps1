# A staff account is set to not require Kerberos pre-authentication, exposing it to
# AS-REP roasting. The student should re-require pre-auth. Undo restores the setting.
# -Sam picks who this shift targets (defaults to priya.nair).
param([switch]$Undo, [string]$Sam = "priya.nair")
$ErrorActionPreference = "Continue"
. "$PSScriptRoot\Incident-Common.ps1"
if (-not (Confirm-User $Sam)) { return }

if ($Undo) {
    Set-ADAccountControl -Identity $Sam -DoesNotRequirePreAuth $false -ErrorAction SilentlyContinue
    return
}

Set-ADAccountControl -Identity $Sam -DoesNotRequirePreAuth $true -ErrorAction SilentlyContinue
