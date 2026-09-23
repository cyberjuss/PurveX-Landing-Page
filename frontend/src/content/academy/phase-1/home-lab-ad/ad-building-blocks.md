<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>If Alex Rivera's account lives in the IT department, why does it also show up in two separate security groups?</p>
</div>

### Active Directory's Building Blocks

Four objects to know cold: **Organizational Units**, **Containers**, **Security Groups**, and **Group Policy Objects (GPOs)**. Two of them look identical in the console but behave nothing alike. By the end of this tab, you'll look at any object in Active Directory and know exactly what it is.

### Organizational Units (OUs)

An **OU** is a folder for organizing accounts, and also a boundary: permissions and Group Policy attach to it directly.

GovTechFinancial's five departments are each their own OU, each nesting a `Users` sub-OU one level deeper (IT also gets a `Workstations` sub-OU):

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

Every account lives in exactly one OU: its department. That's the account's location, separate from its access.

`AccessLevels` sits outside `Departments` on purpose, since `Server Admins` and `Helpdesk` (Level 2/3) grant domain-wide access rather than department membership.

You can also delegate control over a single OU. Helpdesk, for example, can reset passwords only for accounts inside `OU=Users,OU=IT`, leaving the rest of the domain untouched.

### Containers

A **Container** looks like an OU in the console, same folder icon, but it's a different kind of object.

| | Organizational Unit | Container |
| ----- | ----- | ----- |
| Can a GPO link to it? | Yes | No |
| Can you delegate permissions on it? | Yes | No |
| Can you create your own? | Yes, anywhere | No, fixed set built by Windows |
| Examples in this domain | `OU=IT`, `OU=Compliance` | `CN=Users`, `CN=Computers` |

The default `Users` and `Computers` folders are Containers, not OUs, which is why the build script moves every account into a real OU: an account left in a Container can never be targeted by Group Policy.

<div class="academy-thinklike">
<span class="academy-thinklike__tag">Think Like an Analyst</span>
<p>An account still sitting in the default Container usually means one thing: nobody organized it after creation. That's not a crime on its own, but it's a gap worth noting, and exactly the kind of loose end an attacker hopes you never check.</p>
</div>

### Security Groups

A **Security Group** is a list of accounts, used to grant permissions or apply Group Policy to exactly who needs it, regardless of OU.

**A group isn't a place an account lives, it's a list an account is added to.** An account has exactly one OU, but any number of groups.

Every department has a standard-access group (`IT Users`, `Compliance Users`, and so on). IT also has a second, more privileged one: `IT Admins`.

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

Same OU, different access: OU answers "where does this account live," a group answers "what can it do," and checking only one leaves an investigation half done.

### Group Policy Objects (GPOs)

A **GPO** is a bundle of settings, such as password policy, screen-lock timeout, or software restrictions, applied to everything inside whatever it's linked to.

The rule to memorize: a GPO links only to a **Site, Domain, or OU**, never a Container and never a group directly. That's why getting accounts out of the default Container matters.

A GPO linked to `OU=IT` could enforce a shorter password expiration for IT staff only, leaving other departments untouched. Groups can still narrow who inside that OU it applies to, through security filtering, but the link always starts at the OU.

### Putting It Together

| Object | Answers | Can hold a GPO link? | Can nest? |
| ----- | ----- | ----- | ----- |
| Organizational Unit | Where does this account live? | Yes | Yes |
| Container | Where did Windows put this by default? | No | No |
| Security Group | What can this account access? | No (can filter one) | Yes, groups can contain groups |
| Group Policy Object | What settings apply here? | — | Links to Sites, Domains, or OUs |

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
