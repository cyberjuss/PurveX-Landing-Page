### Risk

Risk is the likelihood that a threat exploits a vulnerability, combined with the impact if it does. It is the idea that lets you compare two problems with nothing else in common, which is the whole reason it exists. Without it you rank work by how alarming each item sounds, and the items that sound most alarming are very often not the ones that would cost the business most.

**Risk = Threat × Vulnerability × Impact**

Writing it as a product makes one property obvious: **if any factor is zero, the risk is zero.**

- A threat with no weakness to exploit produces no risk.
- A weakness nothing can reach produces no risk, however serious it would be in other circumstances.

That is why a finding cannot be assessed on its own. You need all three parts before the number means anything.

In practice teams rarely score the three separately, because threat and vulnerability together are really describing one thing: how likely this is to happen at all. Most teams collapse them and score risk as **likelihood × impact**. The Week 1 lab scores it that way, and you will see that convention almost everywhere. The three-part version is the better way to understand what you are measuring. The two-part version is the practical way to measure it.

This also explains what a security programme actually does. Threats are seldom removable, so a programme works on the other two factors:

- It **closes vulnerabilities**, so the likelihood falls.
- It **reduces impact**, so the cost is lower when something does get through.

Backups and segmentation are impact controls rather than likelihood controls, which is why they stay valuable even against an attack you failed to prevent.

Before you escalate anything, name all three parts:

- the vulnerability
- the threat
- the impact

An escalation that supplies all three gives the person receiving it everything they need to decide. One that says only that something looks bad sends them back to do the work you have already done.
