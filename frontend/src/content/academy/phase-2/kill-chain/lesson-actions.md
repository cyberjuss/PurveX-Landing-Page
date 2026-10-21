### Actions on Objectives
<!-- art: server -->

Actions on Objectives is the last stage: the attacker does what they actually came for, whether that is stealing data, encrypting it for ransom, or disrupting operations. Every stage before this one existed to make this moment possible. It is also the stage with the clearest cost, which is why the six stages before it exist to be stopped first.

MITRE ATT&CK splits this final goal across more than one tactic, depending on what the attacker is actually after. [Collection (TA0009)](https://attack.mitre.org/tactics/TA0009/) and [Exfiltration (TA0010)](https://attack.mitre.org/tactics/TA0010/) cover theft of data. [Impact (TA0040)](https://attack.mitre.org/tactics/TA0040/) covers disruption or destruction, such as ransomware encrypting a file share.

By the time an incident reaches this stage, the SOC's job has shifted from prevention to containment and scope. Cutting off the access that got the attacker here matters more now than stopping the next step, and so does finding out exactly what they reached. That is also why every earlier lesson in this phase exists to catch an intrusion before it reaches this point rather than after.
