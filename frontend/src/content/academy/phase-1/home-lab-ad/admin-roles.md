### Administrative Roles

Access here is deliberately divided into three levels rather than concentrated in a single all-powerful admin account, and that separation is itself a security control worth understanding on its own terms. By the end of this tab, you'll know what each level should and shouldn't be able to touch.

| Access Level | Controls | Cannot Touch |
| ----- | ----- | ----- |
| Level 1 (Domain Admin) | Controls the Domain Controller and Active Directory itself. Highest level of access in the environment. | Nothing above it |
| Level 2 (Server Admin) | Controls the servers, application and file servers. | The Domain Controller |
| Level 3 (Helpdesk) | Handles workstations only, password resets, and local support. | Servers or the Domain Controller |

This separation limits how far a compromise can spread.

<div class="academy-thinklike">
<span class="academy-thinklike__tag">Think Like an Analyst</span>
<p>Any time you see an account from Level 3 attempting something that belongs to Level 1, that's your first real red flag, no log analysis required yet.</p>
</div>
