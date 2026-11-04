### C: Condition
<!-- art: gauge -->

Condition is the line where a count becomes an alert. Aggregate hands you a number, failed sign-ins per account per hour, but a number on its own isn't a decision yet. Condition supplies the decision. It's the `where` clause that says how high that number has to climb before it deserves a person's attention.

```
let threshold = 5;
SigninLogs
| where TimeGenerated > ago(24h)
| where ResultType != "0"
| summarize FailedCount = count() by UserPrincipalName, bin(TimeGenerated, 1h)
| where FailedCount > threshold
```

At the top of the query, `let threshold = 5;` defines a named constant. That way the number appears only once, and the logic below it reads cleanly as `where FailedCount > threshold`. KQL's `let` statement requires that trailing semicolon, and once a name is defined, you can reuse it anywhere later in the same query.

This is where last week's lesson on thresholds pays off. Five failed sign-ins in an hour isn't a number to borrow from a blog post or another company's dashboard. It's a judgment you make against your own environment's baseline, based on how many failed sign-ins a real employee in your directory normally produces in an hour by mistyping a password or two. If you set the threshold too low, the detection fires on ordinary typos until nobody trusts it. If you set it too high, an attacker fits comfortably underneath it.
