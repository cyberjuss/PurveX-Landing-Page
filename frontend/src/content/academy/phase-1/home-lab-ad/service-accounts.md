<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>An account signed in at 2 AM with nobody at the keyboard. What kind of account is that?</p>
</div>

### Service Accounts

A **service account** gives an identity to a service rather than a person:

- A scheduled task
- An automated process

That is how an account can log on every night at 2 AM with nobody at a keyboard.

Follow these practices every time:

* **Dedicated OU.** Keep service accounts apart from real people. You can apply different policy and spot them at a glance. The clean PurveX Financial baseline has no such OU, so create `OU=ServiceAccounts` under the domain root.
* **Naming convention.** Use a prefix that makes the account unmistakable, such as `svc-` or a leading `$`. `svc-backup-job` is a service account. `j.smith` is not.
* **Password never expires.** A service account cannot type a new password when the old one expires. Set `PasswordNeverExpires = $true` and `ChangePasswordAtLogon = $false` on purpose. That is the opposite of a person's settings.
* **Restricted logon hours.** If a backup job only runs overnight, the account's **Logon Hours** should reflect that. A logon outside that window is a red flag.
* **A filled-in Description.** "Runs the nightly backup job on IT-WKS01" tells the next person what breaks if this account is disabled.

If the name, the OU, and the Description do not all say "service," treat the account like a person until you prove otherwise.

### Onboarding by Mirroring Group Membership

The fastest way to onboard someone into an existing role is to copy a peer's group membership. Say PurveX Financial hires a second Help Desk Technician to work alongside Priya Nair.

Open Priya's **Member Of** tab and note every group. Then open the new hire's **Member Of** tab and add the same groups. Keep both Properties windows side by side so you do not miss one.

The same comparison helps during an investigation. An account with more groups than its peers, and no onboarding record to explain them, is worth asking about.

Compare against The Environment tab, not against the ticket.
