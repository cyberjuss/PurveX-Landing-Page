### Authorization

Once authentication has settled who you are, authorization takes over and decides what you're allowed to do. It answers a single question, what you can reach, and it simply assumes the first question was answered correctly. That assumption has an important consequence: everything here applies equally to a real employee and to an attacker who has signed in as one. That's why authorization is a security control, not just an administrative convenience.

### Principles

Three principles shape almost every authorization decision you'll make. Rather than memorizing their definitions, it's more useful to understand what each one is for:

- **Least privilege.** Each account gets only the access its job requires. The value is not tidiness. A compromised account can only reach as far as its permissions allow, so the blast radius of a stolen credential is decided in advance by whoever granted the access.
- **Need to know.** People get access to specific data only while a task genuinely requires it, not permanently because somebody once asked.
- **Separation of duties.** No single person controls an entire sensitive process end to end, such as both editing what clients are billed and approving those same changes. A fraud or a serious mistake then needs two people, not one.

```match
prompt: Match each principle to what it means.
Least privilege = Each account gets only the access its job requires
Need to know = Access to specific data only while a task requires it
Separation of duties = No single person controls a sensitive process end to end
```

### Role-based access control

To put those principles into practice, permissions are almost never assigned to people directly. Instead, they're granted to **security groups**, and people are added to those groups, so each group stands in for a role. That extra step buys you two things:

- Changing somebody's job becomes a matter of changing which groups they belong to.
- You can read what an account is able to do from its memberships, rather than hunting through every system one at a time.

At PurveX, for example, there's one standard group per department: `IT Users`, `Compliance Users`, `Wealth Management Users`, `Operations Users` and `Finance Accounting Users`. On top of those, `IT Admins` adds admin rights beyond `IT Users`.

Admin rights get the same careful treatment. Rather than being granted as one block, administrative power is deliberately split into three levels, so that the most dangerous rights sit with the fewest people. As you read the table, notice that the line each level must never cross matters just as much as what it controls.

| Level | Controls | Must never touch |
|---|---|---|
| Level 1, Domain Admin | The domain controller and Active Directory | Nothing above it |
| Level 2, Server Admin | Application and file servers | The domain controller |
| Level 3, Helpdesk | Workstations, password resets, local support | Servers or the domain controller |

```sort
prompt: Which access level controls each one?
Level 1 · Domain Admin: The domain controller | Active Directory
Level 2 · Server Admin: Application servers | File servers
Level 3 · Helpdesk: Workstations | Password resets | Local support
```

### Reading access

```
whoami /groups
Get-ADPrincipalGroupMembership taylor.osei | Select-Object Name
Get-ADGroupMember "IT Admins"
icacls "C:\PurveX\Shares\Finance"
```

These commands show you an account's groups and what they can reach. If you prefer the graphical tool, the **Member Of** tab on an account in Active Directory Users and Computers lists the same groups.

Shared folders add one more wrinkle, because they have two sets of permissions: **share** and **NTFS**. When someone connects over the network, the more restrictive of the two wins. To cut through all of that, the folder's **Effective Access** tab shows what a named user can actually do once every group is counted.

### Common failures

With all of that in place, here are the failures behind most of the authorization problems you'll run into. What they have in common is that they build up quietly over time, rather than arriving as an incident:

- **Privilege creep.** People change roles and keep the groups from the old one, so a long career produces an account that can reach almost everything. The fix is procedural: remove old access in the same change that grants new access, because a separate ticket to do it later is a ticket nobody raises.
- **Stale accounts.** These are the same problem for people who have left entirely. Colonial Pipeline is the cautionary example, since the VPN account the attackers used was no longer in use by anybody.
- **Admin accounts for daily work.** Every routine action becomes a privileged one. An administrator should hold a normal account for day-to-day use and a separate admin account for admin tasks.
- **Over-privileged service accounts.** `svc-backup-job` needs to read the data it backs up and nothing else. It has no business signing in interactively or holding Domain Admin.
- **Unreviewed groups.** This is the condition that lets all of the above persist. Periodic access reviews, where each manager confirms who should still be in which group, catch what individual tickets miss.

```match
prompt: Name the failure in each scenario.
Privilege creep = Someone changed roles and kept the groups from the old one
Stale account = An account still active for someone who has left
Admin account for daily work = Every routine action an administrator takes is a privileged one
Over-privileged service account = svc-backup-job signs in interactively and holds Domain Admin
```

### Logs

| Event ID | Meaning |
|---|---|
| 4728 | Member added to a security-enabled global group |
| 4732 | Member added to a security-enabled local group |
| 4756 | Member added to a security-enabled universal group |
| 4672 | Special privileges assigned to a new sign-in, usually an admin |

When you see any of these in the logs, escalate:

- someone added to `IT Admins` or `Domain Admins` without a matching ticket
- an account added to a group and removed again shortly after
- a help desk account signing in to servers with admin rights

### Check yourself

Here's one to think through. `svc-backup-job` appears in a 4624 event with logon type 10, which is a Remote Desktop sign-in. A backup job never needs to sit at a remote desktop, so what does that tell you, and what do you check first?
