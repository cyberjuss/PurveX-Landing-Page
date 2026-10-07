<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>What are we protecting when we call something "secure"?</p>
</div>

### Introduction

Calling a system secure tells the people around you almost nothing they can act on. Security is not a single property that a system either has or lacks. It is three separate jobs running at once, and when something goes wrong it is one of those three that has failed. Before you write a ticket or close an alert, your first task is to name which one.

The three jobs are keeping information private, keeping it accurate, and keeping it available to the people who need it. Each one fails in its own way:

- **Confidentiality** fails as a **leak**. The data sits where it always did, but somebody now holds a copy who should not.
- **Integrity** fails as a **lie**. The data still looks ordinary, but it can no longer be trusted.
- **Availability** fails as a **lockout**. Nothing has leaked and nothing has changed, but the work has stopped.

Together these three are known as the CIA triad, and you will meet all three on the desk long before anyone hands you the term.

Telling them apart matters because the response to each is different. A leaked password, a payroll figure that changed overnight, and a site that will not load are three distinct problems. They are escalated to different people and contained in different ways, and the cost of getting the classification wrong is time spent chasing the wrong failure while the real one continues.

### Talking about danger before it happens

This week also covers the vocabulary analysts use for danger that has not yet caused harm. Three words do most of the work:

- A **vulnerability** is a weakness.
- A **threat** is something or someone that could use it.
- **Risk** is the chance the two meet, and what it would cost.

These words get used loosely in ordinary conversation, which is precisely why they are worth pinning down. A queue of alerts is full of language designed to sound alarming, and an analyst who cannot separate a weakness from an actor ends up ranking work by how frightening it sounds rather than by what it would cost the business.

Once you can separate them, you can rank a queue instead of reacting to it. By the end of the week you should be able to look at a failure and say which of the three jobs broke, then say whether the danger in front of you is a weakness, an actor, or the chance that the two come together.

### Questions Answered in This Week

- What does it actually mean to call something secure?
- What is confidentiality and what does it look like when it fails?
- What is integrity and why can a silent change be worse than an obvious one?
- What is availability and why does a lockout count as a security failure?
- What is a vulnerability, and why does one on its own cause no harm?
- What is a threat, and how much of it is within your control?
- What is risk, and how do you work it out from a threat and a vulnerability?
- How do the three properties trade off against each other in practice?
