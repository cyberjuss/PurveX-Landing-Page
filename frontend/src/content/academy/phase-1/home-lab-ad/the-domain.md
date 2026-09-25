<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>What has to exist before any account in this lab can sign in?</p>
</div>

### The database

Active Directory is the database of users, computers, and groups. A Windows Server becomes that database only after you install Active Directory Domain Services and promote it to a domain controller.

Promotion is what lets the server authenticate sign-ins with Kerberos. Until that reboot finishes, the departments and accounts have nowhere to live.

In this lab the domain name is `purvexfinancial.local`. The server you promote is the domain controller for that name.

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

`Install-Forest.ps1` on Install the Domain does this same promotion and links the lab to your Academy account. Use the script when you want that link. Use these screens when you want to see each step.
