# An attacker turns off auditing for the Special Logon subcategory to blind the
# SOC to elevated-privilege sign-ins (4672). Changing an audit policy emits a real
# 4719. The student re-enables auditing for that subcategory. Undo re-enables it.
# Special Logon is used so this never disables the auditing the shift's other
# incidents rely on (account, group, and logon events keep flowing).
param([switch]$Undo)
$ErrorActionPreference = "Continue"
Import-Module ActiveDirectory -ErrorAction SilentlyContinue

$sub = "Special Logon"

if ($Undo) {
    auditpol /set /subcategory:"$sub" /success:enable /failure:disable | Out-Null
    return
}

# Turn the subcategory off entirely.
auditpol /set /subcategory:"$sub" /success:disable /failure:disable | Out-Null
