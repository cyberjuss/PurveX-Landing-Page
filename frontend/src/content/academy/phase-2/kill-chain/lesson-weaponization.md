### Weaponization
<!-- art: bug -->

Weaponization is where the attacker builds or obtains the tool that will exploit a weakness found during reconnaissance, commonly malware paired with an exploit for a specific vulnerability. This stage happens entirely on the attacker's own infrastructure, before anything reaches the target. That is why a defender essentially never observes it directly.

MITRE ATT&CK's closest equivalent tactic is [Resource Development (TA0042)](https://attack.mitre.org/tactics/TA0042/): techniques an attacker uses to establish the resources that later stages of the chain depend on, from acquired infrastructure to custom-built or modified malware.

Because this stage is invisible to the target, defenses built around it are indirect. Patching known vulnerabilities removes the exact weakness a weaponized tool was built to exploit, which can make that tooling worthless before it is ever used. That is also why vulnerability management and the Delivery stage that follows it carry more of a SOC's actual defensive weight than this one does.
