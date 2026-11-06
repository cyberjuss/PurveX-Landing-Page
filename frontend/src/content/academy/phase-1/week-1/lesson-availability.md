### Availability

Availability means that systems and data are there when the people who need them go to use them. When it fails, nothing has leaked and nothing has changed, so the data is still intact and still private. What's stopped is the work itself, which is why we call this failure a **lockout**. It's also the most visible of the three, and usually the first to land in your queue, because the people affected notice straight away.

Availability matters most where being unreachable is the harm in itself, such as:

- email
- the time clock
- the VPN
- a payment page at checkout

To see why, think about what each outage costs. A payment page that won't load loses money for every minute it stays down, and a time clock that's unreachable at shift change leaves someone fixing payroll by hand later.

**Controls:** backups, redundancy and patching.

- **Backups** let you rebuild after something is lost.
- **Redundancy** keeps a second path open when the first one fails.
- **Patching** closes the defects that could otherwise be used to knock a service over.

You need all three because a service can go down for more than one reason: hardware fails, a change goes wrong, or someone attacks it on purpose. That last case has a name you'll hear often. A **distributed denial of service** (DDoS) attack floods a service with more requests than it can answer, until real users can't get through. Nothing is stolen and nothing is changed, which makes it a useful reminder that an incident doesn't have to involve data leaving the building.

```match
prompt: Which availability control would get PurveX working again?
level: 2
Backups = Ransomware encrypted every file on the Finance share
Redundancy = The office's only internet link went down at 9 AM
Patching = A published flaw lets anyone crash the VPN with one request
```

```sort
prompt: Monday's queue at PurveX. A leak, a lie or a lockout?
level: 2
Confidentiality: The Wealth Management client export is sitting in the Operations share | Sam's password was pasted into a team chat
Integrity: A wire approval's account number changed overnight | A firewall rule was quietly edited to allow Remote Desktop
Availability: Nobody can open the file shares this morning | The time clock is down at shift change
```
