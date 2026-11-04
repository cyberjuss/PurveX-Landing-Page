### Reconnaissance
<!-- art: scan -->

Reconnaissance is the first stage of the Cyber Kill Chain, where the attacker researches a target before touching it. That research can be as simple as collecting employee names and job titles from a company website and LinkedIn, or as involved as scanning which services a network exposes to the internet. On its own, nothing in this stage breaks a law or a system, and that's exactly why it's hard to catch.

MITRE ATT&CK tracks this stage as its own tactic, [Reconnaissance (TA0043)](https://attack.mitre.org/tactics/TA0043/). It covers the ways attackers gather information about an organization's employees, technology or network before they launch an attack.

As a defender, you'll rarely see reconnaissance directly, because most of it happens outside any system a SOC monitors. What you can sometimes see is the footprint it leaves. That might be a wave of sign-in attempts against names scraped from a company directory, or a scan of a narrow set of exposed ports that matches what a job posting revealed about the environment. Noticing a footprint like that is usually the closest a Tier 1 analyst gets to catching this stage while it's still happening.
