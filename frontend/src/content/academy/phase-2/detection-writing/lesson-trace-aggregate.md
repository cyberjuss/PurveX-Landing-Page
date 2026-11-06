### A: Aggregate
<!-- art: transform -->

Aggregate is the step where raw events become the single number a detection runs on. On its own, a table of a hundred failed sign-ins, one row per attempt, tells you very little. What matters is how those attempts group together, meaning how many hit each account and over what span of time.

```
SigninLogs
| where TimeGenerated > ago(24h)
| where ResultType != "0"
| summarize FailedCount = count() by UserPrincipalName, bin(TimeGenerated, 1h)
```

Let's take it a line at a time. `where ResultType != "0"` narrows the table to failed sign-ins only, since a `ResultType` of `0` means a successful one. Next, `summarize count() by UserPrincipalName` does the actual collapsing. Instead of one row per event, it produces one row per account, along with a count of that account's matching events. Finally, adding `bin(TimeGenerated, 1h)` to the `by` clause sorts those counts into one-hour windows. That gives you failed attempts per account per hour, rather than one big total for the whole 24 hours that would hide a burst inside a single hour.

The hourly shape matters because Password Spraying arrives as a burst rather than a steady trickle. If an account has 40 failed sign-ins spread evenly across 24 hours, it might be someone who forgot their password and kept trying. The same 40 failures inside one hour look much more like an attack. Aggregate is what brings that difference to the surface instead of leaving it buried in the data.
