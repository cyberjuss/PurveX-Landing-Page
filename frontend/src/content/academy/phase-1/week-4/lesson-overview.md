<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Who are you, what are you allowed to do, and who checks every time?</p>
</div>

### Overview

Every sign-in answers two questions: who are you, and what may you do? We squash both into "access", but they fail, get attacked and get fixed separately.

Three pieces do the work:

- **Authentication** proves somebody is who they claim to be, at the front door.
- **Authorization** takes an identity the system already trusts and decides what it may reach.
- **Access control** enforces that decision on every single request, not just once at sign-in.

The gap between deciding and enforcing is where most things go wrong. You'll also hear "Triple A": authentication, authorization and accounting, the record of who did what.

Most real breaches start here, not with clever malware:

| Breach | The way in | What it cost | What failed |
|---|---|---|---|
| Colonial Pipeline, 2021 | A VPN account with a leaked password and no MFA | Ransomware that led Colonial to shut down the pipeline carrying about 45% of the US East Coast's fuel | **Authentication** |
| MGM Resorts, 2023 | A caller who reportedly talked the IT help desk into resetting an employee's MFA | Ransomware that disrupted hotels and casinos for days | **Authentication**, broken through a person |
| First American Financial, 2019 | Changing one number in a web address, with no check that the visitor was allowed to see the document | About 885 million mortgage and banking documents left reachable | **Authorization** |

None needed sophisticated tools. Two were a valid credential in the wrong hands. The third never checked whether the visitor was entitled. Since 2021, broken access control has been number one on the OWASP Top 10 of web application risks.

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

Each role meets this differently:

- **Help desk.** Resetting passwords and MFA makes you part of authentication, which is why attackers call the desk.
- **Systems administrator.** Groups grant permissions, so every extra membership is a door someone may use later.
- **SOC analyst.** Sign-in logs and group changes show when someone isn't who they claim, or reaches further than their job needs.

By the end of the week, you'll be able to:

- name the three kinds of proof, and rank MFA methods by how hard each one is to trick
- handle a password or MFA reset without becoming the attacker's way in
- explain least privilege, and read what an account can do from its groups
- explain why the server has to re-check permissions on every request
- find a broken access control flaw in the lab, exploit it, and describe the fix
