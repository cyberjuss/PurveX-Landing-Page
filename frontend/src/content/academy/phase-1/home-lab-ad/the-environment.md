### The Environment

This tab is the inventory of every user account and workstation, with the totals at the end. The build script creates everything listed here. The Range download also adds the Ticket Queue objects listed at the bottom.

Learn the roster well enough to notice when someone is missing. If your directory and this page ever disagree, stop and find out why before you close a ticket.

### Full User Directory

Every user account in the environment with its department, title, username, and group membership.

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

There are nine users, and each sits in one standard group. Alex Rivera is the exception because he also holds IT Admins.

Remember that extra group. Unusual activity on Alex carries more risk than unusual activity on Jordan.

A title is not a group. Priya Nair is a Help Desk Technician, but she sits in IT Users rather than Helpdesk.

When a ticket names a person, look up the username and read the account's Member Of list. Do not guess access from the title.

### The Client Workstation

The lab has only one client machine. Learn where it belongs so you notice if it moves.

| Item | Detail |
| :---- | :---- |
| Computer name | IT WKS01 |
| Assigned department | IT |
| Location | Workstations folder under IT |

A ticket that names a different workstation is already a finding, and so is this one sitting under another department. Confirm the folder before you treat the name as proof.

### What Is in This Environment

These totals are what normal looks like here.

| Item | Count |
| :---- | :---- |
| Departments | 5 |
| Critical departments | 3 |
| Access levels | 3 |
| Security groups | 8 (5 standard, 1 elevated, 2 access level groups) |
| User accounts | 9 |
| Client workstations | 1 |

Level 1 uses the built-in `Domain Admins` group, so the build does not create a third access level group.

Once you build the lab, compare it to these counts. If anything differs, check the build before you trust a ticket answer.

### Ticket Queue Objects

The Range download also plants these for the Ticket Queue. They are work to do, not part of the baseline:

- The `All Employees` and `Finance Reports` groups in `AccessLevels`
- `old.intern` in IT and `svc-backup-job` in `OU=ServiceAccounts`
- A contractor account, `kai.mendes`, and one more staff account, `noah.kim`
- Three more computer objects: `WM-WKS07`, `OPS-WKS03` and a new laptop that still has to be filed
- Two DNS records, a firewall rule, a screen lock GPO and a Finance share under `C:\PurveX` on the domain controller
