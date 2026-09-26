### The Environment

This tab is the inventory: every user account, the one workstation, and the totals. The build script creates exactly what is listed here.

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

A title is not a group. Priya Nair is a Help Desk Technician, but she sits in IT Users, not Helpdesk.

When a ticket names a person, look up the username and read the account's group list, called Member Of. Do not guess access from the title.

### The Client Workstation

The lab has only one client machine. Know where it belongs, and you will notice when it does not.

| Item | Detail |
| :---- | :---- |
| Computer name | IT WKS01 |
| Assigned department | IT |
| Location | Workstations folder under IT |

If a ticket names a different workstation, or this one sits under another department, that is already a finding. Confirm the folder before you treat the name as proof.

### What Is Actually in This Environment

These totals are what normal looks like here.

| Item | Count |
| :---- | :---- |
| Departments | 5 |
| Critical departments | 3 |
| Access levels | 3 |
| Security groups | 9 (5 standard, 1 elevated, 3 access level groups) |
| User accounts | 9 |
| Client workstations | 1 |

Once you build the lab, compare it to these counts. If anything differs, check the build before you trust a ticket answer.
