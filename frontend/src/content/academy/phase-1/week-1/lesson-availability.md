### Availability

Availability means that systems and data are there when the people who need them try to use them. When it fails, nothing has leaked and nothing has been altered, so the data is still intact and still private. What has stopped is the work, which is why this failure is a **lockout**. It is also the most visible of the three and usually the first to be reported, because the people affected find out immediately and have no way to carry on.

It matters most where being unreachable is itself the harm:

- email
- the time clock
- the VPN
- a payment page at checkout

A payment page that will not load is losing money for every minute it stays down, and a time clock that is unreachable at shift change creates a payroll problem somebody has to untangle by hand later.

**Controls:** backups, redundant systems and patching.

- **Backups** let you rebuild after something is lost.
- **Redundancy** keeps a second path open when the first one fails.
- **Patching** closes the defects that would otherwise be used to bring a service down deliberately.

Those three answer different causes, because a service can become unavailable through hardware failure, through a mistake in a change, or through somebody attacking it on purpose. That last cause is worth recognising by name. A **distributed denial of service** attack targets availability directly, flooding a service with more requests than it can answer until genuine users cannot get through. Nothing is stolen and nothing is altered, so the attack succeeds purely by making the service unreachable. That makes it a useful reminder that a security incident does not have to involve data leaving the building.
