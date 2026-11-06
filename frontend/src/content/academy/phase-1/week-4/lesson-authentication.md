### Authentication

Authentication is the work of proving an identity. It answers one question, who you are, and says nothing about what you're allowed to do. Everything in this section is about making that proof hard to fake, because every permission the system grants afterwards assumes this first step was right.

### Factors
<!-- art: mfa -->

| Factor | Examples |
|---|---|
| Something you know | Password, PIN |
| Something you have | Phone with an authenticator app, security key, smart card |
| Something you are | Fingerprint, face |

**Multi-factor authentication**, or MFA, requires proof from two different rows of that table. That's why a password plus a security question isn't multi-factor at all, since both are things you know, and both tend to get lost in the same breach.

The reason MFA matters is blunt: passwords leak constantly and at scale, and a leaked password offers no protection to the account it guards. That's how attackers walked into Colonial Pipeline in 2021, through a VPN account with a leaked password and no second factor. Keep in mind, too, that MFA isn't simply on or off, because the methods vary a lot in strength. We'll rank them later in this lesson.

```sort
prompt: Which kind of factor is each one?
level: 1
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

One rule to take from that table: don't re-enable a disabled account just because someone asks. Find out who disabled it, and why, first.

```sort
prompt: Calls from this morning. Which account state is each person in?
level: 2
Locked out: Riley mistyped her password five times in a row | Someone tried 40 passwords against jamie.torres in an hour
Disabled: Kai's contract ended on Friday and IT turned the account off | The account is frozen while Compliance investigates
Password expired: Taylor's password reached the end of its allowed age
```

### Resets

It's easy to think of a password or MFA reset as an administrative chore, but it's really an authentication decision. For the length of that call, you are the authentication system, able to set aside every control the organization has built, for one account. That's precisely why attackers target this call. In 2023, they reportedly got their first foothold at MGM Resorts without any technical exploit, simply by talking the help desk into resetting an employee's MFA.

1. **Verify** with a method the caller cannot fake, such as a callback to the number on file. Caller ID can be spoofed.
2. **Treat an MFA change** as at least as sensitive as a password reset.
3. **Do not skip steps** for urgency or seniority. Pressure is the most common social engineering move.
4. **Document** the caller, the verification method and the change.

There's one situation you should learn to recognize instantly. When a user reports MFA prompts they didn't trigger, someone already has their password and is waiting at the door for approval, so the second factor is the only thing still holding. Tell them to deny every prompt, then reset the password and end their active sessions before you escalate. That last step matters, because a reset on its own leaves any session the attacker already opened untouched.

### Escalate

Some signs mean you should pass the case up straight away rather than handle it yourself:

- sign-ins to an account that should be dormant
- MFA prompts the user did not start
- a Remote Desktop sign-in to a machine the person never uses
- several reset or MFA change requests for one person in a short time

### How strong is the MFA?

Earlier, you saw that MFA methods differ in strength. Here they are in order, from weakest to strongest:

1. **Text or voice codes.** Open to phishing and to SIM swapping, where an attacker moves the number to a new SIM.
2. **Authenticator app codes.** A fake sign-in page can still capture the code and use it within seconds.
3. **Push approval.** Open to **MFA fatigue**, where an attacker sends prompts until the user approves one. Uber was breached this way in 2022.
4. **Push with number matching.** The user types a number shown on the sign-in screen, so a blind approval fails.
5. **Security keys and passkeys (FIDO2).** The key checks the site's real address, so a fake page gets nothing. These are **phishing-resistant**.

### What the system issues after sign-in

Once you've signed in, the system doesn't ask for your password on every click. It issues a **session token**, usually a cookie, which the browser sends with every request so it stands in for the password from then on. That's why a stolen token is so dangerous: it bypasses both the password and MFA.

In a Windows domain, **Kerberos** plays the same role. The domain controller checks the password once, then issues a ticket that the computer shows to other services instead.

### Reading sign-in events

All of these sign-ins leave a record you can read. Event **4624** is a successful sign-in, and its **logon type** tells you how the person signed in:

| Logon type | Meaning |
|---|---|
| 2 | At the keyboard |
| 3 | Over the network, such as a file share |
| 10 | Remote Desktop |

Its partner, event **4625**, is a failed sign-in. Two fields tell you why it failed: **Status** and **Sub Status**. For a bad password or a bad username, Status reads `0xC000006D`, a general "sign-in failed", so look at Sub Status for the reason. A Sub Status of `0xC000006A` means a wrong password for a real account. `0xC0000064` means an account name that doesn't exist, which is a sign that someone is guessing usernames. A locked account shows `0xC0000234`.

### Check yourself

Here's one to think through. A caller says they're Jordan Ellis from Finance and needs an MFA reset before a board meeting in ten minutes, and their caller ID shows Jordan's name. What do you do, and which detail in that call should make you slow down instead of speeding up?

<details class="lk-answer">
<summary>Compare your answer</summary>

Follow the same process you'd use for anyone: verify with a callback to the number on file, not the number that called you, before you touch the MFA. Caller ID can be spoofed, so seeing Jordan's name proves nothing. The detail that should slow you down is the deadline. A board meeting in ten minutes is pressure, and pressure to skip a step is the most common social engineering move there is.

</details>
