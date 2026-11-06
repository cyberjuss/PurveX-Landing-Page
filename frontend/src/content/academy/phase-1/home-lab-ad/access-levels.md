<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>A Helpdesk login can reset a password. What should it never be able to touch?</p>
</div>

### Administrative Roles

PurveX splits admin access into three levels to limit how far a compromised login can reach.

| Access Level | Controls | Cannot Touch |
| ----- | ----- | ----- |
| Level 1 (Domain Admin) | Controls the Domain Controller and Active Directory itself. Highest level of access in the environment. | Nothing above it |
| Level 2 (Server Admin) | Controls the servers, application and file servers. | The Domain Controller |
| Level 3 (Helpdesk) | Handles workstations only, password resets, and local support. | Servers or the Domain Controller |

A Helpdesk login touching a server or the Domain Controller doesn't match this table. Start asking questions there.

```sort
prompt: Which access level controls each one?
Level 1 · Domain Admin: The Domain Controller | Active Directory itself
Level 2 · Server Admin: Application servers | File servers
Level 3 · Helpdesk: Workstations | Password resets | Local support
```
