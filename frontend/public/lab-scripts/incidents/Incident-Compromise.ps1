# Jamie Torres is compromised: failed sign-ins then a success (4625s then a 4624).
# The student should disable the account to contain it. Undo re-enables it.
param([switch]$Undo, [string]$Password = "PurveX-Lab-2026!")
$ErrorActionPreference = "Continue"
. "$PSScriptRoot\Incident-Common.ps1"
$sam = "jamie.torres"
if (-not (Confirm-User $sam)) { return }

if ($Undo) {
    Enable-ADAccount -Identity $sam -ErrorAction SilentlyContinue
    return
}

# Several failures, then one real success, so the log shows the guess that worked.
Invoke-BadSignIn -Sam $sam -Times 4
Invoke-GoodSignIn -Sam $sam -Password $Password | Out-Null
