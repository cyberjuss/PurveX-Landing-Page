# The domain password policy is weakened (short passwords, no lockout). Emits a
# real 4739. The student restores a safe baseline. Undo restores it too.
param([switch]$Undo)
$ErrorActionPreference = "Continue"
Import-Module ActiveDirectory -ErrorAction Stop
$dn = (Get-ADDomain).DistinguishedName

function Set-Baseline {
    Set-ADDefaultDomainPasswordPolicy -Identity $dn -MinPasswordLength 12 -ComplexityEnabled $true `
        -LockoutThreshold 5 -LockoutDuration "00:30:00" -LockoutObservationWindow "00:30:00" -ErrorAction SilentlyContinue
}

if ($Undo) { Set-Baseline; return }

# Weaken it: short passwords allowed, lockout off.
Set-ADDefaultDomainPasswordPolicy -Identity $dn -MinPasswordLength 4 -ComplexityEnabled $false -LockoutThreshold 0 -ErrorAction SilentlyContinue
