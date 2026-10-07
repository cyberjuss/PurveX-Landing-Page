<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Who are you, what are you allowed to do, and who checks every time?</p>
</div>

### Introduction

Every sign-in, and in fact every click that follows it, answers two entirely separate questions. The first is who you are, and the second is what you are allowed to do now that the system knows. These get collapsed together in ordinary speech, where people talk about having access to something as though it were one idea. Keeping them apart is the foundation of everything in this week. They fail separately, they are attacked separately, and they are fixed by different people.

Three pieces do this work:

- **Authentication** proves somebody is who they claim to be. It happens at the front door.
- **Authorization** takes an identity the system has already established and decides what it may reach.
- **Access control** enforces that decision on every single request, not once at sign-in.

The distinction between deciding something and enforcing it is where a great deal goes wrong. You will hear the whole set called Triple A, for authentication, authorization and accounting, with accounting being the record of who did what.

What makes this worth a full week is how most real breaches actually begin. The attacks that end up in the news are rarely a matter of clever malware defeating a defence. Far more often somebody simply signed in with a credential they should not have had, to a system that never checked whether they ought to be there. The three cases below are among the better documented examples, and each of them failed at a different point in the chain you have just read about.

| Breach | The way in | What it cost | What failed |
|---|---|---|---|
| Colonial Pipeline, 2021 | A VPN account with a leaked password and no MFA | Ransomware that shut down fuel supply for much of the US East Coast | **Authentication** |
| MGM Resorts, 2023 | A caller who talked the IT help desk into resetting an employee's MFA | Ransomware that disrupted hotels and casinos for days | **Authentication**, broken through a person |
| First American Financial, 2019 | Changing one number in a web address, with no check that the visitor was allowed to see the document | About 885 million mortgage and banking documents left reachable | **Authorization** |

The pattern in that table is worth sitting with for a moment, because none of these required an unknown vulnerability or a sophisticated piece of tooling. In two cases a valid credential was used by the wrong person, and in the third the application simply never asked whether the visitor was entitled to the document it was handing over. Nor is that a historical accident. Since 2021 broken access control has sat at number one on the OWASP Top 10 list of web application risks, above every category of injection and every category of misconfiguration.

### Where you meet this on the job

This material reaches you differently depending on where you sit, and you will likely occupy each seat at some stage:

- **Help desk.** You reset passwords and MFA, which makes you an active part of the authentication system rather than an observer of it. Attackers understand that, which is why the desk gets called.
- **Systems administrator.** You decide who belongs to which group, and groups are what grant permissions. Every extra membership you hand out is a door somebody may walk through later.
- **SOC analyst.** You read the record the other two leave behind. Sign-in logs and group changes are frequently the clearest evidence that somebody is not who they claim to be, or is reaching further than their job requires.

By the end of the week you can:

- Name the three kinds of proof and rank MFA methods by how hard each is to trick
- Handle a password or MFA reset without becoming the attacker's route in
- Explain least privilege and read what an account can do from its groups
- Say why the server must re-check permissions on every request
- Find a broken access control flaw in the lab, exploit it, and describe the fix

### Questions Answered in This Week

- What is the difference between authentication and authorization, and why does it matter?
- What are the three authentication factors, and what makes MFA genuinely multi-factor?
- Which MFA methods resist phishing, and which ones do not?
- How do you handle a password or MFA reset without being socially engineered?
- What is least privilege, and how do groups decide what an account can do?
- Why must a server check permissions on every request instead of hiding the button?
- What does broken access control look like, and how is it found and fixed?
