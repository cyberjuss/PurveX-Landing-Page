### Weaponization
<!-- art: bug -->

Weaponization is where the attacker builds or obtains the tool that will exploit a weakness found during reconnaissance, which is often malware paired with an exploit for a specific vulnerability. All of this happens on the attacker's own infrastructure before anything reaches the target, so a defender almost never sees it directly.

The closest match in MITRE ATT&CK is the [Resource Development (TA0042)](https://attack.mitre.org/tactics/TA0042/) tactic. It covers how attackers set up the resources that later stages depend on, from acquired infrastructure to custom-built or modified malware.

Since the target can't see this stage, the defenses against it are indirect. Patching known vulnerabilities removes the exact weakness a weaponized tool was built to exploit, which can make that tool worthless before it's ever used. For the same reason, vulnerability management and the Delivery stage that follows carry far more of a SOC's defensive weight than this stage does.
