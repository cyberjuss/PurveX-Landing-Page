### KQL Basics
<!-- art: terminal -->

KQL (Kusto Query Language) is the language Microsoft Sentinel and Microsoft Defender both use for their detection queries. A KQL query starts from a table of raw events and narrows it down one step at a time, until all that's left is the behavior you're trying to catch. Each step passes its output to the next with a pipe character, `|`, which works just like chaining commands in PowerShell or a Linux shell.

You don't need many operators to get started. A handful of them cover almost everything a detection needs:

- **`where`** filters rows. `where EventID == 4625` keeps only failed logons, since that's the exact event ID Windows writes for one.
- **`summarize ... by ...`** collapses many rows into counts or other aggregates, grouped by whatever you name. `summarize dcount(TargetUserName) by IpAddress` gives one row per source address, with how many distinct accounts it tried.
- **`bin(TimeGenerated, 1h)`** groups timestamps into fixed buckets, usually added inside a `summarize`. That turns "accounts touched per source" into "accounts touched per source per hour" instead of one giant total for the whole query window.
- **`order by`** sorts the result, usually by the count, so the worst offenders sit at the top.

When you put them together, a real query that counts the distinct accounts each source targeted per hour looks like this:

```
SecurityEvent
| where TimeGenerated > ago(24h)
| where EventID == 4625
| summarize TargetedAccounts = dcount(TargetUserName) by IpAddress, bin(TimeGenerated, 1h)
| order by TargetedAccounts desc
```

Read it from top to bottom, which is the order KQL runs it in:

1. Start from every Windows Security event in the last 24 hours.
2. Keep only the failed logons, event 4625.
3. Count the distinct accounts each source touched, per hour.
4. Sort the worst first.

Notice that this query doesn't decide anything yet. All it does is produce a table, and the next lesson adds the piece that turns that table into an actual alert.
