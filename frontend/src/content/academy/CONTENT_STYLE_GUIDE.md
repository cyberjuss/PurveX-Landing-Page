# Academy Content Style Guide

Reference doc for anyone (human or Claude) writing lessons, labs, or quizzes for
the academy portal. Not rendered on the site — `loadLesson()` only loads files
explicitly listed in `academy-content.ts`, so this is safe to keep here.

## Voice

Write like an experienced Help Desk Technician, Systems Administrator, Active
Directory Administrator, and Cybersecurity Engineer who has trained
entry-level people. Not a textbook author. Not a corporate trainer.

The goal is not memorized definitions. The goal is a student who can
troubleshoot, administer, investigate, and think like an IT/security
professional.

## Banned phrases

Never use these or anything in their family:

- "In today's ever-evolving technology landscape"
- "In the world of IT"
- "As technology continues to evolve"
- "It is important to note"
- "Let's dive in"
- "This comprehensive guide"
- "Unlock the power of"
- "At the end of the day"
- "In today's digital age"

No motivational filler added just to pad length. No excessive theory, marketing
language, repetitive summaries, fake corporate scenarios, unnecessary history,
long definitions, or artificially complex language.

## What every technical topic must answer

1. What is it?
2. Why does an IT professional care?
3. What does it look like in a real environment?
4. How would a Help Desk technician encounter it?
5. How would an administrator troubleshoot it?
6. What commands/tools would they use?
7. What logs or evidence would they check?
8. When should the issue be escalated?
9. How could the same issue become a cybersecurity concern?

## Curriculum coverage

**Help Desk** — Windows troubleshooting, user account issues, password resets,
MFA problems, software installation, printer/network troubleshooting,
DNS/DHCP basics, IP addressing, remote support, ticket documentation, hardware
troubleshooting, Windows Event Viewer, basic PowerShell, escalation
procedures, troubleshooting methodology, customer communication.

**Active Directory** — domains and domain controllers, users and groups, OUs,
Group Policy, security vs. distribution groups, NTFS/share permissions,
password policies, account lockouts, authentication, Kerberos basics, LDAP
basics, DNS and AD, computer objects, domain-joining, Group Policy
troubleshooting, delegation, service accounts, AD administration with
PowerShell, common AD failures, least privilege.

**System Administration** — Windows Server, file servers, permissions, DHCP,
DNS, Group Policy, patch management, backup concepts, system monitoring,
PowerShell automation, user lifecycle management, access management.

**Cybersecurity** — CIA triad, authentication/authorization, least privilege,
identity security, endpoint security, vulnerability management, security
logging, SIEM fundamentals, detection engineering, incident response, threat
detection, MITRE ATT&CK, phishing, credential attacks, lateral movement,
privilege escalation, Windows security events.

**SOC/SIEM** — realistic environments: Microsoft Sentinel, Microsoft Defender,
Splunk, Windows Event Logs, Sysmon, Active Directory, Azure, AWS.

## Realistic tickets

Open technical topics with a real Help Desk ticket, e.g. "User cannot log in
after changing their password." Then walk the investigation:

initial symptoms → questions to ask → checks to perform → commands/tools →
likely causes → resolution → documentation → security considerations

Do not reveal the answer up front. The student investigates.

## AD/SysAdmin scenarios to draw from

Account lockouts, cannot access a shared folder, computer cannot authenticate
to the domain, Group Policy not applying, new employee needs access, employee
offboarding, excessive permissions, password policy changes, a failing
service account, DNS breaking domain authentication, suspicious account
activity in Event Viewer.

## Lab structure

Objective, Environment, Starting condition, Task, Commands/tools, Expected
result, Troubleshooting, Security connection, Challenge.

Not every lab is "follow these 10 steps." Some labs hand the student a broken
environment and require them to figure out what's wrong with no guided path.

## Professional judgment

Weave these questions into scenarios rather than answering them for the
student:

- What changed?
- What is the actual symptom?
- Is this a user, system, network, identity, or security problem?
- What evidence supports that conclusion?
- What should I check before making a change?
- Could my fix create a security problem?
- What should I document?
- Should I escalate?

Example of the pattern (file share access): don't say "check permissions."
Make the student work through: Is the user authenticated? Can they reach the
server? Can other users access the share? Is DNS working? Correct group
membership? NTFS permissions? Share permissions? Group Policy issue? Account
locked or disabled? Any evidence of suspicious activity?

## Connect IT to security, every time

Show the full chain a single action runs through:

Help Desk (reset a password) → System Administration (manage the AD account)
→ Security (was the reset legitimate?) → SOC (investigate auth logs for
suspicious activity) → Detection Engineering (build a detection for abnormal
auth behavior).

## Writing style

Use: short explanations, real commands, real examples, real logs, real
troubleshooting, realistic scenarios, practical exercises, technical
reasoning.

Every lesson should leave the student able to say: "I know what this is, I
know how to troubleshoot it, I know how to administer it, and I understand
how it can become a security issue."
