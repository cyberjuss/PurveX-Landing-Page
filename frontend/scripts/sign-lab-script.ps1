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

# The version goes up on every signature, and it goes up here rather than by
# hand. A pod only takes a higher number than the one it runs, which is what
# stops an old signed copy being served back to it -- so a new signature over
# the same number would be refused by every pod and nothing would say why.
# Spending a number on a re-sign that changed nothing costs nothing.
$versionRx = [regex]'(?m)^\$PurvexScriptVersion\s*=\s*(\d+)\s*$'
$found = $versionRx.Match($text)
if (-not $found.Success) {
    Write-Host "The script has no `$PurvexScriptVersion line, so a pod cannot tell this copy from an older one." -ForegroundColor Red
    exit 1
}
$was = [int]$found.Groups[1].Value
$now = $was + 1
$text = $versionRx.Replace($text, "`$PurvexScriptVersion = $now", 1)
# Written back LF, the way git stores it. The .sig covers this text.
[IO.File]::WriteAllText($script, $text, (New-Object Text.UTF8Encoding $false))

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

# The lesson pastes this whole script into a <pre> block, because a student
# building their own domain controller has no Range download to get it from.
# Kept in step here rather than by hand: the two have drifted before, and a
# lesson teaching a script nobody signed or tested is the worst of the three
# outcomes. check-lab-script.mjs fails if they ever part company again.
$lesson = Join-Path $root "frontend/src/content/academy/phase-1/home-lab-ad/build-the-environment.md"
if (Test-Path -LiteralPath $lesson) {
    $md = (Get-Content -LiteralPath $lesson -Raw) -replace "`r`n", "`n"
    $escaped = $text.TrimEnd("`n").Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;")
    $block = '<pre class="ad-code__pre--tall"><code>' + $escaped + '</code></pre>'
    $rx = [regex]'(?s)<pre class="ad-code__pre--tall"><code>.*?</code></pre>'
    if (-not $rx.IsMatch($md)) {
        Write-Host "The lesson has no ad-code__pre--tall block to paste into. Left it alone." -ForegroundColor Yellow
    }
    else {
        $updated = $rx.Replace($md, [System.Text.RegularExpressions.MatchEvaluator] { param($m) $block }, 1)
        if ($updated -ne $md) {
            [IO.File]::WriteAllText($lesson, $updated, (New-Object Text.UTF8Encoding $false))
            Write-Host "Updated the copy in the Build the Environment lesson."
        }
    }
}

Write-Host "Signed version $now of $([IO.Path]::GetFileName($script)) ($($bytes.Length) bytes, LF), up from $was." -ForegroundColor Green
Write-Host "Wrote $out"
Write-Host "Commit both, and the lesson copy if the script changed."
