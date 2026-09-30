# A service principal name (SPN) is registered on an ordinary user account, which
# exposes it to Kerberoasting: any domain user can request a service ticket for it
# and crack the account's password offline. Emits a real 4738 (account changed).
# The student removes the SPN so the account is no longer roastable. Undo removes
# it too.
# -Sam picks who this shift targets (defaults to morgan.lee).
param([switch]$Undo, [string]$Sam = "morgan.lee")
$ErrorActionPreference = "Continue"
. "$PSScriptRoot\Incident-Common.ps1"
if (-not (Confirm-User $Sam)) { return }

$dnsRoot = (Get-ADDomain).DNSRoot
$spn = "HTTP/purvex-reports.$dnsRoot"

if ($Undo) {
    Set-ADUser -Identity $Sam -ServicePrincipalNames @{ Remove = $spn } -ErrorAction SilentlyContinue
    return
}

Set-ADUser -Identity $Sam -ServicePrincipalNames @{ Add = $spn } -ErrorAction SilentlyContinue
