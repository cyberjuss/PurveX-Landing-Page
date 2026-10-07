<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Who are you, what are you allowed to do, and who checks every time?</p>
</div>

### Introduction

Every sign-in, and in fact every click that follows it, answers two entirely separate questions. The first is who you are, and the second is what you are allowed to do now that the system knows. These get collapsed together in ordinary speech, where people talk about having access to something as though it were one idea. Keeping them apart is the foundation of everything in this week, because they fail separately, they are attacked separately, and they are fixed by different people.

**Authentication** answers the first question. It is the work of proving that somebody is who they claim to be, and it happens at the front door. **Authorization** answers the second. It takes an identity the system has already established and decides what that identity may reach. A third piece ties the two together. **Access control** is the check that actually enforces the authorization decision on every single request rather than once at sign-in, and the distinction between deciding something and enforcing it is where a great deal goes wrong. You will hear the whole set referred to as Triple A, for authentication, authorization and accounting, with accounting being the record of who did what.

What makes this worth a full week is how most real breaches actually begin. The attacks that end up in the news are rarely a matter of clever malware defeating a defence. Far more often somebody simply signed in, using a credential they should not have had, to a system that never checked whether they ought to be there. The three cases below are among the better documented examples, and each one failed at a different point in the chain you have just read about.

| Breach | The way in | What it cost | What failed |
|---|---|---|---|
| Colonial Pipeline, 2021 | A VPN account with a leaked password and no MFA | Ransomware that shut down fuel supply for much of the US East Coast | **Authentication** |
| MGM Resorts, 2023 | A caller who talked the IT help desk into resetting an employee's MFA | Ransomware that disrupted hotels and casinos for days | **Authentication**, broken through a person |
| First American Financial, 2019 | Changing one number in a web address, with no check that the visitor was allowed to see the document | About 885 million mortgage and banking documents left reachable | **Authorization** |

The pattern in that table is worth sitting with for a moment. None of these required an unknown vulnerability or a sophisticated piece of tooling. In two cases a valid credential was used by the wrong person, and in the third the application simply never asked whether the visitor was entitled to the document it was handing over. This is not a historical accident either. Since 2021 broken access control has sat at number one on the OWASP Top 10 list of web application risks, above every category of injection and every category of misconfiguration.

### Where you meet this on the job

This material reaches you differently depending on where you sit, and all three vantage points matter because you will likely occupy each of them at some stage.

On the **help desk** you reset passwords and MFA, which makes you an active part of the authentication system rather than an observer of it. Attackers understand this perfectly well, which is why the desk gets called. On the **systems administration** side you decide who belongs to which group, and since groups are what grant permissions, every extra membership you hand out is a door that somebody may walk through later. As a **SOC analyst** you read the record both of those activities leave behind, where sign-in logs and group changes are frequently the clearest evidence that somebody is not who they claim to be, or is reaching further than their job requires.

By the end of the week you should be able to name the three kinds of proof and rank the common MFA methods by how hard each is to trick. You should be able to handle a password or MFA reset without becoming the attacker's route in, which is a narrower path than it first appears. You should be able to explain least privilege and work out what an account can actually do by reading its group memberships. You should be able to say why the server has to re-check permissions on every request rather than trusting what it decided a moment ago. And in the lab you should be able to find a broken access control flaw, exploit it, and describe how it ought to be fixed.

### Questions Answered in This Week

- What is the difference between authentication and authorization, and why does it matter?
- What are the three authentication factors, and what makes MFA genuinely multi-factor?
- Which MFA methods resist phishing, and which ones do not?
- How do you handle a password or MFA reset without being socially engineered?
- What is least privilege, and how do groups decide what an account can do?
- Why must a server check permissions on every request instead of hiding the button?
- What does broken access control look like, and how is it found and fixed?
