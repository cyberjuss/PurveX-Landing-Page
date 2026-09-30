# The domain is set to store passwords with reversible encryption, which keeps
# them effectively recoverable in plain text -- a serious hardening failure an
# attacker or a bad change can introduce. Emits a real 4739 (policy changed). The
# student turns reversible encryption back off. Undo turns it off too.
param([switch]$Undo)
$ErrorActionPreference = "Continue"
Import-Module ActiveDirectory -ErrorAction Stop
$dn = (Get-ADDomain).DistinguishedName

if ($Undo) {
    Set-ADDefaultDomainPasswordPolicy -Identity $dn -ReversibleEncryptionEnabled $false -ErrorAction SilentlyContinue
    return
}

Set-ADDefaultDomainPasswordPolicy -Identity $dn -ReversibleEncryptionEnabled $true -ErrorAction SilentlyContinue
