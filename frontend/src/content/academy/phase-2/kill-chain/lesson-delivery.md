### Delivery
<!-- art: mail -->

Delivery is the stage where the weapon built in the previous step actually reaches the target, commonly through a phishing email, a malicious link, or a compromised website. Everything before this stage happened out of view. Delivery is usually the first moment a defender has any real chance of seeing the attack at all.

MITRE ATT&CK's [Initial Access (TA0001)](https://attack.mitre.org/tactics/TA0001/) tactic covers this ground. Its best-known technique is [Phishing (T1566)](https://attack.mitre.org/techniques/T1566/): an email carrying a malicious attachment or link, sent to a person rather than a system. A person's judgment is easier to exploit than a patched server's code.

A SOC's visibility here runs through email security tooling, which can flag or quarantine a suspicious message. It also runs through the people who receive what gets through. User reporting of a suspicious email is therefore a real detection, not an inconvenience: an employee who forwards a phishing attempt to the SOC may be catching an intrusion at the one stage where it was still cheap to stop.
