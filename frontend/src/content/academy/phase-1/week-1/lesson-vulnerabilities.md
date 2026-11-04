### Vulnerabilities

A vulnerability is a weakness that someone could take advantage of. In other words, it's a flaw in a system or a process, rather than an attack or an attacker. Here are some you'll run into constantly:

- unpatched software
- a misconfigured firewall
- weak passwords
- a port left open that nobody needs

Notice that each of these weaknesses exists whether or not anyone has spotted it, and whether or not anyone plans to use it.

That leads to an idea that takes a little getting used to: **a vulnerability on its own causes no harm at all.** A server that's missing a patch, for instance, isn't doing anything wrong. It sits there running normally and serving its users until something that can use that weakness is able to reach it. And because a weakness only becomes a problem when it meets something else, a list of vulnerabilities isn't the same thing as a list of problems.

### Reading a scanner report

Once you see vulnerabilities that way, you'll read a scanner report differently. A vulnerability scan returns every weakness it can find, often hundreds of them, without any sense of which ones something could actually reach. If you treated that output as a queue of emergencies, it would keep a whole team busy forever. So for any single finding, the useful question isn't "how bad does this weakness look on its own?" Instead, it's "is anything in a position to exploit this, and what would it cost us if something did?"

On the bright side, vulnerabilities are also the part of the picture you have the most control over. You usually can't get rid of the people or programs that would attack you, but you can patch the software, fix the configuration, strengthen the password policy and close the port. That's why so much of a security team's day-to-day work happens right here.

```match
prompt: Match each fix to the weakness it closes.
Patch the software = Unpatched software
Correct the configuration = A misconfigured firewall
Strengthen the password policy = Weak passwords
Close the port = A port left open that nobody needs
```
