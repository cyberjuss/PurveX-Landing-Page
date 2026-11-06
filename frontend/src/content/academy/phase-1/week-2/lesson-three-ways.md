### Encoding vs Encryption vs Hashing

**The ticket:** Jordan Ellis finds this in a vendor script: `password: SGFyYm9yMjAyNg==`. "It's scrambled, so it's encrypted, right?"

All three produce output you can't read, which is why they get mixed up. What separates them is one question: who can reverse it?

- **Encoding** can be undone by anybody.
- **Encryption** can be undone only by somebody holding the key.
- **Hashing** cannot be undone by anybody, under any circumstances.

The answer changes what happens next. If it were encrypted, exposure would depend on whether the key leaked too. If it's only encoded, anyone who read the script has the password.

### How to tell them apart

| | Looks like | Get it back? |
|---|---|---|
| **Base64 encoding** | Letters, digits, `+` `/`, often ends in `=` | Anyone, in one step |
| **Encryption** | Random characters that grow with the input | Only with the key |
| **Hash** | Always the same length: SHA-256 is 64 characters | Never |

Jordan's line is Base64: letters, digits and a trailing `=`. CyberChef's **From Base64** turns it into `Harbor2026` in one click, no key needed. So no, it isn't encrypted. Treat the password as exposed, get it changed, and fix the script.

### Decode Base64 without CyberChef

```
printf '%s' 'SGFyYm9yMjAyNg==' | base64 -d
[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('SGFyYm9yMjAyNg=='))
```

The first line works on Linux or Mac, the second in PowerShell.

### Attackers encode commands

Attackers use Base64 to hide commands. PowerShell runs Base64 given after `-EncodedCommand`, often shortened to `-enc`, so analysts decode it before deciding anything. The text inside is UTF-16, so in CyberChef add **Decode text** set to UTF-16LE after From Base64. `RwBlAHQALQBEAGEAdABlAA==` then decodes to `Get-Date`.

### Good encryption changes every time

Good encryption mixes in a random value, so encrypting the same thing twice with the same key gives two different results. Two identical encrypted values are a warning sign.

```sort
prompt: Encoding, encryption or hashing? Sort each clue.
Encoding: Letters, digits, + and /, often ending in = | Anyone can get it back in one step
Encryption: Random characters that grow with the input | Only the key holder can get it back
Hashing: Always the same length, 64 characters for SHA-256 | Nobody can ever get it back
```

### Check yourself

A log shows `powershell.exe -enc` followed by 400 characters of Base64 on a Finance laptop at 2:14 in the morning. Is that command really hidden from you? And what's the first thing you'd do?
