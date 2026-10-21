### R: Reference
<!-- art: logs -->

Reference is where TRACE becomes actual KQL. Once you know the technique you are hunting, Reference answers two questions: which table holds the evidence, and how far back do you need to look to catch it. For Password Spraying, the evidence is failed sign-in attempts, and those live in the `SigninLogs` table.

```
SigninLogs
| where TimeGenerated > ago(24h)
```

`ago(24h)` sets the time window: everything from 24 hours before the query runs to now. A window that is too short misses an attack that unfolds slowly. A window that is too wide buries a real spike in a long, noisy average. Twenty-four hours is a reasonable starting point for a technique like Password Spraying, which produces a fast burst of activity, not a slow drip.

`where` is the KQL operator doing the filtering here. It keeps only the rows that match a condition, in this case the time window, and drops the rest before anything downstream has to process them. Scoping early like this, before aggregating or filtering further, is also what keeps a detection query fast against a table with millions of rows a day.
