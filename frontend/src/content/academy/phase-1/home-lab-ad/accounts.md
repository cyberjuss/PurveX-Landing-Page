<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>You opened an account. How do you tell a person from a machine or a job?</p>
</div>

### User Accounts

A **user account** represents a person in the directory, and `jordan.ellis` is how you'd find Jordan Ellis. It's the object you'll open on most tickets: its folder tells you where the person lives, and its Member Of tab tells you what they can reach. Their title, on the other hand, is just a field on the account, so when a ticket names a person, check the folder and Member Of against The Environment tab rather than trusting the title.

### Computer Objects

Machines get accounts too. A **computer object** represents a machine in the same way a user account represents a person. In the baseline, `IT-WKS01` is the only client workstation, living under `OU=Workstations,OU=IT,OU=Departments`, and you read it the same way you read a person, folder first and then Member Of.

### Service Accounts

There's a third kind to know about. A **service account** is a user object that gives an identity to a job, such as a scheduled task, rather than to a person. This lab's is `svc-backup-job`, and because it isn't a person, it doesn't belong in a staff group. So if you find it in `IT Users`, that's leftover access, not someone who works in IT.
