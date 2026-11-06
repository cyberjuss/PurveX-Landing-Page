### Hashing and Integrity

**The ticket:** Riley Kwan has two copies of a vendor installer, one from email and one from a download mirror. The vendor's site lists a SHA-256. "Which one is safe to run?"

A hash is a fixed-length value calculated from a file or text. Three properties make it useful:

- The same input always gives the same hash.
- Changing one byte gives a completely different hash.
- It only runs one way. Nobody can rebuild the original from it.

That makes a hash a fingerprint, short enough to paste into a ticket and specific enough that no other file will match it.

### What a hash tells you

One character changes everything:

```
Harbor2026   17e80eed5cd387f397eb28c8ba59af346a8ec8c5569f83cbfebcd5e3df291a7b
Harbor2027   4ec765fd76caad15aec3c46f8c3dc0b9e77cd65b9e4c569677ed2b99d79a0d5b
```

So if your file's hash matches the vendor's, you have the exact bytes the vendor published.

### Verify in three steps

Checking a download takes three steps:

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

A match proves your file is identical to the reference. It says nothing about whether the reference was safe.

CCleaner in 2017, SolarWinds in 2020 and 3CX in 2023 all shipped malware from the vendor's own build process. Customers who checked found a correct hash and a valid signature, because the malware was inside before either was made. A verified hash proves the file arrived intact, not that it was clean.

### Compare automatically

```
(Get-FileHash .\setup.exe -Algorithm SHA256).Hash -eq "PASTE-THE-VENDOR-HASH"
sha256sum setup.exe
echo "PASTE-THE-VENDOR-HASH  setup.exe" | sha256sum -c
```

The first prints `True` or `False`. The last prints `setup.exe: OK` or `FAILED` and needs two spaces before the file name. On a Mac, use `shasum -a 256`.

### The line-break trap

When you hash text, `echo` adds an invisible line break that gets hashed too:

```
printf '%s' 'Harbor2026' | sha256sum   17e80eed5cd3...
echo 'Harbor2026' | sha256sum          be5cc1881c34...
```

Use `printf '%s'`, and make sure nothing follows the text in CyberChef. When checking a file, hash the file, not text copied out of it.

### Old algorithms

MD5 (32 characters) and SHA-1 (40 characters) are broken: two different files can be made with the same hash. They're fine for spotting duplicates, not for proving a file wasn't touched. Use SHA-256.

### Digital signatures

A hash says a file is intact. A signature says who published it. Open **Properties → Digital Signatures** or run `Get-AuthenticodeSignature .\setup.exe`, and look for `Valid` with the publisher you expect. The CCleaner and 3CX files were signed too, so no single check is enough.

### How the SOC uses hashes

In a SOC, you'll see hashes everywhere:

- Alerts in tools like Microsoft Defender name files by their SHA-256.
- Teams share the hashes of bad files so others can block them. MISP is a free, open-source platform for this.
- When you collect evidence, hash it right away and record the value so anyone can later prove it was not changed.

### Check yourself

The vendor emails you a new installer and puts the SHA-256 in that same email. The hash matches. Is the file verified?
