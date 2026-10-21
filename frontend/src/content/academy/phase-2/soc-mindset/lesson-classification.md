### Classifying an Incident

Confirming that something is actually wrong is only half the job. The other half is deciding how urgently it needs to be worked, and that decision has a name: severity classification. Get it wrong in one direction and a real breach sits in the queue behind routine tickets. Get it wrong in the other direction and every alert becomes a fire drill, which trains the team to stop trusting the word "critical."

You already have a working version of this scale. In your own Shift console, every incident carries a severity of P1, P2, or P3, and the console is explicit about what each means: P1 is critical and gets worked first, P2 is high and comes after any open P1, and P3 is routine and gets worked when the queue allows. That three-tier scale is not unique to this course. Most SOCs run some version of it, because urgency only needs enough resolution to answer one question: what gets worked next.

The formal standard behind this is NIST SP 800-61, the federal government's incident-handling guidance, most recently revised as SP 800-61 Revision 3 in 2025. Revision 3 reframes incident response around the six functions of the NIST Cybersecurity Framework 2.0 rather than handing down one fixed severity table, which means the exact scale is left for your organization to define, the same way your Shift console defines its own P1 through P3. What NIST does insist on, across every revision, is that severity gets judged by impact: how many systems or users are affected, how critical those systems are, and how reversible the damage is, not by how alarming the alert's wording sounds.

That last point is worth sitting with. A queue full of alerts is full of language built to sound urgent. An analyst who ranks a queue by how frightening each alert reads, instead of what it would actually cost the business if left unworked, is doing the opposite of this lesson. Classify by impact. Let the label follow the impact, not the other way around.

```sort
prompt: Sort each incident by the severity it would most likely get.
P1 — Critical: Ransomware actively encrypting a file server | Confirmed domain admin account compromise
P2 — High: A phishing email reported before anyone clicked it was clicked by one user | Malware found on a single workstation, contained before it spread
P3 — Routine: A password reset request outside normal hours with no other red flags | A vulnerability scan flags an out-of-date but unexploited plugin
```

<details class="academy-deeper">
<summary>From the field</summary>

[Add your own experience here: the actual severity scale your organization uses, a time a P3 turned out to be a P1 (or the reverse), or your own rule of thumb for classifying under pressure.]

</details>
