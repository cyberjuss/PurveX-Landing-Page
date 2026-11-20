### A: Aggregate
<!-- art: transform -->

Aggregate is the step where raw events become the single number a detection runs on. On its own, a table of a hundred failed logons, one row per attempt, tells you very little. What matters is how those attempts group together, meaning how many different accounts one source touched and over what span of time.

```
SecurityEvent
| where TimeGenerated > ago(24h)
| where EventID == 4625
| summarize TargetedAccounts = dcount(TargetUserName) by IpAddress, bin(TimeGenerated, 1h)
```

Let's take it a line at a time. `where EventID == 4625` narrows the table to failed logons only, since that's the exact event ID Windows writes for one. Next, `summarize dcount(TargetUserName) by IpAddress` does the actual collapsing. Instead of one row per event, it produces one row per source address, along with a count of the distinct accounts that source tried. Finally, adding `bin(TimeGenerated, 1h)` to the `by` clause sorts those counts into one-hour windows. That gives you distinct accounts touched per source per hour, rather than one big total for the whole 24 hours that would hide a burst inside a single hour.

The breadth matters because Password Spraying is defined by touching many accounts, not by hammering one. An account with 40 failed logons spread across 24 hours might just be someone who forgot their password. One source trying 40 different accounts in an hour, even once each, is spraying, and a plain count of failures per account would never surface it, since no single account would ever cross a per-account threshold. Aggregate is what brings that breadth to the surface instead of leaving it buried in the data.
