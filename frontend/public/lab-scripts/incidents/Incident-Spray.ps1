# Password spray: failed sign-ins across many staff in a burst, locking two of them.
# Emits 4625 across accounts and 4740 on the locked ones. Undo unlocks them.
# -Targets are the accounts pushed over the lockout threshold; -Sprayed get a light
# spray. Both default to the original set so the script still runs on its own.
param(
    [switch]$Undo,
    [string[]]$Targets = @("priya.nair", "jordan.ellis"),
    [string[]]$Sprayed = @("alex.rivera", "devon.brooks", "morgan.lee", "sam.whitfield", "taylor.osei", "riley.kwan", "priya.nair", "jordan.ellis")
)
$ErrorActionPreference = "Continue"
. "$PSScriptRoot\Incident-Common.ps1"

$targets = $Targets
$sprayed = $Sprayed

if ($Undo) {
    foreach ($s in $targets) { Unlock-ADAccount -Identity $s -ErrorAction SilentlyContinue }
    return
}

try {
    if ((Get-ADDefaultDomainPasswordPolicy).LockoutThreshold -eq 0) {
        Set-ADDefaultDomainPasswordPolicy -Identity (Get-ADDomain).DistinguishedName -LockoutThreshold 5 -LockoutDuration "00:30:00" -LockoutObservationWindow "00:30:00"
    }
}
catch { }

# One or two tries each across the org (the spray), then push the two targets over the threshold.
foreach ($s in $sprayed) { if (Confirm-User $s) { Invoke-BadSignIn -Sam $s -Times 2 } }
foreach ($s in $targets) { if (Confirm-User $s) { Invoke-BadSignIn -Sam $s -Times 6 } }
