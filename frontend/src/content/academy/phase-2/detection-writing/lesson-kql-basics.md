### KQL Basics
<!-- art: terminal -->

KQL (Kusto Query Language) is the language Microsoft Sentinel and Microsoft Defender both use for their detection queries. A KQL query starts from a table of raw events and narrows it down one step at a time, until all that's left is the behavior you're trying to catch. Each step passes its output to the next with a pipe character, `|`, which works just like chaining commands in PowerShell or a Linux shell.

You don't need many operators to get started. A handful of them cover almost everything a detection needs:

- **`where`** filters rows. `where ResultType != "0"` keeps only sign-ins that were not a clean success.
- **`summarize ... by ...`** collapses many rows into counts or other aggregates, grouped by whatever you name. `summarize count() by UserPrincipalName` gives one row per account, with how many matching events it had.
- **`bin(TimeGenerated, 1h)`** groups timestamps into fixed buckets, usually added inside a `summarize`. That turns "count per account" into "count per account per hour" instead of one giant total for the whole query window.
- **`order by`** sorts the result, usually by the count, so the worst offenders sit at the top.

When you put them together, a real query that counts failed sign-ins per account per hour looks like this:

```
SigninLogs
| where TimeGenerated > ago(24h)
| where ResultType != "0"
| summarize FailedCount = count() by UserPrincipalName, bin(TimeGenerated, 1h)
| order by FailedCount desc
```

Read it from top to bottom, which is the order KQL runs it in:

1. Start from every sign-in log in the last 24 hours.
2. Keep only the ones that were not a success.
3. Count them per account per hour.
4. Sort the worst first.

Notice that this query doesn't decide anything yet. All it does is produce a table, and the next lesson adds the piece that turns that table into an actual alert.
