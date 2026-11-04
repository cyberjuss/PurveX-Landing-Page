<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>What are we protecting when we call something "secure"?</p>
</div>

### Overview

People call systems "secure" all the time, but the word on its own doesn't tell you what to check or what to fix. That's because security isn't a single property a system has or lacks. It's three separate jobs running at the same time, and when something goes wrong, it's one of those three that failed. So before you write up a ticket or close an alert, the first thing you'll learn to do is name which job broke.

Each of the three fails in its own recognizable way:

- **Confidentiality** fails as a **leak**: the data hasn't moved, but someone who shouldn't have a copy now has one.
- **Integrity** fails as a **lie**: the data still looks normal, but you can no longer trust what it says.
- **Availability** fails as a **lockout**: nothing leaked and nothing changed, yet people can't get their work done.

Together these are called the CIA triad. The reason it's worth telling them apart is that each one gets handled differently. A leaked password, a payroll figure that quietly changed overnight, and a website that won't load are three different problems. They go to different people and get contained in different ways, so if you label one wrong, you'll spend your time chasing the wrong failure while the real one keeps going.

### Naming Danger Before It Does Damage

This week also gives you three words that get used loosely in every alert queue. It's worth pinning them down now, because an analyst who mixes them up ends up ranking work by how scary it sounds rather than by what it would actually cost the business:

- A **vulnerability** is a weakness.
- A **threat** is something or someone that could take advantage of it.
- **Risk** is the chance the two meet, and what it would cost if they did.

By the end of the week, you should be able to look at any failure and say which of the three jobs broke. You should also be able to look at any danger and say whether it's a weakness, an actor, or the risk where the two come together.

```connect
prompt: Connect each word to what it means.
Vulnerability = A weakness
Threat = Something or someone that could use it
Risk = The chance the two meet, and what it would cost
```
