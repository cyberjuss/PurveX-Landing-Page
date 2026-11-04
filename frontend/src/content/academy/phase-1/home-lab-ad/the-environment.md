### The Environment

This page is the full inventory of every user account and workstation, with the totals at the end. When you build the lab, the build script creates everything listed here, and the Range download adds the Ticket Queue objects shown at the bottom.

Try to learn the roster well enough that you'd notice if someone were missing. That way, if your directory and this page ever disagree, you'll know to stop and find out why before you close a ticket.

### Full User Directory

Here is every user account in the environment, with its department, title, username, and group membership.

| Department | Name | Title | Username | Group Membership |
| :---- | :---- | :---- | :---- | :---- |
| IT | Alex Rivera | IT Systems Administrator | alex.rivera | IT Users, IT Admins |
| IT | Priya Nair | Help Desk Technician | priya.nair | IT Users |
| Compliance | Devon Brooks | Compliance Officer | devon.brooks | Compliance Users |
| Compliance | Morgan Lee | Regulatory Analyst | morgan.lee | Compliance Users |
| Wealth Management | Sam Whitfield | Senior Financial Advisor | sam.whitfield | Wealth Management Users |
| Wealth Management | Jamie Torres | Client Relationship Manager | jamie.torres | Wealth Management Users |
| Operations | Taylor Osei | Operations Analyst | taylor.osei | Operations Users |
| Operations | Riley Kwan | Settlements Coordinator | riley.kwan | Operations Users |
| Finance and Accounting | Jordan Ellis | Staff Accountant | jordan.ellis | Finance Accounting Users |

There are nine users, and each one sits in a single standard group. The one exception is Alex Rivera, who also holds IT Admins.

That extra group is worth remembering, because it means unusual activity on Alex's account carries more risk than unusual activity on Jordan's.

Notice, too, that a title isn't a group. Priya Nair is a Help Desk Technician, for example, yet she sits in IT Users rather than Helpdesk.

So when a ticket names a person, look up the username and read the account's Member Of list, rather than guessing their access from their title.

### The Client Workstation

Alongside the users, the lab has just one client machine. Learn where it belongs, so you'll notice if it ever moves.

| Item | Detail |
| :---- | :---- |
| Computer name | IT-WKS01 |
| Assigned department | IT |
| Location | Workstations folder under IT |

Because there's only one, a ticket that names a different workstation is already a finding, and so is IT-WKS01 showing up under a different department. In either case, confirm the folder before you treat the name as proof.

### What Is in This Environment

Putting it all together, these totals are what normal looks like here.

| Item | Count |
| :---- | :---- |
| Departments | 5 |
| Critical departments | 3 |
| Access levels | 3 |
| Security groups | 8 (5 standard, 1 elevated, 2 access level groups) |
| User accounts | 9 |
| Client workstations | 1 |

You might wonder why there are only two access level groups when there are three levels. Level 1 uses the built-in `Domain Admins` group, so the build doesn't need to create a third one.

Once you've built the lab, compare it with these counts. If anything differs, check the build before you trust any ticket answer.

### Ticket Queue Objects

Finally, the Range download also plants the following objects for the Ticket Queue. Treat them as work to do, rather than as part of the baseline:

- The `All Employees` and `Finance Reports` groups in `AccessLevels`
- `old.intern` in IT and `svc-backup-job` in `OU=ServiceAccounts`
- A contractor account, `kai.mendes`, and one more staff account, `noah.kim`
- Three more computer objects: `WM-WKS07`, `OPS-WKS03` and a new laptop that still has to be filed
- Two DNS records, a firewall rule, a screen lock GPO and a Finance share under `C:\PurveX` on the domain controller
