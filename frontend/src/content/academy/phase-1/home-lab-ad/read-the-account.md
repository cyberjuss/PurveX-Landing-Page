<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>The friendly fields look fine. Where do you read the time and the last logon?</p>
</div>

### Advanced Features and the Attribute Editor

By default, Active Directory Users and Computers hides a lot. Go to **View → Advanced Features** to turn on the extra tabs.

The most useful new tab is **Attribute Editor**. It shows every raw attribute on an object, including the ones the friendly tabs leave out. These are the attributes that matter most in an investigation:

- `whenCreated`
- `lastLogon`
- `pwdLastSet`
- `memberOf`

With them you can replace a hunch with a real time or group list. With more than one domain controller, `lastLogon` is kept per controller. `lastLogonTimestamp` is shared but can lag by up to 14 days. Do not guess from the display name when the Attribute Editor can show you the time.

Filter the Attribute Editor to **Show only attributes that have values** so you are not scrolling past blank fields.

Open the object from the tree, not from the Find dialog. An object opened from Find results does not show the Attribute Editor tab.

### Managing Computer Objects

You manage computers the same way as users, through their own **Properties** dialog. IT-WKS01 is a good one to practice on.

Check **Member Of** to see which security groups the computer belongs to. A common example is a group that grants automatic Wi-Fi or VPN access.

Then check the Attribute Editor for the last logon time. It shows whether a machine is active or dormant, which matters once you are investigating.

Read a computer in the same order as a person, starting with where IT-WKS01 lives and then its groups and last logon.
