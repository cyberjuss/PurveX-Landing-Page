### Risk

Once you know the weakness and the threat, risk is the idea that ties them together. It's how likely it is that a threat exploits a vulnerability, combined with how much damage that would do. The reason the idea exists is to let you compare problems that otherwise have nothing in common, so you aren't ranking your work by how alarming each item sounds.

**Risk = Threat × Vulnerability × Impact**

Writing risk as a multiplication makes one thing obvious straight away: **if any part is zero, the risk is zero.**

- A threat with no weakness to exploit produces no risk.
- A weakness that nothing can reach produces no risk.
- A flaw on a machine that holds nothing and connects to nothing produces no risk.

In practice, though, teams rarely score those three parts separately. Threat and vulnerability together describe one thing, how likely this is to happen, so most teams combine them and score risk as **likelihood × impact**. It's worth knowing both versions: the three-part one helps you understand what you're measuring, and the two-part one is how you'll see it measured almost everywhere.

This also explains where a security program spends its time. Since you can rarely remove the threat, the work goes into the other two parts:

- It **closes vulnerabilities**, so the likelihood falls.
- It **reduces impact**, so a successful attack costs less. Backups and network segmentation are good examples.

So before you escalate anything, get in the habit of naming the vulnerability, the threat and the impact. An escalation that includes all three gives the person receiving it what they need to decide, while one that only says "this looks bad" sends them off to redo your work.

```sort
prompt: You have budget for six fixes. Does each lower the likelihood of an attack, or the damage when one gets through?
level: 3
Lowers likelihood: Turn on MFA for the VPN | Disable the old intern account | Close port 23 on the domain controller
Lowers impact: Keep offline backups of the Finance share | Separate the client systems from the office network | Limit the client list to Wealth Management only
```
