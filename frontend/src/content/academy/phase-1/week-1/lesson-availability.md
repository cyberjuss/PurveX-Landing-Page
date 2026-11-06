### Availability

Availability means that systems and data are there when the people who need them go to use them. When it fails, nothing has leaked and nothing has been changed, so the data is still intact and still private. What's stopped instead is the work itself, which is why we call this failure a **lockout**. It's also the most visible of the three failures, and usually the first to land in your queue. The people affected notice straight away and can't carry on until it's fixed.

So availability matters most where being unreachable is the harm in itself, such as:

- email
- the time clock
- the VPN
- a payment page at checkout

To see why, think about what each outage costs. A payment page that won't load loses money for every minute it stays down. In the same way, a time clock that's unreachable at shift change creates a payroll mess that someone will have to sort out by hand later.

**Controls:** backups, redundancy and patching.

- **Backups** let you rebuild after something is lost.
- **Redundancy** keeps a second path open when the first one fails.
- **Patching** closes the defects that would otherwise be used to bring a service down deliberately.

You need all three of these because a service can go down for more than one reason: hardware fails, a change goes wrong, or someone attacks it on purpose. That last case has a name you'll hear often. A **distributed denial of service** (DDoS) attack goes straight after availability by flooding a service with more requests than it can answer, until real users can't get through. Since nothing is stolen and nothing is changed, the attack succeeds just by making the service unreachable. That makes it a useful reminder that a security incident doesn't have to involve data leaving the building.

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
