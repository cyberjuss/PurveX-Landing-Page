### Vulnerabilities

A vulnerability is a weakness that someone could take advantage of. It's a flaw in a system or in a process. It isn't an attack, and it isn't an attacker. Here are some you'll run into constantly:

- unpatched software
- a misconfigured firewall
- weak passwords
- a port left open that nobody needs

Notice that every one of these weaknesses exists whether or not anyone has spotted it, and whether or not anyone plans to use it.

This next idea takes a little getting used to: **a vulnerability on its own causes no harm at all.** A server that's missing a patch isn't doing anything wrong. It sits there running normally and serving its users until something that can use that weakness is able to reach it. Because a weakness only becomes a problem when it meets something else, a list of vulnerabilities isn't the same thing as a list of problems.

### Reading a scanner report

Once you see it that way, you'll read a scanner report differently. A vulnerability scan returns every weakness it can find, often hundreds of them, without any sense of which ones something could actually reach. If you treat that output as a queue of emergencies, it will keep a whole team busy forever. So for any single finding, the useful question isn't "how bad does this weakness look on its own?" It's "is anything in a position to exploit this, and what would it cost us if something did?"

Vulnerabilities are also the part of the picture you have the most control over. You usually can't get rid of the people or programs that would attack you, but you can patch the software, fix the configuration, strengthen the password policy and close the port. That's why so much of a security team's day-to-day work happens right here.

```match
prompt: Match each fix to the weakness it closes.
Patch the software = Unpatched software
Correct the configuration = A misconfigured firewall
Strengthen the password policy = Weak passwords
Close the port = A port left open that nobody needs
```
