### Storing Passwords

**The ticket:** a vendor several PurveX staff used was breached, and its user table is online. Alex Rivera asks: "How bad is this for us, and what do we do first?"

A password system never needs your password. It only needs to recognize it. So it stores a value calculated from the password and, at sign-in, runs the same calculation on what you typed and compares. A stolen database then doesn't hand over working passwords.

Two more requirements are where most systems fall short:

- Two users who chose the same password must still end up with **different stored values**, or the table itself reveals which accounts share a password.
- The calculation has to be **slow enough that bulk guessing is impractical**, because an attacker with a copy of the table can guess as often as they like and the system never knows.

### Good storage in one line
<!-- art: salt -->

So store a **salted, slow hash** of each password:

- **Salt:** a random value added per user. Two people with the same password get different hashes, so reuse is hidden.
- **Slow hash:** Argon2id or bcrypt. One high-end graphics card tries about 22 billion SHA-256 guesses a second. At bcrypt's minimum recommended cost of 10, the same card manages about 6,000.

Against a fast, unsalted hash, tools like Hashcat and John the Ripper crack common passwords across the whole table at once. That's what happened to LinkedIn in 2012. How a breached company stored passwords tells you more about the danger than the size of the breach.

```match
prompt: Both halves of good password storage. Match them.
Salt = A random value added per user, so two people with the same password get different hashes
Slow hash = Argon2id or bcrypt, so each guess costs far more time
```

### Why their breach is your problem

People reuse passwords, whatever the policy says. Attackers take a leaked list of emails and passwords and try them on other sign-in pages. That's **credential stuffing**, and it takes no skill.

The defense is **MFA**. With it, a correct password alone no longer gets anyone in.

### What to do first after a vendor breach

When a vendor is breached:

1. Find out how the passwords were stored, because that determines how urgent everything else is.
   - **Encoded:** every password is already exposed. The method offered no protection at all.
   - **Encrypted:** the passwords are exposed if the key was taken with the data. You can rarely confirm that it was not, so treat them as exposed.
   - **Hashed fast and unsalted:** most common passwords will be cracked within days, so treat them as exposed.
   - **Salted and slow:** you have time, but weak passwords still fall to guessing. Reset them anyway.
2. Force resets for affected staff, starting with those confirmed as exposed.
3. Turn on MFA for those accounts, and watch their sign-ins.

**Never** test leaked passwords against real accounts. It looks exactly like credential stuffing and can lock people out. Never email anyone their password.

```order
prompt: A vendor was breached. Put your first moves in order.
Find out how the passwords were stored
Force resets for affected staff, confirmed exposures first
Turn on MFA for those accounts and watch their sign-ins
```

### A salted hash, read left to right

```
$ openssl passwd -6 -salt N4tQ2x 'Harbor2026'
$6$N4tQ2x$YkiZ5pKGVV3yPjoKhMV4oWEqyPJNVynJGzKwvp37hoCLb//X7KoVHJyXe8KXcZ2U7axpFTZFxABOn4py32W0v.
```

`$6$` names the algorithm, then come the salt and the hash. The salt isn't secret. Its job is to make every hash unique.

A bcrypt hash follows the same idea: `$2b$12$1.A448CMPszJoJNh8XDqPeL1ZvsWBt7AjjvYj57Rfr1M4tDk/7Oye`. The `12` is the cost, raised over time as computers get faster.

### How Windows stores passwords

Active Directory stores an **NT hash**, which is fast and unsalted. An attacker who steals one can sometimes sign in with the hash itself, uncracked. That's **pass-the-hash**, and it's why domain controllers and admin accounts are guarded tightly and Windows LAPS gives each machine's local admin its own password.

### Resetting a password safely

When you reset a password at the help desk:

- Verify the caller with a callback to the number on file, never a number they give you.
- Never ask for or learn a user's password. Set a temporary one and tick **User must change password at next logon**.
- A locked account whose password is still right only needs unlocking. Find out why it locked first.

Current NIST guidance asks for at least 15 characters when the password is the only factor, no forced symbol rules and no scheduled changes. Change passwords after a compromise, and block known-breached ones.

### What password attacks look like in the logs

Password attacks show up in the Windows logs as:

| Event ID | Meaning |
|---|---|
| 4625 | Failed sign-in |
| 4624 | Successful sign-in |
| 4740 | Account locked out |

Many 4625s on one account is **brute force**. One or two 4625s across many accounts from one source is **password spraying**.

### Check yourself

A leaked table shows two users with the same value in the password column. What does that tell you, and would a salt have changed it?
