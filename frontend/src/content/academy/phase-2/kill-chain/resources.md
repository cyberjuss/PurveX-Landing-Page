### Sources for this week's facts

- **The Cyber Kill Chain, as a model and framework:** [Lockheed Martin: The Cyber Kill Chain](https://www.lockheedmartin.com/en-us/capabilities/cyber/cyber-kill-chain.html)
- **Its seven stages, its 2011 origin, and its authors (Eric Hutchins, Michael Cloppert, Rohan Amin):** [Hutchins, Cloppert, Amin — "Intelligence-Driven Computer Network Defense Informed by Analysis of Adversary Campaigns and Intrusion Kill Chains," Lockheed Martin, 2011](https://securityandtechnology.org/wp-content/uploads/2020/07/lm-white-paper-intel-driven-defense.pdf), the original paper. The Lockheed Martin page above does not itself name the authors or list the stages.
- **ATT&CK technique IDs used in this week's challenge:**
  - [T1110.003 — Brute Force: Password Spraying](https://attack.mitre.org/techniques/T1110/003/)
  - [T1558.003 — Steal or Forge Kerberos Tickets: Kerberoasting](https://attack.mitre.org/techniques/T1558/003/)
  - [T1098 — Account Manipulation](https://attack.mitre.org/techniques/T1098/)
  - [T1562.002 — Impair Defenses: Disable Windows Event Logging](https://attack.mitre.org/techniques/T1562/002/)
  - [T1136.002 — Create Account: Domain Account](https://attack.mitre.org/techniques/T1136/002/)
- **The five incidents in this week's attack-chain challenge, their exact titles, and which of the IDs above each one carries:** pulled directly from this course's own Shift incident data (`academy-shift.ts`), the same source used for Week 2's ATT&CK lesson. Nothing in the challenge was invented for this lesson.
- **ATT&CK enterprise tactics used in the per-stage lessons, as the closest verifiable match to a Kill Chain stage with no PurveX-specific incident:**
  - [TA0043 — Reconnaissance](https://attack.mitre.org/tactics/TA0043/)
  - [TA0042 — Resource Development](https://attack.mitre.org/tactics/TA0042/)
  - [TA0001 — Initial Access](https://attack.mitre.org/tactics/TA0001/), and its [T1566 — Phishing](https://attack.mitre.org/techniques/T1566/) technique
  - [TA0011 — Command and Control](https://attack.mitre.org/tactics/TA0011/)
  - [TA0009 — Collection](https://attack.mitre.org/tactics/TA0009/), [TA0010 — Exfiltration](https://attack.mitre.org/tactics/TA0010/), and [TA0040 — Impact](https://attack.mitre.org/tactics/TA0040/)
