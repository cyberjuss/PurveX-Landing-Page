<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>What does it actually take to stand up the environment you are about to investigate?</p>
</div>

### Overview

The other tabs describe the departments, the access levels, and the user directory. Those objects only exist in your lab after you run the two scripts below.

Building it yourself is how you see what normal looks like here. Until the scripts finish you are reading a chart. After they finish you have a live copy of GovTech Financial you can open, query, and check a ticket against.

By the end of this tab you should be able to open Active Directory Users and Computers and find the same departments and accounts the other tabs named. If you cannot the lab is not built yet. Do not start a challenge on a half-built directory.

**At a glance:**

* `Install-Forest.ps1` is one-time setup. It turns a blank Windows Server into the domain controller for `govtechfinancial.local`. Skip it if that domain already exists.
* `Build-Environment.ps1` does the real work. It creates every department, group, user, and workstation described above so the environment matches what you have been studying. It is safe to re-run any time.

**What you will need:**

* A Windows Server (2019 or later) you can use as a domain controller. A VM on your own hardware (Hyper-V, VirtualBox, VMware) works fine for this.
* An elevated (Administrator) PowerShell session on that server.
* About 15–20 minutes, plus a reboot partway through.

### Step 1. Install the Domain (Skip If You Already Have One)

If your server is not yet a domain controller, run this first, as Administrator. It installs Active Directory, creates the domain `govtechfinancial.local`, and reboots the server.

**What you need to know:** it asks once for a recovery (DSRM) password. Keep it somewhere safe. It is separate from your account passwords and is only used to recover Active Directory.

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
    govtechfinancial.local.

.DESCRIPTION
    Run once on a fresh server that is not yet a domain controller. It installs
    AD DS and creates the forest. You are prompted for a DSRM recovery password.
    The server reboots when promotion finishes. After the reboot, run
    Build-Environment.ps1.
#&gt;

[CmdletBinding()]
param(
    [string]$DomainName = "govtechfinancial.local",
    [string]$DomainNetbiosName = "GOVTECHFINANCIAL"
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

### Step 2. Build the Environment

After the reboot, log in as `GOVTECHFINANCIAL\Administrator`, open PowerShell as Administrator, and run the script you download here. It builds the departments, groups, users, and workstation from the other tabs.

**What you need to know:**

* It asks once for an initial password. Every account must change it at next logon.
* It is safe to run again. It only creates what is missing and never deletes or resets anything.
* Download it from this page, not from somewhere else. This copy is linked to your Academy account, which is how Coach and your drills can see your lab.

[Download Build-Environment.ps1](/lab-scripts/Build-Environment.ps1)

```powershell
./Build-Environment.ps1
```

**Switches you may want:**

* `-WhatIf` previews what it would do without changing anything.
* `-IncludeCTF` adds the Ticket Queue objects. Use it after you understand the clean baseline.
* `-SyncOnly` sends your lab to the Academy right now.
* `-UninstallSync` stops the automatic sync.

**What it shares with the Academy:** after the first build it starts a sync every 15 minutes while the server is on. It sends a read-only summary of your lab objects, your security settings (password and lockout policy, auditing, log size), and a 30-day count of Security log events, such as failed sign-ins and accounts created. It never sends passwords or raw log entries. Your drills, Coach, and the weekly CTF are built from it.

Download it again and run it once whenever the Academy adds new checks. That refreshes the sync to the newest version.

If it will not run, see **If the Script Will Not Run** at the end of this tab.

### Step 3. Verify It Built, or Reset It

**Verify.** Do not trust the script output alone. Open Active Directory Users and Computers (or run these) and confirm you see all 5 departments, all 9 users in the right department with the right title, and `alex.rivera` in both `IT Users` and `IT Admins`. If any of that is missing, the lab is not ready.

```powershell
Get-ADOrganizationalUnit -Filter * | Sort-Object DistinguishedName

Get-ADUser -Filter * -SearchBase "OU=Departments,$((Get-ADDomain).DistinguishedName)" -Properties Title, Department |
    Select-Object Name, SamAccountName, Title, Department

Get-ADGroupMember -Identity "IT Admins"
```

A note on the workstation. The Environment tab lists it as "IT WKS01," but AD computer names cannot contain spaces, so the script creates the object as `IT-WKS01`. It is the same machine with a valid name.


**Reset.** If you want a completely fresh start, run the cleanup script on the domain controller. It deletes the `Departments`, `AccessLevels`, and `ServiceAccounts` OUs and every user, group, and computer object inside them, including the optional challenge data. The domain itself, the forest, and the built-in accounts are not touched. It asks you to confirm before deleting anything.

```powershell
./Remove-Environment.ps1
```

Add `-WhatIf` to preview what would be deleted, or `-Force` to skip the confirmation prompt. Afterward, run `Build-Environment.ps1` again to rebuild the lab.

[Download Remove-Environment.ps1](/lab-scripts/Remove-Environment.ps1)

Once built and verified, you have your own live copy of the environment every other tab describes. That is the baseline. Challenges start from here.

### If the Script Will Not Run

Three errors account for almost every "it will not run" report. Each is easy to fix once you know which one you are looking at.

<div class="ad-trouble">
<div class="ad-trouble__item">
<span class="ad-trouble__label">Not running as Administrator</span>
<img src="/academy/lab-scripts/run-as-admin-error.png" alt="PowerShell error: the script cannot be run because it contains a &quot;#requires&quot; statement for running as Administrator" class="ad-trouble__img" />
<p>Close this window. Open the Start menu, search PowerShell, right-click it, and choose <strong>Run as Administrator</strong>. Then <code>cd</code> back to your Downloads folder and run the script again.</p>
</div>

<div class="ad-trouble__item">
<span class="ad-trouble__label">File is blocked (downloaded from the internet)</span>
<p>Windows flags files downloaded through a browser. Unblock it before running:</p>
<div class="ad-code">
<div class="ad-code__bar">
<span class="ad-code__label">PowerShell</span>
<button type="button" class="ad-code__copy">Copy</button>
</div>
<pre><code>Unblock-File -Path .\Build-Environment.ps1</code></pre>
</div>
</div>

<div class="ad-trouble__item">
<span class="ad-trouble__label">Running scripts is disabled on this system</span>
<p>PowerShell blocks unsigned scripts by default. This allows them for your own user account only:</p>
<div class="ad-code">
<div class="ad-code__bar">
<span class="ad-code__label">PowerShell</span>
<button type="button" class="ad-code__copy">Copy</button>
</div>
<pre><code>Set-ExecutionPolicy -Scope CurrentUser RemoteSigned</code></pre>
</div>
</div>
</div>

Run into all three in the same session, in that order: elevate first, unblock the file, then relax the execution policy. Each is a one-time fix per machine.
