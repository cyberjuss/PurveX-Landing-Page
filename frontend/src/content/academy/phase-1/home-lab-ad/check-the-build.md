<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>The script finished. How do you know the directory matches the firm, and what do you do when it does not?</p>
</div>

### Check what got built

A script finishing isn't proof the lab is right. Confirm:

- All 5 departments exist
- All 9 users sit in the right department with the right title
- `alex.rivera` is in both `IT Users` and `IT Admins`

`old.intern`, `kai.mendes` and `noah.kim` are Ticket Queue objects. Leave them until you reach those tickets.

```powershell
Get-ADOrganizationalUnit -Filter * | Sort-Object DistinguishedName

Get-ADUser -Filter * -SearchBase "OU=Departments,$((Get-ADDomain).DistinguishedName)" -Properties Title, Department |
    Select-Object Name, SamAccountName, Title, Department

Get-ADGroupMember -Identity "IT Admins"
```

### If the Script Will Not Run

A few errors cover almost every case:

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
<p>You ran a copy without your account key. Sign in and click <strong>Download Build-Environment.ps1</strong> on the Build the Environment tab (don't right-click and save), then run the new file. It only adds what's missing.</p>
</div>

<div class="ad-trouble__item">
<span class="ad-trouble__label">The password does not meet the requirement</span>
<p>Use at least 8 characters with three of: lowercase, uppercase, a number, a symbol. Failed accounts are added on the next run.</p>
</div>

<div class="ad-trouble__item">
<span class="ad-trouble__label">Running scripts is disabled on this system</span>
<p>Allow scripts for your own account:</p>
<div class="ad-code">
<div class="ad-code__bar">
<span class="ad-code__label">PowerShell</span>
<button type="button" class="ad-code__copy">Copy</button>
</div>
<pre><code>Set-ExecutionPolicy -Scope CurrentUser RemoteSigned</code></pre>
</div>
</div>
</div>

If several appear together, fix them in this order:

1. Elevate.
2. Unblock the file.
3. Relax the execution policy.

### Start Over

The cleanup script deletes the `Departments`, `AccessLevels` and `ServiceAccounts` OUs and everything in them, after asking you to confirm. The domain and built-in accounts stay.

```powershell
./Remove-Environment.ps1
```

`-WhatIf` previews it. `-Force` skips the confirmation. Then run `Build-Environment.ps1` to rebuild.

[Download Remove-Environment.ps1](/lab-scripts/Remove-Environment.ps1)
