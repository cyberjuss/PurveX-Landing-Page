<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>An account signed in at 2 AM with nobody at the keyboard. What kind of account is that?</p>
</div>

### Service Accounts

A **service account** gives an identity to a scheduled task or automated process, not a person. That's how an account logs on at 2 AM with nobody at a keyboard. Set one up like this:

* **Dedicated OU.** Keep them apart from people. The Range download creates `OU=ServiceAccounts` for this.
* **Naming convention.** A prefix such as `svc-`, so `svc-backup-job` is unmistakable.
* **Password never expires.** A service can't type a new password. Set `PasswordNeverExpires = $true` and `ChangePasswordAtLogon = $false`, with a long random password IT rotates on a schedule. A group Managed Service Account rotates automatically.
* **Restricted logon hours.** An overnight job gets overnight **Logon Hours**. A logon outside them is a red flag.
* **A filled-in Description.** "Runs the nightly backup job on IT-WKS01" tells the next person what breaks if it's disabled.

### Onboarding by Mirroring Group Membership

To onboard someone into an existing role, copy a peer's groups. For a second Help Desk Technician, open Priya's **Member Of** tab and add the same groups to the new hire, with both windows side by side.

Mirroring also copies any access the peer shouldn't have, so check the peer against The Environment tab first. The same comparison helps in investigations: an account with more groups than its peers and no record to explain them is worth asking about.
