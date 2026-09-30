# An ordinary account is marked trusted for (unconstrained) delegation, which an
# attacker can abuse to impersonate users. The student should remove the trust.
# Undo removes it too (restores baseline).
# -Sam picks who this shift targets (defaults for a standalone run).
param([switch]$Undo, [string]$Sam = "priya.nair")
$ErrorActionPreference = "Continue"
. "$PSScriptRoot\Incident-Common.ps1"
if (-not (Confirm-User $Sam)) { return }

if ($Undo) {
    Set-ADAccountControl -Identity $Sam -TrustedForDelegation $false -ErrorAction SilentlyContinue
    return
}

Set-ADAccountControl -Identity $Sam -TrustedForDelegation $true -ErrorAction SilentlyContinue
