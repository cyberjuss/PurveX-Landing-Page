# Shared helpers for the Shift incident scripts. Dot-sourced by each one.
Import-Module ActiveDirectory -ErrorAction Stop

# Fail a sign-in for one account by binding to LDAP with a wrong password.
# Emits a real 4625 on the domain controller. Never uses the real password.
function Invoke-BadSignIn {
    param([string]$Sam, [int]$Times = 1)
    $dom = (Get-ADDomain).DNSRoot
    for ($i = 0; $i -lt $Times; $i++) {
        try {
            $entry = New-Object System.DirectoryServices.DirectoryEntry("LDAP://$dom", "$Sam@$dom", "wrong-$([guid]::NewGuid().ToString('N').Substring(0,10))")
            $null = $entry.NativeObject
        }
        catch { }
        Start-Sleep -Milliseconds 150
    }
}

# A real successful sign-in for one account, to emit a 4624. Uses the lab password.
function Invoke-GoodSignIn {
    param([string]$Sam, [string]$Password)
    $dom = (Get-ADDomain).DNSRoot
    try {
        $entry = New-Object System.DirectoryServices.DirectoryEntry("LDAP://$dom", "$Sam@$dom", $Password)
        $null = $entry.NativeObject
        return $true
    }
    catch { return $false }
}

function Confirm-User {
    param([string]$Sam)
    return [bool](Get-ADUser -Filter "SamAccountName -eq '$Sam'" -ErrorAction SilentlyContinue)
}
