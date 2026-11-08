<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>A password setting is not applying. Where do you look before you blame the policy?</p>
</div>

### Group Policy Objects (GPOs)

A **GPO**, or Group Policy Object, is a bundle of settings that the domain applies to everything inside whatever the GPO is linked to. Common settings include:

- Password policy
- Screen-lock timeout
- Software restrictions

A GPO can only link to a **Site**, a **Domain** or an **OU**, never to a Container or directly to a group. That's the reason every account in this lab sits in an OU. For example, a GPO linked to `OU=IT` could set a shorter screen-lock timeout for IT staff while leaving every other department untouched.

Password policy is the one exception. For domain accounts, it only takes effect from a GPO linked at the domain itself, so if one group needs stricter rules, you'd use a fine-grained password policy instead. Groups still play a part elsewhere, though, because security filtering lets a group narrow down who inside an OU the GPO applies to.

So if a setting isn't applying, ask where the object lives before you blame the GPO. An account in a Container still gets policy linked at the domain, but it never gets anything linked to an OU.

### Putting It Together

You've now met every kind of object in this lab, and each one answers a different question:

| Object | Answers | Can hold a GPO link? | Can nest? |
| ----- | ----- | ----- | ----- |
| Organizational Unit | Where does this account live? | Yes | Yes |
| User account | Who is this person? | n/a | n/a |
| Computer object | What machine is this? | n/a | n/a |
| Service account | Is this a person or a job? | n/a | n/a |
| Container | Where did Windows put this by default? | No | No |
| Security Group | What can this account access? | No (can filter one) | Yes, groups can contain groups |
| Group Policy Object | What settings apply here? | n/a | Links to Sites, Domains, or OUs |

Use that table as a checklist on every object you open, working in this order:

- Folder first
- Person or machine second
- Group third
- Settings last

If any one of those doesn't match PurveX Financial, you've found something that needs explaining.

```sort
prompt: Will the setting reach the account? Think about where each GPO is linked.
level: 3
Reaches it: A screen-lock GPO linked to OU=IT, for an account in OU=Users,OU=IT | A password policy linked at the domain, for any domain account
Does not reach it: A screen-lock GPO linked to OU=IT, for an account in the Finance and Accounting OU | A GPO someone tried to link directly to the IT Users group | A password policy GPO linked to OU=IT, for IT staff's domain passwords
```
