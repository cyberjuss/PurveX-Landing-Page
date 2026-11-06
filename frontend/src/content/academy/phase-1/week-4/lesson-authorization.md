### Authorization

Authorization decides what an authenticated identity can reach. It applies equally to a real employee and to an attacker signed in as one, which makes it a security control, not admin housekeeping.

### Principles

Three principles:

- **Least privilege.** Each account gets only what its job requires. A stolen account can only reach as far as its permissions, so whoever grants access decides the damage in advance.
- **Need to know.** Access to specific data only while a task requires it.
- **Separation of duties.** No one person controls a sensitive process end to end, such as editing client billing and approving it. Fraud then needs two people.

```match
prompt: Match each principle to what it means.
Least privilege = Each account gets only the access its job requires
Need to know = Access to specific data only while a task requires it
Separation of duties = No single person controls a sensitive process end to end
```

### Role-based access control

Permissions go to **security groups**, not people, and people join groups. Each group is a role. That means:

- A job change is a group change.
- You can read what an account can do from its groups.

PurveX has one group per department: `IT Users`, `Compliance Users`, `Wealth Management Users`, `Operations Users` and `Finance Accounting Users`. On top of those, `IT Admins` adds admin rights beyond `IT Users`.

Admin power is split into three levels, so the most dangerous rights sit with the fewest people. What each level must never touch matters as much as what it controls.

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

These show an account's groups and what they reach. The **Member Of** tab in Active Directory Users and Computers shows the same groups.

Shared folders have **share** and **NTFS** permissions, and over the network the stricter wins. The **Effective Access** tab shows what a named user can do once every group is counted.

### Common failures

Most authorization problems build up quietly:

- **Privilege creep.** People change roles and keep old groups. Remove old access in the same change that grants new access, because the later ticket never gets raised.
- **Stale accounts.** Accounts for people who have left. Colonial Pipeline's attackers used a VPN account nobody used anymore.
- **Admin accounts for daily work.** Admins need a normal account for daily work and a separate one for admin tasks.
- **Over-privileged service accounts.** `svc-backup-job` needs to read what it backs up, nothing more.
- **Unreviewed groups.** What lets all of the above persist. Regular access reviews, where managers confirm who belongs, catch what tickets miss.

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

Escalate:

- someone added to `IT Admins` or `Domain Admins` without a matching ticket
- an account added to a group and removed again shortly after
- a help desk account signing in to servers with admin rights

### Check yourself

`svc-backup-job` appears in a 4624 event with logon type 10, which is a Remote Desktop sign-in. A backup job never needs to sit at a remote desktop, so what does that tell you, and what do you check first?
