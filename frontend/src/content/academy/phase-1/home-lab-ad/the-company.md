### The Company

This tab is the org chart you check a ticket against. Departments, access levels, the data each one handles, and the clients Wealth Management serves.

Your job is to place any account in its department, know what its access level should and should not touch, and size the stakes when something looks off. Do not memorize the tables. Use them when a ticket names a person.

### The Org Chart

| Department | Function | Critical |
| ----- | ----- | ----- |
| IT | Runs and supports the company's technology, managing accounts, workstations, and infrastructure. The only department with elevated access, because it administers the systems. | No |
| Compliance | Ensures the organization follows regulatory requirements, mainly GLBA and SOX, and handles sensitive records and audit material. | Yes |
| Wealth Management | Client-facing. Manages financial planning and advisory services, mainly for private investors and high-net-worth individuals, and handles a large volume of sensitive client financial data. | Yes |
| Operations | Keeps day-to-day business running, handling settlements and internal processes that support the other departments. | No |
| Finance and Accounting | Manages the organization's own internal finances, separate from the client funds Wealth Management handles. | Yes |

Compliance, Wealth Management, and Finance and Accounting are flagged critical because they touch regulated data, client financial records, or the company's own financial systems.

Every department has its own folder in Active Directory and its own group of users. When a ticket names a person check three things:

- Department on this chart
- Folder in the directory
- Group in the directory

If those three disagree stop. The chart is the baseline and the directory is what is true right now.

### Administrative Roles

Access is split into three levels rather than concentrated in one all-powerful account. That limits how far a compromised login can reach.

| Access Level | Controls | Cannot Touch |
| ----- | ----- | ----- |
| Level 1 (Domain Admin) | Controls the Domain Controller and Active Directory itself. Highest level of access in the environment. | Nothing above it |
| Level 2 (Server Admin) | Controls the servers, application and file servers. | The Domain Controller |
| Level 3 (Helpdesk) | Handles workstations only, password resets, and local support. | Servers or the Domain Controller |

A Helpdesk login should not touch servers or the Domain Controller. If it does that does not match this table and that is the first question you ask.

### Data Categories

Knowing what data lives where changes the ticket. "An account was accessed" becomes "an account was accessed and here is what was at risk."

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

Ask which row is in play before you decide how urgent the ticket is. A group change in Wealth Management is not the same problem as the same change in Operations.

### Who Wealth Management Serves

Wealth Management serves private clients rather than corporate accounts. Its book of business is meant to look like a real advisory client base.

| Client Type | Description |
| ----- | ----- |
| Private investors | Individuals managing personal investment portfolios |
| High net worth individuals | Clients with multi-asset holdings across accounts |
| Trust and estate accounts | Accounts tied to trusts, wills, and estate planning |
| Retirement-focused clients | Clients nearing or already in retirement |

That client base is why Wealth Management sits on the critical list. A login or group change there is not the same problem as the same event in Operations so size it against this table rather than how loud the ticket sounds.
