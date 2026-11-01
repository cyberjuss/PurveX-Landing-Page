### Installation
<!-- art: keys -->

Installation is where the attacker sets up a way to keep the foothold gained during Exploitation, such as a backdoor account or persistent malware. Getting in once should not mean getting found and locked out once. An attacker who skips this stage has to repeat Exploitation from scratch every time they lose access, which is slow and risks detection each time.

Create Account: Domain Account ([T1136.002](https://attack.mitre.org/techniques/T1136/002/)) is a direct Installation technique in your own Shift queue. A new account appearing in the directory with no HR record behind it is exactly the kind of backdoor an attacker leaves to keep access, even after the original compromised credential gets reset. Account Manipulation ([T1098](https://attack.mitre.org/techniques/T1098/)) serves the same purpose by escalating an account the attacker already controls instead of creating a new one, such as a standard account quietly added to Domain Admins.

A defender's best chance against Installation is routine: reviewing new accounts and privileged group membership against what HR and change tickets actually authorized, on a fixed schedule rather than only after something else has already gone wrong.
