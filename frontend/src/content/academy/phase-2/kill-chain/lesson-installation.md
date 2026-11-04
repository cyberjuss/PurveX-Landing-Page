### Installation
<!-- art: keys -->

Installation is where the attacker sets up a way to keep the foothold they gained during Exploitation, such as a backdoor account or persistent malware. From their point of view, getting in once shouldn't mean being locked out the first time someone notices. An attacker who skips this stage has to repeat Exploitation from scratch whenever they lose access, which is slow and risks detection every time.

You've seen one Installation technique directly in your Shift queue, Create Account: Domain Account ([T1136.002](https://attack.mitre.org/techniques/T1136/002/)). A new account in the directory with no HR record behind it is exactly the kind of backdoor an attacker leaves, so that they keep access even after the original stolen credential is reset. Account Manipulation ([T1098](https://attack.mitre.org/techniques/T1098/)) does the same job differently. Instead of creating a new account, the attacker escalates one they already control, for example by quietly adding a standard account to Domain Admins.

Your best defense against Installation is routine. Review new accounts and privileged group membership against what HR and change tickets actually authorized, and do it on a fixed schedule rather than only after something else has gone wrong.
