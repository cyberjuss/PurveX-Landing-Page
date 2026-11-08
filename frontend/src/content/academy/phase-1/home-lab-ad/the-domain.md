<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>What has to exist before any account in this lab can sign in?</p>
</div>

### The database

Active Directory is the database that holds a firm's users, computers and groups. An ordinary Windows Server becomes that database once you install Active Directory Domain Services and promote the server to a domain controller. From then on, it checks every sign-in using a protocol called Kerberos. In this lab, the domain is `purvexfinancial.local`, and until that promotion is finished, the departments and accounts have nowhere to live.

<figure class="ad-shot">
<img src="/academy/home-lab-ad/add-roles.png" alt="Server roles list with Active Directory Domain Services checked" />
<figcaption>Active Directory Domain Services is the role that turns the server into the directory. The server name in this photo is from a practice build. This lab uses purvexfinancial.local.</figcaption>
</figure>

### Why one list matters

To see why a domain matters, imagine the firm without one. Each computer would keep its own separate accounts, so a password reset on one PC would mean nothing on the next. The directory solves that by being the one list the whole firm trusts to say who someone is and which computers belong.

### Authentication, authorization, and accounting

To do that, the directory performs three jobs, and you'll use all three on the desk:

- **Authentication** is the domain controller checking who is signing in, which Kerberos handles.
- **Authorization** is what the account is allowed to open, and groups do that job.
- **Accounting** is the record of each attempt, which is what lets you check a lockout or a sign-in from the wrong place.

### Where the triad shows up

Those jobs connect straight back to the three CIA failures from Week 1, and each one shows up in the directory:

- **Confidentiality** fails as a leak when an account in the wrong group can open a door it shouldn't.
- **Integrity** fails as a lie when an account's group or OU no longer matches what the firm approved, or when a ticket states something untrue. That's why you check against the baseline instead of trusting the request.
- **Availability** fails as a lockout when a workstation can't find the domain controller, because then nobody signs in even if the directory is correct.

### Promote the server

With the background in place, it's time to promote your server. Open Server Manager on the Windows Server and add the role:

1. Choose Manage, then Add Roles and Features.
2. Keep Role-based selected.
3. Under Server Roles, select Active Directory Domain Services and add the features it asks for.
4. Leave the rest at the defaults. Restart if it asks.

After the reboot, click the flag in Server Manager and choose Promote this server to a domain controller. Then:

1. Add a new forest with the root domain name `purvexfinancial.local`.
2. Set the recovery password. It is for Directory Services Restore Mode, not for any user.
3. Move through the checks and install, then let the server reboot.

When the server comes back up, Server Manager shows Active Directory Domain Services as installed, and this server is now your domain controller.

<figure class="ad-shot">
<img src="/academy/home-lab-ad/promoted.png" alt="Windows sign-in showing a domain name, then Administrator" />
<figcaption>After promotion the sign-in is the domain, then the account. This practice screen says CYBERJUSS\Administrator. Yours will say PURVEXFINANCIAL\Administrator.</figcaption>
</figure>

If you'd rather not click through all of this, the Install the Domain tab runs the same promotion with `Install-Forest.ps1`. Either way, it's the Build the Environment tab that links the lab to your Range account.
