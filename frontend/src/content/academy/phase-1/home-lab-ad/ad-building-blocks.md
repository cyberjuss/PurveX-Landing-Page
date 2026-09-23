<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>If Alex Rivera's account lives in the IT department, why does it also show up in two separate security groups?</p>
</div>

### Active Directory's Building Blocks

You need four objects cold because every ticket in this domain is built from them:

- **Organizational Units**
- **Containers**
- **Security Groups**
- **Group Policy Objects (GPOs)**

Two of them look the same in the console but they do not behave the same. Look at any object in this domain and know what it is, what it can hold, and what question it answers.

Confirm both:

- Location is not access
- A folder is not a group

### Organizational Units (OUs)

An **OU** is the folder an account lives in and the boundary you attach work to. Permissions and Group Policy link to it directly so the folder is not decoration. It is how this domain records a department and how that department is governed.

GovTechFinancial's five departments are each their own OU. Each one nests a `Users` sub-OU one level deeper and IT also gets a `Workstations` sub-OU because the one client machine in this lab belongs under IT rather than next to people.

```
govtechfinancial.local
 ├─ OU=Departments
 │   ├─ OU=IT
 │   │   ├─ OU=Users         (Alex Rivera, Priya Nair)
 │   │   └─ OU=Workstations  (IT-WKS01)
 │   ├─ OU=Compliance
 │   │   └─ OU=Users         (Devon Brooks, Morgan Lee)
 │   ├─ OU=WealthManagement
 │   │   └─ OU=Users         (Sam Whitfield, Jamie Torres)
 │   ├─ OU=Operations
 │   │   └─ OU=Users         (Taylor Osei, Riley Kwan)
 │   └─ OU=FinanceAccounting
 │       └─ OU=Users         (Jordan Ellis)
 └─ OU=AccessLevels
     ├─ Group: Server Admins  (Level 2)
     └─ Group: Helpdesk       (Level 3)
```

Every account lives in exactly one OU and that OU is its department. That is location not access.

`AccessLevels` sits outside `Departments` on purpose because `Server Admins` and `Helpdesk` (Level 2/3) grant domain-wide access rather than department membership. Those groups live in their own folder so you do not confuse a privilege list with a department.

You can also delegate control over a single OU so Helpdesk can reset passwords only for accounts inside `OU=Users,OU=IT` and leave the rest of the domain untouched.

When a ticket names a person find the folder first. If Alex is not under IT the chart and the directory already disagree.

### Containers

A **Container** looks like an OU in the console with the same folder icon but it is a different kind of object. The icon will fool you if you stop at appearance.

| | Organizational Unit | Container |
| ----- | ----- | ----- |
| Can a GPO link to it? | Yes | No |
| Can you delegate permissions on it? | Yes | No |
| Can you create your own? | Yes, anywhere | No, fixed set built by Windows |
| Examples in this domain | `OU=IT`, `OU=Compliance` | `CN=Users`, `CN=Computers` |

The default `Users` and `Computers` folders are Containers not OUs. Windows built those two folders and they stay where they are.

You cannot do these on a Container:

- Create your own
- Delegate control
- Link a GPO

That is why the build script moves every account into a real OU. An account left in a Container can never be targeted by Group Policy so if you find someone there that is not where they belong. Do not treat the default folders as a department.

### Security Groups

A **Security Group** is a list of accounts you use to grant permissions or apply Group Policy to exactly who needs them no matter which OU those accounts live in. The list can cross departments. The folder cannot.

**A group is not a place an account lives. It is a list an account is added to.** An account has exactly one OU and can sit in any number of groups.

Every department has a standard access group:

- `IT Users`
- `Compliance Users`
- `Wealth Management Users`
- `Operations Users`
- `Finance Accounting Users`

IT also has a second group with more privilege called `IT Admins`. That extra group is how two people in the same folder end up with different access.

<div class="ad-diagram">
<div class="ad-diagram__ou">
<span class="ad-diagram__ou-label">OU=Users,OU=IT</span>
<div class="ad-diagram__user ad-diagram__user--1">Priya Nair</div>
<div class="ad-diagram__user ad-diagram__user--2">Alex Rivera</div>
</div>
<div class="ad-diagram__groups">
<div class="ad-diagram__group ad-diagram__group--users">
<span class="ad-diagram__group-label">IT Users</span>
<span class="ad-diagram__group-note">Priya, Alex</span>
</div>
<div class="ad-diagram__group ad-diagram__group--admins">
<span class="ad-diagram__group-label">IT Admins</span>
<span class="ad-diagram__group-note">Alex only</span>
</div>
</div>
</div>

Two accounts can share an OU and still have different access. Alex and Priya both live under IT but only Alex is in IT Admins so the folder alone never tells you what they can do.

The OU tells you where an account lives and the group tells you what it can do. Checking only one leaves the job half done so open Member Of then look at the folder. Both have to match what this environment says they should be.

### Group Policy Objects (GPOs)

A **GPO** is a bundle of settings the domain applies to everything inside whatever that GPO is linked to:

- Password policy
- Screen-lock timeout
- Software restrictions

Remember this rule. A GPO links only to a **Site**, a **Domain**, or an **OU**. Never to a Container and never to a group directly which is why getting accounts out of the default Container matters.

A GPO linked to `OU=IT` could enforce a shorter password expiration for IT staff only and leave other departments untouched. Groups can still narrow who inside that OU it applies to through security filtering but the link always starts at the OU.

If a setting is not applying ask where the object lives before you blame the GPO. An account in a Container will never get an OU-linked policy.

### Putting It Together

Those four objects answer four different questions and you need all of them before you decide an account is in the right place.

| Object | Answers | Can hold a GPO link? | Can nest? |
| ----- | ----- | ----- | ----- |
| Organizational Unit | Where does this account live? | Yes | Yes |
| Container | Where did Windows put this by default? | No | No |
| Security Group | What can this account access? | No (can filter one) | Yes, groups can contain groups |
| Group Policy Object | What settings apply here? | n/a | Links to Sites, Domains, or OUs |

Use that table on every object you open:

- Folder first
- Group second
- Settings last

If any one of those does not match GovTech Financial you have something to explain.

<style>
.ad-diagram {
  display: flex; align-items: center; justify-content: center; gap: 2.5rem; flex-wrap: wrap;
  margin: 1.5rem 0; padding: 1.75rem 1.5rem;
  border: 1px solid var(--pvrx-border-light); border-radius: 12px;
  background: var(--pvrx-surface-alt-light);
}
.ad-diagram__ou {
  position: relative; display: flex; flex-direction: column; align-items: center; gap: 0.6rem;
  padding: 1.25rem 1.5rem 1.5rem; border: 1.5px dashed #9089c9; border-radius: 10px;
  opacity: 0; animation: ad-diagram-in .5s ease-out .1s both;
}
.ad-diagram__ou-label { font-family: var(--font-mono, ui-monospace, monospace); font-size: 0.7rem; font-weight: 700; letter-spacing: 0.04em; color: #5546e0; text-transform: uppercase }
.ad-diagram__user {
  padding: 0.4rem 0.9rem; border-radius: 999px; background: #fff; border: 1px solid var(--pvrx-border-light);
  font-size: 0.82rem; font-weight: 600; color: var(--pvrx-text-primary-light);
  box-shadow: 0 1px 2px rgba(16,25,46,.05);
}
.ad-diagram__groups { display: flex; flex-direction: column; gap: 0.75rem }
.ad-diagram__group {
  display: flex; flex-direction: column; gap: 0.15rem; padding: 0.65rem 1.1rem;
  border-radius: 10px; min-width: 140px;
  opacity: 0; animation: ad-diagram-in .5s ease-out both;
}
.ad-diagram__group--users { background: rgba(85,70,224,.08); border: 1px solid rgba(85,70,224,.25); animation-delay: .5s }
.ad-diagram__group--admins { background: rgba(229,72,77,.08); border: 1px solid rgba(229,72,77,.28); animation-delay: .8s }
.ad-diagram__group-label { font-size: 0.85rem; font-weight: 700; color: var(--pvrx-text-primary-light) }
.ad-diagram__group-note { font-size: 0.74rem; color: var(--pvrx-text-secondary-light) }
.ad-diagram__user--1 { opacity: 0; animation: ad-diagram-in .5s ease-out .25s both }
.ad-diagram__user--2 { opacity: 0; animation: ad-diagram-in .5s ease-out .35s both }
@keyframes ad-diagram-in { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }
@media (prefers-reduced-motion: reduce) {
  .ad-diagram__ou, .ad-diagram__group, .ad-diagram__user--1, .ad-diagram__user--2 { animation: none; opacity: 1 }
}
@media (max-width: 560px) {
  .ad-diagram { flex-direction: column; gap: 1.25rem }
}
</style>
