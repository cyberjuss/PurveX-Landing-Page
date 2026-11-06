### The MITRE ATT&CK Framework
<!-- art: radar -->

[MITRE ATT&CK](https://attack.mitre.org/) (Adversarial Tactics, Techniques, and Common Knowledge) is a knowledge base of how real attackers operate, maintained by the nonprofit MITRE Corporation. Its biggest gift to the industry is a shared vocabulary. Every technique has a name. So the detection you build, the report you write and the training exercise you run can all point at the same thing, instead of describing it three slightly different ways.

To keep all that behavior manageable, ATT&CK organizes it in three layers:

- **Tactic:** the attacker's goal, such as gaining credentials or escalating privilege.
- **Technique:** a specific way of reaching that goal.
- **Sub-technique:** a technique narrowed further.

Take Password Spraying as an example. It's a technique under the Credential Access tactic, and it already has a name and an ID (T1110.003). That label was there long before the technique ever reaches your queue, because enough real incidents followed the same pattern for MITRE to catalog it.

In fact, you've already met several of these techniques without knowing their labels. The Shift incidents in your hosted lab were built to mirror real attacker behavior, so every one of them carries a real ATT&CK tag:

- **T1110.003, Password Spraying:** a burst of failed sign-ins across many accounts in under a minute.
- **T1558.003, Kerberoasting:** a service principal name set on an ordinary account, so any domain user can request its ticket and crack the password offline.
- **[T1098](https://attack.mitre.org/techniques/T1098/), Account Manipulation:** a standard account added to Domain Admins, or to IT Admins, with no change ticket behind it.
- **T1562.002, Impair Defenses (Disable Windows Event Logging):** the Special Logon audit subcategory switched off, which blinds the SOC to elevated-privilege sign-ins.
- **T1136.002, Create Account: Domain Account:** a new account in the directory with no HR record behind it. That's the kind of backdoor an attacker leaves to keep access.

Learning the IDs isn't about trivia. A technique ID is your key for looking things up. It tells you which detections exist for it, what it looks like in logs, and what an attacker tends to do just before and after it. You'll need exactly that skill in the attack-chain challenges later in this phase.

```sort
prompt: Sort each incident by the ATT&CK tactic its technique falls under.
Credential Access: Password Spraying (T1110.003) | Kerberoasting (T1558.003)
Persistence: Create Account: Domain Account (T1136.002)
Privilege Escalation: Account Manipulation (T1098)
Defense Evasion: Impair Defenses (T1562.002)
```
