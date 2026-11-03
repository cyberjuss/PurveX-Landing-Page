<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>What are we protecting when we call something "secure"?</p>
</div>

### Overview

"Secure" tells nobody anything they can act on. Security is three separate jobs, and when something breaks, exactly one of them failed. Your first move on any ticket is naming which.

- **Confidentiality** fails as a **leak**. The data is untouched, but the wrong person now has a copy.
- **Integrity** fails as a **lie**. The data looks normal but can no longer be trusted.
- **Availability** fails as a **lockout**. Nothing leaked, nothing changed, but the work stopped.

Together these are the CIA triad. A leaked password, a payroll figure that changed overnight, and a site that will not load are three different problems, escalated to different people and fixed in different ways. Name the wrong one and you chase the wrong failure while the real one keeps going.

### Naming Danger Before It Does Damage

Three more words do most of the work here, and this week pins them down because the alert queue uses them loosely:

- A **vulnerability** is a weakness.
- A **threat** is something or someone that could use it.
- **Risk** is the chance the two meet, and what it would cost.

An analyst who can't tell a weakness from an actor ranks work by how scary it sounds, not by what it would actually cost the business. By the end of the week you should be able to name which of the three jobs broke, and whether what's in front of you is a weakness, an actor, or the risk where they meet.

```connect
prompt: Connect each word to what it means.
Vulnerability = A weakness
Threat = Something or someone that could use it
Risk = The chance the two meet, and what it would cost
```
