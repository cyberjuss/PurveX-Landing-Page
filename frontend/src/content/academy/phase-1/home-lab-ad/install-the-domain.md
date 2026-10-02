<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>What has to be true before the departments and accounts can exist?</p>
</div>

### Install the domain

Without a domain, the departments and accounts have nowhere to live. This script creates it. Skip this tab if `purvexfinancial.local` already exists.

The script installs Active Directory Domain Services and promotes the server, the same job you saw screen by screen on The Domain Controller. It asks for a recovery-mode password and then reboots.

**Before you run it.** Use an elevated PowerShell on a fresh Windows Server that is not yet a domain controller.

The script asks you to type one password twice: the DSRM recovery password. It is for Directory Services Restore Mode, not for any user. Use at least 8 characters and three of these: lowercase, uppercase, a number, and a symbol.

**What you should see at the end.** The server reboots on its own. Sign back in as `PURVEXFINANCIAL\Administrator`, then go to Build the Environment. That download is the one linked to your Range account, and it is what connects your lab to Coach.

[Download Install-Forest.ps1](/lab-scripts/Install-Forest.ps1)

You can also copy it straight from here:

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

