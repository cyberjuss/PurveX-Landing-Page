<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>What has to exist before any account in this lab can sign in?</p>
</div>

### The database

Active Directory is the database that holds a firm's users, computers, and groups. An ordinary Windows Server becomes that database once you install Active Directory Domain Services and promote the server to a domain controller.

After it's promoted, the server checks every sign-in using a protocol called Kerberos. Until that promotion and its reboot are finished, though, the departments and accounts have nowhere to live.

In this lab, the domain name is `purvexfinancial.local`, and the server you promote becomes the domain controller for that name.

<figure class="ad-shot">
<img src="/academy/home-lab-ad/add-roles.png" alt="Server roles list with Active Directory Domain Services checked" />
<figcaption>Active Directory Domain Services is the role that turns the server into the directory. The server name in this photo is from a practice build. This lab uses purvexfinancial.local.</figcaption>
</figure>

### Why one list matters

To see why a domain matters, imagine the firm without one. Each computer would keep its own separate accounts, so a password reset on one PC would mean nothing on the next.

The directory solves that by being the one list the whole firm trusts to say who someone is and which computers belong.

### Authentication, authorization, and accounting

To do that, the directory performs three jobs, and you'll use all three on the desk:

- **Authentication** is the domain controller checking who is signing in. Kerberos performs that check. After promotion a sign-in reads as the domain followed by the account.
- **Authorization** is what the account is allowed to open. Groups do that job, and you meet them on the Groups tab.
- **Accounting** is the record of each attempt. The domain controller logs the sign-in, so you can check a lockout or a sign-in from the wrong place.

### Where the triad shows up

Those jobs connect straight back to Week 1, where you named the three CIA failures: a leak, a lie, and a lockout. Each one shows up in the directory like this:

- **Confidentiality** fails as a leak. Authentication and group membership decide who can open what. An account in the wrong group can open a door it should not.
- **Integrity** fails as a lie. In the directory, that is an account whose group or OU no longer matches what the firm approved, or a ticket that states something untrue. Verify the account, its group and its OU against the baseline instead of trusting the request.
- **Availability** fails as a lockout. If a workstation cannot find the domain controller, nobody signs in even when the directory is correct. Join a Computer walks through that failure.

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

When the server comes back up, Server Manager shows Active Directory Domain Services as installed, which means this server is now your domain controller.

<figure class="ad-shot">
<img src="/academy/home-lab-ad/promoted.png" alt="Windows sign-in showing a domain name, then Administrator" />
<figcaption>After promotion the sign-in is the domain, then the account. This practice screen says CYBERJUSS\Administrator. Yours will say PURVEXFINANCIAL\Administrator.</figcaption>
</figure>

If you'd rather not click through all of this, the Install the Domain tab runs the same promotion with `Install-Forest.ps1`. Use the script when you want speed, or these screens when you want to see each step. Either way, it's the Build the Environment tab that links the lab to your Range account.
