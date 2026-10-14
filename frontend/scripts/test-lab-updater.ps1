#Requires -Version 5.1
<#
Runs the real Update-PurvexScript against a stubbed download.

    npm run test:lab-updater

A hosted pod replaces its own copy of Build-Environment.ps1 from the site and
runs it as SYSTEM, so every refusal in that function is load bearing and none of
them is reachable from the site: they only fire on a download that is wrong.
This lifts the function out of the script with the parser, stubs
Invoke-WebRequest, and feeds it the downloads an attacker would hope to serve --
an older signed copy, a copy with the version line removed, a valid signature
from the wrong key, content edited after signing, a redirect to another host.

Needs the private key, because several cases need content genuinely signed at a
version of the test's choosing. It skips rather than fails without one, so it is
a developer test and not a ship check. `npm run check:lab-script` is the check
that runs anywhere.
#>
param(
    [string]$KeyPath = $(if ($env:PURVEX_LAB_SIGNING_KEY) { $env:PURVEX_LAB_SIGNING_KEY } else { Join-Path $HOME ".purvex/lab-signing-key.xml" })
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$src = Join-Path $root "frontend/public/lab-scripts/Build-Environment.ps1"

if (-not (Test-Path -LiteralPath $KeyPath)) {
    Write-Host "No signing key at $KeyPath, so there is nothing to sign test content with. Skipped." -ForegroundColor Yellow
    exit 0
}
$keyFile = $KeyPath

$tokens = $null; $perrors = $null
$ast = [System.Management.Automation.Language.Parser]::ParseFile($src, [ref]$tokens, [ref]$perrors)
$want = @("Test-PurvexSignature", "Update-PurvexScript")
$fns = $ast.FindAll({ param($n) $n -is [System.Management.Automation.Language.FunctionDefinitionAst] -and $want -contains $n.Name }, $true)
$lines = (Get-Content -LiteralPath $src -Raw) -replace "`r`n", "`n"
$consts = ($lines -split "`n") | Where-Object { $_ -like '$PurvexSigningKey = *' -or $_ -like '$PurvexScriptVersion = *' }
Invoke-Expression (($consts -join "`n") + "`n" + (($fns | ForEach-Object { $_.Extent.Text }) -join "`n"))

$tmp = Join-Path $env:TEMP "purvex-updater-test"
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
$dest = Join-Path $tmp "Build-Environment.ps1"
function Get-PurvexSyncScriptPath { $script:dest }

$rsa = New-Object System.Security.Cryptography.RSACryptoServiceProvider
$rsa.FromXmlString((Get-Content -LiteralPath $keyFile -Raw))
function Sign($text) {
    [Convert]::ToBase64String($rsa.SignData([Text.Encoding]::UTF8.GetBytes(($text -replace "`r`n", "`n")), "SHA256"))
}
function AtVersion($n) {
    [regex]::Replace($lines, '(?m)^\$PurvexScriptVersion\s*=\s*\d+\s*$', "`$PurvexScriptVersion = $n", 1)
}

# The stub. Functions beat cmdlets in name resolution, so the real function
# under test calls this without knowing.
$script:serveScript = $null
$script:serveSig = $null
$script:serveHost = "purvex.io"
$script:sigStatus = 200
function Invoke-WebRequest {
    param([string]$Uri, [switch]$UseBasicParsing, [int]$TimeoutSec)
    $isSig = $Uri.EndsWith(".sig")
    if ($isSig -and $script:sigStatus -ne 200) { throw "404" }
    $body = if ($isSig) { $script:serveSig } else { $script:serveScript }
    [pscustomobject]@{
        # byte[], which is what purvex.io actually returns for these two.
        Content      = [Text.Encoding]::UTF8.GetBytes([string]$body)
        BaseResponse = [pscustomobject]@{ ResponseUri = [uri]("https://$($script:serveHost)" + ([uri]$Uri).AbsolutePath) }
    }
}

$fails = 0
function T($name, $want, $got) {
    if ($want -eq $got) { "ok    $name" } else { $script:fails++; "FAIL  $name (want $want, got $got)" }
}
function Reset($version) {
    $script:serveScript = AtVersion $version
    $script:serveSig = Sign $script:serveScript
    $script:serveHost = "purvex.io"
    $script:sigStatus = 200
    Remove-Item -LiteralPath $dest -ErrorAction SilentlyContinue
}
$running = $PurvexScriptVersion
"running version: $running"
""

Reset ($running + 1)
T "a newer signed version is taken" $true (Update-PurvexScript -Key "pvl_test" -Url "https://purvex.io")
T "  and it landed on disk with the key written in" $true ((Test-Path $dest) -and (Get-Content $dest -Raw).Contains("'pvl_test'"))

Reset ($running + 1)
$null = Update-PurvexScript -Key "pvl_test" -Url "https://purvex.io"
T "the same newer version twice is a no-op the second time" $false (Update-PurvexScript -Key "pvl_test" -Url "https://purvex.io")

Reset $running
T "the version it is already running is refused" $false (Update-PurvexScript -Key "pvl_test" -Url "https://purvex.io")

Reset ($running - 1)
T "an older version, properly signed, is refused" $false (Update-PurvexScript -Key "pvl_test" -Url "https://purvex.io")

Reset 1
T "version 1, properly signed, is refused" $false (Update-PurvexScript -Key "pvl_test" -Url "https://purvex.io")

# A real copy from before the version line existed: signed by us, and a
# downgrade to a script with no signature check in it at all.
Reset ($running + 1)
$script:serveScript = $script:serveScript -replace '(?m)^\$PurvexScriptVersion\s*=\s*\d+\s*$', '# no version here'
$script:serveSig = Sign $script:serveScript
T "a signed copy with no version line is refused" $false (Update-PurvexScript -Key "pvl_test" -Url "https://purvex.io")

Reset ($running + 1)
$script:serveScript = $script:serveScript + "`nnet user evil P@ss1234! /add`n"
T "content changed after signing is refused" $false (Update-PurvexScript -Key "pvl_test" -Url "https://purvex.io")

Reset ($running + 1)
$script:serveSig = "junk"
T "a junk signature is refused" $false (Update-PurvexScript -Key "pvl_test" -Url "https://purvex.io")

Reset ($running + 1)
$script:sigStatus = 404
T "no signature served at all is refused" $false (Update-PurvexScript -Key "pvl_test" -Url "https://purvex.io")

Reset ($running + 1)
$script:serveHost = "evil.example"
T "a redirect off the pod's own host is refused" $false (Update-PurvexScript -Key "pvl_test" -Url "https://purvex.io")

Reset ($running + 1)
T "a student's own key is refused" $false (Update-PurvexScript -Key "pvx_student" -Url "https://purvex.io")
T "an empty key is refused" $false (Update-PurvexScript -Key "" -Url "https://purvex.io")
T "plain http is refused" $false (Update-PurvexScript -Key "pvl_test" -Url "http://purvex.io")
T "a url that is not a url is refused" $false (Update-PurvexScript -Key "pvl_test" -Url "not a url")

Reset ($running + 1)
T "  nothing was written by any refusal" $false (Test-Path $dest)

$rsa.Dispose()
Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
""
if ($fails) { "$fails failed"; exit 1 } else { "all passed"; exit 0 }
