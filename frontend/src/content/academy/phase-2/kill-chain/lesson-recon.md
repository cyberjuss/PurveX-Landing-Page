### Reconnaissance
<!-- art: scan -->

Reconnaissance is the first stage of the Cyber Kill Chain. The attacker researches a target before touching it. That can be as simple as collecting employee names and job titles from the company website and LinkedIn. It can also be as involved as scanning which services a network exposes to the internet. Nothing in this stage breaks a system, and that's why it's hard to catch.

MITRE ATT&CK tracks this stage as its own tactic, [Reconnaissance (TA0043)](https://attack.mitre.org/tactics/TA0043/). It covers how attackers learn about an organization's people, technology and network before an attack.

As a defender, you'll rarely see reconnaissance directly, because most of it happens outside any system a SOC monitors. What you can sometimes see is the footprint it leaves. One example is a wave of sign-in attempts against names scraped from a company directory. Another is a scan of a few exposed ports that matches what a job posting revealed about the environment. Spotting a footprint like that is usually as close as a Tier 1 analyst gets to catching this stage in progress.
