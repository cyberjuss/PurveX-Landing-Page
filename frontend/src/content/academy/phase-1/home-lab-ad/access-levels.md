<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>A Helpdesk login can reset a password. What should it never be able to touch?</p>
</div>

### Administrative Roles

Rather than giving one account all the power, PurveX Financial splits administrative access into three levels. The point of the split is to limit how far a compromised login can reach.

| Access Level | Controls | Cannot Touch |
| ----- | ----- | ----- |
| Level 1 (Domain Admin) | Controls the Domain Controller and Active Directory itself. Highest level of access in the environment. | Nothing above it |
| Level 2 (Server Admin) | Controls the servers, application and file servers. | The Domain Controller |
| Level 3 (Helpdesk) | Handles workstations only, password resets, and local support. | Servers or the Domain Controller |

Reading the table from the bottom up, a Helpdesk login should never touch a server or the Domain Controller. So if you ever see one doing that, the activity doesn't match this table, and that mismatch is where your questions should start.

```sort
prompt: Requests are waiting. Which level should handle each one?
level: 2
Level 1 · Domain Admin: Promote a second domain controller | Change who sits in IT Admins
Level 2 · Server Admin: Restart the file server after patching | Install an update on the application server
Level 3 · Helpdesk: Unlock Riley's account | Rejoin a workstation to the domain
```
