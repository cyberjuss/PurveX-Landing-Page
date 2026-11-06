<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>A password setting is not applying. Where do you look before you blame the policy?</p>
</div>

### Group Policy Objects (GPOs)

A **GPO** (Group Policy Object) is a bundle of settings applied to everything inside what it's linked to, such as:

- Password policy
- Screen-lock timeout
- Software restrictions

A GPO links only to a **Site**, a **Domain** or an **OU**, never a Container or a group. A GPO linked to `OU=IT` could shorten the screen lock for IT alone.

Password policy is the exception: for domain accounts, it only works from a GPO linked at the domain. Stricter rules for one group need a fine-grained password policy.

Security filtering lets a group narrow who inside the OU a GPO applies to.

If a setting isn't applying, check where the object lives before blaming the GPO. An account in a Container gets domain-linked policy but nothing linked to an OU.

### Putting It Together

Each kind of object answers a different question:

| Object | Answers | Can hold a GPO link? | Can nest? |
| ----- | ----- | ----- | ----- |
| Organizational Unit | Where does this account live? | Yes | Yes |
| User account | Who is this person? | n/a | n/a |
| Computer object | What machine is this? | n/a | n/a |
| Service account | Is this a person or a job? | n/a | n/a |
| Container | Where did Windows put this by default? | No | No |
| Security Group | What can this account access? | No (can filter one) | Yes, groups can contain groups |
| Group Policy Object | What settings apply here? | n/a | Links to Sites, Domains, or OUs |

Check every object in this order:

- Folder first
- Person or machine second
- Group third
- Settings last

Anything that doesn't match PurveX needs explaining.
