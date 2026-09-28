### Authentication

Authentication proves an identity. It answers one question: who are you?

### Factors

| Factor | Examples |
|---|---|
| Something you know | Password, PIN |
| Something you have | Phone with an authenticator app, security key, smart card |
| Something you are | Fingerprint, face |

**Multi-factor authentication (MFA)** requires proof from two different factors. A password plus a security question is still one factor, because both are something you know.

MFA matters because passwords leak. In 2021, attackers entered Colonial Pipeline through a VPN account with a leaked password and no MFA.

### MFA strength

From weakest to strongest:

1. **Text or voice codes.** Open to SIM swapping, where an attacker moves the number to a new SIM, and to phishing.
2. **Authenticator app codes.** A fake sign-in page can still capture the code and use it within seconds.
3. **Push approval.** Open to **MFA fatigue**, where an attacker sends prompts until the user approves one. Uber was breached this way in 2022.
4. **Push with number matching.** The user types a number shown on the sign-in screen, so a blind approval fails.
5. **Security keys and passkeys (FIDO2).** The key checks the site's real address, so a fake page gets nothing. These are **phishing-resistant**.

### Sessions

After sign-in, the system issues a **session token**, usually a cookie. The browser sends it with every request, so it stands in for the password. A stolen token bypasses both the password and MFA.

In a Windows domain, **Kerberos** plays the same role. The domain controller checks the password once and issues a ticket that the computer shows to other services.

### Account states

| State | Meaning | Typical cause |
|---|---|---|
| Locked out | Too many wrong passwords in a short time | A device still using an old password, or someone guessing |
| Disabled | An administrator turned the account off | The person left, or the account is under investigation |
| Password expired | Policy requires a new password | Normal. The user sets a new one |

```
Get-ADUser jamie.torres -Properties LockedOut, Enabled, PasswordExpired, LastLogonDate, BadLogonCount
Search-ADAccount -LockedOut
Unlock-ADAccount jamie.torres
```

Do not re-enable a disabled account on request. Find out who disabled it and why.

### Resets

A password or MFA reset is an authentication decision. In 2023, attackers breached MGM Resorts by talking the help desk into an MFA reset.

1. **Verify** with a method the caller cannot fake, such as a callback to the number on file. Caller ID can be spoofed.
2. **Treat an MFA change** as at least as sensitive as a password reset.
3. **Do not skip steps** for urgency or seniority. Pressure is the most common social engineering move.
4. **Document** the caller, the verification method and the change.

Unexpected MFA prompts mean someone already has the password. Tell the user to deny them, reset the password, end active sessions and escalate.

### Logs

Event **4624** is a successful sign-in. Its **logon type** shows how:

| Logon type | Meaning |
|---|---|
| 2 | At the keyboard |
| 3 | Over the network, such as a file share |
| 10 | Remote Desktop |

Event **4625** is a failed sign-in. `0xC000006A` is a wrong password for a real account. `0xC0000064` is an account name that does not exist, a sign of username guessing. `0xC0000234` is a locked account.

Escalate:

- sign-ins to an account that should be dormant
- MFA prompts the user did not start
- a Remote Desktop sign-in (type 10) to a machine the person never uses
- several reset or MFA change requests for one person in a short time

### Check yourself

A caller says they are Jordan Ellis, the Finance lead, and need an MFA reset before a board meeting in ten minutes. Their caller ID shows Jordan's name. What do you do, and which detail in that call should make you slow down, not speed up?
