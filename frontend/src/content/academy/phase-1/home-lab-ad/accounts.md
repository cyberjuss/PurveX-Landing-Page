<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>You opened an account. How do you tell a person from a machine or a job?</p>
</div>

### User Accounts

A **user account** represents a person, such as `jordan.ellis`. Its folder says where they live, its Member Of tab says what they can reach, and its title is only a field. When a ticket names a person, check both against The Environment tab.

### Computer Objects

A **computer object** represents a machine. `IT-WKS01` is the only client workstation, under `OU=Workstations,OU=IT,OU=Departments`. Read it the same way: folder, then Member Of.

### Service Accounts

A **service account** is a user object for a job, such as a scheduled task, not a person. `svc-backup-job` is this lab's. It doesn't belong in a staff group, so finding it in `IT Users` means leftover access.
