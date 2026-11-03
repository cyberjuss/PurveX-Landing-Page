<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>What does a SOC analyst actually do that a help desk technician or system administrator does not?</p>
</div>

### Overview

Everything before this week built a baseline: what a correctly configured system looks like, what a normal authentication flow looks like, what a login record should contain. This week turns that baseline into a job. A SOC (Security Operations Center) analyst watches the environment and decides, alert by alert, whether what's happening still matches it.

That's harder than it sounds, because most of what reaches a SOC is noise: a patch triggers a file-scan alert, an employee logs in from a new laptop, a service account restarts after maintenance. None of that is an attack, and treating it all like one buries the handful of alerts a week that actually are.

This is the same judgment you'll use in every lab and challenge from here forward, including the ones built from your own hosted environment.

```order
prompt: Put these in the order a SOC alert actually moves through.
Something in the environment generates an alert
A Tier 1 analyst triages it against the baseline
A confirmed incident gets classified by severity
A Tier 2 analyst investigates scope and root cause
A Tier 3 analyst builds or tunes the detection that should have caught it sooner
```
