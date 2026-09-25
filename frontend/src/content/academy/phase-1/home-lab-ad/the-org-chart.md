<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>A ticket names a person. Which three things have to agree before you change anything?</p>
</div>

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
