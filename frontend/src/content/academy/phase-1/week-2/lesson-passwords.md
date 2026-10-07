### Storing Passwords

**The ticket:** a vendor several PurveX staff used was breached, and its user table is online. Alex Rivera asks: "How bad is this for us, and what do we do first?"

The first thing to understand is that a password store never needs the password itself. It only needs to recognise the right one when it is offered again. So a well built system keeps a value calculated from the password, and at sign-in it performs the same calculation on whatever was typed and compares the two results. The original is never written down anywhere, which means a stolen database does not immediately hand the attacker a set of working credentials.

That alone is not enough, and the two requirements that follow are where most real systems fail. Two users who happened to choose the same password must still end up with different stored values, otherwise the table itself reveals which accounts share a password. And the calculation has to be slow enough that working through millions of guesses is impractical, because an attacker with a copy of the table can try as many as they like without the system ever knowing.

### Good storage in one line

A system should store a **salted, slow hash** of each password rather than the password. At sign-in it hashes whatever was typed, using the same salt, and compares the result. Both halves of that phrase are load-bearing.

- **Salt:** a random value added per user. Two people with the same password get different hashes, so reuse is hidden.
- **Slow hash:** Argon2id or bcrypt. One high-end graphics card tries about 22 billion SHA-256 guesses a second. At bcrypt's minimum recommended cost of 10, the same card manages about 7,500.

Without both of those, identical passwords produce identical stored values and the whole table can be attacked as a single unit rather than one account at a time. Tools such as Hashcat and John the Ripper are built for exactly this, and against a fast unsalted hash they work through common passwords at a rate that makes the exercise trivial. That is precisely what happened to LinkedIn in 2012, and it is why the age of a breach tells you very little about how exposed its users were.

### Why their breach is your problem

The reason a vendor's breach lands on your desk is that people reuse passwords across services, and they do so in large numbers regardless of what any policy says. Attackers know this, so a leaked set of email and password pairs is immediately tried against other sign-in pages to see where else the same combination works. This is called **credential stuffing**, and it requires no skill and no knowledge of your organisation at all.

The defence that actually holds here is **MFA**, because it changes what a stolen password is worth. A correct password on its own stops being sufficient to get in, which means the attacker needs something they did not obtain from the vendor's database.

### What to do first after a vendor breach

1. Find out how the passwords were stored, because that determines how urgent everything else is. Encoded means every password is already exposed and the method offered no protection at all. Encrypted means they are exposed if the key was taken alongside the data, and since you are rarely in a position to confirm that it was not, treat them as exposed.
2. Force resets for affected staff, starting with any confirmed exposed.
3. Turn on MFA for those accounts, and watch their sign-ins.

Two things to avoid while doing this. **Never** test leaked passwords against real accounts to see which ones work, because you will generate exactly the sign-in pattern a credential-stuffing attack produces and you may lock out the people you are trying to protect. And never send anybody their password by email, which puts a working credential into a mailbox and a mail server you do not control.

<details class="academy-deeper">
<summary>Go deeper</summary>

#### A salted hash, read left to right

```
$ openssl passwd -6 -salt N4tQ2x 'Harbor2026'
$6$N4tQ2x$YkiZ5pKGVV3yPjoKhMV4oWEqyPJNVynJGzKwvp37hoCLb//X7KoVHJyXe8KXcZ2U7axpFTZFxABOn4py32W0v.
```

`$6$` names the algorithm, and the salt and the hash follow it. The salt is not secret. It works by making every hash unique.

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
