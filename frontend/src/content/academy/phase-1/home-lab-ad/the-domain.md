<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>What has to exist before any account in this lab can sign in?</p>
</div>

### The database

Active Directory is the database of users, computers, and groups. A Windows Server becomes that database only after you install Active Directory Domain Services and promote it to a domain controller.

Promotion is what lets the server authenticate sign-ins with Kerberos. Until that reboot finishes, the departments and accounts have nowhere to live.

In this lab the domain name is `purvexfinancial.local`. The server you promote is the domain controller for that name.

<figure class="ad-shot">
<img src="/academy/home-lab-ad/add-roles.png" alt="Server roles list with Active Directory Domain Services checked" />
<figcaption>Active Directory Domain Services is the role that turns the server into the directory. The server name in this photo is from a practice build. This lab uses purvexfinancial.local.</figcaption>
</figure>

### Why one list matters

Without a domain, each computer keeps its own accounts. A password reset on one PC does not exist on the next. The directory is the one list the firm trusts for who someone is and which computer belongs.

### Authentication, authorization, and accounting

The directory does three jobs. You will use all three on the desk.

- **Authentication** is the domain controller checking who is signing in. Kerberos is that check. After promotion, the sign-in reads as the domain, then the account.
- **Authorization** is what that account is allowed to open. Groups do that job. You meet them on the later tabs.
- **Accounting** is the record of the attempt. The domain controller writes the sign-in, so a lockout or a sign-in from the wrong place can be checked.

### Where the triad shows up

You already named these jobs as the vault, the seal, and the hours.

- **Confidentiality** is the vault. Authentication and group membership are the badge. An account in the wrong group is a badge that should not open the door.
- **Integrity** is the seal on the directory. A title, a ticket, or a caller can be wrong. The account, the group, and the OU are what you verify.
- **Availability** is the hours. If a workstation cannot find the domain controller, nobody signs in even when the directory is correct. That failure is on the next tab.

### Promote the server

Open Server Manager on the Windows Server.

1. Manage, then Add Roles and Features.
2. Keep Role-based selected.
3. Under Server Roles, select Active Directory Domain Services and add the features it asks for.
4. Leave the rest at the defaults. Restart if it asks.

After the reboot, use the flag in Server Manager and choose Promote this server to a domain controller.

1. Add a new forest. The root domain name is `purvexfinancial.local`.
2. Set the recovery password. That password is for Directory Services Restore Mode. It is not a user password.
3. Move through the checks, install, and let the server reboot.

When it comes back, Server Manager shows Active Directory Domain Services installed. This server is the domain controller.

<figure class="ad-shot">
<img src="/academy/home-lab-ad/promoted.png" alt="Windows sign-in showing a domain name, then Administrator" />
<figcaption>After promotion the sign-in is the domain, then the account. This practice screen says CYBERJUSS\Administrator. Yours will say PURVEXFINANCIAL\Administrator.</figcaption>
</figure>

`Install-Forest.ps1` on Install the Domain does this same promotion and links the lab to your Academy account. Use the script when you want that link. Use these screens when you want to see each step.
