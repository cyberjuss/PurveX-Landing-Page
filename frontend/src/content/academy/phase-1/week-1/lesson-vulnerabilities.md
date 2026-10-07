### Vulnerabilities

A vulnerability is a weakness that could be exploited. It is a flaw in a system or a process, and it is worth being clear from the start that it is not an attack and not an attacker. Common examples:

- unpatched software
- a misconfigured firewall
- weak passwords
- a port left open that nobody needs

In every one of those the weakness exists whether or not anybody has noticed it, and whether or not anybody intends to use it.

This is the part that takes getting used to: **a vulnerability on its own causes no harm at all.** A server missing a patch is not doing anything wrong. It sits there running normally, serving its users, and nothing bad happens until something capable of using that weakness is able to reach it. The weakness only becomes a problem in combination with something else, which is why a list of vulnerabilities is not the same thing as a list of problems.

### Reading a scanner report

Understanding that changes how you read a scanner report. A scan returns every weakness it can find, often hundreds of them, with no sense of which ones anything can actually reach. Treating that list as a queue of emergencies will consume a team indefinitely. The useful question about any single finding is not how serious the weakness looks on its own, but whether anything is in a position to exploit it and what it would cost if something did.

Vulnerabilities are also the part of the picture you have the most power over. You generally cannot remove the things that would attack you, but you can patch the software, correct the configuration, strengthen the password policy and close the port. That is why most of the day to day work of a security team is spent here.
