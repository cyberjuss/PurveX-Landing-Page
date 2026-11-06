### Command and Control
<!-- art: network -->

Command and Control, often shortened to C2, is the stage where the compromised system reaches back out to a server the attacker controls. That channel lets the attacker send more instructions. Installation gave them a foothold that survives a reboot or a password reset. Command and Control turns that foothold into something they can steer.

MITRE ATT&CK tracks this as its own tactic, [Command and Control (TA0011)](https://attack.mitre.org/tactics/TA0011/). It covers the many ways a compromised host can talk back to the attacker, from a direct connection to traffic disguised as ordinary web browsing.

This is also the stage where Disable Windows Event Logging ([T1562.002](https://attack.mitre.org/techniques/T1562/002/)) tends to turn up in your queue. Once attackers reach this stage, they have every reason to blind the SOC. The next stage, Actions on Objectives, is the one most likely to get noticed. Your advantage as a defender comes mostly from what the network can see. Outbound connections to new or unusual destinations are one of the few signals a C2 channel can't fully hide.
