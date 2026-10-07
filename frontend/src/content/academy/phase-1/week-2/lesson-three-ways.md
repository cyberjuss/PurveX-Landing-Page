### Encoding, Encryption or Hashing?

**The ticket:** Jordan Ellis finds this in a vendor script: `password: SGFyYm9yMjAyNg==`. "It's scrambled, so it's encrypted, right?"

All three produce output a person cannot read, and that surface similarity is what makes the mistake so common. What separates them has nothing to do with how scrambled the result looks. It is a question of who can reverse it:

- **Encoding** can be undone by anybody.
- **Encryption** can be undone only by somebody holding the key.
- **Hashing** cannot be undone by anybody, under any circumstances.

Jordan's question matters because the answer changes what happens next. If the value were genuinely encrypted, the exposure would depend on whether the key leaked too. If it is merely encoded, the password is already public to anyone who has read that script, and the clock on replacing it started the moment the file was written.

### How to tell them apart

| | Looks like | Get it back? |
|---|---|---|
| **Base64 encoding** | Letters, digits, `+` `/`, often ends in `=` | Anyone, in one step |
| **Encryption** | Random characters that grow with the input | Only with the key |
| **Hash** | Always the same length: SHA-256 is 64 characters | Never |

Jordan's line is Base64. The letters, the digits and the trailing `=` are the signature, and CyberChef's **From Base64** operation turns it into `Harbor2026` in a single click with no key and no secret of any kind. So the answer to Jordan's question is no. The value is not encrypted and never was. That password should be treated as exposed and reported so it gets changed, and the script should be corrected so the next person does not inherit the same assumption.

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
