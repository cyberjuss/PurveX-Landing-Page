### Types of Malware

Malware is grouped by how it spreads and what it does once it lands. That grouping is useful on the job, because naming the type quickly tells you what to expect next and how urgent your response needs to be.

The main types you'll see include:

- Virus
- Worm
- Trojan
- Ransomware
- Spyware and infostealers
- Rootkit

Since your response changes with the type, what matters most is what makes each one different, so let's take them one at a time.

#### Virus

A virus attaches itself to a file or program and runs whenever that file is opened. Because it needs a person to run the infected file before it can spread, it only moves as fast as people share and open files.

On the job, then, a virus alert usually points at one file on one machine. Your response is to quarantine the file and isolate the host, and then check whether the same file reached anyone else.

#### Worm

A worm is different, because it spreads across a network on its own, without anyone needing to open anything. It exploits a weakness or uses stolen credentials to copy itself from machine to machine.

That makes a worm more urgent than a virus, since it doesn't wait for a person. So if one machine is hit, assume others may be next, and contain it right away.

#### Trojan

A trojan hides inside something that looks legitimate, such as a cracked app or a fake installer. The user runs it on purpose, believing it's safe, and it quietly opens a door for the attacker.

Trojans are common precisely because they rely on trust rather than a technical flaw. To respond, isolate the host and reset the credentials of the account that ran it. Then note what the trojan dropped or connected to, so whoever investigates next can follow its trail.

#### Ransomware

Ransomware encrypts files and demands payment for the key. What makes it so damaging is that attackers often reach file shares and delete backups before they start encrypting, so the damage is already widespread by the time anyone sees the ransom note.

For that reason, ransomware is always a top-severity incident, and speed matters. Isolate affected hosts from the network immediately to stop the encryption spreading, and escalate at once.

#### Spyware and infostealers

Spyware watches what a user does, while an infostealer goes after specific data, such as passwords and session cookies, and sends it to the attacker.

The danger here is how quiet it is. Since no files get locked, it can run for weeks without anyone noticing. So when you suspect it, treat the account's credentials and sessions as compromised, not just the machine.

#### Rootkit

Finally, a rootkit hides an attacker's presence by tampering with the operating system itself, which means normal tools may report that nothing is wrong. It's often what keeps other malware hidden.

A suspected rootkit is beyond a Tier 1 fix. Preserve the machine, and don't trust anything it reports about itself. Instead, escalate to a team that can inspect it from outside the running system.

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

In practice, a real alert rarely tells you its own type. It shows up as a symptom instead, so working out the type is the first thing you have to do.

```sort
prompt: Read what was reported. Sort each one by what it actually is.
Virus: A user in Operations says a single attachment she opened this morning is now attached to every document she saves, and Defender flags that one file on her machine only
Worm: Twelve workstations in the Finance pod alert within the same two minutes, and none of the affected users remember opening anything
Trojan: A help desk ticket says a "PDF converter" the user downloaded last week is still listed in Startup Apps, and Task Manager shows it talking to an address nobody recognizes
Ransomware: A call comes in that every file on the WealthManagement share now ends in .locked, and a text file in the folder demands payment in cryptocurrency
Spyware and infostealers: An analyst notices one account signed in from a new location using a password that was never reset or shared, and nothing else on the machine looks different
Rootkit: Defender reports a clean scan on a machine, but the Shift queue shows that same machine quietly sending large amounts of data out every night for two weeks
```
