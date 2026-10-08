<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Two people pick the same password. Why can a stolen password file give one company away and tell an attacker almost nothing at another?</p>
</div>

**Situation:** When a password database leaks, how the passwords were stored decides how bad the day is. The difference between a disaster and a shrug is a small step called salting, and most people who have heard the word cannot say what it actually does.

**Task:** Store the same password the weak way and the strong way on your Ubuntu server, and prove from the output why one leaks information and the other does not. Predict each result before you run the command.

**What you need:** Your hosted lab running, and a terminal on the Ubuntu desktop. Every command ships with the system. Nothing is cracked and no attack tool is used. You are looking at password storage the way the team that protects it does.

### Before You Start

Commit to an answer first.

1. Two users choose the password `Summer2024!`. If the system hashes it with plain SHA-256, do their stored values look the same or different?
2. What does adding a random salt to each password change about that?
3. Does salting make an individual password harder to guess, or does it do something else?

Write your three answers down.

### Store It the Weak Way

A plain hash with no salt is the storage that goes wrong. Hash the same password as though it belonged to two different users.

```bash
printf 'Summer2024!' | sha256sum
printf 'Summer2024!' | sha256sum
```

The two values are identical. In a real leaked database, every account that chose this password would carry the exact same stored value. An attacker who never recovers a single password still learns who shares one.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-2/PLACEHOLDER-store-unsalted.png" alt="Terminal showing two identical SHA-256 digests for the same password" />
<figcaption>Screenshot 1. [ADD IMAGE] Same password, same stored value, every time.</figcaption>
</figure>
</div>

### See Why That Leaks

Make a small table of what an unsalted file would hold, using three accounts where two share a password.

```bash
for p in 'Summer2024!' 'T7rq!vMx2' 'Summer2024!'; do printf '%s' "$p" | sha256sum; done
```

Read the three lines. Two match and one does not, and you did not need to know any of the passwords to see which two people reused one. That alone is a finding on a real incident.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-2/PLACEHOLDER-store-correlation.png" alt="Terminal showing three hashes where two are identical, revealing reused passwords" />
<figcaption>Screenshot 2. [ADD IMAGE] Two accounts reused a password, visible without cracking anything.</figcaption>
</figure>
</div>

### Store It the Strong Way

Now store the same password the way a modern Linux system does, with a random salt per user. The tool builds the salt for you.

```bash
openssl passwd -6 'Summer2024!'
openssl passwd -6 'Summer2024!'
```

Run it twice and the two results differ, even though the password is identical. The `$6$` marks the hashing method and the block after it is the random salt the tool generated. Reused passwords no longer look alike in storage.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-2/PLACEHOLDER-store-salted.png" alt="Terminal showing two different salted hashes for the same password with the dollar-six prefix" />
<figcaption>Screenshot 3. [ADD IMAGE] Same password, two different stored values.</figcaption>
</figure>
</div>

### Prove the Salt Is the Reason

Pin the salt to a fixed value and the output becomes repeatable, which shows the salt was the only thing making the two differ.

```bash
openssl passwd -6 -salt ABCD1234 'Summer2024!'
openssl passwd -6 -salt ABCD1234 'Summer2024!'
```

These two match, because you forced the same salt both times. The system uses a random one precisely so that never happens across real accounts.

### Check Yourself

Answer from the output you saw.

1. Did two unsalted SHA-256 hashes of the same password match or differ?
2. In the three-account loop, how many of the three stored values were identical?
3. With `openssl passwd -6` and no fixed salt, did the same password produce the same value twice or two different values?
4. Salting mainly stops an attacker from doing which one: guessing a single password faster, or spotting that many accounts share one?

### Take It Further

A firm is breached and the stored passwords were plain SHA-256 with no salt. A manager says the passwords are safe because SHA-256 cannot be reversed.

Give the one thing the attacker learns from that file without reversing anything, and say why it still matters to the people in the database.

### Why It Matters

When a breach is reported, the first technical question is how the passwords were stored, because that decides whether every reused credential across the company is now exposed. Unsalted storage turns one leaked file into a map of who shares passwords, and that map is often more useful to an attacker than any single cracked login.
