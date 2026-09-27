### Storing Passwords

Alex Rivera in IT forwards an email from a software vendor. The vendor's customer portal was breached, and the attackers posted its user table online. Several PurveX staff had accounts there. Alex asks you two questions: how bad is this for us, and what do we do first?

The answer depends on how the vendor stored those passwords. This section teaches you to read that from the data itself, and to know what good storage looks like.

<div class="academy-analogy">
<span class="academy-analogy__tag">Think of it like a coat check</span>
<ul>
<li>The coat check never needs to know what your coat looks like. It keeps a ticket that matches it.</li>
<li>A good ticket is unique to you, even if two people hand in identical coats.</li>
<li>A good coat check also makes each ticket slow to fake, so nobody can try a thousand guesses at the counter.</li>
</ul>
</div>

### A system should never store your password

When you sign in, the system hashes what you typed and compares it to the hash it stored when you set the password. If they match, you are in. The password itself never needs to be saved anywhere.

That means a stolen password table should hold only hashes. Whether those hashes hold up depends on two things: whether each one is **salted**, and whether the hash is **slow**.

### Why a plain, fast hash fails

**Problem 1: identical passwords give identical hashes.** Anyone reading the table can see which users share a password without cracking anything. Crack one and you have cracked all of them.

**Problem 2: fast hashes are fast to guess.** A hash cannot be reversed, but it can be guessed. The attacker takes a list of likely passwords, hashes each one, and looks for matches in the table. That is all Hashcat and John the Ripper, the two standard open-source cracking tools, do. They just do it very quickly.

In a test on one ordinary processor core, SHA-256 ran about 1.2 million times a second. Hashcat on a single gaming graphics card runs SHA-256 billions of times a second. People choose predictable passwords, so attackers do not try every combination. They use:

- **Wordlists:** passwords leaked in earlier breaches, most common first
- **Rules:** the tweaks people make, such as a capital first letter, the current year, and `!` at the end
- **Brute force:** every combination, for short passwords only

A password like `Harbor2026` falls to a wordlist with rules in seconds. Length helps far more than symbols. Every added character multiplies the work.

**Problem 3: precomputed tables.** For unsalted hashes, an attacker does not even need to guess live. Huge lookup tables of hash-to-password pairs, called rainbow tables, already exist for common passwords. LinkedIn's 2012 breach showed all three problems at once: 6.5 million unsalted SHA-1 hashes, and most were cracked within days.

### The fix, part 1: salt

A **salt** is a random value created for each user and stored next to their hash. The system hashes the salt and the password together. Two people with the same password now get completely different hashes. Here is `Harbor2026` stored for two users, using the salted format Linux uses in its password file:

```
$ openssl passwd -6 -salt N4tQ2x 'Harbor2026'
$6$N4tQ2x$YkiZ5pKGVV3yPjoKhMV4oWEqyPJNVynJGzKwvp37hoCLb//X7KoVHJyXe8KXcZ2U7axpFTZFxABOn4py32W0v.
$ openssl passwd -6 -salt Hb7Lp0 'Harbor2026'
$6$Hb7Lp0$2gxWA1WELhPbwuTd0CZ4CjRRHMcfFADgjiSaspTT19bhAvtuI2c8Pz4SdeRM9.KWXzPJU6P610ZZdox741ByY0
```

Read the format left to right: `$6$` names the algorithm, then the salt, then the hash.

A salt does not need to be secret, and it is not. It sits in plain sight in the table. It works because it makes every hash unique. Reused passwords no longer show, precomputed tables become useless, and the attacker has to guess each user's password separately.

### The fix, part 2: a slow hash

SHA-256 was built to be fast, which is good for checking files and bad for passwords. Password hashes use algorithms built to be slow on purpose, with a cost setting you can raise as computers get faster. The OWASP guidance, in order of preference:

1. **Argon2id**, the winner of the 2015 Password Hashing Competition
2. **scrypt**
3. **bcrypt**, still very common
4. **PBKDF2**, where FIPS compliance requires it

A bcrypt hash carries its own settings:

```
$2b$12$1.A448CMPszJoJNh8XDqPeL1ZvsWBt7AjjvYj57Rfr1M4tDk/7Oye
```

`$2b$` is bcrypt, `12` is the cost, the next 22 characters are the salt, and the rest is the hash. On the same processor core that ran 1.2 million SHA-256 hashes a second, bcrypt at cost 12 managed about 3 or 4 guesses a second. A login waits a quarter of a second once. An attacker waits that long for every single guess.

### How Windows stores passwords

Active Directory stores each account's password as an **NT hash**, which is fast and unsalted. Two accounts with the same password have the same NT hash. Two things follow:

- The domain controller's password database is one of the most valuable files in the company. Anyone who copies it can crack weak passwords offline.
- Some Windows sign-ins accept the hash itself instead of the password. An attacker who steals a hash from a machine's memory can sign in as that user without ever cracking it. This is called **pass-the-hash**.

This is why domain controllers and admin accounts are guarded so tightly, and why **Windows LAPS** gives every machine's local administrator account its own random password. One stolen local admin hash then opens one machine, not all of them.

### Why someone else's breach is your problem

People reuse passwords. Attackers know this, so they take the email and password pairs from one breach and try them on email, VPN and banking sign-ins everywhere else. This is **credential stuffing**. A vendor's breach becomes a PurveX risk the moment one employee used the same password at work.

**Multi-factor authentication (MFA)** is the strongest single control here. A password alone no longer gets anyone in.

### On the help desk: resetting passwords safely

- **Verify the caller** with the approved method, such as a callback to the number on file. Never use a number the caller gives you.
- **Never ask for a user's password**, and never learn it. Set a temporary one and tick **User must change password at next logon** in Active Directory.
- **Never send a password by email or chat.** Those messages are stored and searched.
- **Unlock is not reset.** A locked account whose password is still right only needs unlocking. Find out why it locked first. A phone still trying an old saved password is routine. Failures from a machine the user has never used are not.

Current NIST guidance (SP 800-63B, revision 4) has changed several old habits. Require length: at least 15 characters when the password is the only factor, and at least 8 with MFA. Do not force mixes of symbols and numbers. Do not force changes on a schedule. Do force a change when there is evidence of compromise. Check new passwords against lists of known breached passwords.

### In the SOC: what password attacks look like

Windows records every sign-in attempt in the Security log:

| Event ID | Meaning |
|---|---|
| 4625 | A sign-in failed |
| 4624 | A sign-in succeeded |
| 4740 | An account was locked out |

The patterns matter more than any one event:

- **Brute force:** many 4625s for one account, often ending in a 4740.
- **Password spraying:** one or two 4625s each across many accounts, from the same source. Attackers try one common password everywhere and stay under the lockout limit.
- **Credential stuffing that worked:** a 4624 for an account with no failures before it, from a place or at a time that does not fit the user.

### What to do first after a vendor breach

Before anyone touches an account, find out what the vendor actually lost and how it was stored. Plain text, encoding and reversible encryption mean every password is exposed. Unsalted fast hashes mean weak ones are exposed and reuse is visible. Salted slow hashes mean far less is exposed, though weak passwords can still fall.

Then protect the people:

- Force resets for affected staff whose work password might match, starting with anyone whose password is confirmed exposed.
- Make sure MFA is on for those accounts.
- Watch the sign-in logs for those accounts over the next weeks.

Never try leaked passwords against real accounts to "check" them. That is unauthorized access, even with good intentions. Never email anyone their leaked password.

**Escalate** when:

- a password turns up in a file, script or share in plain text or Base64
- a user says they typed their password into an unfamiliar page
- the sign-in logs show a spraying pattern

### Check yourself

A dump shows two users with exactly the same value in the password column. What does that tell you about how the passwords were stored, even before you know the algorithm? Would a salt have changed what you can see?
