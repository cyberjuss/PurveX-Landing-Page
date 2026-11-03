<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Correct the Record, Then Prove the System Already Fixed It</h3>
<p class="ad-brief__ask">Can you correct a manager's wrong read on a breach, then prove the system's own tools already store passwords the right way?</p>
<p>Hosted lab required, with a terminal open on the Ubuntu desktop. Builds on the Store It Weak, Then See Why That Leaks challenge above.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 3 solved</span>
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
<p><strong>Task:</strong> Read <code>priya.sample</code>'s line in <code>/etc/shadow</code>. What marker sits between the first two <code>$</code> signs, identifying the hashing method the system picked on its own?</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the hashing method marker in /etc/shadow" placeholder="a letter" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{y}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The line reads <code>priya.sample:$X$salt$hash:...</code>. <code>X</code> is what you want, and it is not <code>6</code>. Ubuntu's own default moved on since the <code>openssl passwd -6</code> command you ran by hand in the challenge above.</p>
<ol>
<li>Clean up when you are done: <code>sudo userdel -r priya.sample</code>.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="1|5">Those mark MD5 and SHA-256 respectively, both weaker and neither one what a current Ubuntu system actually uses by default.</div>
<div class="ad-miss" data-guess="6">That is the SHA-512 marker from the <code>openssl passwd -6</code> command you ran by hand earlier. The system picked something newer on its own, without being asked.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>y</code></p>
</div>
<div>
<span>Why it matters</span>
<p><code>$y$</code> is yescrypt, Ubuntu's actual default since 22.04, a memory-hard scheme built specifically to be slow and expensive to brute-force at scale, newer and tougher to crack than the SHA-512 you configured by hand with <code>openssl passwd -6</code>. You never had to choose it, or even know its name: creating the account the normal way did better than the manual demonstration did. The weak storage in this whole lab only ever happens when someone builds their own password handling by hand instead of trusting the tool built for the job.</p>
</div>
</div>
</div>
</div>

### Take It Further

The same manager asks whether switching to a salted hash would have stopped the breach from happening at all.

<div class="ad-mission ad-mission--capstone" data-id="w2m-c7" data-attempts="0">
<span class="ad-mission__num">Ticket 06 · INC-1157 · Medium</span>
<p><strong>CISO Briefing · Follow-up · 5:15 PM</strong><br>The manager wants a direct answer before the briefing ends: would salting have prevented this breach?</p>
<p><strong>Task:</strong> Say what salting actually would and would not have changed about this specific incident. Type its letter.<br><strong>A</strong> Yes, a salted hash cannot be breached at all, so this incident would not have happened.<br><strong>B</strong> Salting would have stopped an attacker from spotting which accounts share a password, but it does nothing for a password that was weak to begin with: <code>Summer2024!</code> stays guessable, salted or not.<br><strong>C</strong> No, salting changes nothing about password security. It is purely cosmetic.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what salting would and would not have changed" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Salting changed one thing in this whole lab: whether identical passwords looked identical in storage. It never touched how guessable any single password was.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">You proved in the challenge above that salting stops correlation, not guessing. A weak password salted is still a weak password.</div>
<div class="ad-miss" data-guess="c">Salting is not cosmetic. It is the exact difference between the "weak" and "strong" storage you ran side by side in this lab.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. Stops the correlation, not the weak password itself</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A salted database would have hidden the fact that accounts shared <code>Summer2024!</code>, but it would not have made <code>Summer2024!</code> a harder password to guess. Salting and password strength fix two different problems, and a breach review that only asks "was it salted" misses the half of the question a weak password answers on its own.</p>
</div>
</div>
</div>
</div>

### Why It Matters

When a breach is reported, the first technical question is how the passwords were stored, because that decides whether every reused credential across the company is now exposed. Salting closes one door. It was never going to be the whole fix.
