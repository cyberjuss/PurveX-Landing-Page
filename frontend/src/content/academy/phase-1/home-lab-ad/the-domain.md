<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>What has to exist before any account in this lab can sign in?</p>
</div>

### The database

Active Directory is the database of a firm's users, computers and groups. A Windows Server becomes it when you install Active Directory Domain Services and promote the server to a domain controller. It then checks every sign-in with Kerberos. In this lab, the domain is `purvexfinancial.local`.

<figure class="ad-shot">
<img src="/academy/home-lab-ad/add-roles.png" alt="Server roles list with Active Directory Domain Services checked" />
<figcaption>Active Directory Domain Services is the role that turns the server into the directory. The server name in this photo is from a practice build. This lab uses purvexfinancial.local.</figcaption>
</figure>

### Why one list matters

Without a domain, each computer keeps its own accounts, and a password reset on one PC means nothing on the next. The directory is the one list the whole firm trusts.

### Authentication, authorization, and accounting

It does three jobs:

- **Authentication** is the domain controller checking who is signing in, using Kerberos.
- **Authorization** is what the account may open. Groups do that.
- **Accounting** is the log of each attempt, so you can check a lockout or an odd sign-in.

### Where the triad shows up

Week 1's three failures show up here too:

- **Confidentiality** (leak): an account in the wrong group can open what it shouldn't.
- **Integrity** (lie): an account whose group or OU no longer matches what was approved, or a ticket that's untrue. Check against the baseline.
- **Availability** (lockout): if a workstation can't find the domain controller, nobody signs in.

### Promote the server

In Server Manager, add the role:

1. Choose Manage, then Add Roles and Features.
2. Keep Role-based selected.
3. Under Server Roles, select Active Directory Domain Services and add the features it asks for.
4. Leave the rest at the defaults. Restart if it asks.

After the reboot, click the flag in Server Manager and choose Promote this server to a domain controller. Then:

1. Add a new forest with the root domain name `purvexfinancial.local`.
2. Set the recovery password. It is for Directory Services Restore Mode, not for any user.
3. Move through the checks and install, then let the server reboot.

After the reboot, this server is your domain controller.

<figure class="ad-shot">
<img src="/academy/home-lab-ad/promoted.png" alt="Windows sign-in showing a domain name, then Administrator" />
<figcaption>After promotion the sign-in is the domain, then the account. This practice screen says CYBERJUSS\Administrator. Yours will say PURVEXFINANCIAL\Administrator.</figcaption>
</figure>

The Install the Domain tab does the same with `Install-Forest.ps1`. Either way, Build the Environment links the lab to your Range account.
