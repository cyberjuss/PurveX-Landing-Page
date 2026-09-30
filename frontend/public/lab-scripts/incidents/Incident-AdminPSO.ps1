# A provisioning task: privileged accounts (IT Admins) have no fine-grained
# password policy, so they fall back to the weaker domain default. The student
# creates a Password Settings Object (PSO) for IT Admins with a longer minimum
# length and lockout. Inject clears any existing IT Admins PSO so it is a real
# create task; undo removes whatever PSO now applies to IT Admins.
# -Group is the privileged group to protect (defaults to IT Admins).
param([switch]$Undo, [string]$Group = "IT Admins")
$ErrorActionPreference = "Continue"
Import-Module ActiveDirectory -ErrorAction Stop

# Remove any fine-grained policy currently applied to the group. Used by both
# inject (start clean) and undo (clean up the student's work after the shift).
$applied = Get-ADFineGrainedPasswordPolicy -Filter * -ErrorAction SilentlyContinue | Where-Object {
    @($_.AppliesTo | ForEach-Object { ($_ -split '(?<!\\),', 2)[0] -replace '^(CN|OU)=', '' }) -contains $Group
}
foreach ($p in $applied) { Remove-ADFineGrainedPasswordPolicy -Identity $p.Name -Confirm:$false -ErrorAction SilentlyContinue }
