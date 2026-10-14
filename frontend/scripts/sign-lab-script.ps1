#Requires -Version 5.1
<#
Signs the lab script, so a pod can tell PurveX's copy from anyone else's.

A hosted pod replaces its own copy of Build-Environment.ps1 from the site a few
times a day and then runs it as SYSTEM. TLS alone would make that trust the
channel: a hijacked deploy, a leaked token or a mis-issued certificate would all
serve a file the pod would run. The signature moves the trust to the file.

    npm run sign:lab-script

Run it after every change to frontend/public/lab-scripts/Build-Environment.ps1
and commit the .sig beside it. Forgetting is safe but not free: every pod
refuses the update and keeps the copy it already has, so it goes stale rather
than wrong. `npm run check:lab-script` is what catches that before a deploy.

The private key lives outside the repo, at ~/.purvex/lab-signing-key.xml with a
user-only ACL, or wherever PURVEX_LAB_SIGNING_KEY points. It is never committed
and never leaves this machine.
#>
param(
    [string]$KeyPath = $(if ($env:PURVEX_LAB_SIGNING_KEY) { $env:PURVEX_LAB_SIGNING_KEY } else { Join-Path $HOME ".purvex\lab-signing-key.xml" })
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$script = Join-Path $root "frontend\public\lab-scripts\Build-Environment.ps1"
$out = "$script.sig"

if (-not (Test-Path -LiteralPath $KeyPath)) {
    Write-Host "No signing key at $KeyPath." -ForegroundColor Red
    Write-Host "It is deliberately not in the repo. Point PURVEX_LAB_SIGNING_KEY at it, or restore it from wherever you keep it."
    exit 1
}
if (-not (Test-Path -LiteralPath $script)) { Write-Host "No script at $script." -ForegroundColor Red; exit 1 }

# LF, always. Git stores this file with LF and checks it out on Windows with
# CRLF, so a signature over the bytes on disk would not match the bytes the
# site serves. The pod normalises the same way before it verifies.
$text = (Get-Content -LiteralPath $script -Raw) -replace "`r`n", "`n"
$bytes = [Text.Encoding]::UTF8.GetBytes($text)

$rsa = New-Object System.Security.Cryptography.RSACryptoServiceProvider
try {
    $rsa.FromXmlString((Get-Content -LiteralPath $KeyPath -Raw))
    $sig = [Convert]::ToBase64String($rsa.SignData($bytes, "SHA256"))
    # Verified here rather than trusted: a signature that does not check out on
    # the machine that made it would fail silently on every pod instead.
    if (-not $rsa.VerifyData($bytes, "SHA256", [Convert]::FromBase64String($sig))) {
        Write-Host "Signed, but the signature did not verify. Not writing it." -ForegroundColor Red
        exit 1
    }
}
finally { $rsa.Dispose() }

# No trailing newline and no BOM: the pod trims whitespace, but a BOM would ride
# along into the base64 and break the decode.
[IO.File]::WriteAllText($out, $sig, (New-Object Text.UTF8Encoding $false))

Write-Host "Signed $([IO.Path]::GetFileName($script)) ($($bytes.Length) bytes, LF)." -ForegroundColor Green
Write-Host "Wrote $out"
