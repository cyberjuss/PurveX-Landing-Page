<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>If GovTechFinancial's domain already exists and the accounts are already built, what does an IT admin actually spend their day doing in it?</p>
</div>

### What IT Actually Does Here, Day to Day

Almost nobody builds a domain from scratch. Walk into a real IT job and Active Directory is already standing, the OUs already exist, the accounts are already there. What fills the day instead is a short list of tasks that repeat constantly: finding an account, resetting a password, moving someone between departments, standing up a service account correctly. This tab walks through each one, using GovTechFinancial's own accounts so it is muscle memory before you ever touch a real environment.

### Finding Users and Computers

The fastest way to locate an account isn't scrolling through OUs, it's the **Find** dialog. Right-click the domain (or any OU) in Active Directory Users and Computers, choose **Find**, and pick what you're looking for from the dropdown: Users, Contacts, and Groups for a person, or Computers for a machine.

You can search by first name, last name, or username. Try it with `jordan.ellis`, GovTechFinancial's Staff Accountant in Finance and Accounting, and it should turn up in seconds regardless of which OU you started the search from. This is the tool you'll reach for constantly, so it's worth getting comfortable with before anything else on this page.

### Resetting and Unlocking a Password

These are two different problems that get confused constantly.

* **Account locked** — the user remembers their password but mistyped it too many times, and AD locked the account as a precaution. Open the account's **Properties → Account** tab, check **Unlock account**, and click Apply. Nothing about the password changes.
* **Password forgotten** — the user genuinely doesn't know it anymore. Right-click the account and choose **Reset Password**. Set a new temporary one, check **User must change password at next logon**, and (if the account also happens to be locked) check **Unlock the user's account** in the same dialog.

<div class="ad-decision">
<div class="ad-decision__q">User calls in locked out.<br>Does she remember her password?</div>
<div class="ad-decision__branches">
<div class="ad-decision__branch ad-decision__branch--yes">
<span class="ad-decision__label">Yes</span>
<div class="ad-decision__box">
<strong>Unlock</strong>
<span>Properties → Account tab<br>Check <em>Unlock account</em></span>
</div>
</div>
<div class="ad-decision__branch ad-decision__branch--no">
<span class="ad-decision__label">No</span>
<div class="ad-decision__box ad-decision__box--accent">
<strong>Reset</strong>
<span>Right-click → Reset Password<br>Force change at next logon</span>
</div>
</div>
</div>
</div>

Say Riley Kwan, an Operations Analyst, calls in locked out after three failed logon attempts. First question to ask: does she remember her password? If yes, it's an unlock. If she genuinely forgot it, it's a reset, and it should always force a change at next logon, since a temporary password you set is never meant to be a long-term credential.

### Editing a User's Profile

Most day-to-day edits happen on the account's **Properties** dialog: updating a **Description** after a role change, a new phone number, a new title after a promotion. Small, but this is why an account's profile can be trusted as a source of truth, if it's kept current.

Adding someone to a distribution or security group works the same way: open **Properties → Member Of**, click **Add**, type the group name (or just the first few letters if you're not sure), and confirm. Say a new hire in Wealth Management, Jamie Torres, needs to start receiving firm-wide announcements. Add her to whatever GovTechFinancial's all-employees distribution list would be, the same way you'd add anyone to `Wealth Management Users`.

### Moving a User to a Different OU

When someone transfers, their account needs to move with them, since OU membership is what different department policies key off of. Right-click the account, choose **Move**, and select the destination OU.

Picture Taylor Osei transferring from Operations into Compliance. The move is: find the account, **Move**, select `OU=Users,OU=Compliance,OU=Departments`. Afterward, verify it by going straight to that OU and confirming Taylor now shows up there. A transfer that only updates a job title but never actually moves the AD object is a common, easy-to-miss mistake, and it means the old department's policies are still silently in effect.

### Advanced Features and the Attribute Editor

By default, Active Directory Users and Computers hides a lot. Go to **View → Advanced Features** to turn on the extra tabs, most usefully the **Attribute Editor**, which exposes every raw attribute on an object instead of just the friendly summary fields.

This matters for investigation specifically. Attributes like `whenCreated`, `lastLogon`, `pwdLastSet`, and `memberOf` are exactly the kind of detail that turns "this account looks suspicious" into "this account authenticated at 2 AM from a workstation it's never used before." A quick tip once Advanced Features is on: in the Attribute Editor, filter to **Show only attributes that have values**, so you're not scrolling past dozens of blank fields to find the two that actually matter.

### Managing Computer Objects

Computers get managed the same way users do, through their own **Properties** dialog. GovTechFinancial's IT-WKS01 is a good one to practice on: check **Member Of** to see what security groups it belongs to (a common real-world example is a group that grants automatic Wi-Fi or VPN access to anything that's a member), and check the Attribute Editor for things like last logon time, which tells you whether a machine is actually in active use or sitting dormant, a detail that matters a lot once you're investigating rather than administering.

### Service Accounts

A **service account** is a special account that gives an identity to a service, a scheduled task, an automated process, rather than a person. It's why an account can be actively "logging on" every night at 2 AM with nobody actually sitting at a keyboard.

Best practice, every time:

* **Dedicated OU.** Keep service accounts out of the same OU as real people, so you can apply different policy and spot them at a glance. GovTechFinancial doesn't have one yet, which means creating `OU=ServiceAccounts` under the domain root is itself good practice.
* **Naming convention.** Prefix it so it's unmistakable at a glance, for example `svc-` or a leading `$`. `svc-backup-job` is instantly recognizable as a service account; `j.smith` is not.
* **Password never expires, and don't force a change.** A service account can't type in a new password when it expires, so `PasswordNeverExpires = $true` and `ChangePasswordAtLogon = $false` are both intentional here, the opposite of what you'd set for a person.
* **Restrict logon hours if the job is scheduled.** If a backup job only ever needs to run overnight, the account's **Logon Hours** should reflect that. Anything outside that window becomes an instant red flag.
* **Always fill in the Description.** "Runs the nightly backup job on IT-WKS01" saves the next person (possibly you, in six months) from having to guess what breaks if this account gets disabled.

### Onboarding: Mirroring Group Membership

The fastest, least error-prone way to onboard someone into a role that already exists is to copy a peer's group membership rather than rebuilding it by hand. Say GovTechFinancial hires a second Help Desk Technician alongside Priya Nair. Open Priya's **Member Of** tab, note every group listed there, then open the new hire's **Member Of** tab and add the same ones. Doing this side by side, both accounts' Properties open at once, makes it much harder to miss one.

This is also exactly the kind of thing worth double-checking during an investigation: an account with more group memberships than its peers in the same role, with no onboarding record explaining why, is worth asking about.

<div class="academy-analogy">
<span class="academy-analogy__tag">Think of it like running a building's front desk</span>
<ul>
<li><strong>Finding an account</strong> is checking the directory board for a name.</li>
<li><strong>Reset vs. unlock</strong> is the difference between issuing someone a new keycard and just buzzing them back in.</li>
<li><strong>Moving a user's OU</strong> is updating which floor their badge grants access to after they change teams.</li>
<li><strong>A service account</strong> is the badge given to the cleaning crew's cart, not a person, scheduled for a specific window, and clearly labeled so security doesn't mistake it for an intruder.</li>
</ul>
</div>

None of this is complicated on its own. What makes it a skill is doing it correctly and consistently, every single time, because the accounts and groups you create today are exactly what you (or the next analyst) will be staring at during an investigation months from now.

<style>
.ad-decision { margin: 1.25rem 0; }
.ad-decision__q {
  max-width: 340px; margin: 0 auto 1.25rem; padding: 0.85rem 1.1rem; text-align: center;
  border: 1px solid var(--pvrx-border-light); border-radius: 10px; background: #fff;
  font-size: 0.9rem; font-weight: 650; color: var(--pvrx-text-primary-light);
  opacity: 0; animation: ad-decision-in 0.5s ease-out both;
}
.ad-decision__branches { display: flex; justify-content: center; gap: 2.5rem; flex-wrap: wrap; }
.ad-decision__branch { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; opacity: 0; animation: ad-decision-in 0.5s ease-out both; }
.ad-decision__branch--yes { animation-delay: 0.15s; }
.ad-decision__branch--no { animation-delay: 0.3s; }
.ad-decision__label {
  font-family: var(--font-mono, ui-monospace, monospace); font-size: 0.7rem; font-weight: 700;
  letter-spacing: 0.06em; text-transform: uppercase; color: var(--pvrx-text-secondary-light);
}
.ad-decision__box {
  display: flex; flex-direction: column; align-items: center; gap: 0.3rem; min-width: 190px;
  padding: 0.9rem 1.1rem; border-radius: 10px; text-align: center;
  border: 1.5px solid var(--pvrx-border-light); background: var(--pvrx-surface-alt-light);
}
.ad-decision__box strong { font-family: var(--font-display); font-size: 0.95rem; }
.ad-decision__box span { font-size: 0.8rem; color: var(--pvrx-text-secondary-light); line-height: 1.5; }
.ad-decision__box--accent { border-color: rgba(85,70,224,0.35); background: rgba(85,70,224,0.06); }
.ad-decision__box--accent strong { color: #5546e0; }
@keyframes ad-decision-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) {
  .ad-decision__q, .ad-decision__branch { animation: none; opacity: 1; }
}
</style>
