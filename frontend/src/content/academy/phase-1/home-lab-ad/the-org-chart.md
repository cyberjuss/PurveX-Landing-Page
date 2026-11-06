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

The critical departments touch regulated data or the firm's own finances.

Active Directory mirrors this chart: each department has its own folder and group. When a ticket names a person, check that three things agree:

- Department on this chart
- Folder in the directory
- Group in the directory

If they disagree, stop and find out why before you change anything.

```sort
prompt: Which departments are marked critical?
Critical: Compliance | Wealth Management | Finance and Accounting
Not critical: IT | Operations
```

```match
prompt: Match each department to what it does.
IT = Runs and supports the company's technology
Compliance = Ensures the firm meets regulatory requirements, mainly GLBA and SOX
Wealth Management = Client-facing financial planning for private investors
Operations = Settlements and the internal processes behind the other departments
Finance and Accounting = The firm's own internal finances
```
