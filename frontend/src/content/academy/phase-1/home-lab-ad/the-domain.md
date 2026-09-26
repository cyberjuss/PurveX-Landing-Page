<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>What has to exist before any account in this lab can sign in?</p>
</div>

### The database

Active Directory is the database of users, computers, and groups. A Windows Server becomes that database once you install Active Directory Domain Services and promote it to a domain controller.

Promotion lets the server authenticate sign-ins with Kerberos. Until the promotion reboot finishes, the departments and accounts have nowhere to live.

In this lab the domain name is `purvexfinancial.local`. The server you promote becomes the domain controller for that name.

<figure class="ad-shot">
<img src="/academy/home-lab-ad/add-roles.png" alt="Server roles list with Active Directory Domain Services checked" />
<figcaption>Active Directory Domain Services is the role that turns the server into the directory. The server name in this photo is from a practice build. This lab uses purvexfinancial.local.</figcaption>
</figure>

### Why one list matters

Without a domain, each computer keeps its own accounts. A password reset on one PC does not exist on the next one.

The directory is the one list the firm trusts to say who someone is and which computers belong.

### Authentication, authorization, and accounting

The directory does three jobs, and you will use all three on the desk:

- **Authentication** is the domain controller checking who is signing in. Kerberos performs that check. After promotion, a sign-in reads as the domain, then the account.
- **Authorization** is what the account is allowed to open. Groups do that job, and you meet them on the Groups tab.
- **Accounting** is the record of each attempt. The domain controller logs the sign-in, so you can check a lockout or a sign-in from the wrong place.

### Where the triad shows up

In Week 1 you named the three CIA jobs the vault, the seal, and the hours. Each one maps to the directory:

- **Confidentiality** is the vault. Authentication and group membership act as the badge. An account in the wrong group is a badge that opens a door it should not.
- **Integrity** is the seal on the directory. A title, a ticket, or a caller can be wrong. The account, the group, and the OU are what you verify.
- **Availability** is the hours. If a workstation cannot find the domain controller, nobody signs in, even when the directory is correct. Join a Computer walks through that failure.

### Promote the server

Open Server Manager on the Windows Server and add the role:

1. Choose Manage, then Add Roles and Features.
2. Keep Role-based selected.
3. Under Server Roles, select Active Directory Domain Services and add the features it asks for.
4. Leave the rest at the defaults. Restart if it asks.

After the reboot, click the flag in Server Manager and choose Promote this server to a domain controller:

1. Add a new forest with the root domain name `purvexfinancial.local`.
2. Set the recovery password. It is for Directory Services Restore Mode, not for any user.
3. Move through the checks, install, and let the server reboot.

When the server comes back, Server Manager shows Active Directory Domain Services installed. This server is now the domain controller.

<figure class="ad-shot">
<img src="/academy/home-lab-ad/promoted.png" alt="Windows sign-in showing a domain name, then Administrator" />
<figcaption>After promotion the sign-in is the domain, then the account. This practice screen says CYBERJUSS\Administrator. Yours will say PURVEXFINANCIAL\Administrator.</figcaption>
</figure>

The next tab, Install the Domain, runs this same promotion with `Install-Forest.ps1` and links the lab to your Academy account. Use the script when you want that link. Use these screens when you want to see each step.
