### The MITRE ATT&CK Framework
<!-- art: radar -->

[MITRE ATT&CK](https://attack.mitre.org/) (Adversarial Tactics, Techniques, and Common Knowledge) is a knowledge base, maintained by the nonprofit MITRE Corporation, that catalogs how real attackers actually operate. It gives the industry a shared vocabulary for attacker behavior, so that a detection you build, a report you write, and a training exercise you run can all point at the same named technique instead of three different descriptions of roughly the same thing.

ATT&CK organizes that behavior in three layers:

- **Tactic:** the attacker's goal, such as gaining credentials or escalating privilege.
- **Technique:** a specific way of reaching that goal.
- **Sub-technique:** a technique narrowed further.

Password Spraying is a technique under the Credential Access tactic. It already has a name and an ID (T1110.003). That label exists before you ever see the technique in your own queue, because enough real incidents followed the same pattern for MITRE to catalogue it.

You have already met several of these techniques without the label. Every Shift incident in your own hosted lab carries a real ATT&CK tag, because the incidents were built to mirror actual attacker behavior rather than invented ones:

- **T1110.003, Password Spraying:** a burst of failed sign-ins across many accounts in under a minute.
- **T1558.003, Kerberoasting:** a service principal name set on an ordinary account, so any domain user can request its ticket and crack the password offline.
- **[T1098](https://attack.mitre.org/techniques/T1098/), Account Manipulation:** a standard account added to Domain Admins, or to IT Admins, with no change ticket behind it.
- **T1562.002, Impair Defenses (Disable Windows Event Logging):** the Special Logon audit subcategory switched off, which blinds the SOC to elevated-privilege sign-ins.
- **T1136.002, Create Account: Domain Account:** a new account appearing in the directory with no HR record behind it, which is exactly the kind of backdoor an attacker leaves to keep access.

The point of knowing the ID is not trivia. A technique ID is how you look up what detections exist for it, what it usually looks like in logs, and what an attacker typically does right before and right after it. That is the exact skill the attack-chain challenges later in this phase will ask you to use.

```sort
prompt: Sort each incident by the ATT&CK tactic its technique falls under.
Credential Access: Password Spraying (T1110.003) | Kerberoasting (T1558.003)
Persistence: Create Account: Domain Account (T1136.002)
Privilege Escalation: Account Manipulation (T1098)
Defense Evasion: Impair Defenses (T1562.002)
```
