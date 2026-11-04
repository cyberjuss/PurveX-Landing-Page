<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Tell Encoding, Hashing, and Encryption Apart</h3>
<p class="ad-brief__ask">One of these reverses instantly, one needs a key, and one never comes back at all. Can you tell which is which?</p>
<p>Hosted lab required, with Firefox open on the Ubuntu desktop.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 2 solved</span>
</div>

### Before You Start

Make a prediction for each of these before you open anything. Nothing gets marked here, and the tool itself will show you whether you were right.

<div class="ad-check ad-check--predict" data-check="w2e-p1">
<p class="ad-check__q">Base64 and encryption both produce gibberish. Which one can anyone reverse without a secret?</p>
<button type="button" class="ad-check__opt" data-i="0">Base64</button>
<button type="button" class="ad-check__opt" data-i="1">Encryption</button>
<button type="button" class="ad-check__opt" data-i="2">Neither</button>
<p class="ad-check__note">Got it. In a moment you'll reverse one of them with a single operation, and you'll find the other needs a key.</p>
</div>

<div class="ad-check ad-check--predict" data-check="w2e-p2">
<p class="ad-check__q">If you hash a password and later lose the original, can you get the password back from the hash?</p>
<button type="button" class="ad-check__opt" data-i="0">Yes, by reversing the hash</button>
<button type="button" class="ad-check__opt" data-i="1">No, hashing is one-way</button>
<p class="ad-check__note">Got it. You'll search the tool for a reverse operation and see for yourself what turns up.</p>
</div>

<div class="ad-check ad-check--predict" data-check="w2e-p3">
<p class="ad-check__q">Which of the three is the only one that needs a key to undo?</p>
<button type="button" class="ad-check__opt" data-i="0">Encoding</button>
<button type="button" class="ad-check__opt" data-i="1">Hashing</button>
<button type="button" class="ad-check__opt" data-i="2">Encryption</button>
<p class="ad-check__note">Got it. You'll change the key and watch the original stop coming back.</p>
</div>

### Open CyberChef

To start, open Firefox on the Ubuntu desktop and go to the live tool.

```
https://gchq.github.io/CyberChef/
```

Take a moment to get your bearings, because the screen has three areas. On the left is a list of operations that you search and drag from. In the middle is your recipe, which is simply those operations stacked in order. Along the bottom are the Input and Output boxes.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-2/PLACEHOLDER-cyberchef-layout.png" alt="CyberChef open in Firefox showing the operations list, the recipe area and the input and output boxes" />
<figcaption>Screenshot 1. [ADD IMAGE] The three areas of CyberChef.</figcaption>
</figure>
</div>

### Encode It

Let's start with encoding. In the Input box, type the single word `advisory`. Then search the operations list for "To Base64" and drag it into the recipe.

The Output now shows `YWR2aXNvcnk=`, and that's encoding. It rearranges the characters by a public rule, which means anyone can undo it. To prove it, add "From Base64" under the first operation, and you'll see the word come straight back.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-2/PLACEHOLDER-cyberchef-base64.png" alt="CyberChef recipe with To Base64 producing the encoded output" />
<figcaption>Screenshot 2. [ADD IMAGE] Encoding, and nothing secret involved.</figcaption>
</figure>
</div>

You can confirm the same thing in a terminal, too.

```bash
printf 'advisory' | base64
printf 'advisory' | base64 | base64 -d
```

### Hash It

Next, clear the recipe so you can try hashing. With `advisory` still in the Input, search for "SHA2" and drag in "SHA2" set to 256.

This time the Output is a long, fixed-length string, and that's hashing. Because a hash is one-way by design, there's no "unhash" operation anywhere in the list for you to drag in. Go ahead and search for one, so you can see that for yourself.

```bash
printf 'advisory' | sha256sum
```

While you're here, change one letter of the input and watch the whole hash change. That's the useful part: a hash can prove whether data changed, even though it never stores the data itself.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-2/PLACEHOLDER-cyberchef-hash.png" alt="CyberChef showing a SHA2-256 hash with no reverse operation available" />
<figcaption>Screenshot 3. [ADD IMAGE] Hashing, with no way back by design.</figcaption>
</figure>
</div>

### Encrypt It

Finally, clear the recipe once more for encryption. Search for "AES Encrypt" and drag it in. In its Key field, type `00000000000000000000000000000000`, and leave the mode as it is. Then put `advisory` in the Input.

What you see in the Output now is the encrypted value. Drag "AES Decrypt" in below it with the same key, and the word comes back. But change just one character of the key, and it won't.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-2/PLACEHOLDER-cyberchef-aes.png" alt="CyberChef showing AES Encrypt and AES Decrypt with a matching key returning the original word" />
<figcaption>Screenshot 4. [ADD IMAGE] Encryption, reversible only with the key.</figcaption>
</figure>
</div>

### Check Yourself

Answer based on what you actually saw in the tool.

<div class="ad-mission" data-id="w2e-c1" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1092 · Low</span>
<p><strong>Task:</strong> Which of the three had no reverse operation anywhere in the list? Type its letter.<br><strong>A</strong> Encoding.<br><strong>B</strong> Hashing.<br><strong>C</strong> Encryption.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for which transformation has no reverse operation" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Think back over the three recipes. You added a reverse operation right under two of them, so which one never got one?</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">Look again: you reversed this one with "From Base64" right below "To Base64", so it does have a reverse operation.</div>
<div class="ad-miss" data-guess="c">You reversed this one too, with "AES Decrypt" and the matching key, so it has a reverse operation as well.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. Hashing</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Hashing is one-way by design, so there's no unhash operation to drag in. That's exactly why hashing suits password storage: even the system storing the hash can't turn it back into the password.</p>
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
<p>Compare the two reverse operations. "From Base64" needed nothing typed into it, whereas "AES Decrypt" had a field you had to fill in to match "AES Encrypt."</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="b">You did have to supply something for AES Decrypt to work. Look at the field you filled in with the same value you typed into AES Encrypt.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>A. A key</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Encryption can only be reversed with the key. Base64, on the other hand, can be reversed by anyone, because the rule it follows is public.</p>
</div>
</div>
</div>
</div>

### Why It Matters

You just ran three transformations and got three different answers to the question "can this come back?" In the next challenge, you'll put that difference to work on a real decision and a real log.
