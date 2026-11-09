### Authorization

Once authentication has settled who you are, authorization decides what you're allowed to reach. Notice that it assumes the first question was answered correctly, so everything here applies equally to a real employee and to an attacker signed in as one. That's why authorization is a security control and not just administrative housekeeping.

### Principles

Three principles shape almost every authorization decision you'll make, and it's more useful to understand what each one is for than to memorize its definition:

- **Least privilege.** Each account gets only the access its job requires. The point isn't tidiness: a stolen account can only reach as far as its permissions, so whoever grants access is deciding the damage in advance.
- **Need to know.** People get access to specific data only while a task requires it, not permanently because somebody once asked.
- **Separation of duties.** No single person controls a sensitive process end to end, such as both editing what clients are billed and approving those changes, so a fraud or a serious mistake needs two people rather than one.

```match
prompt: Which principle is each PurveX rule enforcing?
level: 2
Least privilege = svc-backup-job can read the backup folders and nothing else
Need to know = Morgan gets the audit folder only while this quarter's filing is open
Separation of duties = Jordan can enter a wire, but someone else has to approve it
```

### Role-based access control

To put those principles into practice, permissions are almost never given to people directly. They're granted to **security groups**, and people are added to those groups, so each group stands in for a role. That extra step buys you two things:

- Changing somebody's job becomes a matter of changing their groups.
- You can read what an account can do from its memberships, rather than hunting through every system.

At PurveX, there's one standard group per department:

- `IT Users`
- `Compliance Users`
- `Wealth Management Users`
- `Operations Users`
- `Finance Accounting Users`

On top of those, `IT Admins` adds admin rights beyond `IT Users`.

Admin rights get the same careful treatment. Rather than being granted as one block, administrative power is split into three levels, so that the most dangerous rights sit with the fewest people. As you read the table, notice that the line each level must never cross matters just as much as what it controls.

| Level | Controls | Must never touch |
|---|---|---|
| Level 1, Domain Admin | The domain controller and Active Directory | Nothing above it |
| Level 2, Server Admin | Application and file servers | The domain controller |
| Level 3, Helpdesk | Workstations, password resets, local support | Servers or the domain controller |

```sort
prompt: Who should handle each request?
level: 2
Level 1 · Domain Admin: Change who sits in Domain Admins | Create a new department OU
Level 2 · Server Admin: Patch the file server | Restart the reporting application
Level 3 · Helpdesk: Reset Riley's password | Fix the printer on IT-WKS01
```

### Reading access

```
whoami /groups
Get-ADPrincipalGroupMembership taylor.osei | Select-Object Name
Get-ADGroupMember "IT Admins"
icacls "C:\PurveX\Shares\Finance"
```

These commands show you an account's groups and what those groups can reach. If you prefer the graphical tool, the **Member Of** tab in Active Directory Users and Computers lists the same groups.

Shared folders add one wrinkle, because they carry two sets of permissions, **share** and **NTFS**, and over the network the stricter of the two wins. To cut through that, the folder's **Effective Access** tab shows what a named user can do once every group is counted.

### Common failures

Here are the failures behind most of the authorization problems you'll meet. What they share is that they build up quietly over time, rather than arriving as an incident:

- **Privilege creep.** People change roles and keep the groups from the old one, until a long career produces an account that reaches almost everything. The fix is to remove old access in the same change that grants new access, because a separate ticket to do it later is one nobody raises.
- **Stale accounts.** These are the same problem for people who have left entirely, and Colonial Pipeline is the cautionary example, since the VPN account the attackers used was no longer in use by anybody.
- **Admin accounts for daily work.** When an administrator works from an admin account, every routine action becomes a privileged one, so they should use a normal account day to day and a separate one for admin tasks.
- **Over-privileged service accounts.** `svc-backup-job` needs to read the data it backs up and nothing else, so it has no business signing in interactively or holding Domain Admin.
- **Unreviewed groups.** This is the condition that lets all of the above persist. Regular access reviews, where each manager confirms who should still be in which group, catch what individual tickets miss.

```match
prompt: The access review found these. Name the failure in each.
level: 3
Privilege creep = Taylor moved to Compliance and still has Operations Users
Stale account = An intern's account is still enabled six months after they left
Admin account for daily work = Alex reads email while signed in to his admin account
Over-privileged service account = svc-backup-job signs in to the desktop and holds Domain Admin
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

<details class="lk-answer">
<summary>Compare your answer</summary>

It tells you someone is using the service account's credentials interactively, which is either misuse or a compromise, because the job itself never needs a desktop. Check where the sign-in came from, what groups the account holds, and whether its password changed recently. Then escalate, because an attacker sitting in a service account often has far more access than a person would.

</details>
