### Risk

Risk ties the weakness and the threat together: how likely a threat is to exploit a vulnerability, and how much damage that would do. It lets you compare problems that otherwise have nothing in common, instead of ranking them by how alarming they sound.

**Risk = Threat × Vulnerability × Impact**

**If any part is zero, the risk is zero.**

- A threat with no weakness to use produces no risk.
- A weakness nothing can reach produces no risk.
- A flaw on a machine that holds nothing and connects to nothing produces no risk.

In practice, teams combine threat and vulnerability into one number, likelihood, and score risk as **likelihood × impact**. The three-part version explains what you're measuring. The two-part version is how you measure it.

You can rarely remove the threat, so security work goes into the other two:

- **Close vulnerabilities**, so likelihood falls.
- **Reduce impact**, so a success costs less. Backups and network segmentation do this.

Before you escalate anything, name the vulnerability, the threat and the impact. That gives the next person what they need to decide, instead of "this looks bad".

```sort
prompt: Does each control lower the likelihood, or the impact when something gets through?
Lowers likelihood: Patching the software | Closing a port nobody needs | Strengthening the password policy
Lowers impact: Backups | Network segmentation
```
