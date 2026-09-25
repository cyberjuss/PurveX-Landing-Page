<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>A password setting is not applying. Where do you look before you blame the policy?</p>
</div>

### Group Policy Objects (GPOs)

A **GPO** is a bundle of settings the domain applies to everything inside whatever that GPO is linked to:

- Password policy
- Screen-lock timeout
- Software restrictions

Remember this rule. A GPO links only to a **Site**, a **Domain**, or an **OU**. Never to a Container and never to a group directly which is why getting accounts out of the default Container matters.

A GPO linked to `OU=IT` could enforce a shorter password expiration for IT staff only and leave other departments untouched. Groups can still narrow who inside that OU it applies to through security filtering but the link always starts at the OU.

If a setting is not applying ask where the object lives before you blame the GPO. An account in a Container will never get an OU-linked policy.

### Putting It Together

Those objects answer different questions and you need all of them before you decide something is in the right place.

| Object | Answers | Can hold a GPO link? | Can nest? |
| ----- | ----- | ----- | ----- |
| Organizational Unit | Where does this account live? | Yes | Yes |
| User account | Who is this person? | n/a | n/a |
| Computer object | What machine is this? | n/a | n/a |
| Service account | Is this a person or a job? | n/a | n/a |
| Container | Where did Windows put this by default? | No | No |
| Security Group | What can this account access? | No (can filter one) | Yes, groups can contain groups |
| Group Policy Object | What settings apply here? | n/a | Links to Sites, Domains, or OUs |

Use that table on every object you open:

- Folder first
- Person or machine second
- Group third
- Settings last

If any one of those does not match PurveX Financial you have something to explain.
