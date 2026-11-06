### Vulnerabilities

A vulnerability is a weakness someone could take advantage of. It's a flaw in a system or process, not an attack:

- unpatched software
- a misconfigured firewall
- weak passwords
- a port left open that nobody needs

**A vulnerability on its own causes no harm.** A server missing a patch runs normally until something that can use the weakness reaches it. So a list of vulnerabilities isn't a list of problems.

### Reading a scanner report

A vulnerability scan returns every weakness it finds, often hundreds. Treat that as a queue of emergencies and you'll never finish. For each finding, ask: is anything in a position to exploit this, and what would it cost if it did?

Vulnerabilities are also the part you control most. You can't remove attackers, but you can patch, fix the configuration, tighten the password policy and close the port. That's where most daily security work happens.

```match
prompt: Match each fix to the weakness it closes.
Patch the software = Unpatched software
Correct the configuration = A misconfigured firewall
Strengthen the password policy = Weak passwords
Close the port = A port left open that nobody needs
```
