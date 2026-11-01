### Reconnaissance
<!-- art: scan -->

Reconnaissance is the first Cyber Kill Chain stage: the attacker researches a target before touching it. That research can be as simple as reading employee names and job titles off a company website and LinkedIn. It can also be as involved as scanning which services a network exposes to the internet. Nothing in this stage breaks a law or a system on its own, which is exactly why it is hard to catch.

MITRE ATT&CK tracks this stage as its own tactic, [Reconnaissance (TA0043)](https://attack.mitre.org/tactics/TA0043/). It covers techniques for gathering information about an organization's employees, technology, or network before an attack is ever launched.

A defender rarely sees reconnaissance directly, since most of it happens outside any system a SOC monitors. What is visible is the occasional footprint it leaves: a wave of login attempts against names scraped from a company directory, or a scan against a narrow set of exposed ports that lines up with what a job posting revealed about the environment. Noticing that footprint is the closest a Tier 1 analyst usually gets to catching this stage while it is still happening.
