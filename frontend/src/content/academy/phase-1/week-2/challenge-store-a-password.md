<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Store It Weak, Then See Why That Leaks</h3>
<p class="ad-brief__ask">Why does a stolen password file give one company away, yet tell an attacker almost nothing at another?</p>
<p>Hosted lab required, with a terminal open on the Ubuntu desktop.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 4 solved</span>
</div>

### Before You Start

Make a prediction for each of these first. Nothing gets marked here, and the output will show you whether you were right.

<div class="ad-check ad-check--predict" data-check="w2m-p1">
<p class="ad-check__q">ruth.okonkwo and ines.pelletier, two of Operations' seasonal hires, both choose <code>Summer2024!</code>. Hashed with plain SHA-256, do their stored values look the same or different?</p>
<button type="button" class="ad-check__opt" data-i="0">The same</button>
<button type="button" class="ad-check__opt" data-i="1">Different</button>
<p class="ad-check__note">Got it. You'll hash that password twice in the next step and see for yourself.</p>
</div>

<div class="ad-check ad-check--predict" data-check="w2m-p2">
<p class="ad-check__q">What does adding a random salt to each password change about that?</p>
<button type="button" class="ad-check__opt" data-i="0">Nothing, the same password still hashes the same</button>
<button type="button" class="ad-check__opt" data-i="1">The stored values differ even for the same password</button>
<button type="button" class="ad-check__opt" data-i="2">It encrypts the password so it can be read back</button>
<p class="ad-check__note">Got it. You'll run the salted version twice and compare.</p>
</div>

<div class="ad-check ad-check--predict" data-check="w2m-p3">
<p class="ad-check__q">Does salting make one password harder to guess, or does it do something else?</p>
<button type="button" class="ad-check__opt" data-i="0">Harder to guess</button>
<button type="button" class="ad-check__opt" data-i="1">Stops identical passwords from looking identical in storage</button>
<p class="ad-check__note">Got it. A short loop over three accounts will make the real effect visible.</p>
</div>

### Store It the Weak Way

To see what goes wrong, we'll start with the weak way: a plain hash with no salt. Hash the same password as though it belonged to ruth.okonkwo, and then hash it again as though it belonged to ines.pelletier.

```bash
printf 'Summer2024!' | sha256sum
printf 'Summer2024!' | sha256sum
```

You'll see that the two values are identical. In a real leaked database, that means every account that chose this password would carry the exact same stored value. So even an attacker who never cracks a single password still learns which people share one.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-2/PLACEHOLDER-store-unsalted.png" alt="Terminal showing two identical SHA-256 digests for the same password" />
<figcaption>Screenshot 1. [ADD IMAGE] Same password, same stored value, every time.</figcaption>
</figure>
</div>

### See Why That Leaks

To make that concrete, build a small table of what an unsalted password file would hold. Use three of Operations' seasonal accounts, two of which share a password: ruth.okonkwo, dmitri.volkov, then ines.pelletier.

```bash
for p in 'Summer2024!' 'T7rq!vMx2' 'Summer2024!'; do printf '%s' "$p" | sha256sum; done
```

Now read the three lines. Two of them match and one doesn't, so without knowing any of the passwords, you can already tell that ruth.okonkwo and ines.pelletier reused one while dmitri.volkov's stands apart. On a real incident, that observation alone would be a finding worth reporting.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-2/PLACEHOLDER-store-correlation.png" alt="Terminal showing three hashes where two are identical, revealing reused passwords" />
<figcaption>Screenshot 2. [ADD IMAGE] Two accounts reused a password, visible without cracking anything.</figcaption>
</figure>
</div>

### Store It the Strong Way

Next, let's do it properly. Store ruth.okonkwo's password the way a modern Linux system does, with a random salt for each user. You don't need to make the salt yourself, because the tool builds it for you.

```bash
openssl passwd -6 'Summer2024!'
openssl passwd -6 'Summer2024!'
```

Run the command twice, and this time the two results differ, even though the password is identical. The `$6$` at the start marks the hashing method, and the block after it is the random salt the tool generated. Because of that salt, reused passwords no longer look alike in storage.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-2/PLACEHOLDER-store-salted.png" alt="Terminal showing two different salted hashes for the same password with the dollar-six prefix" />
<figcaption>Screenshot 3. [ADD IMAGE] Same password, two different stored values.</figcaption>
</figure>
</div>

### Prove the Salt Is the Reason

You can prove that the salt is what made the difference. If you pin the salt to a fixed value, the output becomes repeatable, which shows the salt was the only thing making the two results differ.

```bash
openssl passwd -6 -salt ABCD1234 'Summer2024!'
openssl passwd -6 -salt ABCD1234 'Summer2024!'
```

Sure enough, these two match, because you forced the same salt both times. That's exactly why a real system picks a random salt: so this never happens across real accounts.

### Check Yourself

Answer based on the output you actually saw.

<div class="ad-mission" data-id="w2m-c1" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1097 · Low</span>
<p><strong>Task:</strong> Did two unsalted SHA-256 hashes of the same password match or differ? Type its letter.<br><strong>A</strong> They matched exactly.<br><strong>B</strong> They differed.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for whether the two unsalted hashes matched" placeholder="A or B" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{a}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Look back at the two <code>sha256sum</code> lines from "Store It the Weak Way." They had the same input and the same algorithm, with no randomness involved, so what would you expect?</p>
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
<p>Plain hashing is deterministic, which means the same input always gives the same output. That's exactly the property that gives away password reuse.</p>
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
<p>The loop hashed <code>Summer2024!</code>, <code>T7rq!vMx2</code> and <code>Summer2024!</code>, in that order. How many of those three are the same password?</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">Look again: ruth.okonkwo and ines.pelletier, first and third in the loop, used the identical password, so their hashes had to match.</div>
<div class="ad-miss" data-guess="c">dmitri.volkov's password, the middle one in the loop, was different from the other two, so its hash stands apart.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. Two</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Two accounts reused a password, so their stored values matched. Notice that you spotted the reuse without recovering a single password.</p>
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
<p>Compare the block right after the <code>$6$</code> prefix in your two <code>openssl passwd -6</code> outputs. The tool picked that part fresh on each run.</p>
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
<p>The random salt is different on each run, so the stored value differs too, even though the password is identical.</p>
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
<p>Think about what actually changed between the unsalted three-account loop and the salted runs. It wasn't how hard any one password is to guess. It was whether matching stored values tell you anything.</p>
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
<p>Salting stops attackers from using precomputed tables, and it breaks the link between accounts that share a password. It doesn't make a weak password strong, though, which is why length and complexity still matter.</p>
</div>
</div>
</div>
</div>

### Why It Matters

As you've seen, unsalted storage turns one leaked file into a map of who shares passwords, readable without cracking anything at all. In the next challenge, you'll put that finding in front of a manager and check that the system's own tools already fix it.
