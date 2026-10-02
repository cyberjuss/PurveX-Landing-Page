### Types of Malware

Malware is grouped by how it spreads and what it does once it lands. Naming the type quickly tells you what to expect next and how urgent the response is.

The main types you will see include:

Virus
Worm
Trojan
Ransomware
Spyware and infostealers
Rootkit

As you read, note what makes each one different because the response changes with the type.

#### Virus

A virus attaches itself to a file or program and runs when that file is opened. It needs a person to run the infected file to spread, so it moves as fast as people share and open files.

On the job, a virus alert usually points at one file on one machine. The response is to isolate the file and the host, then check whether the same file reached anyone else.

#### Worm

A worm spreads on its own across a network, with no one needing to open anything. It exploits a weakness or uses stolen credentials to copy itself from machine to machine.

A worm is more urgent than a virus because it does not wait for a person. If one machine is hit, assume others may be next and contain it right away.

#### Trojan

A trojan hides inside something that looks legitimate, such as a cracked app or a fake installer. The user runs it on purpose believing it is safe, and it opens a door for the attacker.

Trojans are common because they rely on trust rather than a technical flaw. The response is to remove the program and reset the account that ran it. Then look for what it dropped or connected to.

#### Ransomware

Ransomware encrypts files and demands payment for the key. It often spreads across shares and backups first, so the damage is wide by the time anyone sees the ransom note.

Ransomware is a top-severity incident. Speed matters: isolate affected hosts from the network immediately to stop the encryption from spreading, and escalate at once.

#### Spyware and infostealers

Spyware watches what a user does. An infostealer grabs specific data such as passwords and session cookies and sends it to the attacker.

The danger is quiet: no files are locked, so it can run for weeks. When you suspect it, treat the account's credentials and sessions as compromised along with the machine.

#### Rootkit

A rootkit hides an attacker's presence by tampering with the operating system itself, so normal tools may report that nothing is wrong. It is often what keeps other malware hidden.

A suspected rootkit is beyond a tier-1 fix. Preserve the machine and do not trust its own output. Escalate to a team that can inspect it from outside the running system.
