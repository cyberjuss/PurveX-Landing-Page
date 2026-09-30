# One account is hammered with failed sign-ins until it locks -- a targeted brute
# force against a single user, not a spray across many. Emits real 4625s and a 4740
# lockout on that account. The student unlocks the real user and escalates. Undo
# unlocks the account.
# -Sam picks who this shift targets (defaults to sam.whitfield).
param([switch]$Undo, [string]$Sam = "sam.whitfield", [int]$Count = 8)
$ErrorActionPreference = "Continue"
. "$PSScriptRoot\Incident-Common.ps1"
if (-not (Confirm-User $Sam)) { return }

if ($Undo) {
    Unlock-ADAccount -Identity $Sam -ErrorAction SilentlyContinue
    return
}

Invoke-BadSignIn -Sam $Sam -Times $Count
