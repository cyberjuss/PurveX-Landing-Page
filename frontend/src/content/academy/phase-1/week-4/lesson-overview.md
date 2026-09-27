<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Who are you, what are you allowed to do, and who checks every time?</p>
</div>

### Overview

Every sign-in and every click inside a system answers two separate questions.

- **Authentication:** who are you? Prove it.
- **Authorization:** now that we know who you are, what are you allowed to do?

A third piece ties them together. **Access control** is the check that enforces the answer on every request, not just at the front door. People call the whole set "Triple A": authentication, authorization and accounting, where accounting is the log of who did what.

Most breaches you will study start here, not with clever malware.

- In 2021, attackers entered Colonial Pipeline's network through a VPN account that had a leaked password and no multi-factor authentication. That one account led to a ransomware attack that shut down fuel supply for much of the US East Coast. That was an **authentication** failure.
- In 2023, an attacker called MGM Resorts' IT help desk pretending to be an employee and talked the help desk into resetting that person's MFA. The call led to a ransomware attack that disrupted hotels and casinos for days. **Authentication** again, broken through a person instead of a password.
- In 2019, First American Financial left about 885 million mortgage and banking documents reachable by changing one number in a web address. The site never checked whether the visitor was allowed to see that document. That was an **authorization** failure.

Broken access control has been number one on the OWASP Top 10, the standard list of web application risks, since 2021.

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
