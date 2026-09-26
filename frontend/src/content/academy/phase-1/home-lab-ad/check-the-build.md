<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>The script finished. How do you know the directory matches the firm, and what do you do when it does not?</p>
</div>

### Check what got built

**Verify.** Do not trust the script output alone. Open Active Directory Users and Computers, or run the commands below, and confirm three things:

- All 5 departments exist
- All 9 users sit in the right department with the right title
- `alex.rivera` is in both `IT Users` and `IT Admins`

If any of that is missing, the lab is not ready.

```powershell
Get-ADOrganizationalUnit -Filter * | Sort-Object DistinguishedName

Get-ADUser -Filter * -SearchBase "OU=Departments,$((Get-ADDomain).DistinguishedName)" -Properties Title, Department |
    Select-Object Name, SamAccountName, Title, Department

Get-ADGroupMember -Identity "IT Admins"
```

**A note on the workstation.** The Environment tab lists it as "IT WKS01." AD computer names cannot contain spaces, so the script creates the object as `IT-WKS01`. It is the same machine with a valid name.

Once the lab is built and verified, you have a live copy of the environment the baseline tabs describe. The challenges start from here.

### If the Script Will Not Run

A few errors account for almost every "it will not run" report. Each one is easy to fix once you know which one you are looking at.

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
<span class="ad-trouble__label">The script says it is not linked to PurveX Academy</span>
<p>You ran a copy without your account key, such as a saved or pasted copy. Sign in, open Build the Environment, and click <strong>Download Build-Environment.ps1</strong> once. Do not right-click and save. If a red message appears under the link, read it, sign in again, and click the link once more. Then run the new file. It only adds what is missing.</p>
</div>

<div class="ad-trouble__item">
<span class="ad-trouble__label">The password does not meet the requirement</span>
<p>The domain rejected the initial password. The script checks it first and asks again. Choose at least 8 characters with three of these: lowercase, uppercase, a number, a symbol. Any account that failed shows a red line and is added the next time you run the script.</p>
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

If you hit the Administrator, blocked-file, and execution-policy errors in one session, fix them in that order. Elevate first, unblock the file, then relax the execution policy. Each is a one-time fix per machine.

### Start Over

For a completely fresh start, run the cleanup script on the domain controller. It asks you to confirm before it deletes anything.

The script deletes the `Departments`, `AccessLevels`, and `ServiceAccounts` OUs and every user, group, and computer inside them, including the challenge data. The domain, the forest, and the built-in accounts stay untouched.

```powershell
./Remove-Environment.ps1
```

Add `-WhatIf` to preview what would be deleted, or `-Force` to skip the confirmation. Afterward, run `Build-Environment.ps1` again to rebuild the lab.

[Download Remove-Environment.ps1](/lab-scripts/Remove-Environment.ps1)
