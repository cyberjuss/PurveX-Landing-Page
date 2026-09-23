<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>A user says they can't log in right after changing their password. Is that one problem, or could it be four different problems wearing the same symptom?</p>
</div>

### The Ticket

> **Submitted by:** Sam Whitfield, Senior Financial Advisor, Wealth Management
> **Subject:** Can't log into my computer
>
> "IT made me change my password yesterday. I typed in the new one today and it says it's wrong. Now it says my account is locked. I need to get into a client meeting in 20 minutes."

Before you read any further, sit with this for a second. Do not decide what's wrong yet. You don't have enough information to know, and neither does Sam.

### Questions to Ask First

A locked-out account after a password change could be several different problems that all produce the same words on screen. Before touching anything, you'd want to know:

* Is Sam typing the password they think they set, or could there be a typo they're not aware of? (Caps Lock, autocorrect on a phone keyboard, a character they're unsure how to type)
* Did Sam actually finish setting the new password, or did the change get interrupted partway through?
* Is this happening on Sam's desktop only, or also on a phone, tablet, or VPN client?
* Does Sam have anything else that stores this password and logs in automatically, a mapped network drive, Outlook mobile, a saved RDP connection, that might still be trying the *old* password over and over without Sam realizing it?
* When exactly did the account lock, relative to when Sam says they typed the new password?
* Is anyone else on the team having the same problem today?

Notice none of these are "check permissions" or "just reset it." A reset might not even be the right move yet, resetting a password that's already correct doesn't fix anything, and resetting it again if something else is silently hammering the account with the old password just locks it out again a few minutes later.

### What You'd Actually Check

<details>
<summary>Think through it yourself first, then expand this to see the investigation path.</summary>

**1. Confirm the account is actually locked, not just the wrong password.**
In Active Directory Users and Computers, open Sam's account properties and check the Account tab, or from a domain machine run:

<div class="ad-code">
<div class="ad-code__bar">
<span class="ad-code__label">PowerShell</span>
<button type="button" class="ad-code__copy" onclick="const code=this.closest('.ad-code').querySelector('code').innerText; navigator.clipboard.writeText(code); const b=this; b.textContent='Copied'; setTimeout(()=>{b.textContent='Copy';},1500);">Copy</button>
</div>
<pre><code>Get-ADUser sam.whitfield -Properties LockedOut, BadLogonCount, PasswordLastSet</code></pre>
</div>

This tells you three things at once: whether the account is actually locked, how many bad attempts got logged, and exactly when the password was last changed, which confirms Sam's new password really did save.

**2. Check the Security event log for the real story.**
Event ID **4625** (failed logon) on the domain controller shows every bad attempt, including the source: which machine or IP it came from. Event ID **4740** (account locked out) shows the moment it tripped the lockout policy, and which computer triggered it, called the "Caller Computer Name" field. If the failed attempts are coming from Sam's desktop only, that's one story. If they're coming from a machine Sam has never used, or continuing *after* Sam stopped trying, that's a very different one.

**3. Rule out a device silently retrying the old password.**
This is the most common real-world cause and the easiest to miss. Ask Sam directly: any mapped drives, a phone mail app, a saved Wi-Fi credential, a scheduled task running as their account? Any one of these can retry the old password every few minutes, relock the account right after you unlock it, and make it look like the reset "didn't work" when the real problem was never the account itself.

**4. Only now, unlock or reset.**
If Sam simply mistyped it: unlock the account (Properties → Account → Unlock account), no reset needed, password is fine. If Sam genuinely doesn't remember what they set: reset it, force a change at next logon, and confirm verbally that the new one is typed correctly before ending the call. Either way, walk Sam through every device that might still hold the old password, or you'll get the same ticket again in ten minutes.

</details>

### Likely Causes, Ranked by How Often They're the Real Answer

1. A device or saved credential (mapped drive, phone, VPN client) is silently retrying the old password and relocking the account.
2. A simple typo, often Caps Lock or a keyboard layout issue, not a forgotten password at all.
3. The password change didn't fully complete or hasn't replicated to the domain controller Sam's machine is authenticating against yet.
4. Someone else is actually attempting to log in as Sam. Rare, but it's exactly why you check the event log's source computer before assuming it's harmless.

### Resolution and Verification

Whatever the cause, resolution isn't done until Sam successfully logs in and confirms it from their own machine, not from your test. If the cause was a stale saved credential, the ticket isn't closed until that device is updated too, otherwise the account locks again shortly after you close it.

### Documentation

> User: Sam Whitfield (Wealth Management). Reported: locked out after yesterday's mandatory password change, ~9:15 AM.
>
> Checked: `Get-ADUser` showed account locked, BadLogonCount 6, PasswordLastSet confirmed yesterday 4:32 PM (change did complete). Security log (4625) showed repeated failures from Sam's desktop AND from Sam's iPhone Mail profile, still configured with the old password.
>
> Root cause: iPhone Mail app retrying old password automatically, relocking account roughly every 15 minutes.
>
> Action: Unlocked account (no reset needed, new password was correct). Updated Mail profile on Sam's phone with new password. Confirmed login on desktop and phone both successful at 9:47 AM.

### Security Considerations

A handful of failed logons right after a password change, from the user's own machine, is routine. The same event pattern from a machine or location the user has never used is not, and it's exactly what a SOC analyst correlates when reviewing authentication logs: source, timing, and whether the failures stopped the moment the legitimate user succeeded, or kept going after. A Help Desk ticket that never records the source of the failed attempts gives that later investigation nothing to work with.

<div class="academy-thinklike">
<span class="academy-thinklike__tag">Think Like an Analyst</span>
<p>This exact scenario, repeated failed logons followed by a lockout, is also the signature of a password-spray or brute-force attempt against a real account. The only thing that tells them apart at a glance is the source of the failed attempts. That's why Step 2 above never skips straight to unlocking the account: an analyst reviewing this account's history later needs to see that the source was checked, not assumed.</p>
</div>
