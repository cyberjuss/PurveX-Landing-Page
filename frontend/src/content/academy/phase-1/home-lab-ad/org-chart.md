### The Org Chart

Every organization has a structure, and understanding it is not a formality, it is the baseline against which every future alert gets judged. Here is the breakdown of the departments and what each one is for.

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
