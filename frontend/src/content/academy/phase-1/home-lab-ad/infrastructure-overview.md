# **Infrastructure Overview**

### **Essential Question**

Before you can recognize what's abnormal in an investigation, what does "normal" actually look like in this environment?

### **Overview**

This is an overview of the GovTech Financial environment. It is meant to mimic an actual enterprise network to the best of its capability.

Study this environment closely, because it matters later when we move into investigation and threat detection.

Note: In cybersecurity, you must know what normal looks like before you can spot what is not.

***Domain: govtechfinancial. local***

***Script:***

---

**The Org Chart**

Every organization has a structure. Here is the breakdown of the departments and what each one is for.

| Department | Function | Critical |
| ----- | ----- | ----- |
| IT | Runs and supports the technology for the rest of the company. Manages accounts, workstations, and infrastructure. Only department with elevated access, since it is the group responsible for administering systems. | No |
| Compliance | Makes sure the organization follows regulatory requirements, primarily GLBA and SOX in this environment. Handles sensitive records and audit material. | Yes |
| Wealth Management | Client-facing. Manages financial planning and advisory services for the firm's clients, primarily private investors and high net worth individuals. Handles a large volume of sensitive client financial data. | Yes |
| Operations | Keeps day-to-day business running. Handles settlements and internal processes supporting the other departments. | No |
| Finance and Accounting | Manages the organization's own internal finances, separate from the client funds handled by Wealth Management. | Yes |

Compliance, Wealth Management, and Finance and Accounting are flagged as critical because they touch regulated data, client financial records, or the company's own financial systems.

Every department has its own folder in Active Directory, its own workstation, and its own group of users.

Come back to this table after every lab going forward. Every account and every alert you touch belongs to one of these five departments, and knowing which one is often the first step in figuring out whether something matters.

---

**Administrative Roles**

Access is divided into three levels rather than a single all-powerful admin account.

| Access Level | Controls | Cannot Touch |
| ----- | ----- | ----- |
| Level 1 (Domain Admin) | Controls the Domain Controller and Active Directory itself. Highest level of access in the environment. | Nothing above it |
| Level 2 (Server Admin) | Controls the servers, application and file servers. | The Domain Controller |
| Level 3 (Helpdesk) | Handles workstations only, password resets, and local support. | Servers or the Domain Controller |

This separation limits how far a compromise can spread. Any time you see an account from Level 3 attempting something that belongs to Level 1, that is your first real red flag.

---

**Data Categories Handled Across the Environment**

| Data Category | Examples | Primarily Handled By |
| :---- | :---- | :---- |
| Personal identifying information | Full name, date of birth, Social Security number, home address, phone number, email | Wealth Management, Compliance |
| Account and portfolio data | Account numbers, holdings, asset allocation, transaction history, balances | Wealth Management, Operations |
| Financial background | Income, net worth, source of funds, tax records | Wealth Management, Compliance |
| Estate and trust documentation | Wills, trust agreements, beneficiary designations, power of attorney records | Wealth Management |
| Retirement account details | 401k and IRA balances, contribution history, distribution schedules | Wealth Management |
| Advisory records | Investment strategy notes, risk tolerance assessments, meeting and communication logs | Wealth Management |
| Internal financial records | Company ledgers, payroll, internal budgets | Finance and Accounting |
| Regulatory and audit material | Compliance filings, audit trails, GLBA and SOX documentation | Compliance |
| System and access logs | Authentication logs, admin activity, account changes | IT |

---

**Who Wealth Management Serves**

Wealth Management is built around private clients rather than corporate accounts. Its book of business is meant to reflect a realistic advisory client base.

| Client Type | Description |
| ----- | ----- |
| Private investors | Individuals managing personal investment portfolios |
| High net worth individuals | Clients with multi-asset holdings across accounts |
| Trust and estate accounts | Accounts tied to trusts, wills, and estate planning |
| Retirement-focused clients | Clients nearing or already in retirement |

This client base is part of why Wealth Management sits on the critical list. The data involved is personal, financial, and exactly the kind of thing a real attacker would be after.

---

**Full User Directory**

Every user account in this environment, listed by department, with title, username, and group membership.

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

Nine users total. Each of them sits in exactly one standard access group, except Alex Rivera, who also holds elevated access through IT Admins.

---

**The Client Workstation**

| Item | Detail |
| :---- | :---- |
| Computer name | IT WKS01 |
| Assigned department | IT |
| Location | Workstations folder under IT |

---

**What Is Actually In This Environment**

For reference, here is what currently exists in the environment.

| Item | Count |
| :---- | :---- |
| Departments | 5 |
| Critical departments | 3 |
| Access levels | 3 |
| Security groups | 9 (5 standard, 1 elevated, 3 access level groups) |
| User accounts | 9 |
| Client workstations | 1 |

