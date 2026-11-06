<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>The script finished. How do you know the directory matches the firm, and what do you do when it does not?</p>
</div>

### Check what got built

**Verify.** A script saying it finished isn't the same as the lab being right, so don't rely on its output alone. Open Active Directory Users and Computers, or run the commands below, and confirm three things:

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

Once the lab is built and verified, you have a live copy of the environment the baseline tabs describe, and that's where the challenges begin.

### If the Script Will Not Run

If the script won't run, the good news is that a handful of errors account for almost every report. Each one is easy to fix once you know which one you're looking at.

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
<p>This means you ran a copy that doesn't carry your account key, such as a saved or pasted copy. To fix it, sign in and click <strong>Download Build-Environment.ps1</strong> once on the Build the Environment tab, rather than right-clicking and saving. If a red message appears under the link, read it and sign in again before you click the link once more. Then run the new file. Since it only adds what's missing, it won't disturb what you've already built.</p>
</div>

<div class="ad-trouble__item">
<span class="ad-trouble__label">The password does not meet the requirement</span>
<p>This means the domain rejected the initial password. The script checks it first and asks you again, so choose at least 8 characters using three of these: lowercase, uppercase, a number, and a symbol. Any account that failed shows a red line, and it will be added the next time you run the script.</p>
</div>

<div class="ad-trouble__item">
<span class="ad-trouble__label">Running scripts is disabled on this system</span>
<p>Windows client editions block unsigned scripts by default, and some servers are locked down the same way. This command allows them for your own user account only:</p>
<div class="ad-code">
<div class="ad-code__bar">
<span class="ad-code__label">PowerShell</span>
<button type="button" class="ad-code__copy">Copy</button>
</div>
<pre><code>Set-ExecutionPolicy -Scope CurrentUser RemoteSigned</code></pre>
</div>
</div>
</div>

Notice that three of these are about how the machine is set up, not your account or what you typed. They can all show up together in the same session. When they do, fix them in this order:

1. Elevate.
2. Unblock the file.
3. Relax the execution policy.

Each of those is a one-time fix, so once a machine is sorted, you won't see them again there.

### Start Over

If you ever want a fresh start, run the cleanup script on the domain controller. Don't worry about deleting something by accident, because it asks you to confirm first.

When you confirm, the script deletes the `Departments`, `AccessLevels`, and `ServiceAccounts` OUs and everything inside them, including the challenge data. The domain itself and its built-in accounts stay untouched.

```powershell
./Remove-Environment.ps1
```

To preview what would be deleted, add `-WhatIf`, or add `-Force` to skip the confirmation. Once it's done, run `Build-Environment.ps1` again to rebuild the lab.

[Download Remove-Environment.ps1](/lab-scripts/Remove-Environment.ps1)
