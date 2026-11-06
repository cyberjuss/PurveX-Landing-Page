<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>What has to be true before the departments and accounts can exist?</p>
</div>

### Install the domain

As you saw on the last tab, the departments and accounts have nowhere to live until a domain exists, and this script creates it for you. It installs Active Directory Domain Services and promotes the server, the same job you walked through screen by screen on The Domain Controller tab. If `purvexfinancial.local` already exists, you can skip this tab.

**Before you run it.** Open an elevated PowerShell window (Run as administrator) on a fresh Windows Server that isn't a domain controller yet.

When it runs, the script asks you to type one password twice. That's the DSRM recovery password, which is only used for Directory Services Restore Mode and never by a user. It needs at least 8 characters, using three of these: lowercase letters, uppercase letters, numbers and symbols.

**What you should see at the end.** The server reboots on its own. When it comes back, sign in as `PURVEXFINANCIAL\Administrator` and go to the Build the Environment tab, where the download is linked to your Range account.

[Download Install-Forest.ps1](/lab-scripts/Install-Forest.ps1)

If you'd rather not download it, you can copy it from here instead:

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

