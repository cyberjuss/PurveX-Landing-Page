### Storing Passwords

**The ticket:** a vendor several PurveX staff used was breached, and its user table is online. Alex Rivera asks: "How bad is this for us, and what do we do first?"

<div class="academy-analogy">
<span class="academy-analogy__tag">Think of it like a coat check</span>
<ul>
<li>It never needs your coat's description. It keeps a ticket that matches it.</li>
<li>A good ticket is unique, even for two identical coats.</li>
<li>A good ticket is also slow to fake, so nobody can try a thousand at the counter.</li>
</ul>
</div>

### Good storage in one line

A system should store a **salted, slow hash** of each password, never the password. At sign-in it hashes what you typed and compares.

- **Salt:** a random value added per user. Two people with the same password get different hashes, so reuse is hidden.
- **Slow hash:** Argon2id or bcrypt. Crackers on graphics cards try billions of SHA-256 guesses a second. bcrypt at a normal cost setting allows only a few per second on one processor core.

**Without a salt and a slow hash,** the same passwords show the same value, and tools like Hashcat and John the Ripper guess weak passwords fast. That is what happened to LinkedIn in 2012.

### Why their breach is your problem

People reuse passwords. Attackers try leaked email and password pairs on other sign-ins. This is **credential stuffing**. **MFA** stops a stolen password from being enough.

### What to do first after a vendor breach

1. Find out how the passwords were stored. Encoded means every one is exposed. Encrypted means every one is exposed if the key was taken too, so treat them as exposed.
2. Force resets for affected staff, starting with any confirmed exposed.
3. Turn on MFA for those accounts, and watch their sign-ins.

**Never** try leaked passwords on real accounts, and never email anyone their password.

<details class="academy-deeper">
<summary>Go deeper: what a salted hash looks like, Windows passwords, safe resets, and sign-in logs</summary>

#### A salted hash, read left to right

```
$ openssl passwd -6 -salt N4tQ2x 'Harbor2026'
$6$N4tQ2x$YkiZ5pKGVV3yPjoKhMV4oWEqyPJNVynJGzKwvp37hoCLb//X7KoVHJyXe8KXcZ2U7axpFTZFxABOn4py32W0v.
```

`$6$` names the algorithm, then the salt, then the hash. The salt is not secret. It works by making every hash unique.

A bcrypt hash: `$2b$12$1.A448CMPszJoJNh8XDqPeL1ZvsWBt7AjjvYj57Rfr1M4tDk/7Oye`. `12` is the cost setting, which you raise as computers get faster.

#### How Windows stores passwords

Active Directory stores an **NT hash**, which is fast and unsalted. Attackers who steal one can sometimes sign in with the hash itself, without cracking it. This is **pass-the-hash**. It is why domain controllers and admin accounts are guarded so tightly, and why Windows LAPS gives every machine's local admin its own password.

#### Resetting a password safely

- Verify the caller with a callback to the number on file, never a number they give you.
- Never ask for or learn a user's password. Set a temporary one and tick **User must change password at next logon**.
- A locked account whose password is still right only needs unlocking. Find out why it locked first.

Current NIST guidance: at least 15 characters when the password is the only factor. No forced symbol rules. No scheduled changes, only changes after a compromise. Block known-breached passwords.

#### What password attacks look like in the logs

| Event ID | Meaning |
|---|---|
| 4625 | Failed sign-in |
| 4624 | Successful sign-in |
| 4740 | Account locked out |

Many 4625s on one account is **brute force**. One or two 4625s across many accounts from one source is **password spraying**.

</details>

### Check yourself

A leaked table shows two users with exactly the same value in the password column. What does that tell you, and would a salt have changed it?
