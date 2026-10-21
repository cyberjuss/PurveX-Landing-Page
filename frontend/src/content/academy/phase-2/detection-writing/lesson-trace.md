### The TRACE Method

A query that produces a table is not yet a detection. A detection needs to name what it is hunting for, scope itself to the right data, count the right thing, decide at what point that count becomes worth someone's attention, and say what happens when it fires. **TRACE** is a five-part way to build that, in order, using nothing this phase has not already taught you.

- **T — Technique.** Name the ATT&CK technique you are trying to catch, before writing a line of KQL. This is Week 2's lesson put to work: know whether you are hunting Password Spraying (T1110.003), Kerberoasting (T1558.003), or something else, because the technique decides which table and which fields matter.
- **R — Reference.** Scope the query to the right table and time window. This is the `SigninLogs` / `ago(24h)` part: where does this technique actually show up, and how far back do you need to look to catch it.
- **A — Aggregate.** Count the right thing, grouped the right way. `summarize count() by UserPrincipalName, bin(TimeGenerated, 1h)` turns raw events into the number you actually care about.
- **C — Condition.** Apply last week's threshold. `where FailedCount > 5` is the line where "interesting" becomes "alert-worthy," set against your own environment's baseline, not a borrowed number.
- **E — Escalation.** Decide what happens when it fires: what severity it gets (this phase's P1, P2, or P3), and who or what it notifies.

Here is a full detection for Password Spraying, T1110.003, built by walking through all five letters in order:

```
let threshold = 5;
SigninLogs
| where TimeGenerated > ago(24h)
| where ResultType != "0"
| summarize FailedCount = count() by UserPrincipalName, bin(TimeGenerated, 1h)
| where FailedCount > threshold
| order by FailedCount desc
```

The `let threshold = 5;` line and the final `where FailedCount > threshold` are Condition. The `SigninLogs` table and the `ago(24h)` window are Reference. The `summarize` line is Aggregate. Technique and Escalation are not KQL at all. Technique is the decision you made before writing anything, that this query hunts Password Spraying. Escalation is the decision you make after, that this fires as a P2 (Week 1's scale, High, worked after any open P1) and routes to the SOC queue the same way the Shift incident built from this exact technique already does.

```order
prompt: Put these TRACE steps in the order you would actually build this detection.
Technique: decide this query hunts Password Spraying, T1110.003
Reference: scope it to SigninLogs over the last 24 hours
Aggregate: count failed sign-ins per account per hour
Condition: set the threshold, where FailedCount > 5
Escalation: fire as a P2 and route it to the SOC queue
```

<details class="academy-deeper">
<summary>From the field</summary>

[Add your own experience here: a real detection you'd walk through TRACE-style, or a case where getting the Condition step wrong (too loose or too strict) caused a real problem.]

</details>
