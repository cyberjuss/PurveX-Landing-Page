### Weaponization
<!-- art: bug -->

Weaponization is where the attacker builds or obtains the tool that will exploit a weakness found during reconnaissance. Often that's malware paired with an exploit for one specific flaw. All of this happens on the attacker's own systems before anything reaches the target, so a defender almost never sees it.

The closest match in MITRE ATT&CK is the [Resource Development (TA0042)](https://attack.mitre.org/tactics/TA0042/) tactic. It covers how attackers set up what the later stages depend on, such as servers they rent or take over and malware they write or modify.

Since the target can't see this stage, the defenses against it are indirect. Patching removes the weakness a weaponized tool was built to exploit, which can make the tool worthless before it's used. That's why patching, and watching the Delivery stage that follows, carry far more of a SOC's defensive weight than this stage does.
