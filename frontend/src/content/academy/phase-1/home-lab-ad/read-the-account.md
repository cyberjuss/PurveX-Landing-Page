<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>The friendly fields look fine. Where do you read the time and the last logon?</p>
</div>

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
