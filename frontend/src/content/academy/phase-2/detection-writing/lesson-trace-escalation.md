### E: Escalation
<!-- art: ticket -->

Escalation covers what happens the moment a detection fires. Like Technique, it isn't KQL at all, and it's there because a detection firing is the start of the work rather than the end of it. This last step of TRACE decides what severity the alert gets and who or what it notifies. It uses the same P1, P2 and P3 scale you learned in SOC Mindset.

For Password Spraying, that means routing the alert as a P2, High, so it's worked after any open P1. That's how the Shift incident built from this technique already sits in your own queue. The reasoning runs both ways. An attack in progress against real accounts isn't routine, so it shouldn't wait for P3-level attention. But it isn't yet a breach with confirmed access either, so it shouldn't outrank a P1 that's already in front of you.

Here's the full detection, built by working through all five TRACE letters in order:

```
let threshold = 5;
SecurityEvent
| where TimeGenerated > ago(24h)
| where EventID == 4625
| summarize TargetedAccounts = dcount(TargetUserName) by IpAddress, bin(TimeGenerated, 1h)
| where TargetedAccounts > threshold
| order by TargetedAccounts desc
```

As you read it, notice that every line traces back to one of the letters:

- `let threshold = 5;` and the final `where TargetedAccounts > threshold` are Condition.
- `SecurityEvent` and `ago(24h)` are Reference.
- The `summarize` line is Aggregate.
- `order by TargetedAccounts desc` sorts the worst offenders to the top, so whoever works this queue sees the most severe case first.
- Technique and Escalation never appear in the query text at all. Technique is the decision made before writing it, that this hunts Password Spraying. Escalation is the decision made after, that this fires as a P2 and routes to the SOC queue.

One word of caution before you use it anywhere real. This course built the query to teach TRACE, using Microsoft's documented KQL operators, but it hasn't been run against a live Sentinel workspace. Check its syntax against your own tenant first.

```order
prompt: Put these TRACE steps in the order you would build this detection.
Technique: decide this query hunts Password Spraying, T1110.003
Reference: scope it to SecurityEvent over the last 24 hours
Aggregate: count distinct accounts touched per source per hour
Condition: set the threshold, where TargetedAccounts > 5
Escalation: fire as a P2 and route it to the SOC queue
```
