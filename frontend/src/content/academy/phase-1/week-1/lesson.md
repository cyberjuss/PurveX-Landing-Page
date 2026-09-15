### **Essential Question**

What are we actually protecting when we talk about "security," and how do defenders decide which risks are worth acting on?

### **Overview**

This lesson covers the CIA triad — confidentiality, integrity, and availability — the three properties nearly every security control exists to protect. It then connects that foundation to how analysts talk about risk: the relationship between vulnerabilities (weaknesses), threats (who or what could exploit them), and the risk that results when the two meet.

---

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

---

### **Risk, Threats, and Vulnerabilities**

These three terms get mixed up constantly — here's how they relate:

**Vulnerability** — A weakness that could be exploited.

* Example: unpatched software, a misconfigured firewall, weak passwords, an open port

**Threat** — Something (or someone) that could exploit a vulnerability.

* Example: a hacker, malware, an insider, a natural disaster, a nation-state actor

**Risk** — The likelihood and impact of a threat actually exploiting a vulnerability.

* Formula analysts use: **Risk \= Threat × Vulnerability × Impact**  
* No vulnerability \= no risk, even if the threat exists.  
* No threat \= no risk, even if the vulnerability exists.  
* Risk is what you actually manage — you usually can't eliminate threats, so you reduce risk by closing vulnerabilities and lowering potential impact.

**Simple analogy:**

* A vulnerability is an unlocked door.  
* A threat is a burglar in the neighborhood.  
* Risk is the chance that the burglar finds and uses that unlocked door — and what it costs you if they do.

---

### **How It All Connects**

1. A **vulnerability** exists (unpatched server).  
2. A **threat** (attacker) targets that vulnerability.  
3. If successful, the attack compromises **confidentiality, integrity, and/or availability**.  
4. The **risk** was the probability and impact of that happening — which is what security teams assess and prioritize *before* an incident, not after.

