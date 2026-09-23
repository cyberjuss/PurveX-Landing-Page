### Administrative Roles

Access is split into three levels rather than concentrated in one all-powerful account, which limits how far a compromised login can reach. By the end of this tab, you'll know what each level should and shouldn't touch.

| Access Level | Controls | Cannot Touch |
| ----- | ----- | ----- |
| Level 1 (Domain Admin) | Controls the Domain Controller and Active Directory itself. Highest level of access in the environment. | Nothing above it |
| Level 2 (Server Admin) | Controls the servers, application and file servers. | The Domain Controller |
| Level 3 (Helpdesk) | Handles workstations only, password resets, and local support. | Servers or the Domain Controller |

<div class="academy-thinklike">
<span class="academy-thinklike__tag">Think Like an Analyst</span>
<p>A Level 3 account attempting a Level 1 task is a red flag, no log analysis required to know that.</p>
</div>
