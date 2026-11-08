<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>An account signed in at 2 AM with nobody at the keyboard. What kind of account is that?</p>
</div>

### Service Accounts

You met service accounts briefly on the Accounts tab. A **service account** gives an identity to a scheduled task or an automated process rather than a person. That's how an account can log on every night at 2 AM with nobody at a keyboard. Because they work so differently from people, set them up like this:

* **Dedicated OU.** Keep service accounts apart from real people, so you can apply different policy and spot them at a glance. The Range download creates `OU=ServiceAccounts` for this.
* **Naming convention.** Use a prefix such as `svc-`, so that `svc-backup-job` is unmistakably a service and `j.smith` is not.
* **Password never expires.** A service can't type a new password when the old one expires, so set `PasswordNeverExpires = $true` and `ChangePasswordAtLogon = $false` on purpose. Since that's the opposite of a person's settings, pair it with a long, random password that IT rotates on a schedule. Better still, use a group Managed Service Account, whose password Windows rotates automatically.
* **Restricted logon hours.** If a backup job only runs overnight, its **Logon Hours** should say so, which makes a logon outside that window a red flag.
* **A filled-in Description.** A line such as "Runs the nightly backup job on IT-WKS01" tells the next person what breaks if this account is disabled.

### Onboarding by Mirroring Group Membership

Group membership also gives you a quick way to set up new staff, because the fastest way to onboard someone into an existing role is to copy a peer's groups. If PurveX hires a second Help Desk Technician, for example, you'd open Priya's **Member Of** tab, note every group, and add the same ones to the new hire. Keep both windows side by side so you don't miss one.

One caution, though: mirroring also copies any access the peer shouldn't have, so check the peer's groups against The Environment tab before you copy anything. That same side-by-side comparison helps during an investigation, too, since an account with more groups than its peers and no record to explain them is worth asking about.

```sort
prompt: You're reviewing svc-backup-job and two other service accounts. Good practice, or a red flag?
level: 3
Good practice: It lives in OU=ServiceAccounts | Its Description names the job and its run window | Its Logon Hours match the backup window
Red flag: A service account is a member of IT Users | A service account can sign in to any workstation's desktop | A service account is named j.smith, like a person
```
