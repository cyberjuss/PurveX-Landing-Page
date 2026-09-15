### **The CIA Triad**

The foundation of information security. Every security control exists to protect one or more of these three properties.

**Confidentiality** — Only authorized people/systems can access the data.

* Threat example: an attacker intercepts unencrypted traffic and reads sensitive data  
* Common controls: encryption, access control lists, authentication, need-to-know policies

**Integrity** — Data is accurate and hasn't been tampered with, whether in transit or at rest.

* Threat example: an attacker modifies a file or intercepts and alters data mid-transmission  
* Common controls: hashing, digital signatures, checksums, version control, audit logs

**Availability** — Systems and data are accessible to authorized users when needed.

* Threat example: a DDoS attack takes a web server offline  
* Common controls: redundancy, backups, failover systems, DDoS protection, patching

*Quick way to remember it: if a security incident is a breach, a defacement, or an outage, you can usually map it straight back to one leg of the triad — confidentiality, integrity, or availability.*
