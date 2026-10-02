### Hashing and Integrity

**The ticket:** Riley Kwan has two copies of a vendor installer, one from email and one from a download mirror. The vendor's site lists a SHA-256. "Which one is safe to run?"

<div class="academy-analogy">
<span class="academy-analogy__tag">Think of it like a fingerprint</span>
<ul>
<li>The same file always leaves the same print.</li>
<li>Change one byte and the print is completely different.</li>
<li>You can match a print to a file, but never rebuild the file from it.</li>
</ul>
</div>

### What a hash tells you

One character changes everything:

```
Harbor2026   17e80eed5cd387f397eb28c8ba59af346a8ec8c5569f83cbfebcd5e3df291a7b
Harbor2027   4ec765fd76caad15aec3c46f8c3dc0b9e77cd65b9e4c569677ed2b99d79a0d5b
```

So if your file's hash matches the vendor's character for character, it is the exact file the vendor published.

### Verify in three steps

1. **Take the reference hash from the vendor's own site**, not from the mirror that served the file.
2. **Hash your copy.** In CyberChef, use SHA2 set to 256 and drag the file into Input. In PowerShell: `Get-FileHash .\setup.exe`
3. **Let the tool compare.** Eyes skip characters.

**If it does not match:** do not run it and do not delete it. Put both hashes in the ticket and escalate. Deleting destroys the evidence.

### What a hash cannot prove

A match proves the file is identical to the reference. It does not prove the reference is safe.

CCleaner (2017), SolarWinds (2020) and 3CX (2023) all shipped malware from the vendor's own build. Every download matched what the vendor shipped, and carried its valid signature.

<details class="academy-deeper">
<summary>Go deeper: more tools, the line-break trap, signatures, and how the SOC uses hashes</summary>

#### Compare automatically

```
(Get-FileHash .\setup.exe -Algorithm SHA256).Hash -eq "PASTE-THE-VENDOR-HASH"
sha256sum setup.exe
echo "PASTE-THE-VENDOR-HASH  setup.exe" | sha256sum -c
```

The first prints `True` or `False`. The last prints `setup.exe: OK` or `FAILED`, and needs two spaces before the file name. On a Mac, use `shasum -a 256`.

#### The line-break trap

`echo` adds an invisible line break, and it gets hashed too:

```
printf '%s' 'Harbor2026' | sha256sum   17e80eed5cd3...
echo 'Harbor2026' | sha256sum          be5cc1881c34...
```

Use `printf '%s'`, and leave nothing after the text in CyberChef. For a file, hash the file itself rather than its copied text.

#### Old algorithms

MD5 (32 characters) and SHA-1 (40 characters) are broken. Researchers can make two different files with the same hash. They are fine for spotting duplicates, not for proving a file is untouched. Use SHA-256.

#### Digital signatures

A signature tells you who published the file. Open **Properties → Digital Signatures** on the file or run `Get-AuthenticodeSignature .\setup.exe` and look for `Valid` and a name you expect. The CCleaner and 3CX files were signed too, so no single check is enough.

#### How the SOC uses hashes

- Alerts in tools like Microsoft Defender name files by their SHA-256.
- Teams share the hashes of bad files so others can block them. MISP is a free, open-source platform for this.
- When you collect evidence, hash it right away and record the value so anyone can later prove it was not changed.

</details>

### Check yourself

The vendor emails a new installer and puts the SHA-256 in the same email. Your hash matches. Is the file verified?
