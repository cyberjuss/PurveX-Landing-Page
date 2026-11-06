### Installation
<!-- art: keys -->

Installation is where the attacker sets up a way to keep the foothold gained during Exploitation, such as a backdoor account or malware that survives a restart. From their point of view, getting in once shouldn't mean being locked out the first time someone notices. Without this stage, they'd have to repeat Exploitation every time they lost access. That's slow, and it risks detection each time.

You've seen one Installation technique in your Shift queue: Create Account: Domain Account ([T1136.002](https://attack.mitre.org/techniques/T1136/002/)). A new account with no HR record behind it is the kind of backdoor an attacker leaves. It keeps them in even after the stolen password is reset. Account Manipulation ([T1098](https://attack.mitre.org/techniques/T1098/)) does the same job differently. Instead of creating a new account, the attacker escalates one they already control, for example by quietly adding a standard account to Domain Admins.

Your best defense against Installation is routine. Check new accounts and privileged group membership against what HR and change tickets authorized. Do it on a fixed schedule, not only after something has gone wrong.
