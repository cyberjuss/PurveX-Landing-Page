### Availability

Availability means systems and data are there when people need them. When it fails, nothing leaked and nothing changed. The work stopped. That's a **lockout**. It's the most visible failure and usually the first in your queue, because people notice straight away.

It matters most where being unreachable is the harm:

- email
- the time clock
- the VPN
- a payment page at checkout

A payment page that won't load loses money every minute. A time clock that's down at shift change means fixing payroll by hand later.

**Controls:** backups, redundancy and patching.

- **Backups** let you rebuild after a loss.
- **Redundancy** keeps a second path open when the first fails.
- **Patching** closes defects that could be used to knock a service over.

A service can go down from failed hardware, a bad change or an attack. A **distributed denial of service** (DDoS) attack floods a service until real users can't get through. Nothing is stolen or changed, which is a reminder that an incident doesn't have to involve data leaving the building.

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
