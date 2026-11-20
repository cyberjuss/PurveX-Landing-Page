<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>You opened an account. How do you tell a person from a machine or a job?</p>
</div>

### User Accounts

A **user account** represents a person in the directory, and `jordan.ellis` is how you'd find Jordan Ellis. It's the object you'll open on most tickets:

<ul>
<li><strong>Its folder</strong> tells you where the person lives</li>
<li><strong>Its Member Of tab</strong> tells you what they can reach</li>
<li><strong>Its title</strong> is just a field, and tells you nothing about access</li>
</ul>

So when a ticket names a person, check the folder and Member Of against The Environment tab rather than trusting the title.

### Computer Objects

Machines get accounts too. A **computer object** represents a machine in the same way a user account represents a person. In the baseline, `IT-WKS01` is the only client workstation, living under `OU=Workstations,OU=IT,OU=Departments`, and you read it the same way you read a person, folder first and then Member Of.

### Service Accounts

There's a third kind to know about. A **service account** is a user object that gives an identity to a job, such as a scheduled task, rather than to a person. This lab's is `svc-backup-job`, and because it isn't a person, it doesn't belong in a staff group. So if you find it in `IT Users`, that's leftover access, not someone who works in IT.

```sort
prompt: Person, machine or job? Sort each object you might open.
level: 1
Person: jordan.ellis | maya.okafor
Machine: IT-WKS01 | OPS-WKS03
Job: svc-settlements | An account that signs in at 2 AM to run a scheduled report
```
