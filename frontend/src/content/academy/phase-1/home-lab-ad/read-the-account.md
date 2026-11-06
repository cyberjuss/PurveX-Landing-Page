<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>The friendly fields look fine. Where do you read the time and the last logon?</p>
</div>

### Advanced Features and the Attribute Editor

Turn on **View → Advanced Features** to see the hidden tabs. The **Attribute Editor** shows every raw attribute. The ones that matter most in an investigation:

- `whenCreated`
- `lastLogon`
- `pwdLastSet`
- `memberOf`

These replace a hunch with a real time or list. With more than one domain controller, `lastLogon` is kept per DC, while `lastLogonTimestamp` is shared but can lag up to 14 days.

Source: [Microsoft Learn: Last-Logon-Timestamp attribute](https://learn.microsoft.com/en-us/windows/win32/adschema/a-lastlogontimestamp)

Filter to **Show only attributes that have values**. Open the object from the tree, not Find, or the Attribute Editor tab won't appear.

### Managing Computer Objects

Read a computer the same way. On IT-WKS01, check where it lives, its **Member Of** (for example, a group granting Wi-Fi or VPN access), then its last logon in the Attribute Editor to see if it's active or dormant.
