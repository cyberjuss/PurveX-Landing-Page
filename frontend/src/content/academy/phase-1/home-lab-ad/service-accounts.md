<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>An account signed in at 2 AM with nobody at the keyboard. What kind of account is that?</p>
</div>

### Service Accounts

You met service accounts briefly on the Accounts tab. A **service account** gives an identity to a service rather than a person, such as:

- A scheduled task
- An automated process

That's how an account can log on every night at 2 AM with nobody at a keyboard, which answers this tab's question.

Because service accounts work so differently from people, follow these practices every time you set one up:

* **Dedicated OU.** Keep service accounts apart from real people. You can apply different policy and spot them at a glance. The Range download creates `OU=ServiceAccounts` under the domain root for this.
* **Naming convention.** Use a prefix that makes the account unmistakable, such as `svc-`. `svc-backup-job` is a service account. `j.smith` is not.
* **Password never expires.** A service account cannot type a new password when the old one expires. Set `PasswordNeverExpires = $true` and `ChangePasswordAtLogon = $false` on purpose. That is the opposite of a person's settings, so pair it with a long, random password that IT rotates on a schedule. A group Managed Service Account goes further, because Windows rotates its password automatically.
* **Restricted logon hours.** If a backup job only runs overnight, the account's **Logon Hours** should reflect that. A logon outside that window is a red flag.
* **A filled-in Description.** "Runs the nightly backup job on IT-WKS01" tells the next person what breaks if this account is disabled.

Until its name, OU and Description all show it's a service, treat the account like a person.

### Onboarding by Mirroring Group Membership

Group membership also gives you a quick way to set up new staff. The fastest way to onboard someone into an existing role is to copy a peer's group membership. Say, for example, that PurveX Financial hires a second Help Desk Technician to work alongside Priya Nair.

To set them up, open Priya's **Member Of** tab and note every group, then open the new hire's **Member Of** tab and add the same groups. It helps to keep both Properties windows side by side, so you don't miss one.

That same side-by-side comparison helps during an investigation, too. An account with more groups than its peers, and no onboarding record to explain them, is worth asking about.

One caution, though: mirroring also copies any access the peer shouldn't have. So before you copy anything, check the peer's groups against The Environment tab rather than against the ticket.
