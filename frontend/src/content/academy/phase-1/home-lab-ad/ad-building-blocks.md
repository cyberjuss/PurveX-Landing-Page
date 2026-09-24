<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>If Alex Rivera's account lives in the IT department, why does it also show up in two separate security groups?</p>
</div>

### Active Directory's Building Blocks

You need these objects cold because every ticket in this domain is built from them:

- **Organizational Units**
- **User accounts**
- **Computer objects**
- **Service accounts**
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

<div class="ad-tree" aria-label="govtechfinancial.local directory">
  <div class="ad-tree__root">
    <span class="ad-tree__kind ad-tree__kind--domain">Domain</span>
    <strong>govtechfinancial.local</strong>
  </div>
  <div class="ad-tree__fork" aria-hidden="true"></div>
  <div class="ad-tree__map">
    <section class="ad-tree__pane">
      <header class="ad-tree__ou">
        <span class="ad-tree__kind">OU</span>
        <span class="ad-tree__name">Departments</span>
      </header>
      <div class="ad-tree__depts">
        <article class="ad-tree__dept">
          <h4>IT</h4>
          <div class="ad-tree__slot">
            <span>Users</span>
            <div class="ad-tree__chips">
              <span>Alex Rivera</span>
              <span>Priya Nair</span>
            </div>
          </div>
          <div class="ad-tree__slot">
            <span>Workstations</span>
            <div class="ad-tree__chips">
              <span>IT-WKS01</span>
            </div>
          </div>
        </article>
        <article class="ad-tree__dept">
          <h4>Compliance</h4>
          <div class="ad-tree__slot">
            <span>Users</span>
            <div class="ad-tree__chips">
              <span>Devon Brooks</span>
              <span>Morgan Lee</span>
            </div>
          </div>
        </article>
        <article class="ad-tree__dept">
          <h4>WealthManagement</h4>
          <div class="ad-tree__slot">
            <span>Users</span>
            <div class="ad-tree__chips">
              <span>Sam Whitfield</span>
              <span>Jamie Torres</span>
            </div>
          </div>
        </article>
        <article class="ad-tree__dept">
          <h4>Operations</h4>
          <div class="ad-tree__slot">
            <span>Users</span>
            <div class="ad-tree__chips">
              <span>Taylor Osei</span>
              <span>Riley Kwan</span>
            </div>
          </div>
        </article>
        <article class="ad-tree__dept">
          <h4>FinanceAccounting</h4>
          <div class="ad-tree__slot">
            <span>Users</span>
            <div class="ad-tree__chips">
              <span>Jordan Ellis</span>
            </div>
          </div>
        </article>
      </div>
    </section>
    <section class="ad-tree__pane ad-tree__pane--access">
      <header class="ad-tree__ou">
        <span class="ad-tree__kind">OU</span>
        <span class="ad-tree__name">AccessLevels</span>
      </header>
      <div class="ad-tree__groups">
        <div class="ad-tree__group">
          <span class="ad-tree__kind ad-tree__kind--group">Group</span>
          <strong>Server Admins</strong>
          <em>Level 2</em>
        </div>
        <div class="ad-tree__group">
          <span class="ad-tree__kind ad-tree__kind--group">Group</span>
          <strong>Helpdesk</strong>
          <em>Level 3</em>
        </div>
      </div>
    </section>
  </div>
</div>

Every account lives in exactly one OU and that OU is its department. That is location not access.

`AccessLevels` sits outside `Departments` on purpose because `Server Admins` and `Helpdesk` (Level 2/3) grant domain-wide access rather than department membership. Those groups live in their own folder so you do not confuse a privilege list with a department.

You can also delegate control over a single OU so Helpdesk can reset passwords only for accounts inside `OU=Users,OU=IT` and leave the rest of the domain untouched.

When a ticket names a person find the folder first. If Alex is not under IT the chart and the directory already disagree.

### User Accounts

A **user account** is a person in this directory. Jordan Ellis is an account. `jordan.ellis` is how you find him.

The account is the object you open on a ticket. The folder tells you where that person lives. Member Of tells you what they can reach. Title is a field on the account not a group so Priya Nair can be a Help Desk Technician and still sit only in `IT Users`.

Nine people live in this domain and each one lives in exactly one department OU. Alex Rivera is the one to remember because he is the only person in two groups.

When a ticket names a person open the account and check both:

- The folders above it
- Member Of

If either one disagrees with The Environment tab stop.

### Computer Objects

A **computer object** is a machine in this directory the same way a user account is a person. `IT-WKS01` is the only client workstation in this lab and it lives under `OU=Workstations,OU=IT`.

You find it the same way you find a person. You read the folder then you read Member Of. The name has no spaces.

If a later ticket names a different workstation or this one sits under a different department that is already a finding. Confirm the folder before you treat the name as proof.

### Service Accounts

A **service account** is still a user object but it is not a person. It gives an identity to a job such as a scheduled task or an automated process so a login can happen with nobody at a keyboard.

`svc-backup-job` is the one in this lab. The name starts with `svc-` so you can tell it from `jordan.ellis` at a glance.

It does not belong in a staff group. If you find it in `IT Users` that is leftover access not a person who works in IT.

When you open an account check the name and the Description before you treat it like a person. A service account gets a written window and a written job. A person gets a department and a group.

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

Open one object. Read the folder. Then read every group on Member Of. Compare these two:

<div class="ad-og" aria-label="Alex Rivera and Priya Nair with their groups">
  <article class="ad-og__card">
    <header>
      <span class="ad-og__kind">User</span>
      <strong>Alex Rivera</strong>
      <em>alex.rivera</em>
    </header>
    <div class="ad-og__row">
      <span>Lives in</span>
      <code>OU=Users,OU=IT</code>
    </div>
    <div class="ad-og__row">
      <span>Member Of</span>
      <div class="ad-og__groups">
        <b>IT Users</b>
        <b class="ad-og__groups--admin">IT Admins</b>
      </div>
    </div>
  </article>
  <article class="ad-og__card">
    <header>
      <span class="ad-og__kind">User</span>
      <strong>Priya Nair</strong>
      <em>priya.nair</em>
    </header>
    <div class="ad-og__row">
      <span>Lives in</span>
      <code>OU=Users,OU=IT</code>
    </div>
    <div class="ad-og__row">
      <span>Member Of</span>
      <div class="ad-og__groups">
        <b>IT Users</b>
      </div>
    </div>
  </article>
</div>

Same folder. Different groups. Alex and Priya both live under IT but only Alex is in IT Admins so the folder alone never tells you what they can do.

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
