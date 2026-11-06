### Encoding vs Encryption vs Hashing

**The ticket:** Jordan Ellis finds this in a vendor script: `password: SGFyYm9yMjAyNg==`. "It's scrambled, so it's encrypted, right?"

It's an easy mistake to make, because all three methods produce output that a person can't read. That surface similarity is what makes the mix-up so common. What separates them has nothing to do with how scrambled the result looks. Instead, it comes down to one question: who can reverse it?

- **Encoding** can be undone by anybody.
- **Encryption** can be undone only by somebody holding the key.
- **Hashing** cannot be undone by anybody, under any circumstances.

Jordan's question matters because the answer changes what happens next. If the value were genuinely encrypted, how exposed the password is would depend on whether the key leaked too. If it's only encoded, the password is already public to anyone who has read that script. The clock on replacing it started the moment the file was written.

### How to tell them apart

| | Looks like | Get it back? |
|---|---|---|
| **Base64 encoding** | Letters, digits, `+` `/`, often ends in `=` | Anyone, in one step |
| **Encryption** | Random characters that grow with the input | Only with the key |
| **Hash** | Always the same length: SHA-256 is 64 characters | Never |

Using that table, you can see that Jordan's line is Base64: the letters, the digits and the trailing `=` are its signature. In fact, CyberChef's **From Base64** operation turns it into `Harbor2026` in a single click, with no key or secret involved at all. So the answer to Jordan's question is no. The value isn't encrypted, and it never was. That means the password should be treated as exposed and reported so it gets changed. The script should be fixed too, so the next person to read it doesn't inherit the same assumption.

### Decode Base64 without CyberChef

```
printf '%s' 'SGFyYm9yMjAyNg==' | base64 -d
[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('SGFyYm9yMjAyNg=='))
```

You don't need CyberChef to do this, either. The first command works on Linux or Mac, and the second does the same thing in PowerShell.

### Attackers encode commands

Attackers know about Base64 too, and they use it to hide commands. PowerShell will run Base64 text given after `-EncodedCommand`, which is often shortened to `-enc`. So when a SOC analyst sees `powershell -enc` followed by a long string, they decode it before deciding anything. One detail trips people up here: the text inside is UTF-16, so in CyberChef you add **Decode text** set to UTF-16LE after From Base64. With that step added, `RwBlAHQALQBEAGEAdABlAA==` decodes to `Get-Date`.

### Good encryption changes every time

Encryption has a telltale habit of its own. If you encrypt the same thing twice with the same key, good encryption gives you two different results, because it mixes in a random value each time. So if you ever see two identical encrypted values, treat that as a warning sign about how the encryption was built.

```sort
prompt: Encoding, encryption or hashing? Sort each clue.
Encoding: Letters, digits, + and /, often ending in = | Anyone can get it back in one step
Encryption: Random characters that grow with the input | Only the key holder can get it back
Hashing: Always the same length, 64 characters for SHA-256 | Nobody can ever get it back
```

### Check yourself

Here's a situation to think through before moving on. A log shows `powershell.exe -enc` followed by 400 characters of Base64 on a Finance laptop at 2:14 in the morning. Is that command really hidden from you? And what's the first thing you'd do?
