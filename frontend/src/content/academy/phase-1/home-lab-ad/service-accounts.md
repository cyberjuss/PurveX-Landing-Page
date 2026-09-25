<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>An account signed in at 2 AM with nobody at the keyboard. What kind of account is that?</p>
</div>

### Service Accounts

A **service account** gives an identity to a service rather than a person:

- A scheduled task
- An automated process

That is why an account can log on every night at 2 AM with nobody at a keyboard.

Best practice every time:

* **Dedicated OU.** Keep service accounts out of the same OU as real people. You can apply different policy and spot them at a glance. PurveXFinancial does not have one yet. Creating `OU=ServiceAccounts` under the domain root is itself good practice.
* **Naming convention.** Prefix it so it is unmistakable. `svc-` or a leading `$`. `svc-backup-job` is a service account. `j.smith` is not.
* **Password never expires. Do not force a change.** A service account cannot type in a new password when the old one expires. `PasswordNeverExpires = $true` and `ChangePasswordAtLogon = $false` are intentional here. The opposite of what you set for a person.
* **Restrict logon hours if the job is scheduled.** If a backup job only needs to run overnight the account's **Logon Hours** should reflect that. Anything outside that window is a red flag.
* **Always fill in the Description.** "Runs the nightly backup job on IT-WKS01" saves the next person from guessing what breaks if this account gets disabled.

If you open an account and the name, the OU, and the Description do not all say service treat it like a person until you prove otherwise.

### Onboarding by Mirroring Group Membership

The fastest way to onboard someone into an existing role is to copy a peer's group membership. Say PurveXFinancial hires a second Help Desk Technician alongside Priya Nair. Open Priya's **Member Of** tab. Note every group listed. Then open the new hire's **Member Of** tab and add the same ones. Keep both Properties windows open side by side so you do not miss one.

Check this during an investigation too. An account with more group memberships than its peers and no onboarding record to explain why is worth asking about. Compare against The Environment tab. Not against the ticket.
