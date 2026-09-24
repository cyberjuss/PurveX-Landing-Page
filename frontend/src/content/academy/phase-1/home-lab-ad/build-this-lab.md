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

If your server is not yet a domain controller, download and run this first. It installs Active Directory Domain Services and promotes the server to the root of a new domain, `govtechfinancial.local`. It asks for a recovery-mode password and then reboots automatically. Without a domain, the departments, users, and groups in the next step have nowhere to live.

**What this script does:**

* Installs the AD DS (Active Directory Domain Services) Windows Server role
* Prompts you for a DSRM (Directory Services Restore Mode) recovery password. It is separate from any domain account password and is used only for AD recovery
* Promotes the server to the root of a new forest called `govtechfinancial.local`, with DNS installed alongside it
* Reboots the server automatically once promotion finishes

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

After the reboot, log back in as `GOVTECHFINANCIAL\Administrator` and run this script. It creates every department, group, user, and the workstation object described in the other tabs. This step turns the org chart and user directory from a description into a live environment you can query and investigate.

**What this script does:**

* Creates two top-level OUs: `Departments` and `AccessLevels`
* Creates all 5 department OUs (IT, Compliance, Wealth Management, Operations, Finance and Accounting), each with its own `Users` sub-OU (IT also gets a `Workstations` sub-OU)
* Creates all 9 security groups. Each department gets a standard access group, `IT Admins` is elevated, and `Server Admins` and `Helpdesk` are the Level 2 and Level 3 access groups
* Creates all 9 user accounts from the Full User Directory in The Environment tab, in the right OU, with the right title and department, and adds each one to the right group(s)
* Pre-stages the `IT-WKS01` computer object
* Prompts once for an initial password. Every account must change it at next logon, so nobody keeps that password long-term
* Is safe to run more than once. It only creates what is missing and never resets or deletes anything that exists
* Optional: add `-IncludeCTF` to plant ticket-queue challenge objects after the clean baseline is built
* The Academy download starts a 15-minute Coach sync on the domain controller after the first successful build. The VM only has to stay on. To stop it: `./Build-Environment.ps1 -UninstallSync`. A one-off refresh is still `./Build-Environment.ps1 -SyncOnly`.
* The sync now also sends your security settings (password and lockout policy, auditing, log size) and a 30-day count of Security log events, such as failed sign-ins and accounts created. It never sends passwords or raw log entries. Your drills and the weekly CTF use it, so download the script again and run it once to get it.

[Download Build-Environment.ps1](/lab-scripts/Build-Environment.ps1)

Use the download above, not a pasted copy, so the script is linked to your Academy account.

```powershell
./Build-Environment.ps1
```

To see exactly what the script is about to do before committing to it, run it with `-WhatIf` first:

```powershell
./Build-Environment.ps1 -WhatIf
```

If the script will not run, see **If the Script Will Not Run** at the end of this tab for the three most common causes and their fixes.

To add the optional ticket-queue challenge data, run the same script with the CTF switch:

```powershell
./Build-Environment.ps1 -IncludeCTF
```

This adds a service-account OU, a backup service account, a leftover intern account, a firm-wide group with one intentional membership gap, a disabled Operations account, and a few workstation objects that back the Ticket Queue. Use this after you understand the clean baseline. The tickets ask you to add, create, remove, write, and move objects, not only read them.

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
