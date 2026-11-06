### Delivery
<!-- art: mail -->

Delivery is the stage where the weapon reaches the target. Most often it arrives as a phishing email, a malicious link or a compromised website. Everything before this happened out of view, so Delivery is usually a defender's first real chance to see the attack.

In MITRE ATT&CK, this ground is covered by the [Initial Access (TA0001)](https://attack.mitre.org/tactics/TA0001/) tactic. Its best-known technique is [Phishing (T1566)](https://attack.mitre.org/techniques/T1566/), an email carrying a malicious attachment or link. Phishing is aimed at a person rather than a system, because a person's judgment is easier to exploit than a patched server's code.

A SOC sees this stage in two ways. The first is email security tooling, which can flag or quarantine a suspicious message. The second is the people who receive whatever gets through. That's why a user reporting a suspicious email counts as a real detection, not an inconvenience. When an employee forwards a phishing attempt to the SOC, they may be catching an intrusion at the one stage where it's still cheap to stop.
