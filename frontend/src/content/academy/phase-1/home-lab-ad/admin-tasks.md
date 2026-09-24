<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>If PurveXFinancial's domain already exists and the accounts are already built, what does an IT admin actually spend their day doing in it?</p>
</div>

### What IT Actually Does Here, Day to Day

Almost nobody builds a domain from scratch. In a real IT job Active Directory is already standing with the OUs and accounts in place. The day is a short list of tasks that repeat:

- Find an account
- Reset a password
- Move someone between departments
- Set up a service account

This tab walks through each one using PurveX Financial's own accounts. Do the task then confirm the directory shows what you think it shows because the click is not the finish. The check is.

### Finding Users and Computers

The fastest way to locate an account is the **Find** dialog rather than scrolling through OUs. Right-click the domain or any OU in Active Directory Users and Computers and choose **Find**. Then pick what you are looking for from the dropdown:

- Users, Contacts, and Groups for a person
- Computers for a machine

Search by:

- first name
- last name
- username

Try it with `jordan.ellis`, the Staff Accountant in Finance and Accounting. The account turns up in seconds no matter which OU you started from so get comfortable with it first because you will use this tool constantly.

Open the account after you find it:

- Read the folder
- Read Member Of

Finding the object is only the start.

### Resetting and Unlocking a Password

These are two different problems that get confused constantly.

* **Account locked.** The user remembers their password but mistyped it too many times so AD locked the account as a precaution. Open **Properties → Account**, check **Unlock account**, and click Apply. The password does not change.
* **Password forgotten.** The user does not know it anymore. Right-click the account and choose **Reset Password**, set a new temporary password, and check **User must change password at next logon**. If the account is also locked check **Unlock the user's account** in the same dialog.

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

Say Riley Kwan in Operations calls in locked out after three failed logon attempts. If she remembers her password unlock the account. If she has forgotten it reset it and force a change at next logon. A temporary password is never a long-term credential.

Do not treat "locked out" as the same job as "forgot my password." Check the Account tab before you change anything. Then open it again and confirm the box you meant to clear is actually cleared.

### Editing a User's Profile

Most day-to-day edits happen on the account's **Properties** dialog:

- A new **Description** after a role change
- A new phone number
- A new title after a promotion

These are small changes that keep the profile trustworthy.

Adding someone to a group works the same way:

- Open **Properties → Member Of**
- Click **Add**
- Type the group name
- Confirm

Say Jamie Torres in Wealth Management needs firm-wide announcements. Add her to the all-employees list the same way you would add anyone to `Wealth Management Users`.

Read Member Of after you click OK. If Jamie is not on the list, the ticket is not done.

### Moving a User to a Different OU

When someone transfers their account has to move with them because department policies depend on OU membership:

- Right-click the account
- Choose **Move**
- Select the destination OU

Picture Taylor Osei transferring from Operations into Compliance. Find the account, choose **Move**, and select `OU=Users,OU=Compliance,OU=Departments`. Then open that OU and confirm Taylor shows up there.

A transfer that updates the job title but never moves the AD object is a common mistake because the old department's policies stay in effect. An HR notice is not a move. The folder is the move so confirm the folders above the account before you close it.

### Advanced Features and the Attribute Editor

By default Active Directory Users and Computers hides a lot. Go to **View → Advanced Features** to turn on the extra tabs. The useful one is **Attribute Editor** because it shows every raw attribute on an object not just the friendly summary fields.

This matters for investigation:

- `whenCreated`
- `lastLogon`
- `pwdLastSet`
- `memberOf`

A hunch becomes a time, a group list, or a last logon. Filter the Attribute Editor to **Show only attributes that have values** so you are not scrolling past blank fields.

Do not guess from the display name when the Attribute Editor can show you the time.

### Managing Computer Objects

Computers are managed the same way users are through their own **Properties** dialog. IT-WKS01 is a good one to practice on. Check **Member Of** to see which security groups it belongs to. A common example is a group that grants automatic Wi-Fi or VPN access. Then check the Attribute Editor for last logon time because it shows whether a machine is active or dormant and that matters once you are investigating.

Know where IT-WKS01 lives first then read the groups then read last logon. Same order as a person.

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
