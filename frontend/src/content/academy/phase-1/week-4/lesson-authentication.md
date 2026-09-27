### Authentication: Who Are You?

Two calls reach the desk on the same morning.

Jamie Torres in Wealth Management says their phone keeps buzzing with sign-in approval requests they did not start. There have been about fifteen in ten minutes, and Jamie asks if it is fine to approve one so they stop.

An hour later someone calls, says they are Jamie, says they got a new phone, and asks you to move their MFA to it right away because a client meeting starts in five minutes.

Both calls are about authentication. One of them may be the attacker.

<div class="academy-analogy">
<span class="academy-analogy__tag">Think of it like a building entrance</span>
<ul>
<li>The badge reader, the guard who checks your face and the PIN pad are three different kinds of proof.</li>
<li>Using two of them together is far harder to fake than any one on its own.</li>
<li>The weakest spot is often the guard who can be talked into letting someone through.</li>
</ul>
</div>

### Three kinds of proof

Authentication means proving you are who you claim to be. There are three kinds of proof, called **factors**:

| Factor | Examples |
|---|---|
| Something you know | Password, PIN |
| Something you have | Phone with an authenticator app, security key, smart card |
| Something you are | Fingerprint, face |

**Multi-factor authentication (MFA)** needs proof from two different kinds. A password plus a security question is still one factor, because both are things you know. A password plus a code from your phone is two.

MFA matters because passwords leak. Colonial Pipeline's attackers had a working password. MFA would have asked them for a second proof they did not have.

### Not all MFA is equal

From easiest to trick to hardest:

1. **Text message or voice codes.** Attackers can take over a phone number by convincing the carrier to move it to a new SIM, and codes can be phished on fake sign-in pages.
2. **Authenticator app codes.** Better, but a fake sign-in page can still ask for the code and use it within seconds.
3. **Push approval.** The phone asks "Approve this sign-in?" Attackers with a stolen password send prompt after prompt until the user approves one to make them stop. This is **MFA fatigue**. In 2022, Uber was breached this way after an attacker flooded a contractor with prompts and then messaged them pretending to be IT.
4. **Push with number matching.** The sign-in screen shows a number and the user has to type it on the phone. A user who did not start the sign-in cannot see the number, so a blind approval is impossible.
5. **Security keys and passkeys (FIDO2).** The key checks the real website's address before it answers. A fake page gets nothing. These are called **phishing-resistant**.

### After you sign in: the session

Signing in happens once. After that, the system hands your browser a **session token**, usually a cookie, and the browser shows it with every request. That token is your identity for the rest of the session.

Two things follow. First, a stolen session token skips the password and MFA entirely. Some phishing kits sit between the user and the real site just to capture it. Second, the server has to keep checking what that session is allowed to do on every request. The Broken Access Control section and this week's lab are about exactly that.

On a Windows domain the idea is the same. When a PurveX user signs in, the domain controller checks the password with **Kerberos** and issues a ticket. The laptop shows that ticket to file servers and other services instead of sending the password again.

### On the help desk: account states

When "I can't sign in" comes in, find out which state the account is in before you change anything:

| State | What it means | Typical cause |
|---|---|---|
| Locked out | Too many wrong passwords in a short time | A phone or mapped drive still using an old password, or someone guessing |
| Disabled | An administrator turned the account off | The person left, or the account is under investigation |
| Password expired | Policy required a new password | Normal. The user sets a new one |

In PowerShell with the Active Directory module:

```
Get-ADUser jamie.torres -Properties LockedOut, Enabled, PasswordExpired, LastLogonDate, BadLogonCount
Search-ADAccount -LockedOut
Unlock-ADAccount jamie.torres
```

Do not re-enable a disabled account because someone asked. Find out who disabled it and why.

### On the help desk: resets are authentication

When you reset a password or move someone's MFA to a new phone, you are the authentication. If an attacker can talk you into it, every other control is bypassed. That is exactly what happened at MGM Resorts in 2023.

Handle every reset the same way, however urgent the caller sounds:

1. **Verify with something the attacker cannot copy.** Call back the number on file in the directory, not the number the caller gives you. Follow your company's approved method. Caller ID can be faked, and names and job titles are on LinkedIn.
2. **Treat an MFA change as a password reset, or higher.** Registering a new phone hands over the second factor.
3. **Never skip the process for urgency or seniority.** A caller who presses on time, rank or a waiting client is using the most common social engineering move there is.
4. **Document** who called, how you verified them, and what you changed.

### Back to Jamie

The first call is the important one. Prompts Jamie did not start mean someone already has Jamie's password and is trying to get past MFA.

- Tell Jamie to deny every prompt and approve nothing.
- Reset Jamie's password through the verified process, and sign Jamie out of active sessions.
- Escalate to security right away. The password came from somewhere, and the attacker may try other people next.

The second call, a new phone and an urgent MFA move an hour later, is exactly what that attacker would try next. Verify through the number on file before you touch anything.

### In the SOC: what the logs show

Windows logs each attempt in the Security log. Event **4624** is a successful sign-in, and its **logon type** tells you how:

| Logon type | Meaning |
|---|---|
| 2 | At the keyboard |
| 3 | Over the network, such as opening a file share |
| 10 | Remote Desktop |

Event **4625** is a failed sign-in, and the failure code says why. `0xC000006A` means a wrong password for a real account. `0xC0000064` means the account name does not exist, which suggests someone guessing usernames. `0xC0000234` means the account is locked.

Patterns to escalate:

- Successful sign-ins for an account that should be dormant. Colonial's VPN account was no longer in use.
- A user reporting MFA prompts they did not start.
- A Remote Desktop sign-in (type 10) to a machine that person never uses.
- Several reset or MFA change requests for the same person in a short time.

### Check yourself

A caller says they are Jordan Ellis, the Finance lead, and need an MFA reset before a board meeting in ten minutes. Their caller ID shows Jordan's name. What do you do, and which detail in that call should make you slow down, not speed up?
