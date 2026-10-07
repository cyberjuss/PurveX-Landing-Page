### Authorization

Authorization decides what an identity the system has already authenticated is allowed to do. It answers one question, which is what you can reach, and it assumes the previous question has been settled. Everything here therefore applies equally to a legitimate employee and to an attacker who has successfully signed in as one, which is the reason authorization is a security control rather than an administrative convenience.

### Principles

Three principles shape almost every authorization decision you will make, and they are worth understanding by their purpose rather than their definition.

**Least privilege** means each account receives only the access its job actually requires. Its value is not tidiness. It is that an account which has been compromised can only reach as far as its permissions allow, so the blast radius of a stolen credential is decided in advance by whoever granted the access. **Need to know** narrows this further for specific data, granting it only while a task genuinely requires it rather than permanently because somebody once asked. **Separation of duties** ensures no single person controls an entire sensitive process end to end, such as being able to both edit what clients are billed and approve those same changes, which removes the possibility of one person acting alone.

### Role-based access control

In practice permissions are almost never assigned to people directly. They are granted to **security groups**, and people are added to the groups. The group stands in for the role, which means changing somebody's job is a matter of changing which groups they belong to, and it also means you can answer the question of what an account can do by reading its memberships rather than hunting through every system individually.

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

The failures below account for most of the authorization problems you will encounter, and all of them accumulate quietly rather than arriving as an incident.

**Privilege creep** happens when people change roles and keep the groups from their old one, so that a long career produces an account that can reach almost everything. The fix is procedural rather than technical: remove the old access in the same change that grants the new access, because a separate ticket to remove it later is a ticket nobody raises. **Stale accounts** are the same problem for people who have left entirely, and Colonial Pipeline is the cautionary example, since the VPN account the attackers used was one that was no longer in use by anybody.

**Admin accounts used for daily work** turn every routine action into a privileged one, so an administrator should hold a normal account for day to day use and a separate admin account used only for admin tasks. **Over-privileged service accounts** follow the same logic for software: an account such as `svc-backup-job` needs to read the data it backs up and nothing else, and it has no business signing in interactively or holding Domain Admin. **Unreviewed groups** is the underlying condition that lets all of the above persist, which is why organisations run periodic access reviews where each manager confirms who should still be in which group. Reviews catch what individual tickets miss.

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
