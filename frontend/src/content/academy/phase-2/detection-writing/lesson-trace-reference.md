### R: Reference
<!-- art: logs -->

Reference is the point where TRACE turns into actual KQL. Once you know which technique you're hunting, Reference answers two questions: which table holds the evidence, and how far back you need to look to catch it. This lab's domain is on-prem Active Directory, not Azure AD, so a failed logon isn't a sign-in event at all: it's Windows Security event ID 4625, and events like it live in the `SecurityEvent` table.

```
SecurityEvent
| where TimeGenerated > ago(24h)
```

`ago(24h)` sets the time window, covering everything from 24 hours before the query runs up to now. Choosing that window takes some care. Too short, and you'll miss an attack that unfolds slowly. Too wide, and a real spike gets buried in a long, noisy average. Twenty-four hours is a reasonable starting point for Password Spraying, because it produces a fast burst of activity rather than a slow drip.

The filtering itself is done by `where`. It keeps only the rows that match a condition, in this case the time window, and drops everything else before later steps have to process it. Narrowing the data this early, before any aggregating or further filtering, is also what keeps a detection fast against a table that gains millions of rows a day.
