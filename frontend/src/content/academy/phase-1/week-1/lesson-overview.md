<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>What are we protecting when we call something "secure"?</p>
</div>

### Overview

Calling a system "secure" tells nobody anything they can act on, because security isn't one property a system either has or lacks. It's three separate jobs running at once, and when something goes wrong, it's always exactly one of the three that failed. Before you write a ticket or close an alert, your first task is naming which.

- **Confidentiality** fails as a **leak**: the data sits untouched, but the wrong person now holds a copy.
- **Integrity** fails as a **lie**: the data still looks ordinary, but it can no longer be trusted.
- **Availability** fails as a **lockout**: nothing leaked and nothing changed, but the work stopped.

Together these three are the CIA triad. Telling them apart matters because the response to each is different: a leaked password, a payroll figure that changed overnight, and a site that won't load are three distinct problems, escalated to different people and contained in different ways. Classify one wrongly and you spend your time chasing the wrong failure while the real one carries on.

### Naming Danger Before It Does Damage

This week also pins down three words the alert queue uses loosely, because an analyst who can't tell them apart ends up ranking work by how alarming it sounds instead of what it would actually cost the business:

- A **vulnerability** is a weakness.
- A **threat** is something or someone that could use it.
- **Risk** is the chance the two meet, and what it would cost.

By the end of the week you should be able to look at a failure and say which of the three jobs broke, and look at a danger and say whether it's a weakness, an actor, or the risk where the two meet.

```connect
prompt: Connect each word to what it means.
Vulnerability = A weakness
Threat = Something or someone that could use it
Risk = The chance the two meet, and what it would cost
```
