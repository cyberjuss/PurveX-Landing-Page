<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Protect a Real File, Then Take It Further</h3>
<p class="ad-brief__ask">Can you encrypt and decrypt a real file on your own machine, and then name the one transformation whose output is always the same length?</p>
<p>Hosted lab required, with the Ubuntu desktop open. Builds on the two challenges above.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 2 solved</span>
</div>

### Protect a Real File

In CyberChef, you proved that encryption needs a key while encoding doesn't. Now it's time to use that for real, on your own machine, with a whole file instead of a single test word.

```bash
printf 'Q3 advisory fees: 412500' > ~/ledger-copy.txt
openssl enc -aes-256-cbc -pbkdf2 -salt -in ~/ledger-copy.txt -out ~/ledger-copy.enc -pass pass:PurveX-Backup-Key1
rm ~/ledger-copy.txt
```

At this point, the plain file is gone. Only `ledger-copy.enc` is left in your home directory, and without the passphrase you just chose, nobody can read it. So let's decrypt it back.

```bash
openssl enc -d -aes-256-cbc -pbkdf2 -in ~/ledger-copy.enc -pass pass:PurveX-Backup-Key1
```

<div class="ad-mission ad-mission--capstone" data-id="w2e-c6" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1153 · Low</span>
<p><strong>Task:</strong> Run the decrypt command above. What line does it print?</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the decrypted file content" placeholder="the decrypted line" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{q3 advisory fees: 412500}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>You should get back exactly what you wrote into the file before encrypting it, nothing more and nothing less. That round trip only works because you supplied the same passphrase both times.</p>
<ol>
<li>Try the decrypt command with a wrong passphrase first, and watch it refuse rather than return garbage.</li>
<li>Then run it again with the real one, <code>PurveX-Backup-Key1</code>.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="q3advisoryfees412500">You're very close. Keep the spaces and the colon exactly as they were in the original file.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>Q3 advisory fees: 412500</code></p>
</div>
<div>
<span>Why it matters</span>
<p>That's the same line from the ledger file in the CIA triad lab, except now it's actually protected rather than sitting in the clear. The plain copy is gone, so only the encrypted copy plus the passphrase you know can bring it back. That's what "needs a key to undo" really means once it's a real file rather than one word in a browser tool.</p>
</div>
</div>
</div>
</div>

### Take It Further

Now let's take what you know one step further. A different log shows a value that's exactly 64 characters long, no matter how short or long the original data was.

<div class="ad-mission ad-mission--capstone" data-id="w2e-c7" data-attempts="0">
<span class="ad-mission__num">Ticket 06 · INC-1156 · Medium</span>
<p><strong>SOC Queue · Log Review · 4:00 PM</strong><br>A teammate asks what that fixed-length value tells you, before anyone tries to reverse it.</p>
<p><strong>Task:</strong> Name which of the three transformations produces a fixed-length output no matter what goes in, and what that fixed length tells you on its own. Type its letter.<br><strong>A</strong> Encoding, since Base64 output length has nothing to do with the input.<br><strong>B</strong> Hashing, since SHA2-256 always returns the same 64-character length regardless of input size, and that fixed length alone is the tell that it cannot be reversed.<br><strong>C</strong> Encryption, since AES output is always a fixed size too.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for which transformation always produces a fixed-length output" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Think back to the first challenge in this set. You hashed one short word and got a 64-character string back, and changing the length of the input never changed that number.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">Base64's output grows with the input, so a longer word gives a longer encoded string. That means its length isn't fixed.</div>
<div class="ad-miss" data-guess="c">AES output grows with the input too. It gets padded up to a block size, but it isn't fixed to one length no matter what goes in.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. Hashing, always 64 characters</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A SHA2-256 hash is always 64 hex characters, whether the input is one word or an entire file. That fixed length is a hash's signature, and it also explains why a hash can never be "unpacked" back into the original. If the output is always the same small size, it simply can't hold all the information from a larger input in the first place.</p>
</div>
</div>
</div>
</div>

### Why It Matters

As an analyst, you'll read strange-looking strings in logs every day, and your first decision will always be which of the three you're looking at. That decision matters in both directions. If you assume an encoded value is safe because it looks encrypted, you'll miss data walking out in plain sight. And if you can't tell a hash from a leak, you'll escalate things that were never a problem.
