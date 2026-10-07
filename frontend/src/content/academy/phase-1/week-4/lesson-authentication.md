### Authentication

Authentication is the work of proving an identity. It answers a single question, which is who you are, and it has nothing at all to say about what you may do once the answer is established. Everything in this section is about making that proof hard to fake, because every permission the system grants afterwards rests on the assumption that it got this first step right.

### Factors

| Factor | Examples |
|---|---|
| Something you know | Password, PIN |
| Something you have | Phone with an authenticator app, security key, smart card |
| Something you are | Fingerprint, face |

**Multi-factor authentication**, almost always shortened to MFA, requires proof drawn from two different rows of that table. The word different is doing real work there. A password combined with a security question is not multi-factor at all, because both are things you know and both are lost in the same way, usually in the same breach.

MFA matters for a blunt reason: passwords leak, constantly and at scale, and a password that has leaked offers no protection whatsoever to the account it guards. In 2021 attackers walked into Colonial Pipeline through a VPN account that had a leaked password and no second factor. The result was a ransomware incident that interrupted fuel supply across much of the US East Coast.

It is a mistake, though, to treat MFA as a single thing that is either present or absent. The methods vary considerably in how much they protect you:

- **Text and app codes** can be captured by a convincing fake sign-in page and replayed within seconds, because the user hands the code over willingly.
- **Security keys and passkeys** check the real address of the site before responding, so a fake page receives nothing it can use.

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

A password or MFA reset is not an administrative chore. It is an authentication decision, and for the duration of that call you are the authentication system. Whatever controls the organization has invested in, you are briefly in a position to set them aside for one account, which is precisely why this is attacked. In 2023 attackers breached MGM Resorts by doing nothing more technical than talking the IT help desk into resetting an employee's MFA.

1. **Verify** with a method the caller cannot fake, such as a callback to the number on file. Caller ID can be spoofed.
2. **Treat an MFA change** as at least as sensitive as a password reset.
3. **Do not skip steps** for urgency or seniority. Pressure is the most common social engineering move.
4. **Document** the caller, the verification method and the change.

One situation deserves to be recognized instantly. A user reporting MFA prompts they did not trigger is telling you that somebody already holds their password and is standing at the door waiting for approval, which means the second factor is the only thing still holding. Tell them to deny every prompt, then reset the password and terminate active sessions before you escalate. The last step matters because a reset on its own leaves any session the attacker has already established untouched.

### Escalate

- sign-ins to an account that should be dormant
- MFA prompts the user did not start
- a Remote Desktop sign-in to a machine the person never uses
- several reset or MFA change requests for one person in a short time

<details class="academy-deeper">
<summary>Go deeper</summary>

#### How strong is the MFA?

From weakest to strongest:

1. **Text or voice codes.** Open to phishing and to SIM swapping, where an attacker moves the number to a new SIM.
2. **Authenticator app codes.** A fake sign-in page can still capture the code and use it within seconds.
3. **Push approval.** Open to **MFA fatigue**, where an attacker sends prompts until the user approves one. Uber was breached this way in 2022.
4. **Push with number matching.** The user types a number shown on the sign-in screen, so a blind approval fails.
5. **Security keys and passkeys (FIDO2).** The key checks the site's real address, so a fake page gets nothing. These are **phishing-resistant**.

#### What the system issues after sign-in

After sign-in the system issues a **session token**, usually a cookie. The browser sends it with every request, so it stands in for the password. A stolen token bypasses both the password and MFA.

In a Windows domain, **Kerberos** plays the same role. The domain controller checks the password once and issues a ticket that the computer shows to other services.

#### Reading sign-in events

Event **4624** is a successful sign-in. Its **logon type** shows how:

| Logon type | Meaning |
|---|---|
| 2 | At the keyboard |
| 3 | Over the network, such as a file share |
| 10 | Remote Desktop |

Event **4625** is a failed sign-in. `0xC000006A` is a wrong password for a real account. `0xC0000064` is an account name that does not exist, a sign of username guessing. `0xC0000234` is a locked account.

</details>

### Check yourself

A caller says they are Jordan Ellis from Finance and needs an MFA reset before a board meeting in ten minutes. Their caller ID shows Jordan's name. What do you do, and which detail in that call should make you slow down instead of speeding up?
