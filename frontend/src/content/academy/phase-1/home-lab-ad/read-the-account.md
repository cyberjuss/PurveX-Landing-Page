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

With these, you can replace a hunch with a real time or a real list of groups. One caution about those times, once there is more than one domain controller:

<ul>
<li><code>lastLogon</code> is kept separately on each domain controller</li>
<li><code>lastLogonTimestamp</code> is shared between them, but can lag by up to 14 days</li>
</ul>

Source: [Microsoft Learn: Last-Logon-Timestamp attribute](https://learn.microsoft.com/en-us/windows/win32/adschema/a-lastlogontimestamp)

Two tips for the Attribute Editor:

<ul>
<li>Filter the list to <strong>Show only attributes that have values</strong> to save scrolling</li>
<li>Open the object from the tree, not from the Find dialog. An object opened from Find results doesn't show the Attribute Editor tab</li>
</ul>

### Managing Computer Objects

Everything you've learned about reading users applies to computers too, and IT-WKS01 is a good one to practice on:

<ul>
<li>Start with where it lives</li>
<li>Check <strong>Member Of</strong> for groups, such as one that grants automatic Wi-Fi or VPN access</li>
<li>Look up its last logon in the Attribute Editor, which tells you whether the machine is active or dormant</li>
</ul>

```match
prompt: An investigator has questions about an account. Which attribute answers each one?
level: 3
pwdLastSet = Did the password reset on Monday really happen?
whenCreated = Did this account appear on the same day as the incident?
memberOf = Which groups sit behind this account's access?
```
