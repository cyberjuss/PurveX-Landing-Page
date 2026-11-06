### Authentication

Authentication proves who you are, nothing more. Every permission granted afterwards assumes it got this right, so the proof has to be hard to fake.

### Factors
<!-- art: mfa -->

| Factor | Examples |
|---|---|
| Something you know | Password, PIN |
| Something you have | Phone with an authenticator app, security key, smart card |
| Something you are | Fingerprint, face |

**Multi-factor authentication** (MFA) needs proof from two different rows. A password plus a security question isn't MFA: both are things you know and leak together.

Passwords leak constantly, and a leaked password protects nothing. Attackers entered Colonial Pipeline in 2021 through a VPN account with a leaked password and no second factor.

MFA methods vary a lot in strength. That's ranked further down.

```sort
prompt: Which kind of factor is each one?
Something you know: A password | A PIN
Something you have: A phone with an authenticator app | A security key | A smart card
Something you are: A fingerprint | Your face
```

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

Don't re-enable a disabled account just because someone asks. Find out who disabled it and why.

```sort
prompt: Match each cause to the account state it produces.
Locked out: A device still using an old password | Someone guessing
Disabled: The person left | The account is under investigation
Password expired: Policy requires a new password
```

### Resets

A reset isn't a chore. For that call, you are the authentication system, and you can bypass every control for one account. That's why attackers target it. In 2023, attackers reportedly got into MGM Resorts by talking the help desk into resetting an employee's MFA.

1. **Verify** with a method the caller cannot fake, such as a callback to the number on file. Caller ID can be spoofed.
2. **Treat an MFA change** as at least as sensitive as a password reset.
3. **Do not skip steps** for urgency or seniority. Pressure is the most common social engineering move.
4. **Document** the caller, the verification method and the change.

If a user reports MFA prompts they didn't trigger, someone has their password and the second factor is all that's holding. Tell them to deny every prompt, reset the password and end their active sessions, then escalate. A reset alone leaves an attacker's open session running.

### Escalate

Escalate straight away for:

- sign-ins to an account that should be dormant
- MFA prompts the user did not start
- a Remote Desktop sign-in to a machine the person never uses
- several reset or MFA change requests for one person in a short time

### How strong is the MFA?

Weakest to strongest:

1. **Text or voice codes.** Open to phishing and to SIM swapping, where an attacker moves the number to a new SIM.
2. **Authenticator app codes.** A fake sign-in page can still capture the code and use it within seconds.
3. **Push approval.** Open to **MFA fatigue**, where an attacker sends prompts until the user approves one. Uber was breached this way in 2022.
4. **Push with number matching.** The user types a number shown on the sign-in screen, so a blind approval fails.
5. **Security keys and passkeys (FIDO2).** The key checks the site's real address, so a fake page gets nothing. These are **phishing-resistant**.

### What the system issues after sign-in

After sign-in, the system issues a **session token**, usually a cookie, that stands in for the password on every request. A stolen token bypasses both the password and MFA.

In a Windows domain, **Kerberos** does the same: the domain controller checks the password once and issues a ticket.

### Reading sign-in events

Event **4624** is a successful sign-in. Its **logon type** says how:

| Logon type | Meaning |
|---|---|
| 2 | At the keyboard |
| 3 | Over the network, such as a file share |
| 10 | Remote Desktop |

Its partner, event **4625**, is a failed sign-in. Two fields tell you why it failed: **Status** and **Sub Status**. For a bad password or a bad username, Status reads `0xC000006D`, a general "sign-in failed", so look at Sub Status for the reason. A Sub Status of `0xC000006A` means a wrong password for a real account. `0xC0000064` means an account name that doesn't exist, which is a sign that someone is guessing usernames. A locked account shows `0xC0000234`.

### Check yourself

A caller says they're Jordan Ellis from Finance and needs an MFA reset before a board meeting in ten minutes, and their caller ID shows Jordan's name. What do you do, and which detail in that call should make you slow down instead of speeding up?
