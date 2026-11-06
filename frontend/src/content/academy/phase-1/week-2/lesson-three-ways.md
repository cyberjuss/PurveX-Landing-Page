### Encoding vs Encryption vs Hashing

**The ticket:** Jordan Ellis finds this in a vendor script: `password: SGFyYm9yMjAyNg==`. "It's scrambled, so it's encrypted, right?"

It's an easy mistake to make, because all three methods produce output a person can't read. What separates them has nothing to do with how scrambled the result looks. It comes down to one question: who can reverse it?

- **Encoding** can be undone by anybody.
- **Encryption** can be undone only by somebody holding the key.
- **Hashing** cannot be undone by anybody, under any circumstances.

Jordan's question matters because the answer changes what happens next. If the value were really encrypted, how exposed the password is would depend on whether the key leaked too. If it's only encoded, though, the password is already known to anyone who has read that script.

### How to tell them apart

| | Looks like | Get it back? |
|---|---|---|
| **Base64 encoding** | Letters, digits, `+` `/`, often ends in `=` | Anyone, in one step |
| **Encryption** | Random characters that grow with the input | Only with the key |
| **Hash** | Always the same length: SHA-256 is 64 characters | Never |

Using that table, you can see that Jordan's line is Base64, because the letters, the digits and the trailing `=` are its signature. CyberChef's **From Base64** turns it into `Harbor2026` in a single click, with no key involved at all. So the answer to Jordan is no, it was never encrypted. The password should be treated as exposed and changed, and the script should be fixed so the next person doesn't inherit the same assumption.

### Decode Base64 without CyberChef

```
printf '%s' 'SGFyYm9yMjAyNg==' | base64 -d
[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('SGFyYm9yMjAyNg=='))
```

You don't need CyberChef for this, either. The first command works on Linux or a Mac, and the second does the same thing in PowerShell.

### Attackers encode commands

Attackers know about Base64 too, and they use it to hide commands. PowerShell will run Base64 text given after `-EncodedCommand`, which is often shortened to `-enc`, so when an analyst sees `powershell -enc` followed by a long string, they decode it before deciding anything. One detail trips people up here: the text inside is UTF-16, so in CyberChef you add **Decode text** set to UTF-16LE after From Base64. With that step added, `RwBlAHQALQBEAGEAdABlAA==` decodes to `Get-Date`.

### Good encryption changes every time

Encryption has a telltale habit of its own. Good encryption mixes in a random value each time, so encrypting the same thing twice with the same key gives two different results. If you ever see two identical encrypted values, treat that as a warning sign about how the encryption was built.

```sort
prompt: You found these in PurveX files. Encoding, encryption or hashing?
level: 2
Encoding: password: SGFyYm9yMjAyNg== in a vendor script | A config value ending in == that decodes in one click
Encryption: A note that only opens with the passphrase Tide-Lamp-42 | Sam's BitLocker drive
Hashing: A 64-character value printed next to a download link | $6$N4tQ2x$YkiZ5p… in a password table
```

### Check yourself

Here's a situation to think through before moving on. A log shows `powershell.exe -enc` followed by 400 characters of Base64 on a Finance laptop at 2:14 in the morning. Is that command really hidden from you? And what's the first thing you'd do?

<details class="lk-answer">
<summary>Compare your answer</summary>

It isn't hidden at all, because Base64 is encoding, and anyone can reverse it. Decode it first, with From Base64 and then Decode text set to UTF-16LE, so you can read exactly what it runs before you judge it. Then look at who ran it and whether anything like it is normal for that laptop. If the decoded command downloads something or connects out, that's when you escalate and isolate the machine.

</details>
