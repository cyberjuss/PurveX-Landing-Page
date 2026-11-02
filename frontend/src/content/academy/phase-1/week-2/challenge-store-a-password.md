<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>What a Leaked Password File Actually Gives Away</h3>
<p class="ad-brief__ask">Why can a stolen password file give one company away and tell an attacker almost nothing at another?</p>
<p>Hosted lab required, with a terminal open on the Ubuntu desktop.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 6 solved</span>
</div>

### Before You Start

Commit to an answer first. Nothing is marked yet. The output settles each one.

<div class="ad-check ad-check--predict" data-check="w2m-p1">
<p class="ad-check__q">ruth.okonkwo and ines.pelletier, two of Operations' seasonal hires, both choose <code>Summer2024!</code>. Hashed with plain SHA-256, do their stored values look the same or different?</p>
<button type="button" class="ad-check__opt" data-i="0">The same</button>
<button type="button" class="ad-check__opt" data-i="1">Different</button>
<p class="ad-check__note">Locked in. You will hash it twice in the next step and see.</p>
</div>

<div class="ad-check ad-check--predict" data-check="w2m-p2">
<p class="ad-check__q">What does adding a random salt to each password change about that?</p>
<button type="button" class="ad-check__opt" data-i="0">Nothing, the same password still hashes the same</button>
<button type="button" class="ad-check__opt" data-i="1">The stored values differ even for the same password</button>
<button type="button" class="ad-check__opt" data-i="2">It encrypts the password so it can be read back</button>
<p class="ad-check__note">Locked in. You will run the salted version twice and compare.</p>
</div>

<div class="ad-check ad-check--predict" data-check="w2m-p3">
<p class="ad-check__q">Does salting make one password harder to guess, or does it do something else?</p>
<button type="button" class="ad-check__opt" data-i="0">Harder to guess</button>
<button type="button" class="ad-check__opt" data-i="1">Stops identical passwords from looking identical in storage</button>
<p class="ad-check__note">Locked in. The three-account loop makes the real effect visible.</p>
</div>

### Store It the Weak Way

A plain hash with no salt is the storage that goes wrong. Hash the same password as though it belonged to ruth.okonkwo, then again as though it belonged to ines.pelletier.

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

Make a small table of what an unsalted file would hold, using three of Operations' seasonal accounts where two share a password: ruth.okonkwo, dmitri.volkov, then ines.pelletier.

```bash
for p in 'Summer2024!' 'T7rq!vMx2' 'Summer2024!'; do printf '%s' "$p" | sha256sum; done
```

Read the three lines. Two match and one does not, and you did not need to know any of the passwords to see that ruth.okonkwo and ines.pelletier reused one while dmitri.volkov's stands apart. That alone is a finding on a real incident.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-2/PLACEHOLDER-store-correlation.png" alt="Terminal showing three hashes where two are identical, revealing reused passwords" />
<figcaption>Screenshot 2. [ADD IMAGE] Two accounts reused a password, visible without cracking anything.</figcaption>
</figure>
</div>

### Store It the Strong Way

Now store ruth.okonkwo's password the way a modern Linux system does, with a random salt per user. The tool builds the salt for you.

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

<div class="ad-mission" data-id="w2m-c1" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1097 · Low</span>
<p><strong>Task:</strong> Did two unsalted SHA-256 hashes of the same password match or differ? Type its letter.<br><strong>A</strong> They matched exactly.<br><strong>B</strong> They differed.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for whether the two unsalted hashes matched" placeholder="A or B" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{a}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Look at the two <code>sha256sum</code> lines from "Store It the Weak Way." Same input, same algorithm, no randomness involved.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="b">Plain SHA-256 has no randomness in it at all. The same input always produces the same output.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>A. They matched exactly</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Plain hashing is deterministic, so the same input always gives the same output. That is the property that leaks reuse.</p>
</div>
</div>
</div>
</div>

### Count the Reused Password

<div class="ad-mission" data-id="w2m-c2" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1098 · Low</span>
<p><strong>Task:</strong> In the ruth.okonkwo / dmitri.volkov / ines.pelletier loop, how many of the three stored values were identical? Type its letter.<br><strong>A</strong> Zero.<br><strong>B</strong> Two.<br><strong>C</strong> All three.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for how many stored values were identical" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The loop hashed <code>Summer2024!</code>, <code>T7rq!vMx2</code>, <code>Summer2024!</code> in that order. Two of those three passwords are the same password.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">ruth.okonkwo and ines.pelletier, first and third in the loop, used the identical password. Their hashes could not help but match.</div>
<div class="ad-miss" data-guess="c">dmitri.volkov's password, the middle one in the loop, was different from the other two, so its hash stands apart.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. Two</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Two accounts reused a password, and their stored values matched. You spotted the reuse without recovering a single password.</p>
</div>
</div>
</div>
</div>

### Confirm the Salt Changed the Output

<div class="ad-mission" data-id="w2m-c3" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1099 · Low</span>
<p><strong>Task:</strong> With <code>openssl passwd -6</code> and no fixed salt, did the same password give the same value twice? Type its letter.<br><strong>A</strong> The same value both times.<br><strong>B</strong> Two different values.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for whether the salted command gave the same value twice" placeholder="A or B" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Compare the two blocks after the <code>$6$</code> prefix in your two <code>openssl passwd -6</code> outputs. The tool picked that part fresh each run.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">You did not pin a salt with <code>-salt</code> this time, so the tool generated a fresh random one on each run.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. Two different values</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The random salt differs each run, so the stored value differs even though the password is identical.</p>
</div>
</div>
</div>
</div>

### Name What Salting Actually Stops

<div class="ad-mission" data-id="w2m-c4" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1100 · Low</span>
<p><strong>Task:</strong> Salting mainly stops an attacker from doing which one? Type its letter.<br><strong>A</strong> Guessing a single password faster.<br><strong>B</strong> Spotting that many accounts share one password.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what salting mainly stops" placeholder="A or B" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Think about what changed between the unsalted three-account loop and the salted runs: not how hard any one password is to guess, but whether matching stored values mean anything.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">A weak password is still weak with or without a salt. Salting changes whether identical passwords look identical in storage, not how guessable any one of them is.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. Spotting that many accounts share one password</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Salting defeats precomputation and breaks the correlation between accounts. A weak password is still weak, so length and complexity still matter.</p>
</div>
</div>
</div>
</div>

### Correct a Manager's Wrong Assumption

<div class="ad-mission ad-mission--capstone" data-id="w2m-c5" data-attempts="0">
<span class="ad-mission__num">Ticket 05 · INC-1101 · Critical</span>
<p><strong>CISO Briefing · Breach Review · 5:00 PM</strong><br>PurveX Financial is breached and the stored passwords turn out to be plain SHA-256 with no salt. A manager in the briefing says the passwords are safe because SHA-256 cannot be reversed.</p>
<p><strong>Task:</strong> What does the attacker actually learn from that file, even without reversing a single hash? Type its letter.<br><strong>A</strong> Nothing. The manager is right, since the hashes cannot be reversed.<br><strong>B</strong> Exactly which accounts in the company share a password with each other, read straight off which stored values match, with no cracking at all.<br><strong>C</strong> The attacker learns every employee's actual password immediately.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what the attacker actually learns from the unsalted file" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Think back to the three-account loop. You identified two accounts sharing a password without ever knowing what the password was.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">The manager is half right that the hashes cannot be reversed, but that is not the same as the file being safe. Matching values still say something.</div>
<div class="ad-miss" data-guess="c">SHA-256 being one-way is exactly why the attacker cannot read a password straight out of the file. That part of the manager's claim is true.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. Which accounts share a password, with no cracking at all</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The manager is only half right. SHA-256 really cannot be reversed, but "cannot be reversed" is not the same as "safe." Matching values across a leaked file hand an attacker a ready-made list of accounts to try one cracked or reused password against, which is exactly the finding this lab let you make without cracking anything at all.</p>
</div>
</div>
</div>
</div>

### Create One the Right Way

You hashed a password by hand twice, unsalted and salted, as a demonstration. Nobody should ever store a real account's password that way; the system has its own tool for this, and it is worth checking that the tool actually does what you just proved matters.

```bash
sudo useradd -m priya.sample
echo 'priya.sample:Summer2024!' | sudo chpasswd
sudo grep priya.sample /etc/shadow
```

`chpasswd` is the real, standard way to set a Linux account's password, the same mechanism behind `passwd` and behind account creation itself. Read the second field in the line it printed, between the first two `$` signs.

<div class="ad-mission ad-mission--capstone" data-id="w2m-c6" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1152 · Low</span>
<p><strong>Task:</strong> Read <code>priya.sample</code>'s line in <code>/etc/shadow</code>. What number sits between the first two <code>$</code> signs, marking the hashing method the system used on its own?</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the hashing method number in /etc/shadow" placeholder="a number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{6}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The line reads <code>priya.sample:$N$salt$hash:...</code>. <code>N</code> is the number you want, and you have already seen this exact digit once before in this lab.</p>
<ol>
<li>Clean up when you are done: <code>sudo userdel -r priya.sample</code>.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="1|5">Those mark MD5 and SHA-256 respectively, both weaker and neither one what a current Ubuntu system actually uses by default.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>6</code></p>
</div>
<div>
<span>Why it matters</span>
<p><code>$6$</code> is SHA-512, salted, the exact same method behind the <code>openssl passwd -6</code> command earlier in this lab. You never had to choose it: creating the account the normal way did the right thing automatically. The weak storage in this whole lab only ever happens when someone builds their own password handling by hand instead of trusting the tool built for the job.</p>
</div>
</div>
</div>
</div>

### Take It Further

The same manager asks whether switching to a salted hash would have stopped the breach from happening at all.

Say what salting actually would and would not have changed about this specific incident, and name the one thing a salted hash still cannot protect against: a password that was weak to begin with.

### Why It Matters

When a breach is reported, the first technical question is how the passwords were stored, because that decides whether every reused credential across the company is now exposed. Unsalted storage turns one leaked file into a map of who shares passwords, and that map is often more useful to an attacker than any single cracked login.
