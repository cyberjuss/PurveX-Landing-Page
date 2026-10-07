# Academy Content Style Guide

Reference doc for anyone (human or Claude) writing lessons, labs, or quizzes for
the academy portal. Not rendered on the site — `loadLesson()` only loads files
explicitly listed in `academy-content.ts`, so this is safe to keep here.

## Voice

Write as a cybersecurity instructor explaining the material to a new hire or
junior analyst. Direct, practical, instructor-led. Professional but
conversational. Confident and grounded.

The learner should leave thinking: I understand this environment, I know what
normal looks like, and I can recognize when something does not fit.

Explain the why behind the task, not just what to do. Use concrete examples
from the source only. Treat the environment, systems, users, tickets, and
procedures as a real workplace. Emphasize verification, context, normal
behavior, and investigation. Make clear what the learner is responsible for
understanding or deciding.

## Instructional order

1. Establish the environment or context first.
2. Explain why that context matters to the analyst.
3. Connect the concept to the actual work the learner will perform.
4. Show what the learner should look for, verify, or question.
5. Reinforce that assumptions should be verified against the environment.
6. Teach what good looks like before discussing what is abnormal.

Use only facts, names, systems, and tickets already in the source. Do not
invent examples to make a lesson sound more complete. If the source does not
support a claim, leave it out.

## Tone and paragraph shape

Write in continuous textbook prose, the way a professional reference book
explains a subject to a practitioner. This replaces the clipped one-sentence
style the lessons used to carry, and the old 240-character paragraph ceiling
no longer applies.

A paragraph is three to six sentences. It opens with a topic sentence and then
develops that one idea: what the thing is, why it matters, what it costs when
it goes wrong, and what the reader will be able to do about it. A paragraph
that states a fact and stops is too short. A paragraph carrying two ideas
should be two paragraphs.

Address the reader as "you" and keep the register even and measured. Explain
consequences rather than asserting importance. "It would be costly to build
the wrong thing" teaches. "This is critical" does not.

Prose and lists share the work. Prose explains and connects. A list carries
anything parallel: examples, controls, failure modes, the order to check
things in, what to escalate on. If you find yourself writing "X, Y and Z"
inside a sentence and those three are a real set, make them a list.

Do not stack more than three paragraphs without a list, a subheading or a
table between them. A screen of unbroken prose is not thorough, it is hard to
read and a student skims it. Alternate: explain, then enumerate, then explain
what the enumeration means.

The opposite failure still applies. Do not shred an explanation into bullet
fragments. A list item is a parallel item, not a sentence that lost its
paragraph.

No em dashes. No semicolons. Overview owns the baseline. Later tabs teach
their own object. Missions stay scenario plus question. Teaching goes in the
hint.

## Sentences carry into each other

A paragraph is an argument, not a stack of facts. Each sentence should pick up
something from the one before it and carry it forward, so a reader is never
dropped into a new subject with no handhold.

Watch for a sentence that opens a brand new subject cold, straight after a full
stop. Usually it wants joining to its neighbour with because, so, which, while
or where, or it wants an opening phrase that names what came before.

Cold:

> None of them prevents a change. A hash does not stop somebody editing a file.

Carried:

> None of them actually prevents a change: a hash does not stop somebody
> editing a file.

Cold:

> That shapes how you investigate. Confidentiality asks whether anyone could
> have seen this. Integrity asks whether this is still what it was.

Carried:

> That difference shapes how you investigate. Where confidentiality asks
> whether anyone could have seen this, integrity asks whether this is still
> what it was.

Three or more consecutive short declaratives is the signal to re-read. There
are no em dashes and no semicolons here, so the joins get made with
conjunctions, a colon, or a phrase that refers back.

Reference material inside a `Go deeper` block, event-ID tables and command
explanations are exempt. Terse is correct there.

### Do not pay for flow with commas

Joining every pair of sentences with a comma and a conjunction fixes
choppiness by creating the opposite problem. Keep sentences at a median of
roughly 15 to 20 words and rarely past 40, which is about 240 characters.

When a sentence runs long, split it and open the second one with a phrase that
points back. A backward reference costs no commas and carries the thought just
as well as a conjunction would.

> Long: It numbers every byte it sends and expects the far side to acknowledge
> what it received, resending anything that goes unconfirmed, and the handshake
> is what starts that bookkeeping by having each side declare the number it
> intends to count from.

> Split: It numbers every byte it sends and expects the far side to acknowledge
> what it received, resending anything that goes unconfirmed. The handshake
> starts that bookkeeping, by having each side declare the number it intends to
> count from.

Three commas in one sentence is the signal to re-read it. If the commas are
carrying a genuine set of parallel items, that set probably wants to be a
list instead.

## Structure of an overview tab

The page already prints the week's title and summary above the content, so an
overview never repeats them. Its first heading stays "Overview", matching the
tab label in academy-content.ts.

```
### Overview

Four to six paragraphs. What the week covers, why the work matters, what is
hard about it, and what the reader can do by the end.

### Questions Answered in This Week

- One question per section the week teaches.
```

Every later tab opens with its own `###` heading and then runs as prose.

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
