<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>What are we protecting when we call something "secure"?</p>
</div>

### Overview

"Secure" on its own doesn't tell you what to check or fix. Security is three separate jobs, and when something goes wrong, one of them failed. Your first skill this week is naming which one.

Each fails in its own way:

- **Confidentiality** fails as a **leak**: someone who shouldn't have a copy now has one.
- **Integrity** fails as a **lie**: the data looks normal, but you can't trust it.
- **Availability** fails as a **lockout**: nothing leaked or changed, but people can't work.

Together, these are the CIA triad. Each failure goes to different people and gets contained differently, so a wrong label means chasing the wrong problem while the real one keeps going.

### Naming Danger Before It Does Damage

Three more words get used loosely in every alert queue:

- A **vulnerability** is a weakness.
- A **threat** is something or someone that could use it.
- **Risk** is the chance the two meet, and what it would cost.

Mix them up and you'll rank work by how scary it sounds instead of what it would cost.

```connect
prompt: Connect each word to what it means.
Vulnerability = A weakness
Threat = Something or someone that could use it
Risk = The chance the two meet, and what it would cost
```
