<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Three strings look like scrambled nonsense. One reverses instantly, one needs a key and one never comes back. Can you tell which is which before you try?</p>
</div>

**Situation:** Encoding, encryption and hashing all turn readable text into something unreadable, so beginners treat them as the same thing. A responder who calls an encoded value "encrypted" sends a ticket to the wrong place and wastes the morning.

**Task:** Take one word through all three transformations in CyberChef, then confirm each result from the command line. Decide which outputs you can reverse and which you cannot, and prove your decision rather than assuming it.

**What you need:** Your hosted lab running, and Firefox on the Ubuntu desktop. CyberChef is a free tool from GCHQ that SOC analysts use to recognise and decode data. It runs entirely in the browser.

### Before You Start

Commit to an answer before you open anything.

1. Base64 and encryption both produce gibberish. Which one can anyone reverse without a secret?
2. If you hash a password and later lose the original, can you get the password back from the hash?
3. Which of the three is the only one that needs a key to undo?

Write your three answers down.

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

1. Which of the three had no reverse operation anywhere in the list?
2. To undo the AES output, what did you have to supply that Base64 never asked for?
3. A password is stored so a server can check it later but never needs to read it back. Which of the three fits that job?
4. You intercept the value `YWR2aXNvcnk=` in a log. Encoding, encryption or hashing?

### Take It Further

An alert flags data leaving a workstation that reads `cGF5bG9hZA==`. A teammate says it is encrypted and the firm cannot know what it is.

Say whether that is correct, and explain in one sentence how you would find out what the data is.

### Why It Matters

Analysts read strange-looking strings in logs every day, and the first decision is always which of the three they are looking at. Call an encoded value encrypted and you escalate a non-event. Miss that a value is only encoded and you overlook data walking out in plain sight.
