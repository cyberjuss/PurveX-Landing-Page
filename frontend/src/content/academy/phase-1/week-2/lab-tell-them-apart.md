<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Three strings look like scrambled nonsense. One reverses instantly, one needs a key and one never comes back. Can you tell which is which before you try?</p>
</div>

**Situation:** Encoding, encryption and hashing all turn readable text into something unreadable, so beginners treat them as the same thing. A responder who calls an encoded value "encrypted" sends a ticket to the wrong place and wastes the morning.

**Task:** Take one word through all three transformations in CyberChef, then confirm each result from the command line. Decide which outputs you can reverse and which you cannot, and prove your decision rather than assuming it.

**What you need:** Your hosted lab running, and Firefox on the Ubuntu desktop. CyberChef is a free tool from GCHQ that SOC analysts use to recognize and decode data. It runs entirely in the browser.

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
<p><strong>Task:</strong> Which of the three had no reverse operation anywhere in the list? Type its letter.<br><strong>A</strong> Encoding.<br><strong>B</strong> Hashing.<br><strong>C</strong> Encryption.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for which transformation has no reverse operation" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
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
<p><strong>Task:</strong> To undo the AES output, what did you have to supply that Base64 never asked for? Type its letter.<br><strong>A</strong> A key.<br><strong>B</strong> Nothing extra.<br><strong>C</strong> The original text.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what AES needed that Base64 did not" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{a}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
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
<p><strong>Task:</strong> A password is stored so a server can check it later but never needs to read it back. Which of the three fits that job? Type its letter.<br><strong>A</strong> Encoding.<br><strong>B</strong> Encryption.<br><strong>C</strong> Hashing.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for which transformation fits password storage" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{c}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
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
<p><strong>Task:</strong> You intercept the value <code>YWR2aXNvcnk=</code> in a log. Encoding, encryption or hashing? Type its letter.<br><strong>A</strong> Encoding.<br><strong>B</strong> Encryption.<br><strong>C</strong> Hashing.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what the intercepted value is" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{a}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
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
<p><strong>Task:</strong> An alert flags data leaving a workstation that reads <code>cGF5bG9hZA==</code>. A teammate says it is encrypted and the firm cannot know what it is. Decode it yourself and report the actual word.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the decoded word" placeholder="one word" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{payload}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
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

### Take It Further

A different log shows a value that is exactly 64 characters long, no matter how short or long the original data was.

Name which of the three transformations produces a fixed-length output no matter what goes in, and say what that fixed length tells you before you even try to reverse anything.

### Why It Matters

Analysts read strange-looking strings in logs every day, and the first decision is always which of the three they are looking at. Call an encoded value encrypted and you escalate a non-event. Miss that a value is only encoded and you overlook data walking out in plain sight.
