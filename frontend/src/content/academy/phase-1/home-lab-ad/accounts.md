<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>You opened an account. How do you tell a person, a machine, and a job apart?</p>
</div>

### User Accounts

A **user account** is a person in this directory. Jordan Ellis is an account. `jordan.ellis` is how you find him.

The account is the object you open on a ticket. The folder tells you where that person lives. Member Of tells you what they can reach. Title is a field on the account not a group so Priya Nair can be a Help Desk Technician and still sit only in `IT Users`.

Nine people live in this domain and each one lives in exactly one department OU. Alex Rivera is the one to remember because he is the only person in two groups.

When a ticket names a person open the account and check both:

- The folders above it
- Member Of

If either one disagrees with The Environment tab stop.

### Computer Objects

A **computer object** is a machine in this directory the same way a user account is a person. `IT-WKS01` is the only client workstation in this lab and it lives under `OU=Workstations,OU=IT`.

You find it the same way you find a person. You read the folder then you read Member Of. The name has no spaces.

If a later ticket names a different workstation or this one sits under a different department that is already a finding. Confirm the folder before you treat the name as proof.

### Service Accounts

A **service account** is still a user object but it is not a person. It gives an identity to a job such as a scheduled task or an automated process so a login can happen with nobody at a keyboard.

`svc-backup-job` is the one in this lab. The name starts with `svc-` so you can tell it from `jordan.ellis` at a glance.

It does not belong in a staff group. If you find it in `IT Users` that is leftover access not a person who works in IT.

When you open an account check the name and the Description before you treat it like a person. A service account gets a written window and a written job. A person gets a department and a group.
