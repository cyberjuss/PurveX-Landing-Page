### The Environment

This tab is the inventory. Every user account, the one workstation, and the totals.

Learn this roster well enough to notice who is missing later. Check every lab count against these numbers and if the directory and this page disagree stop and find out why before you close a ticket.

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

Nine users total and each sits in one standard access group except Alex Rivera who also holds IT Admins. That extra group is the thing to remember because unusual activity on Alex is not the same as unusual activity on Jordan.

A title is not a group. Priya Nair is a Help Desk Technician and sits in IT Users which does not put her in Helpdesk. When a ticket names a person look up the username and read Member Of instead of guessing from the title.

### The Client Workstation

There is only one machine so know where it belongs and you will notice when it does not.

| Item | Detail |
| :---- | :---- |
| Computer name | IT WKS01 |
| Assigned department | IT |
| Location | Workstations folder under IT |

If a later ticket names a different workstation or this one sits under a different department that is already a finding. Confirm the folder before you treat the name as proof.

### What Is Actually in This Environment

A count of what currently exists.

| Item | Count |
| :---- | :---- |
| Departments | 5 |
| Critical departments | 3 |
| Access levels | 3 |
| Security groups | 9 (5 standard, 1 elevated, 3 access level groups) |
| User accounts | 9 |
| Client workstations | 1 |

If your lab shows a different count stop and check the build before you trust a ticket answer. These numbers are what normal looks like here.
