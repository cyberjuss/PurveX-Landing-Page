<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>The friendly fields look fine. Where do you read the time and the last logon?</p>
</div>

### Advanced Features and the Attribute Editor

The friendly tabs you've used so far only show part of the picture, because by default Active Directory Users and Computers hides a lot. To see more, go to **View → Advanced Features** and turn on the extra tabs.

The most useful of those new tabs is the **Attribute Editor**, which shows every raw attribute on an object, including the ones the friendly tabs leave out. In an investigation, these are the attributes that matter most:

- `whenCreated`
- `lastLogon`
- `pwdLastSet`
- `memberOf`

With these, you can replace a hunch with a real time or a real list of groups. There's one caution about those times, though. When there's more than one domain controller, `lastLogon` is kept separately on each one, while `lastLogonTimestamp` is shared between them but can lag by up to 14 days. Either way, don't guess from the display name when the Attribute Editor can show you the actual time.

Source: [Microsoft Learn: Last-Logon-Timestamp attribute](https://learn.microsoft.com/en-us/windows/win32/adschema/a-lastlogontimestamp)

To save yourself some scrolling, filter the Attribute Editor to **Show only attributes that have values**, so you aren't wading through blank fields.

One quirk to know about: open the object from the tree rather than from the Find dialog, because an object opened from the Find results doesn't show the Attribute Editor tab.

### Managing Computer Objects

Everything you've learned about reading users applies to computers too, since you manage them through their own **Properties** dialog in the same way. IT-WKS01 is a good one to practice on.

Start by checking **Member Of** to see which security groups the computer belongs to. A common example would be a group that grants automatic Wi-Fi or VPN access.

Then check the Attribute Editor for the last logon time, which shows whether a machine is active or dormant. That distinction will matter a lot once you're investigating.

In short, read a computer in the same order as a person: start with where IT-WKS01 lives, then move on to its groups and its last logon.
