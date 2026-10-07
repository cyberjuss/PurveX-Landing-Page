### Availability

Availability means that systems and data are there when the people who need them try to use them. When availability fails, nothing has leaked and nothing has been altered. The data is intact and still private. What has stopped is the work, which is why this failure is described as a **lockout**. It is the most visible of the three failures and usually the first one reported, because the people affected find out immediately and have no way to carry on.

The property matters most where being unreachable is itself the harm. Email, the time clock, the VPN and a payment page at checkout are all examples where the content is fine but its absence costs something straight away. A payment page that will not load is losing money for every minute it stays down, and a time clock that is unreachable at shift change creates a payroll problem that somebody has to untangle by hand later.

The controls that protect availability are backups, redundant systems and patching. Backups let you rebuild after something is lost, redundancy keeps a second path open when the first one fails, and patching closes the defects that would otherwise be used to bring a service down deliberately. They answer different causes, because a service can become unavailable through hardware failure, through a mistake in a change, or through somebody attacking it on purpose.

That last cause is worth recognising by name. A distributed denial of service attack targets availability directly, flooding a service with more requests than it can answer until genuine users cannot get through. Nothing is stolen and nothing is altered. The attack succeeds purely by making the service unreachable, which is a useful reminder that a security incident does not have to involve data leaving the building.
