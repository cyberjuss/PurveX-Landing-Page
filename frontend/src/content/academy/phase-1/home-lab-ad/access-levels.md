<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>A Helpdesk login can reset a password. What should it never be able to touch?</p>
</div>

### Administrative Roles

Access is split into three levels rather than concentrated in one all-powerful account. That limits how far a compromised login can reach.

| Access Level | Controls | Cannot Touch |
| ----- | ----- | ----- |
| Level 1 (Domain Admin) | Controls the Domain Controller and Active Directory itself. Highest level of access in the environment. | Nothing above it |
| Level 2 (Server Admin) | Controls the servers, application and file servers. | The Domain Controller |
| Level 3 (Helpdesk) | Handles workstations only, password resets, and local support. | Servers or the Domain Controller |

A Helpdesk login should not touch servers or the Domain Controller. If it does that does not match this table and that is the first question you ask.
