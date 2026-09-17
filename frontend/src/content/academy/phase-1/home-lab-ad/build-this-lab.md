<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>What does it actually take to stand up the environment you are about to investigate?</p>
</div>

### Overview

Everything in the other tabs, the departments, the access levels, the user directory, is not just something to memorize. It is a real Active Directory environment you can build yourself, on your own machine, using the two scripts below. Building it is worth doing: setting up the accounts, groups, and structure yourself is how you actually learn what "normal" looks like in this environment, rather than simply reading a description of it.

### What You Will Need

* A Windows Server (2019 or later) you can use as a domain controller. A VM on your own hardware (Hyper-V, VirtualBox, VMware) works fine for this.
* An elevated (Administrator) PowerShell session on that server.
* About 15–20 minutes, plus a reboot partway through.

### Step 1 — Install the Domain (Skip If You Already Have One)

If your server is not yet a domain controller, download and run this first. It installs Active Directory Domain Services and promotes the server to the root of a new domain, `govtechfinancial.local`. It will ask for a recovery-mode password, then reboot automatically.

[Download Install-Forest.ps1](/lab-scripts/Install-Forest.ps1)

```powershell
./Install-Forest.ps1
```

### Step 2 — Build the Environment

After the reboot, log back in as `GOVTECHFINANCIAL\Administrator` and run this script. It creates every department, group, user, and the workstation object described in the other tabs on this page.

[Download Build-Environment.ps1](/lab-scripts/Build-Environment.ps1)

```powershell
./Build-Environment.ps1
```

You will be prompted once for an initial password. Every account this creates requires a password change at next logon, so this is never a long-term credential for anyone.

To see exactly what the script is about to do before committing to it, run it with `-WhatIf` first:

```powershell
./Build-Environment.ps1 -WhatIf
```

The script only adds things. Running it again later never deletes or resets anything, so it is safe to re-run at any time.

### Step 3 — Verify It Built Correctly

Open Active Directory Users and Computers (or run these) and confirm you see all 5 departments, all 9 users in the right department with the right title, and `alex.rivera` in both `IT Users` and `IT Admins`:

```powershell
Get-ADOrganizationalUnit -Filter * | Sort-Object DistinguishedName

Get-ADUser -Filter * -SearchBase "OU=Departments,$((Get-ADDomain).DistinguishedName)" -Properties Title, Department |
    Select-Object Name, SamAccountName, Title, Department

Get-ADGroupMember -Identity "IT Admins"
```

A quick note on the workstation: the User Directory and Client Workstation tabs list it as "IT WKS01," but AD computer names cannot contain spaces, so the script creates the object as `IT-WKS01`. It is the same machine, just given a technically valid name.

Once this is built and verified, you have your own live copy of the environment every other tab on this page describes. This is what you will be investigating in the labs ahead.
