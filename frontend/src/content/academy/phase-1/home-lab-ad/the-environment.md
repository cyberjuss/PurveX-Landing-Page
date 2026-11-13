### The Environment

This page lists every user account and workstation the build script creates, with the totals at the end. Try to learn the roster well enough that you'd notice if someone were missing. Then, if your directory and this page ever disagree, you'll know to stop and find out why.

### Full User Directory

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

Each of the nine users sits in one standard group, with one exception: Alex Rivera also holds IT Admins. That's worth remembering, because unusual activity on Alex's account carries more risk than the same activity on Jordan's.

Notice, too, that a title isn't a group. Priya Nair is a Help Desk Technician, yet they sit in IT Users rather than Helpdesk. So when a ticket names a person, read the account's Member Of list rather than guessing their access from their title.

### The Client Workstation

| Item | Detail |
| :---- | :---- |
| Computer name | IT-WKS01 |
| Assigned department | IT |
| Location | Workstations folder under IT |

Because there's only one, a ticket that names a different workstation is already a finding, and so is IT-WKS01 turning up under a different department.

### What Is in This Environment

| Item | Count |
| :---- | :---- |
| Departments | 5 |
| Critical departments | 3 |
| Access levels | 3 |
| Security groups | 8 (5 standard, 1 elevated, 2 access level groups) |
| User accounts | 9 |
| Client workstations | 1 |

You might wonder why there are only two access level groups when there are three levels. Level 1 uses the built-in `Domain Admins` group, so the build doesn't need to create a third. Once you've built the lab, compare it with these counts, and if anything differs, check the build before you trust any ticket answer.

### Ticket Queue Objects

Finally, the Range download also plants the following objects for the Ticket Queue. Treat them as work to do rather than as part of the baseline:

- The `All Employees` and `Finance Reports` groups in `AccessLevels`
- `old.intern` in IT and `svc-backup-job` in `OU=ServiceAccounts`
- A contractor account, `kai.mendes`, and one more staff account, `noah.kim`
- Three more computer objects: `WM-WKS07`, `OPS-WKS03` and a new laptop that still has to be filed
- Two DNS records, a firewall rule, a screen lock GPO and a Finance share under `C:\PurveX` on the domain controller

```sort
prompt: You're checking the directory against this page. Does each finding fit the baseline, or does it need a question?
level: 3
Fits the baseline: alex.rivera is in IT Users and IT Admins | IT-WKS01 sits in the IT Workstations folder | jordan.ellis is in Finance Accounting Users
Needs a question: jordan.ellis has turned up in IT Admins | A Wealth Management user is sitting in the Operations folder | A computer named WM-WKS07 is in the IT Workstations folder
```
