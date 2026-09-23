### The CIA Triad

You already know these three jobs. A bank branch just names them cleanly.

<div class="academy-analogy">
<span class="academy-analogy__tag">Think of it like a bank branch</span>
<ul>
<li><strong>Confidentiality</strong> is the vault door — only badge holders get in.</li>
<li><strong>Integrity</strong> is the cash-bag seal — break it and everyone knows.</li>
<li><strong>Availability</strong> is posted hours — open when customers need the branch.</li>
</ul>
</div>

Ask one question of whatever is in front of you: if this goes wrong, is the damage a leak, a lie, or a lockout? That is how you know which job it needs.

**Confidentiality is the vault door — only badge holders get in.** Same job as the lock on your phone. A thing needs the vault when *seeing it* is the harm: a password, a salary, a Social Security number, a patient's chart, an unreleased deal. The downside of a failed lock is not that the file is gone. It is that the wrong person now has a copy, and you may never know they took it. Encryption, logins, and access lists are how you issue badges. An attacker who reads unencrypted traffic walked in without one.

**Integrity is the cash-bag seal — break it and everyone knows.** Same job as tape on a shipped box, or a hash that no longer matches. A thing needs the seal when *a silent change* is the harm: a payroll amount, a medication dose, a firewall rule, a ticket that now says "closed." The bag can still look full. You just cannot swear the count is the one that left. The downside is you act on a lie. Hashing, signatures, and audit logs are how you notice a torn seal. An edited file, or bits flipped in transit, is torn tape.

**Availability is posted hours — open when customers need the branch.** Same job as a site that loads when you need it. A thing needs the hours when *not being there on time* is the harm: email on Monday, the time clock, VPN, the payment page at checkout. The vault can be locked and the seals can be intact. If the doors never open, the branch still failed. The downside is the work stops. Backups, spare servers, and patching keep the hours. A DDoS is a branch that never unlocked.

These jobs pull against each other. More vault (air-gap, extra MFA) can close the hours. More hours (an open share so nobody gets stuck) can leave the door off the vault. Name the job first: leak, lie, or lockout. Then pick the control.
