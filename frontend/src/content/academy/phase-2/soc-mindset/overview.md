<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>What does a SOC analyst do that a help desk technician or system administrator does not?</p>
</div>

### Overview

Everything in Phase 1 built you a baseline: what a correctly configured system looks like, what a normal sign-in looks like, and what a login record should contain. This module turns that baseline into a job. As a SOC (Security Operations Center) analyst, you watch the environment and decide, alert by alert, whether what's happening still matches that baseline.

That's harder than it sounds, because most of what reaches a SOC is noise. A patch triggers a file-scan alert, an employee logs in from a new laptop, or a service account restarts after maintenance. None of that is an attack, and if you treat all of it like one, you'll bury the handful of alerts each week that really are attacks.

Learning to tell the two apart is the judgment you'll use in every lab and challenge from here on, including the ones built from your own hosted environment.

```order
prompt: Put these in the order a SOC alert moves through.
Something in the environment generates an alert
A Tier 1 analyst triages it against the baseline
A confirmed incident gets classified by severity
A Tier 2 analyst investigates scope and root cause
A Tier 3 analyst builds or tunes the detection that should have caught it sooner
```
