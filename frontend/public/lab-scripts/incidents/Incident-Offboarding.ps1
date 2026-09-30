# An offboarding ticket: a leaver's account should be disabled. This ensures the
# account starts enabled (its normal state); the student disables it. Undo re-enables
# it so the lab is clean for the next shift.
# -Sam picks who this shift targets (defaults for a standalone run).
param([switch]$Undo, [string]$Sam = "jordan.ellis")
$ErrorActionPreference = "Continue"
. "$PSScriptRoot\Incident-Common.ps1"
if (-not (Confirm-User $Sam)) { return }

Enable-ADAccount -Identity $Sam -ErrorAction SilentlyContinue
