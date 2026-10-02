### Authorization

Authorization decides what an authenticated identity is allowed to do. It answers one question: what can you access?

### Principles

- **Least privilege:** each account gets only the access its job needs. It limits how far a compromised account can reach.
- **Need to know:** access to specific data only when a task requires it.
- **Separation of duties:** no single person controls a whole sensitive process, such as both editing and approving what clients are billed.

### Role-based access control

Permissions go to **security groups**, and people are added to groups. The group stands for the role, so changing someone's role means changing their groups.

PurveX has one standard group per department: `IT Users`, `Compliance Users`, `Wealth Management Users`, `Operations Users` and `Finance Accounting Users`. `IT Admins` adds admin rights on top of `IT Users`.

Administrative power is split into three levels:

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

- **Privilege creep:** people change roles and keep their old groups. Remove old access in the same change that grants new access.
- **Stale accounts:** leavers who are never disabled. Colonial Pipeline's attackers used a VPN account that was no longer in use.
- **Admin accounts for daily work:** admins should use a normal account day to day and a separate admin account for admin tasks.
- **Over-privileged service accounts:** `svc-backup-job` needs to read what it backs up, not sign in interactively or be a Domain Admin.
- **Unreviewed groups:** regular access reviews in which each manager confirms group membership catch what tickets miss.

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
