# Shared helpers for the Shift incident scripts. Dot-sourced by each one.
Import-Module ActiveDirectory -ErrorAction Stop

# Fail a sign-in for one account with a wrong password over SMB (a network logon).
# This logs a real 4625 on the domain controller, and counts toward lockout.
# LDAP binds do not log 4625, so SMB is used on purpose. Never uses the real password.
function Invoke-BadSignIn {
    param([string]$Sam, [int]$Times = 1)
    $nb = (Get-ADDomain).NetBIOSName
    for ($i = 0; $i -lt $Times; $i++) {
        $bad = "Wrong-$([guid]::NewGuid().ToString('N').Substring(0,10))!"
        & net use "\\localhost\IPC$" $bad /user:"$nb\$Sam" 2>&1 | Out-Null
        & net use "\\localhost\IPC$" /delete 2>&1 | Out-Null
        Start-Sleep -Milliseconds 200
    }
}

# A real successful sign-in for one account over SMB, to emit a 4624. Uses the lab password.
function Invoke-GoodSignIn {
    param([string]$Sam, [string]$Password)
    $nb = (Get-ADDomain).NetBIOSName
    & net use "\\localhost\IPC$" $Password /user:"$nb\$Sam" 2>&1 | Out-Null
    $ok = $LASTEXITCODE -eq 0
    & net use "\\localhost\IPC$" /delete 2>&1 | Out-Null
    return $ok
}

function Confirm-User {
    param([string]$Sam)
    return [bool](Get-ADUser -Filter "SamAccountName -eq '$Sam'" -ErrorAction SilentlyContinue)
}
