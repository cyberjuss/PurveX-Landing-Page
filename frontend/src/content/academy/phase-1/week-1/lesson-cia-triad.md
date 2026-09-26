### The CIA Triad

You already know these three jobs from the Overview. A bank branch gives each one a clear name.

<div class="academy-analogy">
<span class="academy-analogy__tag">Think of it like a bank branch</span>
<ul>
<li><strong>Confidentiality</strong> is the vault door. Only badge holders get in.</li>
<li><strong>Integrity</strong> is the cash-bag seal. Break it and everyone knows.</li>
<li><strong>Availability</strong> is posted hours. Open when customers need the branch.</li>
</ul>
</div>

Ask one question of whatever is in front of you: if this goes wrong, is the damage a leak, a lie, or a lockout? The answer tells you which job it needs.

**Confidentiality is the vault door. Only badge holders get in.** It does the same job as the lock on your phone. A thing needs the vault when *seeing it* is the harm:

- a password
- a salary
- a Social Security number
- a patient's chart
- an unreleased deal

When the vault fails, the file is not gone. The wrong person now has a copy, and you may never know they took it.

Encryption, logins, and access lists are how you issue badges. An attacker who reads unencrypted traffic walked in without one.

**Integrity is the cash-bag seal. Break it and everyone knows.** It does the same job as tape on a shipped box or a hash that no longer matches. A thing needs the seal when *a silent change* is the harm:

- a payroll amount
- a medication dose
- a firewall rule
- a ticket that now says "closed"

The bag can still look full, but you cannot swear the count is the one that left. The harm is that you act on a lie.

Hashing, signatures, and audit logs are how you notice a torn seal. An edited file or bits flipped in transit is torn tape.

**Availability is posted hours. Open when customers need the branch.** It does the same job as a site that loads when you need it. A thing needs the hours when *not being there on time* is the harm:

- email on Monday
- the time clock
- VPN
- the payment page at checkout

The vault can be locked and every seal intact. If the doors never open, the branch still failed, because the work stops.

Backups, spare servers, and patching keep the hours. A DDoS attack is a branch that never unlocks.

These jobs pull against each other. More vault, such as an air gap or extra MFA, can shorten the hours.

More hours, such as an open share so nobody gets stuck, can leave the vault door open. Name the job first, then pick the control:

- leak
- lie
- lockout
