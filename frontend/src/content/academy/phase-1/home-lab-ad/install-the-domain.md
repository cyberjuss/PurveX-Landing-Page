<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>What has to be true before the departments and accounts can exist?</p>
</div>

### Install the domain

Without a domain, the departments and accounts have nowhere to live. This script creates it. Skip this tab if `purvexfinancial.local` already exists.

The script installs Active Directory Domain Services and promotes the server, the same job you saw screen by screen on The Domain Controller. It asks for a recovery-mode password and then reboots.

**Before you run it.** Download the script with the link below while you are signed in. That copy is linked to your account, which is how Coach and your drills see your lab.

When the script asks for the initial password, choose one your domain will accept. Use at least 8 characters and three of these: lowercase, uppercase, a number, and a symbol.

The script checks the password before it creates anything. If the password will not work, it asks again.

**What you should see at the end.** Two green lines mean your lab is connected:

* `Lab snapshot sent to PurveX Coach.`
* `Coach is syncing this DC now. A directory change is sent as soon as it happens.`

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
Write-Host "You will be prompted for a DSRM (recovery mode) password." -ForegroundColor Yellow

Install-ADDSForest `
    -DomainName $DomainName `
    -DomainNetbiosName $DomainNetbiosName `
    -InstallDns:$true `
    -SafeModeAdministratorPassword (Read-Host -AsSecureString -Prompt "DSRM password") `
    -Force:$true</code></pre>
</details>

```powershell
./Install-Forest.ps1
```

