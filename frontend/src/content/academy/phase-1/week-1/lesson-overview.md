<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>What are we protecting when we call something "secure"?</p>
</div>

### Overview

People call systems "secure" all the time, but the word on its own doesn't tell you what to check or what to fix. That's because security isn't one property. It's three separate jobs running at once, and whenever something goes wrong, one of those three jobs has failed. So the first skill we'll build this week is naming which one.

The helpful thing is that each job fails in its own recognizable way:

- **Confidentiality** fails as a **leak**: someone who shouldn't have a copy of the data now has one.
- **Integrity** fails as a **lie**: the data still looks normal, but you can no longer trust what it says.
- **Availability** fails as a **lockout**: nothing leaked and nothing changed, yet people can't get their work done.

Together, these three are known as the CIA triad. Telling them apart matters because each failure goes to different people and gets contained in a different way. If you label one wrong, you'll spend your time chasing the wrong problem while the real one keeps going.

### Naming Danger Before It Does Damage

Alongside the triad, this week pins down three words that get used loosely in every alert queue:

- A **vulnerability** is a weakness.
- A **threat** is something or someone that could take advantage of it.
- **Risk** is the chance the two meet, and what it would cost if they did.

You'll see why the distinction matters as soon as you start ranking work. An analyst who mixes these words up tends to rank tickets by how frightening they sound, when what really matters is what each one would cost the business.

```connect
prompt: Connect each word to what it means.
level: 1
Vulnerability = A weakness
Threat = Something or someone that could use it
Risk = The chance the two meet, and what it would cost
```
