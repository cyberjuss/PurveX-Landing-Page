<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>What does a SOC analyst actually do that a help desk technician or system administrator does not?</p>
</div>

### Overview

Everything before this week built a baseline. You learned what a system looks like when it is configured correctly, what a normal authentication flow looks like, and what a login record is supposed to contain. This week turns that baseline into a job. A SOC (Security Operations Center) analyst watches the environment you now understand and decides, alert by alert, whether what is happening still matches it.

That decision is harder than it sounds, because most of what reaches a SOC is noise. A patch triggers a file-scan alert. An employee logs in from a new laptop. A service account restarts after maintenance. None of that is an attack, and treating all of it like one buries the handful of alerts a week that actually are. This week covers the structure that keeps that triage honest, question by question, below.

None of this is abstract theory you will set aside once the quiz is over. It is the same judgment you will use in every lab and challenge from here forward, including the ones built from your own hosted environment.

```order
prompt: Put these in the order a SOC alert actually moves through.
Something in the environment generates an alert
A Tier 1 analyst triages it against the baseline
A confirmed incident gets classified by severity
A Tier 2 analyst investigates scope and root cause
A Tier 3 analyst builds or tunes the detection that should have caught it sooner
```

### Questions Answered in This Week

- What does a SOC analyst actually do, and how does the tier structure divide that work?
- How is AI changing what a Tier 1, 2, or 3 analyst spends a shift doing?
- What is the investigation mindset, and why does it start from doubt instead of the alert's own label?
- What are the 5 W's, and how do they turn a vague alert into a documented account?
- How does an incident get classified once it is confirmed real?
- What is the difference between allowlisting and blocklisting, and why does the default posture matter more than the list itself?
