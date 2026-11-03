<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Break Integrity and Watch the Hash Scramble</h3>
<p class="ad-brief__ask">Can you change one character in a file and prove exactly how much that breaks?</p>
<p>Hosted lab required, with the Ubuntu desktop open and <code>/srv/cia/ledger.txt</code> already created from the Confidentiality challenge.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 1 solved</span>
</div>

### Before You Start

Commit to an answer before you type anything. Nothing is marked right or wrong yet. You confirm it by doing the lab below.

<div class="ad-check ad-check--predict" data-check="w1e-p2">
<p class="ad-check__q">If you change one character inside a file, how many characters of its SHA-256 hash change?</p>
<button type="button" class="ad-check__opt" data-i="0">Only the part for that character</button>
<button type="button" class="ad-check__opt" data-i="1">Roughly half of it</button>
<button type="button" class="ad-check__opt" data-i="2">Almost all of it</button>
<p class="ad-check__note">Locked in. You compare the two hashes below.</p>
</div>

### Break Integrity

Integrity means the data is what it is supposed to be. Record a baseline first, because integrity can only be proved against something.

```bash
cd /srv/cia
sha256sum ledger.txt > baseline.txt
cat baseline.txt
```

Now change one digit inside the file and check the baseline again.

```bash
sed -i 's/412500/412501/' ledger.txt
sha256sum -c baseline.txt
```

The check reports FAILED. Compare the new hash against the one in `baseline.txt` and note how much of it is different.

```bash
sha256sum ledger.txt
```

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-1/PLACEHOLDER-cia-integrity.png" alt="Terminal showing sha256sum check reporting FAILED after one character changed" />
<figcaption>Screenshot 3. [ADD IMAGE] One digit changed, and the check fails.</figcaption>
</figure>
</div>

### Read the Avalanche Effect

<div class="ad-mission" data-id="w1e-c2" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1083 · Low</span>
<p><strong>Task:</strong> You changed one digit out of twenty-four characters. Roughly how many characters of the SHA-256 hash changed? Type its letter.<br><strong>A</strong> About one character.<br><strong>B</strong> About a quarter.<br><strong>C</strong> Almost all of it.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for how much of the hash changed" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{c}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Put the two lines <code>sha256sum ledger.txt</code> printed, before and after the <code>sed</code> command, side by side and compare them character by character.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a|b">Compare the full 64-character hash from before the edit against the one after. This is not a partial match, even for a one-digit change.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>C. Almost all of it</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A hash has no partial match. One changed character scrambles the whole digest, which is what lets it flag any change at all.</p>
</div>
</div>
</div>
</div>

### Why It Matters

Integrity, unlike confidentiality, can only be proved against a baseline recorded before anything changed. The next challenge in this set breaks the third property, without touching this file at all.
