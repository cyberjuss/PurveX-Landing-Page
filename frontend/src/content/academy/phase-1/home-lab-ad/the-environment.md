### The Environment

Every user and workstation the build script creates. Learn it well enough to notice if your directory ever disagrees.

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

Each user has one standard group. Alex Rivera also holds IT Admins, so odd activity on Alex's account carries more risk.

A title isn't a group. Priya Nair is a Help Desk Technician but sits in IT Users, not Helpdesk. Read the Member Of list, don't guess from the title.

### The Client Workstation

| Item | Detail |
| :---- | :---- |
| Computer name | IT-WKS01 |
| Assigned department | IT |
| Location | Workstations folder under IT |

A ticket naming a different workstation, or IT-WKS01 in another department, is already a finding.

### What Is in This Environment

| Item | Count |
| :---- | :---- |
| Departments | 5 |
| Critical departments | 3 |
| Access levels | 3 |
| Security groups | 8 (5 standard, 1 elevated, 2 access level groups) |
| User accounts | 9 |
| Client workstations | 1 |

Only two access level groups, because Level 1 uses the built-in `Domain Admins`. If your build's counts differ, check the build before trusting any ticket answer.

### Ticket Queue Objects

The Range download also plants these for the Ticket Queue. They're work to do, not baseline:

- The `All Employees` and `Finance Reports` groups in `AccessLevels`
- `old.intern` in IT and `svc-backup-job` in `OU=ServiceAccounts`
- A contractor account, `kai.mendes`, and one more staff account, `noah.kim`
- Three more computer objects: `WM-WKS07`, `OPS-WKS03` and a new laptop that still has to be filed
- Two DNS records, a firewall rule, a screen lock GPO and a Finance share under `C:\PurveX` on the domain controller
