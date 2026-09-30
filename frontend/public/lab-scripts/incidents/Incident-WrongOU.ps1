# A user account is moved out of its department Users OU into the wrong place
# (the top-level Departments container). Group Policy and delegated rights are
# scoped by OU, so a misplaced account is a real access problem. The move plus an
# attribute touch emit a real 4738. The student moves the account back to its
# department's Users OU. Undo also moves it back.
# -Sam picks who this shift targets; -OU is their department OU short name
# (e.g. Compliance, WealthManagement, FinanceAccounting).
param([switch]$Undo, [string]$Sam = "devon.brooks", [string]$OU = "Compliance")
$ErrorActionPreference = "Continue"
. "$PSScriptRoot\Incident-Common.ps1"
if (-not (Confirm-User $Sam)) { return }

$domainDN = (Get-ADDomain).DistinguishedName
$correct = "OU=Users,OU=$OU,OU=Departments,$domainDN"
$wrong = "OU=Departments,$domainDN"

$user = Get-ADUser -Identity $Sam -ErrorAction SilentlyContinue
if (-not $user) { return }

if ($Undo) {
    if ($user.DistinguishedName -ne "CN=$($user.Name),$correct") {
        Move-ADObject -Identity $user.DistinguishedName -TargetPath $correct -ErrorAction SilentlyContinue
    }
    Set-ADUser -Identity $Sam -Clear info -ErrorAction SilentlyContinue
    return
}

# A benign attribute touch guarantees a 4738 even if the move alone does not emit one.
Set-ADUser -Identity $Sam -Replace @{ info = "OU review pending" } -ErrorAction SilentlyContinue
if ($user.DistinguishedName -ne "CN=$($user.Name),$wrong") {
    Move-ADObject -Identity $user.DistinguishedName -TargetPath $wrong -ErrorAction SilentlyContinue
}
