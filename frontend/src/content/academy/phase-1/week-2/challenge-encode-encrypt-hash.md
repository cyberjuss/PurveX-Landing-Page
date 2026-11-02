<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Encoded, Encrypted, or Hashed?</h3>
<p class="ad-brief__ask">One reverses instantly, one needs a key, one never comes back. Can you tell which, then protect a real file?</p>
<p>Hosted lab required, with Firefox open on the Ubuntu desktop.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 6 solved</span>
</div>

### Before You Start

Commit to an answer before you open anything. Nothing is marked yet. The tool settles each one.

<div class="ad-check ad-check--predict" data-check="w2e-p1">
<p class="ad-check__q">Base64 and encryption both produce gibberish. Which one can anyone reverse without a secret?</p>
<button type="button" class="ad-check__opt" data-i="0">Base64</button>
<button type="button" class="ad-check__opt" data-i="1">Encryption</button>
<button type="button" class="ad-check__opt" data-i="2">Neither</button>
<p class="ad-check__note">Locked in. You will reverse one of them with a single operation and need a key for the other.</p>
</div>

<div class="ad-check ad-check--predict" data-check="w2e-p2">
<p class="ad-check__q">If you hash a password and later lose the original, can you get the password back from the hash?</p>
<button type="button" class="ad-check__opt" data-i="0">Yes, by reversing the hash</button>
<button type="button" class="ad-check__opt" data-i="1">No, hashing is one-way</button>
<p class="ad-check__note">Locked in. You will search the tool for a reverse operation and see what you find.</p>
</div>

<div class="ad-check ad-check--predict" data-check="w2e-p3">
<p class="ad-check__q">Which of the three is the only one that needs a key to undo?</p>
<button type="button" class="ad-check__opt" data-i="0">Encoding</button>
<button type="button" class="ad-check__opt" data-i="1">Hashing</button>
<button type="button" class="ad-check__opt" data-i="2">Encryption</button>
<p class="ad-check__note">Locked in. You will change the key and watch the result stop coming back.</p>
</div>

### Open CyberChef

In Firefox on the Ubuntu desktop, open the live tool.

```
https://gchq.github.io/CyberChef/
```

The screen has three areas. The left is a list of operations you search and drag. The middle is your recipe, the operations stacked in order. The bottom boxes are Input and Output.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-2/PLACEHOLDER-cyberchef-layout.png" alt="CyberChef open in Firefox showing the operations list, the recipe area and the input and output boxes" />
<figcaption>Screenshot 1. [ADD IMAGE] The three areas of CyberChef.</figcaption>
</figure>
</div>

### Encode It

In the Input box, type the single word `advisory`. Search the operations list for "To Base64" and drag it into the recipe.

The Output shows `YWR2aXNvcnk=`. This is encoding. It rearranges the characters by a public rule, so anyone can undo it. Add "From Base64" under the first operation and the word returns.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-2/PLACEHOLDER-cyberchef-base64.png" alt="CyberChef recipe with To Base64 producing the encoded output" />
<figcaption>Screenshot 2. [ADD IMAGE] Encoding, and nothing secret involved.</figcaption>
</figure>
</div>

Confirm it in a terminal.

```bash
printf 'advisory' | base64
printf 'advisory' | base64 | base64 -d
```

### Hash It

Clear the recipe. With `advisory` still in the Input, search for "SHA2" and drag in "SHA2" set to 256.

The Output is a long fixed-length string. This is hashing. It is one-way by design, so there is no "unhash" operation anywhere in the list to drag in. Search for one and see.

```bash
printf 'advisory' | sha256sum
```

Change one letter of the input in CyberChef and watch the whole hash change. A hash proves whether data changed. It never stores the data.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-2/PLACEHOLDER-cyberchef-hash.png" alt="CyberChef showing a SHA2-256 hash with no reverse operation available" />
<figcaption>Screenshot 3. [ADD IMAGE] Hashing, with no way back by design.</figcaption>
</figure>
</div>

### Encrypt It

Clear the recipe. Search for "AES Encrypt" and drag it in. In its Key field type `00000000000000000000000000000000` and leave the mode as it is. Put `advisory` in the Input.

The Output is the encrypted value. This is encryption. Drag in "AES Decrypt" below it with the same key and the word returns. Change one character of the key and it does not.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-2/PLACEHOLDER-cyberchef-aes.png" alt="CyberChef showing AES Encrypt and AES Decrypt with a matching key returning the original word" />
<figcaption>Screenshot 4. [ADD IMAGE] Encryption, reversible only with the key.</figcaption>
</figure>
</div>

### Check Yourself

Answer from what you saw in the tool.

<div class="ad-mission" data-id="w2e-c1" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1092 · Low</span>
<p><strong>Task:</strong> Which of the three had no reverse operation anywhere in the list? Type its letter.<br><strong>A</strong> Encoding.<br><strong>B</strong> Hashing.<br><strong>C</strong> Encryption.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for which transformation has no reverse operation" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>You added a reverse operation right under both of the other two. Only one of the three never got one.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">You reversed this one with "From Base64" right below "To Base64." It has a reverse operation.</div>
<div class="ad-miss" data-guess="c">You reversed this one with "AES Decrypt" using the matching key. It has a reverse operation too.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. Hashing</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Hashing is one-way by design. There is no unhash operation to drag in, which is exactly why it suits password storage.</p>
</div>
</div>
</div>
</div>

### Name What Encryption Needs That Encoding Does Not

<div class="ad-mission" data-id="w2e-c2" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1093 · Low</span>
<p><strong>Task:</strong> To undo the AES output, what did you have to supply that Base64 never asked for? Type its letter.<br><strong>A</strong> A key.<br><strong>B</strong> Nothing extra.<br><strong>C</strong> The original text.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what AES needed that Base64 did not" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{a}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>"From Base64" needed nothing typed into it. "AES Decrypt" had a field you had to fill in to match "AES Encrypt."</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="b">You did have to supply something for AES Decrypt to work: the same value you typed into AES Encrypt's Key field.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>A. A key</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Encryption is reversible only with the key. Base64 is reversible by anyone, because its rule is public.</p>
</div>
</div>
</div>
</div>

### Match the Job to the Tool

<div class="ad-mission" data-id="w2e-c3" data-attempts="0">
<span class="ad-mission__num">Ticket 03 · INC-1094 · Medium</span>
<p><strong>Engineering · Design Review · 11:00 AM</strong><br>PurveX Financial's engineering team is designing how the client portal stores login passwords. The server only ever needs to check a password against what it has on file; it never needs to read the original back.</p>
<p><strong>Task:</strong> Which of the three transformations fits that job? Type its letter.<br><strong>A</strong> Encoding.<br><strong>B</strong> Encryption.<br><strong>C</strong> Hashing.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for which transformation fits password storage" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{c}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The job never needs the original value back, only a way to confirm a guess matches it. One of the three has no reverse operation at all, by design.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">Encoding is reversible by anyone, since its rule is public. Storing a password that way lets anyone who reads it recover the real password.</div>
<div class="ad-miss" data-guess="b">Encryption needs a key kept somewhere, and whoever holds that key could read every password back. The job never needs the original at all.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>C. Hashing</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Hashing. The server stores the hash and compares against it, and never needs the original, so one-way is a feature.</p>
</div>
</div>
</div>
</div>

### Read a Real Value Cold

<div class="ad-mission" data-id="w2e-c4" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1095 · Low</span>
<p><strong>Task:</strong> You intercept the value <code>YWR2aXNvcnk=</code> in a log. Encoding, encryption or hashing? Type its letter.<br><strong>A</strong> Encoding.<br><strong>B</strong> Encryption.<br><strong>C</strong> Hashing.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what the intercepted value is" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{a}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>This is the exact value you produced earlier in this lab. Drop it back into CyberChef with "From Base64" and see what comes out.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="b">An AES-encrypted value does not end in a trailing <code>=</code> the way this one does, and this string reverses with a single public operation.</div>
<div class="ad-miss" data-guess="c">A SHA2-256 hash is a fixed 64-character string. This value is shorter and reverses cleanly, which a hash never does.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>A. Encoding</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The trailing <code>=</code> and the character set mark it as Base64. You could read it in seconds, so treating it as encrypted would be a costly mistake.</p>
</div>
</div>
</div>
</div>

### Prove a Teammate Wrong

<div class="ad-mission ad-mission--capstone" data-id="w2e-c5" data-attempts="0">
<span class="ad-mission__num">Ticket 05 · INC-1096 · High</span>
<p><strong>SOC Queue · Data-Loss Alert · 3:30 PM</strong><br>An alert flags data leaving IT-WKS04, Priya Nair's workstation, that reads <code>cGF5bG9hZA==</code>. Teammate noor.ahmadi says it is encrypted and the firm cannot know what it is.</p>
<p><strong>Task:</strong> Decode it yourself and report the actual word.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the decoded word" placeholder="one word" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{payload}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The trailing <code>=</code> and the character set are the same tell as the value you decoded earlier in this lab. Use the same recipe.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="advisory">That is the word from earlier in this lab, encoded differently. Decode this value on its own.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>payload</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The teammate was wrong, and you just proved it in seconds with the same CyberChef recipe from the start of this lab. Calling a Base64 string "encrypted" is not a small mistake. It tells a manager the data is safe when anyone who looks at the log can already read it.</p>
</div>
</div>
</div>
</div>

### Protect a Real File

CyberChef proved encryption needs a key where encoding does not. Now use that for real, on your own machine, with a file instead of a toy word.

```bash
printf 'Q3 advisory fees: 412500' > ~/ledger-copy.txt
openssl enc -aes-256-cbc -pbkdf2 -salt -in ~/ledger-copy.txt -out ~/ledger-copy.enc -pass pass:PurveX-Backup-Key1
rm ~/ledger-copy.txt
```

The plain file is gone. Only `ledger-copy.enc` is left in your home directory, and it is unreadable without the passphrase you just chose. Decrypt it back.

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
<p>It is exactly what you wrote into the file before encrypting it, nothing more and nothing less. The round trip only works because you supplied the same passphrase both times.</p>
<ol>
<li>Try the decrypt command with a wrong passphrase first, and watch it refuse rather than return garbage.</li>
<li>Then run it again with the real one, <code>PurveX-Backup-Key1</code>.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="q3advisoryfees412500">Keep the spaces and the colon exactly as you typed them into the original file.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>Q3 advisory fees: 412500</code></p>
</div>
<div>
<span>Why it matters</span>
<p>This is the same line from the CIA triad lab's own ledger file, now actually protected rather than just sitting in the clear. The plain copy is gone; only the encrypted one and the passphrase in your head can bring it back. That is what "needs a key to undo" means when it is a real file instead of one word in a browser tool.</p>
</div>
</div>
</div>
</div>

### Take It Further

A different log shows a value that is exactly 64 characters long, no matter how short or long the original data was.

Name which of the three transformations produces a fixed-length output no matter what goes in, and say what that fixed length tells you before you even try to reverse anything.

### Why It Matters

Analysts read strange-looking strings in logs every day, and the first decision is always which of the three they are looking at. Call an encoded value encrypted and you escalate a non-event. Miss that a value is only encoded and you overlook data walking out in plain sight.
