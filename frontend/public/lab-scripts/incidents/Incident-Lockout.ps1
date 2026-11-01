# A staff member is locked out. Plants a real lockout (4625s then 4740); undo unlocks.
# -Sam picks who this shift targets (defaults to riley.kwan).
param([switch]$Undo, [string]$Sam = "riley.kwan", [string]$Password = "PurveX-Lab-2026!")
$ErrorActionPreference = "Continue"
. "$PSScriptRoot\Incident-Common.ps1"
$sam = $Sam
if (-not (Confirm-User $sam)) { return }

if ($Undo) {
    Unlock-ADAccount -Identity $sam -ErrorAction SilentlyContinue
    Restore-IncidentLockoutPolicy
    return
}

# A lockout threshold has to exist before bad sign-ins can lock anything.
Set-IncidentLockoutPolicy
try { $threshold = (Get-ADDefaultDomainPasswordPolicy).LockoutThreshold }
catch { $threshold = 5 }
if ($threshold -le 0) { $threshold = 5 }

Invoke-BadSignIn -Sam $sam -Times ([Math]::Max(6, $threshold + 1))
