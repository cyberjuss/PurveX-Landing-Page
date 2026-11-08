<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>The script finished. How do you know the directory matches the firm, and what do you do when it does not?</p>
</div>

### Check what got built

A script saying it finished isn't the same as the lab being right, so don't rely on its output alone. Open Active Directory Users and Computers, or run the commands below, and confirm three things:

- All 5 departments exist
- All 9 users sit in the right department with the right title
- `alex.rivera` is in both `IT Users` and `IT Admins`

If any of that is missing, the lab isn't ready yet. You'll also notice `old.intern`, `kai.mendes` and `noah.kim` in the user list. Those come from the Ticket Queue objects, so leave them alone until you reach those tickets.

```powershell
Get-ADOrganizationalUnit -Filter * | Sort-Object DistinguishedName

Get-ADUser -Filter * -SearchBase "OU=Departments,$((Get-ADDomain).DistinguishedName)" -Properties Title, Department |
    Select-Object Name, SamAccountName, Title, Department

Get-ADGroupMember -Identity "IT Admins"
```

### If the Script Will Not Run

If the script won't run, the good news is that a handful of errors account for almost every report. Each one is easy to fix once you know which you're looking at.

<div class="ad-trouble">
<div class="ad-trouble__item">
<span class="ad-trouble__label">Not running as Administrator</span>
<img src="/academy/lab-scripts/run-as-admin-error.png" alt="PowerShell error: the script cannot be run because it contains a &quot;#requires&quot; statement for running as Administrator" class="ad-trouble__img" />
<p>Close this window, search the Start menu for PowerShell, then right-click it and choose <strong>Run as Administrator</strong>. From there, <code>cd</code> back to your Downloads folder and run the script again.</p>
</div>

<div class="ad-trouble__item">
<span class="ad-trouble__label">File is blocked (downloaded from the internet)</span>
<p>Windows flags any file downloaded through a browser, so you need to unblock this one before running it:</p>
<div class="ad-code">
<div class="ad-code__bar">
<span class="ad-code__label">PowerShell</span>
<button type="button" class="ad-code__copy">Copy</button>
</div>
<pre><code>Unblock-File -Path .\Build-Environment.ps1</code></pre>
</div>
</div>

<div class="ad-trouble__item">
<span class="ad-trouble__label">The script says it is not linked to Range</span>
<p>This means you ran a copy that doesn't carry your account key, such as a saved or pasted copy. Sign in and click <strong>Download Build-Environment.ps1</strong> once on the Build the Environment tab, rather than right-clicking and saving, then run the new file. It only adds what's missing, so it won't disturb what you've already built.</p>
</div>

<div class="ad-trouble__item">
<span class="ad-trouble__label">The password does not meet the requirement</span>
<p>The domain rejected the initial password, so the script asks again. Choose at least 8 characters using three of these: lowercase, uppercase, a number and a symbol. Any account that failed is added the next time you run the script.</p>
</div>

<div class="ad-trouble__item">
<span class="ad-trouble__label">Running scripts is disabled on this system</span>
<p>Windows client editions block unsigned scripts by default, and some servers do too. This command allows them for your own user account only:</p>
<div class="ad-code">
<div class="ad-code__bar">
<span class="ad-code__label">PowerShell</span>
<button type="button" class="ad-code__copy">Copy</button>
</div>
<pre><code>Set-ExecutionPolicy -Scope CurrentUser RemoteSigned</code></pre>
</div>
</div>
</div>

Three of these are about how the machine is set up, and they can all show up in the same session. When they do, fix them in this order, and once a machine is sorted you won't see them there again:

1. Elevate.
2. Unblock the file.
3. Relax the execution policy.

### Start Over

If you ever want a fresh start, run the cleanup script on the domain controller. It asks you to confirm first, then deletes the `Departments`, `AccessLevels` and `ServiceAccounts` OUs and everything inside them, while the domain itself and its built-in accounts stay untouched.

```powershell
./Remove-Environment.ps1
```

Add `-WhatIf` to preview what would be deleted, or `-Force` to skip the confirmation. Once it's done, run `Build-Environment.ps1` again to rebuild the lab.

[Download Remove-Environment.ps1](/lab-scripts/Remove-Environment.ps1)
