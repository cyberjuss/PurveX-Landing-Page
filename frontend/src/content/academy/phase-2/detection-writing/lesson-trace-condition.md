### C: Condition
<!-- art: gauge -->

Condition is the line where a count becomes an alert. Aggregate hands you a number, distinct accounts touched per source per hour, but a number on its own isn't a decision yet. Condition supplies the decision. It's the `where` clause that says how high that number has to climb before it deserves a person's attention.

```
let threshold = 5;
SecurityEvent
| where TimeGenerated > ago(24h)
| where EventID == 4625
| summarize TargetedAccounts = dcount(TargetUserName) by IpAddress, bin(TimeGenerated, 1h)
| where TargetedAccounts > threshold
```

At the top of the query, `let threshold = 5;` defines a named constant. That way the number appears only once, and the logic below it reads cleanly as `where TargetedAccounts > threshold`. KQL's `let` statement requires that trailing semicolon, and once a name is defined, you can reuse it anywhere later in the same query.

This is where the thresholds lesson pays off. Five distinct accounts touched by one source in an hour isn't a number to borrow from a blog post or another company's dashboard. It's a judgment you make against your own environment's baseline. Ask how many different accounts a real source on your network, a shared kiosk, a help-desk workstation, normally touches in an hour. If you set the threshold too low, the detection fires on ordinary traffic until nobody trusts it. If you set it too high, an attacker fits comfortably underneath it.
