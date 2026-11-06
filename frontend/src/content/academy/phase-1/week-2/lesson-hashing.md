### Hashing and Integrity

**The ticket:** Riley Kwan has two copies of a vendor installer, one from email and one from a download mirror. The vendor's site lists a SHA-256. "Which one is safe to run?"

To answer Riley, you first need to know what that SHA-256 value is. A hash is a fixed-length value calculated from a file or a piece of text, and three properties make it useful. First, the same input always produces the same hash, so anybody with the same file can repeat the calculation and get the same answer. Second, changing even a single byte of the input produces a completely different hash, not a slightly different one. Third, the calculation only runs in one direction, which means nobody can rebuild the original from the hash, however much computing power they throw at it.

Taken together, those three properties turn a hash into a fingerprint. It's short enough to publish on a web page or paste into a ticket. Yet it's specific enough that no other file you're likely to meet will produce the same one.

### What a hash tells you

To see how sensitive that fingerprint is, look at what happens when just one character changes:

```
Harbor2026   17e80eed5cd387f397eb28c8ba59af346a8ec8c5569f83cbfebcd5e3df291a7b
Harbor2027   4ec765fd76caad15aec3c46f8c3dc0b9e77cd65b9e4c569677ed2b99d79a0d5b
```

The two inputs above differ by a single character, yet the hashes have nothing in common. That's what makes comparing hashes meaningful. So if your file's hash matches the vendor's character for character, you don't just have a similar file or a probably-correct file. You have the exact sequence of bytes the vendor published.

### Verify in three steps

With that in mind, checking a download comes down to three steps:

1. **Take the reference hash from the vendor's own site**, not from the mirror that served the file.
2. **Hash your copy.** In CyberChef, use SHA2 set to 256 and drag the file into Input. In PowerShell: `Get-FileHash .\setup.exe`
3. **Let the tool compare.** Eyes skip characters.

**If it does not match:** do not run it and do not delete it. Put both hashes in the ticket and escalate. Deleting destroys the evidence.

```order
prompt: Put the verification in order.
Take the reference hash from the vendor's own site
Hash your copy of the file
Let the tool compare the two hashes
```

### What a hash cannot prove

Knowing what the check proves is only half the picture, because it's just as important to know what it doesn't prove. A match tells you that your file is identical to the reference you compared it against. However, it says nothing about whether that reference was safe to begin with. After all, the hash only describes what the vendor shipped, not whether what the vendor shipped was trustworthy.

This isn't just a theoretical gap, either. CCleaner in 2017, SolarWinds in 2020 and 3CX in 2023 all shipped malware straight out of the vendor's own build process. Every customer who verified their download found a correct hash and a valid signature. Those checks passed because the malicious code was already inside before the vendor calculated either one. So all a verified hash tells you is that the file reached you intact. Whether the file was clean at the very start of that chain is a separate question, and it's one a hash can't answer.

### Compare automatically

```
(Get-FileHash .\setup.exe -Algorithm SHA256).Hash -eq "PASTE-THE-VENDOR-HASH"
sha256sum setup.exe
echo "PASTE-THE-VENDOR-HASH  setup.exe" | sha256sum -c
```

Rather than comparing by eye, you can let a command do it for you. The first command above prints `True` or `False`. The last one prints `setup.exe: OK` or `FAILED`, and it needs two spaces before the file name. If you're on a Mac, use `shasum -a 256` instead.

### The line-break trap

There's one trap worth knowing about when you hash text. `echo` adds an invisible line break, and that line break gets hashed along with your text:

```
printf '%s' 'Harbor2026' | sha256sum   17e80eed5cd3...
echo 'Harbor2026' | sha256sum          be5cc1881c34...
```

To avoid it, use `printf '%s'`, and make sure nothing follows the text in CyberChef. For the same reason, when you're checking a file, hash the file itself rather than text you copied out of it.

### Old algorithms

Not every hash algorithm is still safe to rely on. MD5 (32 characters) and SHA-1 (40 characters) are broken, because researchers can now create two different files with the same hash. That makes them fine for spotting duplicate files, but not for proving a file hasn't been touched. For that job, use SHA-256.

### Digital signatures

A hash tells you a file is intact, while a signature tells you who published it. To check one, open **Properties → Digital Signatures** on the file or run `Get-AuthenticodeSignature .\setup.exe`, and look for `Valid` along with a publisher name you expect. Keep in mind, though, that the CCleaner and 3CX files were signed too, which is why no single check is ever enough on its own.

### How the SOC uses hashes

Once you're working in a SOC, you'll see hashes everywhere:

- Alerts in tools like Microsoft Defender name files by their SHA-256.
- Teams share the hashes of bad files so others can block them. MISP is a free, open-source platform for this.
- When you collect evidence, hash it right away and record the value so anyone can later prove it was not changed.

### Check yourself

Here's one to think through. The vendor emails you a new installer and puts the SHA-256 in that same email. The hash matches. Is the file verified?
