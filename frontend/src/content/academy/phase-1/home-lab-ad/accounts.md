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

Machines get accounts too. A **computer object** represents a machine in the same way a user account represents a person. In the baseline, `IT-WKS01` is the only client workstation and lives under `OU=Workstations,OU=IT,OU=Departments`. Read it the same way you read a person: folder first, then Member Of.

### Service Accounts

There's a third kind to know about. A **service account** is a user object that gives an identity to a job, such as a scheduled task, rather than to a person:

<ul>
<li>This lab's is <code>svc-backup-job</code></li>
<li>It isn't a person, so it doesn't belong in a staff group</li>
<li>If you find it in <code>IT Users</code>, that's leftover access, not someone who works in IT</li>
</ul>

```sort
prompt: Person, machine or job? Sort each object you might open.
level: 1
Person: jordan.ellis | maya.okafor
Machine: IT-WKS01 | OPS-WKS03
Job: svc-settlements | An account that signs in at 2 AM to run a scheduled report
```
