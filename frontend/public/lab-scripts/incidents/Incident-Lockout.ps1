# A staff member is locked out. Plants a real lockout (4625s then 4740); undo unlocks.
# -Sam picks who this shift targets (defaults to riley.kwan).
param([switch]$Undo, [string]$Sam = "riley.kwan", [string]$Password = "PurveX-Lab-2026!")
$ErrorActionPreference = "Continue"
. "$PSScriptRoot\Incident-Common.ps1"
$sam = $Sam
if (-not (Confirm-User $sam)) { return }

if ($Undo) {
    Unlock-ADAccount -Identity $sam -ErrorAction SilentlyContinue
    return
}

# Make sure a lockout threshold exists so the bad sign-ins actually lock the account.
try {
    $p = Get-ADDefaultDomainPasswordPolicy
    if ($p.LockoutThreshold -eq 0) { Set-ADDefaultDomainPasswordPolicy -Identity (Get-ADDomain).DistinguishedName -LockoutThreshold 5 -LockoutDuration "00:30:00" -LockoutObservationWindow "00:30:00" }
    $threshold = (Get-ADDefaultDomainPasswordPolicy).LockoutThreshold
}
catch { $threshold = 5 }

Invoke-BadSignIn -Sam $sam -Times ([Math]::Max(6, $threshold + 1))
