### Command and Control
<!-- art: network -->

Command and Control (often shortened to C2) is the stage where the compromised system reaches back out to infrastructure the attacker controls. That channel is what gives the attacker a way to issue further instructions. Installation got the attacker a foothold that survives a reboot or a password reset. Command and Control is what turns that foothold into something the attacker can actually direct.

MITRE ATT&CK tracks this as its own tactic, [Command and Control (TA0011)](https://attack.mitre.org/tactics/TA0011/). It covers the range of ways a compromised host talks back to attacker infrastructure, from a direct connection to traffic disguised as ordinary web browsing.

This stage is also where Disable Windows Event Logging ([T1562.002](https://attack.mitre.org/techniques/T1562/002/)) tends to appear in your own queue. An attacker who has reached Command and Control has every reason to blind the SOC to what happens next. The next stage ahead of them (Actions on Objectives) is the one most likely to get noticed. A defender's edge here is largely about what the network itself can see: outbound connections to new or unusual destinations are one of the few signals a C2 channel cannot fully hide.
