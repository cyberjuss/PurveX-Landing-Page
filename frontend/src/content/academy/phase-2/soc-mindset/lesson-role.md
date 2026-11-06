### What a SOC Analyst Actually Does

A SOC runs around the clock. It watches a stream of alerts from the firewalls, the endpoint tools and the authentication logs, and from the SIEM (Security Information and Event Management system) that ties them together. Phase 1 started you on the help desk, fixing what a user reported, and then moved you behind a system administrator's desk, configuring and maintaining what the firm runs. This job is different from both. Here, you're not building the Kerberos sign-in flow or the file share permissions. Instead, you're watching them run, and deciding dozens of times a shift whether what you're looking at still matches how they're supposed to run. That's why this phase comes after Active Directory and authentication rather than before them: you can't recognize an abnormal ticket request if you've never seen a normal one issued.

Most SOCs split that watching between three tiers:

- **Tier 1** works the incoming queue in real time, triaging alerts and deciding what closes as benign and what escalates. It is usually the first SOC seat someone lands in, the direct next step from help desk or sysadmin work.
- **Tier 2** takes an escalation and goes deeper. It scopes what the account or host touched across the network.
- **Tier 3** does not wait for the queue at all. It hunts for attacker behavior nothing has flagged yet. When it finds a gap, it builds the detection that should have caught it.

It's worth knowing that the tiers aren't separated by how much someone knows. A good Tier 1 analyst and a Tier 3 analyst are often using the same investigation mindset this module teaches. What changes is the scope. Tier 1 asks whether the alert in front of them makes sense. Tier 3 asks what pattern across the whole environment nobody has built a detection for yet.

```sort
prompt: Sort each task by the tier that typically owns it.
Tier 1: Triage the incoming alert queue | Close an alert as a false positive | Escalate a confirmed suspicious alert
Tier 2: Scope what an account or host touched | Determine the root cause of an escalated alert | Coordinate the response to a confirmed incident
Tier 3: Hunt for attacker behavior no alert has flagged | Build or tune a detection rule | Run an in-depth security assessment
```
