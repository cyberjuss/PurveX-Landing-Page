### Authorization

Authorization decides what an identity the system has already authenticated is allowed to do. It answers one question, which is what you can reach, and it assumes the previous question has been settled. Everything here therefore applies equally to a legitimate employee and to an attacker who has signed in as one. That is why authorization is a security control rather than an administrative convenience.

### Principles

Three principles shape almost every authorization decision you will make, and they are worth understanding by their purpose rather than their definition:

- **Least privilege.** Each account gets only the access its job requires. The value is not tidiness. A compromised account can only reach as far as its permissions allow, so the blast radius of a stolen credential is decided in advance by whoever granted the access.
- **Need to know.** Access to specific data only while a task genuinely requires it, rather than permanently because somebody once asked.
- **Separation of duties.** No single person controls an entire sensitive process end to end, such as both editing what clients are billed and approving those same changes. It removes the possibility of one person acting alone.

### Role-based access control

In practice permissions are almost never assigned to people directly. They are granted to **security groups** instead, and people are added to those groups, so the group stands in for the role. That indirection buys you two things:

- Changing somebody's job becomes a matter of changing which groups they belong to.
- You can read what an account is able to do from its memberships, rather than hunting through every system one at a time.

PurveX has one standard group per department: `IT Users`, `Compliance Users`, `Wealth Management Users`, `Operations Users` and `Finance Accounting Users`. `IT Admins` adds admin rights on top of `IT Users`.

Administrative power is deliberately split into three levels rather than granted as a single thing, so that the most dangerous rights sit with the smallest number of people. The boundary each level must not cross matters as much as what it controls.

| Level | Controls | Must never touch |
|---|---|---|
| Level 1, Domain Admin | The domain controller and Active Directory | Nothing above it |
| Level 2, Server Admin | Application and file servers | The domain controller |
| Level 3, Helpdesk | Workstations, password resets, local support | Servers or the domain controller |

### Reading access

```
whoami /groups
Get-ADPrincipalGroupMembership taylor.osei | Select-Object Name
Get-ADGroupMember "IT Admins"
icacls "D:\Shares\Finance"
```

In Active Directory Users and Computers, the account's **Member Of** tab lists its groups.

A shared folder has two sets of permissions: **share** and **NTFS**. Over the network, the more restrictive of the two wins. The folder's **Effective Access** tab shows what a named user can do after every group is counted.

### Common failures

The failures below account for most of the authorization problems you will encounter. All of them accumulate quietly rather than arriving as an incident.

- **Privilege creep.** People change roles and keep the groups from the old one, so a long career produces an account that can reach almost everything. The fix is procedural: remove old access in the same change that grants new access, because a separate ticket to do it later is a ticket nobody raises.
- **Stale accounts.** The same problem for people who have left entirely. Colonial Pipeline is the cautionary example, since the VPN account the attackers used was no longer in use by anybody.
- **Admin accounts for daily work.** Every routine action becomes a privileged one. An administrator should hold a normal account for day to day use and a separate admin account for admin tasks.
- **Over-privileged service accounts.** `svc-backup-job` needs to read the data it backs up and nothing else. It has no business signing in interactively or holding Domain Admin.
- **Unreviewed groups.** The condition that lets all of the above persist. Periodic access reviews, where each manager confirms who should still be in which group, catch what individual tickets miss.

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

`svc-backup-job` appears in a 4624 event with logon type 10, a Remote Desktop sign-in. A backup job never needs to sit at a remote desktop. What does that tell you, and what do you check first?
