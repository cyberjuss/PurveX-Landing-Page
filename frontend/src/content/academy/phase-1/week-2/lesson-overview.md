<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>How do you trust a file or a password when you cannot see inside it?</p>
</div>

### Overview

Week 1 gave you three jobs: keep things private, keep them accurate, and keep them available. This week covers the two tools that do most of that work. Encryption keeps data private. Hashing proves data was not changed.

Two real cases frame the week.

- In 2023, attackers slipped malware into the installer for the 3CX phone app, which thousands of companies downloaded. Analysts confirmed the bad files by their SHA-256 hashes and shared those hashes so other teams could block them.
- In 2012, 6.5 million LinkedIn password hashes were posted online. They were stored without a salt, so most were cracked within days.

Neither case takes advanced math to understand. Both come down to one question: what does this protection actually guarantee, and what does it not?

You will meet three ways to make data unreadable at a glance. On screen they look almost the same. They are not the same, and mixing them up is how a team decides a leaked file is "safe" when it is not.

| Method | What it does | Can you get the original back? |
|---|---|---|
| Encoding | Changes how data is written | Yes. Anyone can. |
| Encryption | Locks data with a key | Yes, but only with the key |
| Hashing | Makes a fingerprint of the data | No. Never. |

### Where you meet this on the job

- **Help desk:** a user asks which copy of an installer is safe, a laptop asks for a BitLocker recovery key, a password reset has to be done without anyone learning the password.
- **Systems administrator:** you verify updates before they go to every machine, and you decide how passwords and keys are stored.
- **SOC analyst:** alerts name files by their hash, attackers hide commands in encoded text, and password attacks show up as patterns in the sign-in logs.

By the end of the week you should be able to:

- Say whether a value is encoded, encrypted or hashed, and what an attacker holding it can do
- Verify a download with a hash using CyberChef, PowerShell or sha256sum
- Explain why a matching hash still does not make a file safe
- Explain what a salt does, and why passwords need a slow hash
- Decide what a help desk does first after a vendor's password breach

The two labs this week put each of these in front of you with real tools.
