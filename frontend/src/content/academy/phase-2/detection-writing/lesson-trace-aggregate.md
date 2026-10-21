### A: Aggregate
<!-- art: transform -->

Aggregate is where raw events turn into the one number a detection actually runs on. A table of a hundred failed sign-ins, one row per attempt, tells you nothing on its own. What matters is how those attempts group: how many hit each account, and over what span of time.

```
SigninLogs
| where TimeGenerated > ago(24h)
| where ResultType != "0"
| summarize FailedCount = count() by UserPrincipalName, bin(TimeGenerated, 1h)
```

`where ResultType != "0"` narrows the table to failed sign-ins only, since a `ResultType` of `0` means a successful one. `summarize count() by UserPrincipalName` is the KQL operator that does the actual collapsing: instead of one row per event, it produces one row per account, with a count of how many matching events that account had. Adding `bin(TimeGenerated, 1h)` to the `by` clause buckets those counts into one-hour windows, so the result is "failed attempts per account per hour" rather than one giant total for the whole 24-hour window, which would hide a burst that happened in a single hour.

That hourly shape matters because Password Spraying looks like a burst, not a steady trickle. An account with 40 failed sign-ins spread evenly across 24 hours might just be someone who forgot their password and kept guessing. An account with 40 failed sign-ins inside one hour looks like an attack. Aggregate is what makes that difference visible in the data instead of buried in it.
