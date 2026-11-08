<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>The friendly fields look fine. Where do you read the time and the last logon?</p>
</div>

### Advanced Features and the Attribute Editor

The friendly tabs you've used so far only show part of the picture, because Active Directory Users and Computers hides a lot by default. Turn on **View → Advanced Features** to reveal the extra tabs, the most useful of which is the **Attribute Editor**. It shows every raw attribute on an object, and in an investigation, these are the ones that matter most:

- `whenCreated`
- `lastLogon`
- `pwdLastSet`
- `memberOf`

With these, you can replace a hunch with a real time or a real list of groups. One caution about those times. With more than one domain controller, `lastLogon` is kept separately on each one, while `lastLogonTimestamp` is shared between them but can lag by up to 14 days.

Source: [Microsoft Learn: Last-Logon-Timestamp attribute](https://learn.microsoft.com/en-us/windows/win32/adschema/a-lastlogontimestamp)

To save yourself some scrolling, filter the list to **Show only attributes that have values**. And one quirk to know about: open the object from the tree rather than from the Find dialog. An object opened from Find results doesn't show the Attribute Editor tab.

### Managing Computer Objects

Everything you've learned about reading users applies to computers too, and IT-WKS01 is a good one to practice on. Start with where it lives, then check **Member Of** for groups such as one that grants automatic Wi-Fi or VPN access. Finally, look up its last logon in the Attribute Editor, which tells you whether the machine is active or dormant, a distinction that matters a lot once you're investigating.

```match
prompt: An investigator has questions about an account. Which attribute answers each one?
level: 3
pwdLastSet = Did the password reset on Monday really happen?
whenCreated = Did this account appear on the same day as the incident?
memberOf = Which groups sit behind this account's access?
```
