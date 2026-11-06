### Vulnerabilities

A vulnerability is a weakness that someone could take advantage of. It's a flaw in a system or a process, not an attack or an attacker. Here are some you'll run into constantly:

- unpatched software
- a misconfigured firewall
- weak passwords
- a port left open that nobody needs

Notice that each of these weaknesses exists whether or not anyone has spotted it, and whether or not anyone plans to use it.

That leads to an idea that takes a little getting used to: **a vulnerability on its own causes no harm at all.** A server that's missing a patch isn't doing anything wrong. It runs normally and serves its users until something that can use the weakness reaches it. A weakness only becomes a problem when it meets something else. So a list of vulnerabilities isn't a list of problems.

### Reading a scanner report

Once you see vulnerabilities that way, you'll read a scanner report differently. A vulnerability scan returns every weakness it can find, often hundreds, with no sense of which ones anything could reach. Treat that output as a queue of emergencies and it would keep a whole team busy forever. So for each finding, don't ask "how bad does this look on its own?" Ask "is anything in a position to exploit this, and what would it cost us if something did?"

On the bright side, vulnerabilities are also the part of the picture you have the most control over. You usually can't get rid of the people or programs that would attack you. You can patch the software, fix the configuration, strengthen the password policy and close the port. That's why so much of a security team's daily work happens here.

```match
prompt: Match each fix to the weakness it closes.
Patch the software = Unpatched software
Correct the configuration = A misconfigured firewall
Strengthen the password policy = Weak passwords
Close the port = A port left open that nobody needs
```
