<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>The friendly fields look fine. Where do you read the time and the last logon?</p>
</div>

### Advanced Features and the Attribute Editor

By default, Active Directory Users and Computers hides a lot. Go to **View → Advanced Features** to turn on the extra tabs.

The most useful new tab is **Attribute Editor**. It shows every raw attribute on an object, not just the friendly summary fields. These are the attributes that matter most in an investigation:

- `whenCreated`
- `lastLogon`
- `pwdLastSet`
- `memberOf`

With them, a hunch becomes a time, a group list, or a last logon. Do not guess from the display name when the Attribute Editor can show you the time.

Filter the Attribute Editor to **Show only attributes that have values** so you are not scrolling past blank fields.

### Managing Computer Objects

You manage computers the same way as users, through their own **Properties** dialog. IT-WKS01 is a good one to practice on.

Check **Member Of** to see which security groups the computer belongs to. A common example is a group that grants automatic Wi-Fi or VPN access.

Then check the Attribute Editor for the last logon time. It shows whether a machine is active or dormant, which matters once you are investigating.

Read a computer in the same order as a person: where IT-WKS01 lives, then its groups, then its last logon.
