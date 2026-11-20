### Hashing and Integrity

**The ticket:** Riley Kwan has two copies of a vendor installer, one from email and one from a download mirror. The vendor's site lists a SHA-256. "Which one is safe to run?"

A hash is a fixed-length value calculated from a file or a piece of text, and three properties make it useful:

- The same input always gives the same hash.
- Changing one byte gives a completely different hash.
- It only runs one way. Nobody can rebuild the original from it.

Taken together, those properties turn a hash into a fingerprint. It's short enough to paste into a ticket, yet specific enough that no other file you're likely to meet will produce the same one.

### What a hash tells you

To see how sensitive that fingerprint is, look at what happens when a single character changes:

```
Harbor2026   17e80eed5cd387f397eb28c8ba59af346a8ec8c5569f83cbfebcd5e3df291a7b
Harbor2027   4ec765fd76caad15aec3c46f8c3dc0b9e77cd65b9e4c569677ed2b99d79a0d5b
```

The two inputs differ by one character, yet the hashes have nothing in common. So if your file's hash matches the vendor's character for character, you don't have a similar or probably-correct file. You have the exact bytes the vendor published.

### Verify in three steps

Checking a download comes down to three steps:

1. **Take the reference hash from the vendor's own site**, not from the mirror that served the file.
2. **Hash your copy.** In CyberChef, use SHA2 set to 256 and drag the file into Input. In PowerShell: `Get-FileHash .\setup.exe`
3. **Let the tool compare.** Eyes skip characters.

**If it does not match,** don't run it and don't delete it either. Put both hashes in the ticket and escalate, because deleting the file destroys your evidence.

```order
prompt: Riley has two copies of the vendor installer. Put your checks in order.
level: 2
Get the SHA-256 from the vendor's own site, not the mirror
Run Get-FileHash on both copies
Let a command compare each hash to the vendor's, not your eyes
Run only the copy that matches, and escalate the other without deleting it
```

### What a hash cannot prove

A match tells you that your file is identical to the reference, but it says nothing about whether the reference was safe to begin with.

CCleaner in 2017, SolarWinds in 2020 and 3CX in 2023 all shipped malware straight out of the vendor's own build process. Customers who checked found a correct hash and a valid signature, because the malware was already inside before either was calculated. So:

<ul>
<li>A verified hash tells you the file reached you intact</li>
<li>Whether it was clean at the start is a question a hash can't answer</li>
</ul>

### Compare automatically

```
(Get-FileHash .\setup.exe -Algorithm SHA256).Hash -eq "PASTE-THE-VENDOR-HASH"
sha256sum setup.exe
echo "PASTE-THE-VENDOR-HASH  setup.exe" | sha256sum -c
```

The first command prints `True` or `False`, and the last prints `setup.exe: OK` or `FAILED`. Note that it needs two spaces before the file name, and on a Mac you'd use `shasum -a 256` instead.

### The line-break trap

When you hash text, watch for one trap. `echo` adds an invisible line break, and that line break gets hashed along with your text:

```
printf '%s' 'Harbor2026' | sha256sum   17e80eed5cd3...
echo 'Harbor2026' | sha256sum          be5cc1881c34...
```

To avoid it, use `printf '%s'`, and make sure nothing follows the text in CyberChef. For the same reason, when you're checking a file, hash the file itself rather than text you copied out of it.

### Old algorithms

Not every hash algorithm is still safe to rely on:

<ul>
<li><strong>MD5</strong> (32 characters) and <strong>SHA-1</strong> (40 characters) are broken, because researchers can now create two different files with the same hash</li>
<li>They're still fine for spotting duplicate files</li>
<li>For proving a file hasn't been touched, use <strong>SHA-256</strong></li>
</ul>

### Digital signatures

A hash tells you a file is intact, while a signature tells you who published it. To check one:

<ul>
<li>Open <strong>Properties → Digital Signatures</strong> on the file, or run <code>Get-AuthenticodeSignature .\setup.exe</code></li>
<li>Look for <code>Valid</code> alongside a publisher name you expect</li>
</ul>

Keep in mind that the CCleaner and 3CX files were signed too, which is why no single check is ever enough on its own.

### How the SOC uses hashes

Once you're working in a SOC, you'll see hashes everywhere:

- Alerts in tools like Microsoft Defender name files by their SHA-256.
- Teams share the hashes of bad files so others can block them. MISP is a free, open-source platform for this.
- When you collect evidence, hash it right away and record the value so anyone can later prove it was not changed.

### Check yourself

Here's one to think through. The vendor emails you a new installer and puts the SHA-256 in that same email. The hash matches. Is the file verified?

<details class="lk-answer">
<summary>Compare your answer</summary>

No. The hash arrived through the same channel as the file, so anyone who could swap the installer could swap the hash in that email too. A match only proves the two came from the same place. Instead:

<ul>
<li>Get the reference hash from the vendor's own website, or confirm it with them another way</li>
<li>Check the file's digital signature as well</li>
</ul>

</details>
