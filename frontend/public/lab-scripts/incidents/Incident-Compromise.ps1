# A staff account is compromised: failed sign-ins then a success (4625s then a 4624).
# The student should disable the account to contain it. Undo re-enables it.
# -Sam picks who this shift targets (defaults to jamie.torres).
param([switch]$Undo, [string]$Sam = "jamie.torres", [string]$Password = "PurveX-Lab-2026!")
$ErrorActionPreference = "Continue"
. "$PSScriptRoot\Incident-Common.ps1"
$sam = $Sam
if (-not (Confirm-User $sam)) { return }

if ($Undo) {
    Enable-ADAccount -Identity $sam -ErrorAction SilentlyContinue
    return
}

# Several failures, then one real success, so the log shows the guess that worked.
Invoke-BadSignIn -Sam $sam -Times 4
Invoke-GoodSignIn -Sam $sam -Password $Password | Out-Null
