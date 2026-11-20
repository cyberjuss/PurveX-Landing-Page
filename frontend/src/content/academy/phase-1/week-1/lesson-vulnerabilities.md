### Vulnerabilities

A vulnerability is a weakness that someone could take advantage of. It's a flaw in a system or a process, rather than an attack or an attacker, and you'll run into these constantly:

- unpatched software
- a misconfigured firewall
- weak passwords
- a port left open that nobody needs

**A vulnerability on its own causes no harm at all.** A server that's missing a patch isn't doing anything wrong. It keeps running normally until something that can use that weakness is able to reach it. So a list of vulnerabilities isn't the same thing as a list of problems.

### Reading a scanner report

A vulnerability scan returns every weakness it can find, often hundreds of them, with no sense of which ones anything could actually reach. If you treated that output as a queue of emergencies, it would keep a whole team busy forever. So for each finding, the useful question isn't how bad it looks on its own. It's whether anything is in a position to exploit it, and what that would cost if it did.

Vulnerabilities are also the part you control most. You usually can't get rid of the people who would attack you, but you can:

- Patch the software.
- Fix the configuration.
- Strengthen the password policy.
- Close the port.

That's why so much of a security team's daily work happens right here.

```check
prompt: A scan of the network comes back with 300 findings. What do you ask about each one first?
level: 2
* Can anything actually reach it, and what would it cost if it were used? :: Reach and cost decide which findings matter.
How severe does the scanner say it is? :: Severity says how bad the flaw could be, not whether anything can get to it on your network.
Which ones have the most alarming names? :: Ranking by how frightening a finding sounds is the habit this week trains out of you.
why: Severity still helps once you know a finding can be reached. It tells you which of the reachable ones to work first.
```

```match
prompt: The weekly scan came back. Match each fix to the finding it closes.
level: 2
Patch the software = The VPN client on every laptop is three versions behind
Correct the configuration = A firewall rule allows Remote Desktop from anywhere
Strengthen the password policy = Accounts can still use passwords like Summer2026
Close the port = Port 23 is open on the domain controller and nobody knows why
```
