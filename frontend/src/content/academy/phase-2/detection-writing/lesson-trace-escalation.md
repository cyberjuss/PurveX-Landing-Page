### E: Escalation
<!-- art: ticket -->

Escalation is what happens the moment a detection fires, and it is not KQL at all, the same way Technique was not. A detection firing is the start of the work, not the end of it. This last step of TRACE decides the severity the alert gets and who or what it notifies, using the same P1, P2, P3 scale Week 1 taught for classifying any incident.

For Password Spraying specifically, that means routing the alert as a P2, High, worked after any open P1, the same way the Shift incident built from this exact technique already does in your own queue. An attack in progress against a real account is not routine, so it does not wait for P3-level attention, but it is also not an active breach with confirmed access, so it does not outrank a P1 already in front of you.

Here is the full detection, built by walking through all five TRACE letters in order:

```
let threshold = 5;
SigninLogs
| where TimeGenerated > ago(24h)
| where ResultType != "0"
| summarize FailedCount = count() by UserPrincipalName, bin(TimeGenerated, 1h)
| where FailedCount > threshold
| order by FailedCount desc
```

Every line traces back to a letter. `let threshold = 5;` and the final `where FailedCount > threshold` are Condition. `SigninLogs` and `ago(24h)` are Reference. The `summarize` line is Aggregate. `order by FailedCount desc` sorts the worst offenders to the top, so whoever works this queue sees the most severe case first. Technique and Escalation never appear in the query text at all. Technique is the decision made before writing it, that this hunts Password Spraying. Escalation is the decision made after, that this fires as a P2 and routes to the SOC queue.

This query is this course's own construction for teaching TRACE, built from Microsoft's documented KQL operators. It has not been run against a live Sentinel workspace, so verify its syntax against your own tenant before using it for real.

```order
prompt: Put these TRACE steps in the order you would actually build this detection.
Technique: decide this query hunts Password Spraying, T1110.003
Reference: scope it to SigninLogs over the last 24 hours
Aggregate: count failed sign-ins per account per hour
Condition: set the threshold, where FailedCount > 5
Escalation: fire as a P2 and route it to the SOC queue
```
