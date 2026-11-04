### Risk

Once you know the weakness and the threat, risk is the idea that ties them together. It's how likely it is that a threat exploits a vulnerability, combined with how much damage that would do. The whole reason the idea exists is to let you compare two problems that otherwise have nothing in common. Without it, you'd end up ranking your work by how alarming each item sounds, and the scariest-sounding items are very often not the ones that would cost the business the most.

**Risk = Threat × Vulnerability × Impact**

Writing risk as a multiplication makes one thing obvious straight away: **if any part is zero, the risk is zero.**

- A threat with no weakness to exploit produces no risk.
- A weakness that nothing can reach produces no risk, however serious it would be somewhere else.
- A flaw on a machine that holds nothing and connects to nothing produces no risk, because there's nothing to lose.

It follows that you can't judge a finding on its own, because you need all three parts before the answer means anything.

In practice, though, teams rarely score those three parts separately. That's because threat and vulnerability together are really describing one thing: how likely this is to happen at all. So most teams combine them and score risk as **likelihood × impact**, which is how the Week 1 lab scores it and how you'll see it done almost everywhere else. Both versions are worth knowing, since the three-part version is the better way to understand what you're measuring, while the two-part version is the practical way to measure it.

This also explains what a security program actually spends its time on. Since you can rarely remove the threat, the work goes into the other two parts:

- It **closes vulnerabilities**, so the likelihood falls.
- It **reduces impact**, so the cost is lower when something does get through.

Backups and network segmentation are good examples of that second kind of work. They don't make an attack any less likely, but they shrink the damage when one succeeds, which is why they're still worth having even against an attack you didn't manage to stop.

With all of that in place, get in the habit of naming all three parts before you escalate anything:

- the vulnerability
- the threat
- the impact

An escalation that includes all three gives the person receiving it everything they need to make a decision. By contrast, one that just says "this looks bad" sends them off to redo the work you've already done.

```sort
prompt: Does each control lower the likelihood, or the impact when something gets through?
Lowers likelihood: Patching the software | Closing a port nobody needs | Strengthening the password policy
Lowers impact: Backups | Network segmentation
```
