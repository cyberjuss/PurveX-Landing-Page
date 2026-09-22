<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>If Alex Rivera's account lives in the IT department, why does it also show up in two separate security groups?</p>
</div>

### Active Directory's Building Blocks

Before any of the labs ahead make sense, four Active Directory objects need to be second nature: **Organizational Units**, **Containers**, **Security Groups**, and **Group Policy Objects (GPOs)**. They get confused constantly, mostly because two of them look almost identical in the management console and behave completely differently. This tab walks through each one using the GovTechFinancial environment you already know.

### Organizational Units (OUs)

An **OU** is a folder in Active Directory that you create to organize accounts, and — critically — a boundary you can attach permissions and Group Policy to.

GovTechFinancial's five departments are each their own OU, and OUs nest, so every department also has its own `Users` sub-OU (IT gets a `Workstations` one too, for its workstation object):

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

Every user, and the department's workstation, lives inside its department's OU. That is what makes an OU useful for an investigation: it tells you where an account *belongs* organizationally, before you even look at what it's a member of.

Notice `AccessLevels` sits outside `Departments` entirely. That's deliberate: `Server Admins` and `Helpdesk` (the Level 2 and Level 3 roles from the Administrative Roles tab) are about what an account can *do* across the whole domain, not which department it's in, so they don't belong nested under any one department.

OUs can nest inside each other, and you can delegate control over just one OU (for example, letting the Helpdesk reset passwords only for accounts inside `OU=Users,OU=IT`) without touching anything else in the domain.

### Containers

A **Container** looks like an OU in Active Directory Users and Computers — same folder icon — but it is not the same object, and the difference matters.

| | Organizational Unit | Container |
| ----- | ----- | ----- |
| Can a GPO link to it? | Yes | No |
| Can you delegate permissions on it? | Yes | No |
| Can you create your own? | Yes, anywhere | No, fixed set built by Windows |
| Examples in this domain | `OU=IT`, `OU=Compliance` | `CN=Users`, `CN=Computers` |

The built-in `Users` and `Computers` folders every fresh domain ships with are Containers, not OUs — which is exactly why the build script moves every account into a real OU under `Departments` instead of leaving it in the default `CN=Users` container. An account sitting in a Container can't be targeted by Group Policy at all. If you ever find a real account still sitting in the default `Users` container, that alone is worth a second look: it means nobody has organized it since it was created.

### Security Groups

A **Security Group** is a list of accounts, built for granting permissions and applying Group Policy to exactly the accounts that need it, regardless of which OU they happen to sit in.

This is the piece that trips people up: **a group is not a place an account lives. It's a list an account is added to.** An account has exactly one OU (its location), but it can belong to any number of groups (its permissions).

GovTechFinancial's group membership makes this concrete. Every department has a standard-access group — `IT Users`, `Compliance Users`, `Wealth Management Users`, and so on — and IT also has a second, more privileged group: `IT Admins`.

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

Both Priya Nair and Alex Rivera live in the same place, `OU=Users,OU=IT`. But Alex belongs to two groups and Priya belongs to one. Their location in Active Directory is identical; their access is not. That's the distinction to hold onto: **OU asks "where does this account live?" A group asks "what can this account do?"** Those are two different questions with two different answers, and an investigation that only checks one of them is only half done.

### Group Policy Objects (GPOs)

A **GPO** is a bundle of settings, a password policy, a screen-lock timeout, a software restriction, that gets applied automatically to every account and computer inside whatever it's linked to.

That last part is the rule to memorize: a GPO can only be linked to a **Site, Domain, or OU**. Never a Container, and never a security group directly. That's why moving accounts out of the default `Users` container and into real OUs (the previous section) isn't just tidiness, it's what makes Group Policy possible at all.

In GovTechFinancial, a GPO linked to `OU=IT` could enforce a shorter password expiration and a locked-down screen timeout for IT staff specifically, without touching Compliance or Wealth Management at all. Security groups can still narrow *who inside that OU* the GPO applies to (called security filtering), but the link itself always starts at the OU.

### Putting It Together

| Object | Answers | Can hold a GPO link? | Can nest? |
| ----- | ----- | ----- | ----- |
| Organizational Unit | Where does this account live? | Yes | Yes |
| Container | Where did Windows put this by default? | No | No |
| Security Group | What can this account access? | No (can filter one) | Yes, groups can contain groups |
| Group Policy Object | What settings apply here? | — | Links to Sites, Domains, or OUs |

<div class="academy-analogy">
<span class="academy-analogy__tag">Think of it like an office building</span>
<ul>
<li><strong>OUs</strong> are the floors. Every desk (account) sits on exactly one floor, and building rules can be set per floor.</li>
<li><strong>Containers</strong> are the loading dock. Things land there by default until someone assigns them a real floor.</li>
<li><strong>Security Groups</strong> are badge access lists. "Everyone on the security team" might include people from three different floors.</li>
<li><strong>GPOs</strong> are the building rules themselves, posted per floor: "3rd floor requires a badge scan every hour."</li>
</ul>
</div>

Come back to this page any time an object's role gets fuzzy. Once you can look at any account in GovTechFinancial and answer both "which OU is it in?" and "which groups is it a member of?" without hesitating, you're ready for the labs ahead.

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
