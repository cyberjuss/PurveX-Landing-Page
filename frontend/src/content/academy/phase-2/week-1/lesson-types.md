### Types of Malware

Malware is grouped by how it spreads and what it does once it lands. Naming the type quickly tells you what to expect next and how urgent the response is.

The main types you will see include:

- Virus
- Worm
- Trojan
- Ransomware
- Spyware and infostealers
- Rootkit

The response changes with the type, so what matters is what makes each one different.

#### Virus

A virus attaches itself to a file or program and runs when that file is opened. It needs a person to run the infected file to spread, so it moves as fast as people share and open files.

On the job, a virus alert usually points at one file on one machine. The response is to quarantine the file and isolate the host, then check whether the same file reached anyone else.

#### Worm

A worm spreads on its own across a network, with no one needing to open anything. It exploits a weakness or uses stolen credentials to copy itself from machine to machine.

A worm is more urgent than a virus because it does not wait for a person. If one machine is hit, assume others may be next and contain it right away.

#### Trojan

A trojan hides inside something that looks legitimate, such as a cracked app or a fake installer. The user runs it on purpose believing it is safe, and it opens a door for the attacker.

Trojans are common because they rely on trust rather than a technical flaw. The response is to isolate the host and reset the credentials of the account that ran it. Then note what the trojan dropped or connected to, so whoever investigates can follow it.

#### Ransomware

Ransomware encrypts files and demands payment for the key. Attackers often reach file shares and delete backups before they start encrypting, so the damage is wide by the time anyone sees the ransom note.

Ransomware is a top-severity incident. Speed matters: isolate affected hosts from the network immediately to stop the encryption from spreading, and escalate at once.

#### Spyware and infostealers

Spyware watches what a user does. An infostealer grabs specific data such as passwords and session cookies and sends it to the attacker.

The danger is quiet: no files are locked, so it can run for weeks. When you suspect it, treat the account's credentials and sessions as compromised along with the machine.

#### Rootkit

A rootkit hides an attacker's presence by tampering with the operating system itself, so normal tools may report that nothing is wrong. It is often what keeps other malware hidden.

A suspected rootkit is beyond a tier-1 fix. Preserve the machine and do not trust its own output. Escalate to a team that can inspect it from outside the running system.

```sort
prompt: Match each behavior to its type.
Virus: Attaches to a file and runs when that file is opened
Worm: Spreads across a network with no one opening anything
Trojan: Hides inside a cracked app or a fake installer
Ransomware: Encrypts files and demands payment for the key
Spyware and infostealers: Grabs passwords and session cookies
Rootkit: Tampers with the operating system so normal tools report nothing wrong
```

```match
prompt: An alert names the type. Match the first move.
Worm = Assume others are next and contain it right away
Ransomware = Isolate affected hosts immediately and escalate at once
Trojan = Isolate the host and reset the account that ran it
Rootkit = Preserve the machine, do not trust its output, and escalate
Spyware = Treat the account's credentials and sessions as compromised
```

### What Kind of Malware Is This?

A real alert rarely names its own type. It shows up as a symptom, and naming the type is the first thing you have to work out.

```sort
prompt: Read what was reported. Sort each one by what it actually is.
Virus: A user in Operations says a single attachment she opened this morning is now attached to every document she saves, and Defender flags that one file on her machine only
Worm: Twelve workstations in the Finance pod alert within the same two minutes, and none of the affected users remember opening anything
Trojan: A help desk ticket says a "PDF converter" the user downloaded last week is still listed in Startup Apps, and Task Manager shows it talking to an address nobody recognizes
Ransomware: A call comes in that every file on the WealthManagement share now ends in .locked, and a text file in the folder demands payment in cryptocurrency
Spyware and infostealers: An analyst notices one account signed in from a new location using a password that was never reset or shared, and nothing else on the machine looks different
Rootkit: Defender reports a clean scan on a machine, but the Shift queue shows that same machine quietly sending large amounts of data out every night for two weeks
```
