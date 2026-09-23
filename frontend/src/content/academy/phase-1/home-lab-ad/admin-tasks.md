<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>If GovTechFinancial's domain already exists and the accounts are already built, what does an IT admin actually spend their day doing in it?</p>
</div>

### What IT Actually Does Here, Day to Day

Almost nobody builds a domain from scratch. In a real IT job, Active Directory is already standing, with the OUs and accounts in place. The day is filled with a short list of tasks that repeat constantly. You find an account, reset a password, move someone between departments, or set up a service account. This tab walks through each one using GovTechFinancial's own accounts, so by the end you will have done every task, not just read about it.

### Finding Users and Computers

The fastest way to locate an account is the **Find** dialog, not scrolling through OUs. Right-click the domain or any OU in Active Directory Users and Computers and choose **Find**. Then pick what you are looking for from the dropdown. Use Users, Contacts, and Groups for a person, or Computers for a machine.

You can search by first name, last name, or username. Try it with `jordan.ellis`, the Staff Accountant in Finance and Accounting. The account turns up in seconds no matter which OU you started from. You will use this tool constantly, so get comfortable with it first.

### Resetting and Unlocking a Password

These are two different problems that get confused constantly.

* **Account locked.** The user remembers their password but mistyped it too many times, and AD locked the account as a precaution. Open **Properties → Account**, check **Unlock account**, and click Apply. The password doesn't change.
* **Password forgotten.** The user genuinely doesn't know it anymore. Right-click the account and choose **Reset Password**. Set a new temporary password and check **User must change password at next logon**. If the account is also locked, check **Unlock the user's account** in the same dialog.

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

Say Riley Kwan, an Operations Analyst, calls in locked out after three failed logon attempts. If she remembers her password, unlock the account. If she has forgotten it, reset it and force a change at next logon. A temporary password is never meant to be a long-term credential.

### Editing a User's Profile

Most day-to-day edits happen on the account's **Properties** dialog. Examples include a new **Description** after a role change, a new phone number, or a new title after a promotion. These changes are small, but they keep an account's profile trustworthy as a source of truth.

Adding someone to a distribution or security group works the same way. Open **Properties → Member Of**, click **Add**, type the group name, and confirm. Say a new hire in Wealth Management, Jamie Torres, needs firm-wide announcements. Add her to the all-employees distribution list the same way you would add anyone to `Wealth Management Users`.

### Moving a User to a Different OU

When someone transfers, their account has to move with them, because department policies depend on OU membership. Right-click the account, choose **Move**, and select the destination OU.

Picture Taylor Osei transferring from Operations into Compliance. Find the account, choose **Move**, and select `OU=Users,OU=Compliance,OU=Departments`. Then open that OU and confirm Taylor shows up there. A transfer that updates the job title but never moves the AD object is a common mistake. It leaves the old department's policies in effect without anyone noticing.

### Advanced Features and the Attribute Editor

By default, Active Directory Users and Computers hides a lot. Go to **View → Advanced Features** to turn on the extra tabs, most usefully the **Attribute Editor**, which exposes every raw attribute on an object instead of just the friendly summary fields.

This matters for investigation. Attributes like `whenCreated`, `lastLogon`, `pwdLastSet`, and `memberOf` turn "this account looks suspicious" into "this account authenticated at 2 AM from a workstation it has never used before." Filter the Attribute Editor to **Show only attributes that have values** so you do not scroll past dozens of blank fields to find the two that matter.

### Managing Computer Objects

Computers are managed the same way users are, through their own **Properties** dialog. IT-WKS01 is a good one to practice on. Check **Member Of** to see which security groups it belongs to. A common real-world example is a group that grants automatic Wi-Fi or VPN access. Then check the Attribute Editor for last logon time. It shows whether a machine is active or dormant, which matters once you are investigating instead of administering.

### Service Accounts

A **service account** gives an identity to a service, like a scheduled task or an automated process, rather than a person. That's why an account can "log on" every night at 2 AM with nobody at a keyboard.

Best practice, every time:

* **Dedicated OU.** Keep service accounts out of the same OU as real people, so you can apply different policy and spot them at a glance. GovTechFinancial doesn't have one yet, which means creating `OU=ServiceAccounts` under the domain root is itself good practice.
* **Naming convention.** Prefix it so it's unmistakable at a glance, for example `svc-` or a leading `$`: `svc-backup-job` is instantly recognizable as a service account, while `j.smith` is not.
* **Password never expires, and don't force a change.** A service account can't type in a new password when the old one expires, so `PasswordNeverExpires = $true` and `ChangePasswordAtLogon = $false` are both intentional here, the opposite of what you'd set for a person.
* **Restrict logon hours if the job is scheduled.** If a backup job only ever needs to run overnight, the account's **Logon Hours** should reflect that. Anything outside that window becomes an instant red flag.
* **Always fill in the Description.** "Runs the nightly backup job on IT-WKS01" saves the next person, possibly you in six months, from guessing what breaks if this account gets disabled.

### Onboarding by Mirroring Group Membership

The fastest and least error-prone way to onboard someone into an existing role is to copy a peer's group membership. Say GovTechFinancial hires a second Help Desk Technician alongside Priya Nair. Open Priya's **Member Of** tab and note every group listed. Then open the new hire's **Member Of** tab and add the same ones. Keep both Properties windows open side by side so you do not miss one.

Check this during an investigation too. An account with more group memberships than its peers, and no onboarding record to explain why, is worth asking about.

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
