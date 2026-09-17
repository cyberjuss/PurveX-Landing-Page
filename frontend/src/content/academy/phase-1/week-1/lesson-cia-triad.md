### The CIA Triad

The foundation of information security, and the lens every other concept in this course gets evaluated through. Any control worth deploying is protecting one or more of these three properties, which means naming the property is usually the fastest way to explain why the control exists at all.

**Confidentiality**: Only authorized people or systems can access the data.

* Threat example: an attacker intercepts unencrypted traffic and reads sensitive data
* Common controls: encryption, access control lists, authentication, need-to-know policies

**Integrity**: Data is accurate. It has not been tampered with, whether in transit or at rest.

* Threat example: an attacker modifies a file, or intercepts and alters data mid-transmission
* Common controls: hashing, digital signatures, checksums, version control, audit logs

**Availability**: Systems and data are accessible to authorized users when needed.

* Threat example: a DDoS attack takes a web server offline
* Common controls: redundancy, backups, failover systems, DDoS protection, patching

*A useful shortcut. Almost every security incident is, at bottom, a breach, a defacement, or an outage. Each maps to exactly one leg of the triad, confidentiality, integrity, or availability, which is why this framework is the first thing an analyst reaches for.*

<div class="academy-analogy">
<span class="academy-analogy__tag">Think of it like a bank branch</span>
<ul>
<li><strong>Confidentiality</strong> is the vault door. Only badge holders get in.</li>
<li><strong>Integrity</strong> is the tamper-evident seal on a cash bag. Break it, and everyone knows something happened.</li>
<li><strong>Availability</strong> is the branch's posted hours. The doors are open exactly when customers need them, no more, no less.</li>
</ul>
</div>
