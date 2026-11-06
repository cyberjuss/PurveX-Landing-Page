<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>What has to be true before the departments and accounts can exist?</p>
</div>

### Install the domain

This script creates the domain: it installs Active Directory Domain Services and promotes the server. Skip this tab if `purvexfinancial.local` already exists.

**Before you run it.** Open an elevated PowerShell window (Run as administrator) on a fresh Windows Server that isn't a domain controller yet.

It asks twice for the DSRM recovery password, used only for Directory Services Restore Mode. At least 8 characters with three of: lowercase, uppercase, numbers, symbols.

**At the end** the server reboots. Sign in as `PURVEXFINANCIAL\Administrator` and go to Build the Environment.

[Download Install-Forest.ps1](/lab-scripts/Install-Forest.ps1)

Or copy it from here:

<details class="ad-code">
<summary>Show Install-Forest.ps1 (copy/paste)</summary>
<div class="ad-code__bar">
<span class="ad-code__label">Install-Forest.ps1</span>
<button type="button" class="ad-code__copy">Copy</button>
</div>

<pre><code>#Requires -RunAsAdministrator
&lt;#
.SYNOPSIS
    Promotes a clean Windows Server to the root domain controller of
    purvexfinancial.local.

.DESCRIPTION
    Run once on a fresh server that is not yet a domain controller. It installs
    AD DS and creates the forest. You are prompted for a DSRM recovery password.
    The server reboots when promotion finishes. After the reboot, run
    Build-Environment.ps1.
#&gt;

[CmdletBinding()]
param(
    [string]$DomainName = "purvexfinancial.local",
    [string]$DomainNetbiosName = "PURVEXFINANCIAL"
)

$ErrorActionPreference = "Stop"

Write-Host "Installing AD DS role..." -ForegroundColor Cyan
Install-WindowsFeature -Name AD-Domain-Services -IncludeManagementTools

Write-Host "Promoting this server to a new forest root domain: $DomainName" -ForegroundColor Cyan
Write-Host "You will be prompted twice for a DSRM (recovery mode) password." -ForegroundColor Yellow

Install-ADDSForest `
    -DomainName $DomainName `
    -DomainNetbiosName $DomainNetbiosName `
    -InstallDns:$true `
    -Force:$true</code></pre>
</details>

```powershell
./Install-Forest.ps1
```

