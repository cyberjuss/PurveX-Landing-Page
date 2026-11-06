### Storing Passwords

**The ticket:** a vendor several PurveX staff used was breached, and its user table is online. Alex Rivera asks: "How bad is this for us, and what do we do first?"

To answer Alex, start with how passwords should be stored in the first place. A password system never needs to know your password. It only needs to recognize the right one when you type it again, so a well-built system stores a value calculated from the password, then runs the same calculation at sign-in and compares the two. Because the password itself is never written down, a stolen database doesn't immediately hand an attacker a set of working credentials.

That alone isn't enough, though. There are two further requirements, and they're where most real systems fall short:

- Two users who chose the same password must still end up with **different stored values**, or the table itself reveals which accounts share a password.
- The calculation has to be **slow enough that bulk guessing is impractical**, because an attacker with a copy of the table can guess as often as they like and the system never knows.

### Good storage in one line
<!-- art: salt -->

Putting those requirements together, a system should store a **salted, slow hash** of each password, and each half of that phrase does a different job:

- **Salt:** a random value added per user. Two people with the same password get different hashes, so reuse is hidden.
- **Slow hash:** Argon2id or bcrypt. One high-end graphics card tries about 22 billion SHA-256 guesses a second. At bcrypt's minimum recommended cost of 10, the same card manages about 6,000.

Without both halves, tools such as Hashcat and John the Ripper can work through common passwords across the whole table at once, and against a fast, unsalted hash they do it so quickly that cracking becomes trivial. That's exactly what happened to LinkedIn in 2012. It's also why the way a breached company stored its passwords tells you far more about the danger than the size of the breach does.

```match
prompt: Both halves of good password storage. Match them.
Salt = A random value added per user, so two people with the same password get different hashes
Slow hash = Argon2id or bcrypt, so each guess costs far more time
```

### Why their breach is your problem

You might wonder why another company's breach lands on your desk at all. The answer is that people reuse passwords across services, whatever any policy says, and attackers know it. They take a leaked list of emails and passwords and try the same pairs on other sign-in pages to see where else they work. That's called **credential stuffing**, and it takes no skill at all.

The defense that holds up against it is **MFA**, because it changes what a stolen password is worth. With MFA turned on, a correct password on its own no longer gets anyone in.

### What to do first after a vendor breach

Here's the order to work in when a vendor is breached:

1. Find out how the passwords were stored, because that determines how urgent everything else is.
   - **Encoded:** every password is already exposed. The method offered no protection at all.
   - **Encrypted:** the passwords are exposed if the key was taken with the data. You can rarely confirm that it was not, so treat them as exposed.
   - **Hashed fast and unsalted:** most common passwords will be cracked within days, so treat them as exposed.
   - **Salted and slow:** you have time, but weak passwords still fall to guessing. Reset them anyway.
2. Force resets for affected staff, starting with those confirmed as exposed.
3. Turn on MFA for those accounts, and watch their sign-ins.

While you work through those steps, there are two things you should never do. Don't test the leaked passwords against real accounts to see which still work, because that produces the same sign-in pattern as a credential-stuffing attack and may lock out the very people you're protecting. And never email anyone their password, since that puts a working credential on mail servers you don't control.

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

It helps to be able to read one of these. The `$6$` at the start names the algorithm, and the salt and the hash follow it. Notice that the salt isn't hidden, because it doesn't need to be secret. Its only job is to make every hash unique.

A bcrypt hash follows the same idea: `$2b$12$1.A448CMPszJoJNh8XDqPeL1ZvsWBt7AjjvYj57Rfr1M4tDk/7Oye`. Here the `12` is the cost setting, which you raise over time as computers get faster.

### How Windows stores passwords

Windows does things differently, and it's worth knowing how. Active Directory stores an **NT hash**, which is both fast and unsalted. Worse, an attacker who steals one can sometimes sign in with the hash itself, without ever cracking it, which is called **pass-the-hash**. That's why domain controllers and admin accounts are guarded so tightly, and why Windows LAPS gives every machine's local admin account its own password.

### Resetting a password safely

All of this comes back to the help desk, where you'll reset passwords regularly. When you do:

- Verify the caller with a callback to the number on file, never a number they give you.
- Never ask for or learn a user's password. Set a temporary one and tick **User must change password at next logon**.
- A locked account whose password is still right only needs unlocking. Find out why it locked first.

Current NIST guidance supports this approach. It asks for at least 15 characters when the password is the only factor, with no forced symbol rules and no scheduled changes. Instead, passwords should change after a compromise, and known-breached passwords should be blocked.

### What password attacks look like in the logs

When passwords are under attack, it shows up in the Windows logs as these events:

| Event ID | Meaning |
|---|---|
| 4625 | Failed sign-in |
| 4624 | Successful sign-in |
| 4740 | Account locked out |

The pattern tells you which attack you're looking at. Many 4625s on one account is **brute force**, while one or two 4625s across many accounts from the same source is **password spraying**.

### Check yourself

Here's one to think through. A leaked table shows two users with the same value in the password column. What does that tell you, and would a salt have changed it?
