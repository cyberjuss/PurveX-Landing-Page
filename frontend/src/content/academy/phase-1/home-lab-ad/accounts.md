<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>You opened an account. How do you tell a person, a machine, and a job apart?</p>
</div>

### User Accounts

A **user account** is a person in this directory. Jordan Ellis is an account, and `jordan.ellis` is how you find him.

The account is the object you open on a ticket. Its folder tells you where the person lives, and its Member Of tab tells you what they can reach.

Title is a field on the account, not a group. That is how Priya Nair can be a Help Desk Technician and still sit only in `IT Users`.

Nine people live in this domain, each in exactly one department OU. Remember Alex Rivera, because he is the only person in two groups.

When a ticket names a person, open the account and check both of these:

- The folders above it
- Member Of

If either one disagrees with The Environment tab, stop.

### Computer Objects

A **computer object** is a machine in this directory, the same way a user account is a person. `IT-WKS01` is the only client workstation in this lab, and it lives under `OU=Workstations,OU=IT`.

You read a computer the same way you read a person: the folder first, then Member Of. Its name has no spaces.

### Service Accounts

A **service account** is a user object, but it is not a person. It gives an identity to a job, such as a scheduled task or an automated process, so a login can happen with nobody at a keyboard.

This lab has one: `svc-backup-job`. The `svc-` prefix lets you tell it from `jordan.ellis` at a glance.

A service account does not belong in a staff group. If you find it in `IT Users`, that is leftover access, not a person who works in IT.

Check the name and the Description before you treat an account like a person. A service account has a written job and a written time window. A person has a department and a group.
