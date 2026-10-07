### Encoding, Encryption or Hashing?

**The ticket:** Jordan Ellis finds this in a vendor script: `password: SGFyYm9yMjAyNg==`. "It's scrambled, so it's encrypted, right?"

<div class="academy-analogy">
<span class="academy-analogy__tag">Think of it like a mailroom</span>
<ul>
<li><strong>Encoding</strong> is shorthand. Anyone who knows it reads the letter.</li>
<li><strong>Encryption</strong> is a locked box. Only the key opens it.</li>
<li><strong>Hashing</strong> is a fingerprint. It identifies the letter but can never rebuild it.</li>
</ul>
</div>

### How to tell them apart

| | Looks like | Get it back? |
|---|---|---|
| **Base64 encoding** | Letters, digits, `+` `/`, often ends in `=` | Anyone, in one step |
| **Encryption** | Random characters that grow with the input | Only with the key |
| **Hash** | Always the same length: SHA-256 is 64 characters | Never |

Jordan's line is Base64. CyberChef's **From Base64** turns it into `Harbor2026` in one click. So the answer is no, it is not encrypted. That password is exposed. Report it so it gets changed.

<details class="academy-deeper">
<summary>Go deeper</summary>

#### Decode Base64 without CyberChef

```
printf '%s' 'SGFyYm9yMjAyNg==' | base64 -d
[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('SGFyYm9yMjAyNg=='))
```

The first is Linux or Mac. The second is PowerShell.

#### Attackers encode commands

PowerShell runs Base64 given after `-EncodedCommand`, often shortened to `-enc`. A SOC analyst who sees `powershell -enc` followed by a long string decodes it before deciding anything. The text inside is UTF-16, so in CyberChef add **Decode text** set to UTF-16LE after From Base64. `RwBlAHQALQBEAGEAdABlAA==` decodes to `Get-Date`.

#### Good encryption changes every time

Encrypt the same thing twice with the same key and good encryption gives two different results, because it mixes in a random value. Two identical encrypted values are a warning sign about how it was built.

</details>

### Check yourself

A log shows `powershell.exe -enc` and 400 characters of Base64 on a Finance laptop at 2:14 in the morning. Is the command hidden from you? What do you do first?
