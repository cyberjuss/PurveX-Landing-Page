### C: Condition
<!-- art: gauge -->

Condition is the line where a count becomes an alert. Aggregate hands you a number, failed sign-ins per account per hour, but a number by itself is not yet a decision. Condition is the `where` clause that says how high that number has to climb before it is worth a human's attention.

```
let threshold = 5;
SigninLogs
| where TimeGenerated > ago(24h)
| where ResultType != "0"
| summarize FailedCount = count() by UserPrincipalName, bin(TimeGenerated, 1h)
| where FailedCount > threshold
```

`let threshold = 5;` defines a named constant at the top of the query, so the number appears once and the logic below reads cleanly: `where FailedCount > threshold`. KQL's `let` statement requires that trailing semicolon, and the name it defines can be reused anywhere later in the same query.

Last week's lesson on setting thresholds for detections is what this condition actually runs on. Five failed sign-ins in an hour is not a number to borrow from a blog post or another company's dashboard. It is a judgment made against your own environment's baseline: how many failed sign-ins a real employee in your directory normally produces in an hour, mistyping a password or two. Set the threshold too low, and a detection fires on ordinary typos until nobody trusts it. Set it too high, and an attacker fits comfortably underneath it.

<details class="academy-deeper">
<summary>From the field</summary>

[Add your own experience here: a threshold you set too tight or too loose, and what you learned adjusting it against real traffic.]

</details>
