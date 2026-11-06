### Vulnerabilities

A vulnerability is a weakness that someone could take advantage of. It's a flaw in a system or a process, rather than an attack or an attacker, and you'll run into these constantly:

- unpatched software
- a misconfigured firewall
- weak passwords
- a port left open that nobody needs

Here's an idea that takes a little getting used to: **a vulnerability on its own causes no harm at all.** A server that's missing a patch isn't doing anything wrong. It keeps running normally until something that can use that weakness is able to reach it. So a list of vulnerabilities isn't the same thing as a list of problems.

### Reading a scanner report

Once you see vulnerabilities that way, you'll read a scanner report differently. A vulnerability scan returns every weakness it can find, often hundreds of them, with no sense of which ones anything could actually reach. If you treated that output as a queue of emergencies, it would keep a whole team busy forever. So for each finding, the useful question isn't how bad it looks on its own. It's whether anything is in a position to exploit it, and what that would cost if it did.

The encouraging part is that vulnerabilities are also what you control most. You usually can't get rid of the people who would attack you, but you can patch the software, fix the configuration, strengthen the password policy and close the port. That's why so much of a security team's daily work happens right here.

```match
prompt: Match each fix to the weakness it closes.
Patch the software = Unpatched software
Correct the configuration = A misconfigured firewall
Strengthen the password policy = Weak passwords
Close the port = A port left open that nobody needs
```
