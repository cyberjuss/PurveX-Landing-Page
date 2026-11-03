<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Who are you, what are you allowed to do, and who checks every time?</p>
</div>

### Overview

Every sign-in, and every click after it, answers two separate questions: who are you, and what are you allowed to do now that the system knows. Ordinary speech collapses these into one idea — "access." Keeping them apart is the whole foundation of this week: they fail separately, get attacked separately, and get fixed by different people.

Three pieces do this work:

- **Authentication** proves somebody is who they claim to be, at the front door.
- **Authorization** takes an identity the system already trusts and decides what it may reach.
- **Access control** enforces that decision on every single request, not just once at sign-in.

The gap between deciding something and enforcing it is where most of it goes wrong. You'll also hear these grouped as Triple A: authentication, authorization and accounting, where accounting is the record of who did what.

Most real breaches begin here, not with clever malware. Somebody signs in with a credential they shouldn't have had, to a system that never checked whether they belonged. The three cases below are well documented, and each failed at a different point in that same chain.

| Breach | The way in | What it cost | What failed |
|---|---|---|---|
| Colonial Pipeline, 2021 | A VPN account with a leaked password and no MFA | Ransomware that led Colonial to shut down the pipeline carrying about 45% of the US East Coast's fuel | **Authentication** |
| MGM Resorts, 2023 | A caller who reportedly talked the IT help desk into resetting an employee's MFA | Ransomware that disrupted hotels and casinos for days | **Authentication**, broken through a person |
| First American Financial, 2019 | Changing one number in a web address, with no check that the visitor was allowed to see the document | About 885 million mortgage and banking documents left reachable | **Authorization** |

None of these needed an unknown vulnerability or sophisticated tooling. Two were a valid credential used by the wrong person; the third was an application that never asked whether the visitor was entitled to the document. That's not an accident: since 2021, broken access control has sat at number one on the OWASP Top 10, above every category of injection and misconfiguration.

```connect
prompt: Connect each word to its job.
Authentication = Proves somebody is who they claim to be
Authorization = Decides what an established identity may reach
Access control = Enforces that decision on every single request
```

```match
prompt: Match each breach to the way in.
Colonial Pipeline = A VPN account with a leaked password and no MFA
MGM Resorts = A caller talked the help desk into resetting an employee's MFA
First American Financial = Changing one number in a web address, with no check on the visitor
```

### Where You Meet This on the Job

You'll likely occupy each of these seats at some stage:

- **Help desk.** Resetting passwords and MFA makes you part of the authentication system, not an observer of it — which is why the desk gets called.
- **Systems administrator.** You decide who belongs to which group, and groups grant permissions. Every extra membership is a door somebody may walk through later.
- **SOC analyst.** You read the record the other two leave behind. Sign-in logs and group changes are often the clearest evidence that somebody isn't who they claim, or is reaching further than their job needs.

By the end of the week you will be able to name the three kinds of proof and rank MFA methods by how hard each is to trick, handle a password or MFA reset without becoming the attacker's route in, explain least privilege and read what an account can do from its groups, say why the server must re-check permissions on every request, and find a broken access control flaw in the lab, exploit it, and describe the fix.
