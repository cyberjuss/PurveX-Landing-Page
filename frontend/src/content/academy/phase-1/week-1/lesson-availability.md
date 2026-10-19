### Availability

Availability means that systems and data are there when the people who need them try to use them. When it fails, nothing has leaked and nothing has been altered, so the data is still intact and still private. What has stopped is the work, which is why this failure is a **lockout**. It is also the most visible of the three and usually the first to be reported, because the people affected find out immediately and have no way to carry on.

It matters most where being unreachable is itself the harm:

- email
- the time clock
- the VPN
- a payment page at checkout

A payment page that will not load loses money for every minute it stays down. A time clock that is unreachable at shift change creates a payroll problem that somebody has to untangle by hand later.

**Controls:** backups, redundancy and patching.

- **Backups** let you rebuild after something is lost.
- **Redundancy** keeps a second path open when the first one fails.
- **Patching** closes the defects that would otherwise be used to bring a service down deliberately.

Those three answer different causes, because a service can go down in more than one way: hardware fails, a change goes wrong, or somebody attacks it on purpose. The last of those is worth recognizing by name. A **distributed denial of service** attack targets availability directly, flooding a service with more requests than it can answer until genuine users cannot get through. Nothing is stolen and nothing is altered, so the attack succeeds purely by making the service unreachable. That makes it a useful reminder that a security incident does not have to involve data leaving the building.

```match
prompt: Match each control to what it does.
Backups = Let you rebuild after something is lost
Redundancy = Keeps a second path open when the first one fails
Patching = Closes the defects that would be used to bring a service down
```

```sort
prompt: A leak, a lie or a lockout? Sort each failure by the part of the triad that broke.
Confidentiality: A leaked password | Salaries seen by someone never meant to see them | Medical records read by the wrong person
Integrity: A payroll figure that changed overnight | A firewall rule changed to allow traffic that used to be blocked | An altered medication dose
Availability: A site that will not load | A DDoS flood makes the service unreachable | The time clock is unreachable at shift change
```
