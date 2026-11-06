<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>You opened an account. How do you tell a person from a machine or a job?</p>
</div>

### User Accounts

A **user account** represents a person in this directory. Jordan Ellis is an account, for example, and `jordan.ellis` is how you find him.

That account is the object you'll open when you work a ticket. Its folder tells you where the person lives, and its Member Of tab tells you what they can reach.

Their title, on the other hand, is a field on the account, not a group. That's how Priya Nair can be a Help Desk Technician and still not be in `Helpdesk`.

Nine people live in this domain, each in exactly one department OU. Of those, remember Alex Rivera, because he's the only person with an elevated group.

So when a ticket names a person, open their account and check both of these:

- The folders above it
- Member Of

If either one disagrees with The Environment tab, stop and find out why before you change anything.

### Computer Objects

Machines get accounts too. A **computer object** represents a machine in the directory, in the same way a user account represents a person. In the baseline, `IT-WKS01` is the only client workstation, and it lives under `OU=Workstations,OU=IT,OU=Departments`.

Conveniently, you read a computer the same way you read a person: check the folder first, then Member Of.

### Service Accounts

There's a third kind of account to know about. A **service account** is a user object, but it doesn't represent a person. Instead, it gives an identity to a job, such as a scheduled task, so that a login can happen with nobody at a keyboard.

This lab has one, `svc-backup-job`, and its `svc-` prefix lets you tell it apart from `jordan.ellis` at a glance.

Because it isn't a person, a service account doesn't belong in a staff group. So if you find it in `IT Users`, that's leftover access, not someone who works in IT.

That's why it pays to check the name and the Description before you treat an account like a person. A service account has a written job and a written time window, whereas a person has a department and a group.
