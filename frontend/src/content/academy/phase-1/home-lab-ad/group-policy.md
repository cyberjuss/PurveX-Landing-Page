<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>A password setting is not applying. Where do you look before you blame the policy?</p>
</div>

### Group Policy Objects (GPOs)

A **GPO**, or Group Policy Object, is a bundle of settings. The domain applies those settings to everything inside the object the GPO is linked to. Common settings include:

- Password policy
- Screen-lock timeout
- Software restrictions

A GPO can only link to a **Site**, a **Domain**, or an **OU**, never to a Container or directly to a group. That's the reason, as you saw on the Groups tab, that every account in this lab sits in an OU rather than a default Container.

For example, a GPO linked to `OU=IT` could set a shorter screen-lock timeout for IT staff while leaving other departments untouched.

Password policy is the one exception to that pattern. For domain accounts, it only takes effect from a GPO linked at the domain itself, so if one group needs stricter rules, you'd use a fine-grained password policy instead.

Groups still play a part, though. Through security filtering, a group can narrow down who inside that OU the GPO applies to, even though the link itself still starts at the OU.

So if a setting isn't applying, ask where the object lives before you blame the GPO. An account in a Container never gets a policy linked to an OU, although it does still get policy linked at the domain.

### Putting It Together

You've now met every kind of object in this lab, and each one answers a different question. Before you decide something is in the right place, you need every one of those answers.

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
