<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Who are you, what are you allowed to do, and who checks every time?</p>
</div>

### Overview

Every sign-in, and every click that follows it, answers two separate questions. First, who are you? And second, now that the system knows, what are you allowed to do? In everyday speech, we squash those two questions into a single word, "access". Keeping them apart is the foundation of this whole week, because they fail separately, they get attacked separately, and different people fix them.

Three pieces share that work between them:

- **Authentication** proves somebody is who they claim to be, at the front door.
- **Authorization** takes an identity the system already trusts and decides what it may reach.
- **Access control** enforces that decision on every single request, not just once at sign-in.

Notice the gap between the last two. Deciding what someone may do and actually enforcing it on every request are different steps, and that gap is where most things go wrong. You'll also hear these ideas grouped as "Triple A": authentication, authorization and accounting, where accounting is the record of who did what.

This matters because most real breaches start right here, rather than with clever malware. Someone signs in with a credential they shouldn't have had, to a system that never checked whether they belonged. The three cases below are well documented, and each one failed at a different point in that same chain.

| Breach | The way in | What it cost | What failed |
|---|---|---|---|
| Colonial Pipeline, 2021 | A VPN account with a leaked password and no MFA | Ransomware that led Colonial to shut down the pipeline carrying about 45% of the US East Coast's fuel | **Authentication** |
| MGM Resorts, 2023 | A caller who reportedly talked the IT help desk into resetting an employee's MFA | Ransomware that disrupted hotels and casinos for days | **Authentication**, broken through a person |
| First American Financial, 2019 | Changing one number in a web address, with no check that the visitor was allowed to see the document | About 885 million mortgage and banking documents left reachable | **Authorization** |

Notice that none of these needed an unknown vulnerability or sophisticated tools. Two of them were a valid credential used by the wrong person, and the third was an application that never asked whether the visitor was entitled to the document. That pattern isn't a coincidence, either. Since 2021, broken access control has sat at number one on the OWASP Top 10, the best-known list of web application risks, ahead of every kind of injection and misconfiguration.

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

Over your career, you'll probably sit in each of these seats at some point, and each one touches this week's ideas differently:

- **Help desk.** Resetting passwords and MFA makes you part of the authentication system, not just an observer of it, and that's exactly why attackers call the desk.
- **Systems administrator.** You decide who belongs to which group, and groups are what grant permissions, so every extra membership you hand out is a door someone may walk through later.
- **SOC analyst.** You read the record the other two leave behind. Sign-in logs and group changes are often the clearest evidence that somebody isn't who they claim, or is reaching further than their job needs.

By the end of the week, you'll be able to:

- name the three kinds of proof, and rank MFA methods by how hard each one is to trick
- handle a password or MFA reset without becoming the attacker's way in
- explain least privilege, and read what an account can do from its groups
- explain why the server has to re-check permissions on every request
- find a broken access control flaw in the lab, exploit it, and describe the fix
