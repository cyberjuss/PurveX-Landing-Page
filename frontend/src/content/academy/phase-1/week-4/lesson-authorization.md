### Authorization: What Are You Allowed to Do?

A ticket from Taylor Osei: "I moved from Operations to Finance last month. Please give me access to the Finance share."

The easy fix is to add Taylor to `Finance Accounting Users` and close the ticket. Before you do, look at what Taylor can already reach. If the account is still in `Operations Users` too, Taylor keeps the old job's access and gains the new one. Do that a few times over a career and one account can reach half the company.

Authentication proved who Taylor is. Authorization decides what Taylor can do, and it is where access quietly piles up.

<div class="academy-analogy">
<span class="academy-analogy__tag">Think of it like a key ring</span>
<ul>
<li>Each key opens one door. A person should carry only the keys their current job needs.</li>
<li>When someone changes jobs, they hand back the old keys before getting new ones.</li>
<li>A master key is kept separate and used only when it is really needed.</li>
</ul>
</div>

### Least privilege

**Least privilege** means every account gets the access its job needs, and nothing more. It does not stop a mistake or an attacker from getting in. It limits how far they reach once they are in.

Two ideas sit next to it:

- **Need to know:** even inside the right department, you see only the data your task requires.
- **Separation of duties:** no single person controls a whole sensitive process. The Week 1 lab had one of these problems: Operations could edit the fee schedule, when only Finance should change what clients are billed.

### How PurveX grants access: groups

Permissions are not given to people one by one. They are given to **security groups**, and people are added to groups. Every PurveX department has its standard group: `IT Users`, `Compliance Users`, `Wealth Management Users`, `Operations Users` and `Finance Accounting Users`. IT also has `IT Admins`, the extra group that lets Alex Rivera do more than Priya Nair, even though both work in IT.

This is **role-based access control**. The group stands for the role. Change the role, change the group, and the access follows.

PurveX also splits administrative power into three levels:

| Level | Controls | Must never touch |
|---|---|---|
| Level 1, Domain Admin | The domain controller and Active Directory | Nothing above it |
| Level 2, Server Admin | Application and file servers | The domain controller |
| Level 3, Helpdesk | Workstations, password resets, local support | Servers or the domain controller |

A help desk login that touches a server does not match this table. That alone is worth a question.

### How to read what an account can do

Start with the groups. From the user's own session:

```
whoami /groups
```

As an administrator, with the Active Directory module:

```
Get-ADPrincipalGroupMembership taylor.osei | Select-Object Name
Get-ADGroupMember "IT Admins"
```

In Active Directory Users and Computers, open the account and read the **Member Of** tab.

For a shared folder, two sets of permissions apply when someone connects over the network: the **share permissions** and the **NTFS permissions** on the folder. The more restrictive of the two wins. To see the NTFS side:

```
icacls "D:\Shares\Finance"
```

In File Explorer, the folder's **Properties**, then **Security**, then **Advanced**, then **Effective Access** shows what a named user can really do after every group is counted.

### Where access goes wrong

- **Privilege creep:** people move jobs and keep old groups, like Taylor. The fix is to remove old access in the same ticket that grants new access.
- **Leavers who are never removed:** an account that should be disabled still works. Colonial Pipeline's attackers used a VPN account that was no longer in use.
- **Daily work on an admin account:** an administrator who reads email while signed in as a Domain Admin puts the whole domain one phishing link away. Admins use a normal account day to day and a separate admin account for admin work.
- **Service accounts with too much power:** `svc-backup-job` exists to run backups. It needs to read the files it backs up, not to sign in interactively or be a Domain Admin.
- **Groups nobody reviews:** access reviews, where each manager confirms who is in their groups, catch what tickets miss.

### Back to Taylor's ticket

1. Confirm the move is real. HR or Taylor's new manager approves the new access, not Taylor alone.
2. Check Taylor's current groups.
3. Add `Finance Accounting Users` and remove `Operations Users` in the same change, unless a manager approves keeping both for a set handover period.
4. Record what you added, what you removed, and who approved it.

### In the SOC: what the logs show

Group changes are some of the most important events in a Windows domain:

| Event ID | Meaning |
|---|---|
| 4728 | A member was added to a security-enabled global group |
| 4732 | A member was added to a security-enabled local group |
| 4756 | A member was added to a security-enabled universal group |
| 4672 | Special privileges were assigned to a new sign-in, usually an admin sign-in |

Escalate when:

- someone is added to `IT Admins` or `Domain Admins` without a matching ticket
- an account is added to a group and removed again shortly after
- a help desk account shows admin sign-ins on servers

Attackers who get in usually try to add themselves to a powerful group next.

### Check yourself

`svc-backup-job` appears in a 4624 event with logon type 10, a Remote Desktop sign-in. A backup job never needs to sit at a remote desktop. What does that tell you, and what do you check first?
