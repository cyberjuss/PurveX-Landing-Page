### Hashing and Integrity

Riley Kwan in Operations calls the desk. A vendor's installer was sent over by email, and Riley also found a copy on a download mirror that came up in a search. The vendor's website lists a SHA-256 value next to its download link. Riley asks which file is safe to run.

Both files have the same name and the same icon. Looking at them tells you nothing. The hash tells you whether either one is exactly what the vendor published.

<div class="academy-analogy">
<span class="academy-analogy__tag">Think of it like a fingerprint</span>
<ul>
<li>Every file has one, and the same file always leaves the same print.</li>
<li>Change the file even slightly and the print is completely different.</li>
<li>You can match a print to a file, but you can never rebuild the file from the print.</li>
</ul>
</div>

### What a hash guarantees

A hash function reads every byte of the input and produces a fixed-length value. Five properties make it useful. Each one is something you can check yourself.

**1. Same input, same hash.** Every tool on every machine gets the same answer. CyberChef, PowerShell and sha256sum all agree, which is why a vendor can publish one value for everyone.

**2. Fixed length.** A SHA-256 hash is always 64 hex characters, whether the input is a ten-letter password or a 4 GB disk image.

**3. One change changes everything.** Here are two inputs that differ by one digit:

```
Harbor2026   17e80eed5cd387f397eb28c8ba59af346a8ec8c5569f83cbfebcd5e3df291a7b
Harbor2027   4ec765fd76caad15aec3c46f8c3dc0b9e77cd65b9e4c569677ed2b99d79a0d5b
```

Nothing lines up. You cannot tell from the hash how big the change was, or where it was. You only learn that the data is different.

**4. One-way.** There is no key and no reverse operation. The only way to find an input for a given hash is to guess inputs and hash each one.

**5. Collision resistant.** For a strong algorithm, nobody can deliberately make two different files with the same hash. This is the property that fails when an algorithm gets old.

| Algorithm | Length | Use it for security? |
|---|---|---|
| MD5 | 32 hex characters | No. Collisions have been made since 2004. |
| SHA-1 | 40 hex characters | No. A public collision was made in 2017. |
| SHA-256 | 64 hex characters | Yes. The current standard. |
| SHA-512 | 128 hex characters | Yes |

You will still see MD5 and SHA-1 in older tools and threat reports. They are fine for spotting two identical files. They are not proof that a file was not tampered with.

### How to verify a file

1. **Get the reference hash from the source.** Take it from the vendor's own website or the IT portal, not from the mirror that served the file. An attacker who can swap the file on a mirror can swap the hash next to it too.
2. **Hash your copy.** Use any of these. All are free, and all give the same answer.
3. **Compare every character.** Let the tool compare for you. Eyes skip characters.

**CyberChef:** open it with the SHA2 operation set to 256, drag the file into the Input pane, and copy the Output.

**PowerShell 7 (Windows, Mac or Linux):**

```
Get-FileHash .\setup.exe -Algorithm SHA256
(Get-FileHash .\setup.exe -Algorithm SHA256).Hash -eq "PASTE-THE-VENDOR-HASH"
```

The second line prints `True` or `False`, so you do not compare by eye. Capital and lowercase letters count as the same.

**Linux or Mac terminal:**

```
sha256sum setup.exe
shasum -a 256 setup.exe
echo "PASTE-THE-VENDOR-HASH  setup.exe" | sha256sum -c
```

The last line prints `setup.exe: OK` or `setup.exe: FAILED`. There are two spaces between the hash and the file name.

### The mistake that fools new analysts

Hashing text instead of a file adds a trap. The `echo` command adds a line break at the end, and the line break gets hashed too:

```
$ printf '%s' 'Harbor2026' | sha256sum
17e80eed5cd387f397eb28c8ba59af346a8ec8c5569f83cbfebcd5e3df291a7b
$ echo 'Harbor2026' | sha256sum
be5cc1881c3496cc4e521a95d6357ede7eab6ce863c9cf630f6e0554797a2693
```

Same word, different hash. Use `printf '%s'`, or make sure nothing follows the text in CyberChef's Input pane. The same thing happens if you copy a file's text into CyberChef instead of loading the file itself, since the copy can change the line endings. For a file, always hash the file.

### What a hash cannot prove

A matching hash proves your file is identical to the reference. It does not prove the reference is safe.

- In 2017, attackers got into the build system for CCleaner. The vendor then shipped and published an installer that already contained malware. Every download matched the vendor's hash.
- In 2020, the same thing happened to a SolarWinds update, and in 2023 to the 3CX installer.

In each case, the vendor's own source was poisoned. So check two things: the file matches the reference, and the reference came from a place you trust.

A **digital signature** adds the second check. The vendor signs the file with a private key, and anyone can verify it with the vendor's public key. On Windows, open the file's **Properties**, then the **Digital Signatures** tab, or run:

```
Get-AuthenticodeSignature .\setup.exe
```

Look for a `Status` of `Valid` and a signer name you expect. A signature tells you who published the file and that it was not changed after signing. The CCleaner and 3CX files were signed too. No single check is enough, which is why endpoint tools also watch what a file does after it runs.

### How the SOC uses hashes

- **Alerts name files by hash.** Endpoint tools such as Microsoft Defender show the SHA-256 of a suspicious file. That value is the file's identity, whatever the file is named.
- **Hashes are indicators.** When a team confirms a bad file, it shares the hash. Other teams search for it across their machines and block it. MISP is a free, open-source platform many teams use to share these indicators.
- **Hashes protect evidence.** When you collect a file or disk image during an incident, you hash it right away and write the value in the ticket. Anyone can later prove the evidence was not changed.

### When to escalate

Riley's download from the mirror does not match the vendor's hash. What now?

- Do not run it, and do not delete it. Deleting destroys the evidence.
- Move it somewhere nobody will open it by accident, and record where it came from.
- Put both hashes in the ticket: the vendor's and yours.
- Escalate to security. A tampered installer on a public mirror may already be on other machines.

Also escalate when a file on an internal share stops matching the hash IT published. That means someone with access to the share changed it.

### Check yourself

A vendor emails you a new version of its installer and includes the SHA-256 in the same email. Your hash matches. Is the file verified? What would you check before installing it on every laptop?
