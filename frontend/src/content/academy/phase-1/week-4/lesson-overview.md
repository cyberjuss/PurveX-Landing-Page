<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Who are you, what are you allowed to do, and who checks every time?</p>
</div>

### Overview

Every sign-in and every click inside a system answers two separate questions.

- **Authentication:** who are you? Prove it.
- **Authorization:** now that we know who you are, what are you allowed to do?

A third piece ties them together. **Access control** is the check that enforces the answer on every request, not just at the front door. People call the whole set "Triple A": authentication, authorization and accounting. Accounting is the log of who did what.

Most breaches you will study start here, not with clever malware.

| Breach | The way in | What it cost | What failed |
|---|---|---|---|
| Colonial Pipeline, 2021 | A VPN account with a leaked password and no MFA | Ransomware that shut down fuel supply for much of the US East Coast | **Authentication** |
| MGM Resorts, 2023 | A caller who talked the IT help desk into resetting an employee's MFA | Ransomware that disrupted hotels and casinos for days | **Authentication**, broken through a person |
| First American Financial, 2019 | Changing one number in a web address, with no check that the visitor was allowed to see the document | About 885 million mortgage and banking documents left reachable | **Authorization** |

Since 2021, broken access control has been number one on the OWASP Top 10 list of web application risks.

### Where you meet this on the job

- **Help desk:** you reset passwords and MFA, which means you are part of authentication. Attackers know that and call the desk.
- **Systems administrator:** you decide who is in which group, and groups decide what people can do. Every extra permission is a door someone can use later.
- **SOC analyst:** sign-in logs and group changes tell you when someone is not who they claim to be, or is doing more than their job allows.

By the end of the week you should be able to:

- Name the three kinds of proof and rank MFA methods by how hard they are to trick
- Handle a password or MFA reset without becoming the attacker's way in
- Explain least privilege and read what an account can do from its groups
- Explain why the server has to check permissions on every request
- Find and exploit a broken access control flaw in the lab, and say how to fix it
