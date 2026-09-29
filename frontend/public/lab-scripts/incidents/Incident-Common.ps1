# Shared helpers for the Shift incident scripts. Dot-sourced by each one.
Import-Module ActiveDirectory -ErrorAction Stop

# The Windows LogonUser API. A failed network logon (type 3) writes a real 4625
# on the domain controller and counts toward lockout; a good one writes a 4624.
# LDAP binds and loopback SMB only do credential validation (4776) and never
# write 4625, so we call LogonUser directly.
if (-not ("Range.Logon" -as [type])) {
    Add-Type -Namespace Range -Name Logon -MemberDefinition @'
[System.Runtime.InteropServices.DllImport("advapi32.dll", SetLastError=true)]
public static extern bool LogonUser(string user, string domain, string password, int logonType, int provider, out System.IntPtr token);
[System.Runtime.InteropServices.DllImport("kernel32.dll", SetLastError=true)]
public static extern bool CloseHandle(System.IntPtr handle);
'@
}

function Invoke-BadSignIn {
    param([string]$Sam, [int]$Times = 1)
    $nb = (Get-ADDomain).NetBIOSName
    for ($i = 0; $i -lt $Times; $i++) {
        $bad = "Wrong-$([guid]::NewGuid().ToString('N').Substring(0,10))!"
        $tok = [IntPtr]::Zero
        # 3 = LOGON32_LOGON_NETWORK, 0 = default provider.
        [void][Range.Logon]::LogonUser($Sam, $nb, $bad, 3, 0, [ref]$tok)
        if ($tok -ne [IntPtr]::Zero) { [void][Range.Logon]::CloseHandle($tok) }
        Start-Sleep -Milliseconds 200
    }
}

function Invoke-GoodSignIn {
    param([string]$Sam, [string]$Password)
    $nb = (Get-ADDomain).NetBIOSName
    $tok = [IntPtr]::Zero
    $ok = [Range.Logon]::LogonUser($Sam, $nb, $Password, 3, 0, [ref]$tok)
    if ($tok -ne [IntPtr]::Zero) { [void][Range.Logon]::CloseHandle($tok) }
    return $ok
}

function Confirm-User {
    param([string]$Sam)
    return [bool](Get-ADUser -Filter "SamAccountName -eq '$Sam'" -ErrorAction SilentlyContinue)
}
