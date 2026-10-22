### KQL Basics
<!-- art: terminal -->

KQL (Kusto Query Language) is the language Microsoft Sentinel and Microsoft Defender both run their detection queries in. A KQL query starts from a table of raw events and narrows it down, one piped step at a time, until what is left is exactly the behavior you are trying to catch. Each step hands its output to the next with a pipe character, `|`, the same idea as chaining commands in PowerShell or a Linux shell.

A handful of operators cover almost everything a detection needs:

- **`where`** filters rows. `where ResultType != "0"` keeps only sign-ins that were not a clean success.
- **`summarize ... by ...`** collapses many rows into counts or other aggregates, grouped by whatever you name. `summarize count() by UserPrincipalName` gives one row per account, with how many matching events it had.
- **`bin(TimeGenerated, 1h)`** groups timestamps into fixed buckets, usually added inside a `summarize`. That turns "count per account" into "count per account per hour" instead of one giant total for the whole query window.
- **`order by`** sorts the result, usually by the count, so the worst offenders sit at the top.

Put together, a real query that counts failed sign-ins per account per hour looks like this:

```
SigninLogs
| where TimeGenerated > ago(24h)
| where ResultType != "0"
| summarize FailedCount = count() by UserPrincipalName, bin(TimeGenerated, 1h)
| order by FailedCount desc
```

Read it top to bottom the way KQL runs it: start from every sign-in log in the last 24 hours, keep only the ones that were not a success, count them per account per hour, and sort the worst first. Nothing about this query decides anything yet. It just produces a table. The next lesson adds the piece that turns a table into an actual alert.
