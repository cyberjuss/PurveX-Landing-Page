<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Break Integrity and Watch the Hash Scramble</h3>
<p class="ad-brief__ask">If you change a single character in a file, can you prove exactly how much that breaks?</p>
<p>Hosted lab required, with the Ubuntu desktop open and <code>/srv/cia/ledger.txt</code> already created from the Confidentiality challenge.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 1 solved</span>
</div>

### Before You Start

Make a prediction before you type anything. Nothing gets marked here, and you'll see whether you were right as soon as you do the lab below.

<div class="ad-check ad-check--predict" data-check="w1e-p2">
<p class="ad-check__q">If you change one character inside a file, how many characters of its SHA-256 hash change?</p>
<button type="button" class="ad-check__opt" data-i="0">Only the part for that character</button>
<button type="button" class="ad-check__opt" data-i="1">Roughly half of it</button>
<button type="button" class="ad-check__opt" data-i="2">Almost all of it</button>
<p class="ad-check__note">Got it. You'll put the two hashes side by side below and see for yourself.</p>
</div>

### Break Integrity

Integrity means the data is still what it's supposed to be. To prove that, you need something to compare against, so the first step is to record a baseline: a fingerprint of the file as it is right now.

```bash
cd /srv/cia
sha256sum ledger.txt > baseline.txt
cat baseline.txt
```

Now change a single digit inside the file and run the check against your baseline again.

```bash
sed -i 's/412500/412501/' ledger.txt
sha256sum -c baseline.txt
```

This time the check reports FAILED. Put the new hash next to the one saved in `baseline.txt`, and notice how much of it has changed.

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
<p>Take the two lines that <code>sha256sum ledger.txt</code> printed, one from before the <code>sed</code> command and one from after, and compare them character by character. How many positions still match?</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a|b">Compare the full 64-character hash from before the edit with the one from after. You'll find it isn't a partial match, even though you only changed one digit.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>C. Almost all of it</code></p>
</div>
<div>
<span>Why it matters</span>
<p>There's no such thing as a partial match with a hash. Changing even one character scrambles the whole fingerprint, and that's exactly what makes a hash so good at catching any change at all, however small.</p>
</div>
</div>
</div>
</div>

### Why It Matters

Here's the key difference from the last challenge: you can only prove integrity if someone recorded a baseline before anything changed. Without that baseline, you'd have nothing to compare against. In the next challenge, you'll break the third property without touching this file at all.
