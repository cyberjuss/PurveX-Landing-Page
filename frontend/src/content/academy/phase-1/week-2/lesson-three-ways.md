### Encoding, Encryption or Hashing?

A ticket comes in from Jordan Ellis in Finance. A vendor's setup script sits on the shared drive, and one line reads:

`password: SGFyYm9yMjAyNg==`

Jordan asks: "It's scrambled, so it's encrypted, right? We're fine?"

You cannot answer that until you know which of the three methods you are looking at. Each one gives an attacker something very different.

<div class="academy-analogy">
<span class="academy-analogy__tag">Think of it like a mailroom</span>
<ul>
<li><strong>Encoding</strong> is writing the letter in shorthand. Anyone who knows shorthand reads it.</li>
<li><strong>Encryption</strong> is putting the letter in a locked box. Only someone with the key opens it.</li>
<li><strong>Hashing</strong> is taking the letter's fingerprint. The print identifies the letter, but you can never rebuild the letter from it.</li>
</ul>
</div>

### The one test

Ask two questions, in this order:

1. Can anyone get the original back?
2. If they can, do they need a secret key to do it?

No way back at all means a hash. A way back that needs a key means encryption. A way back that needs nothing means encoding.

### Encoding: shorthand

Encoding exists so data survives being moved. Email, web pages and scripts handle plain text safely, so binary data and odd characters get rewritten as ordinary letters. The most common scheme is **Base64**.

Base64 is not protection. Jordan's line decodes in one step:

```
$ printf '%s' 'SGFyYm9yMjAyNg==' | base64 -d
Harbor2026
```

In CyberChef the same thing is the **From Base64** operation. In PowerShell:

```
[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('SGFyYm9yMjAyNg=='))
```

How to spot Base64: only letters, digits, `+` and `/`, often ending in `=` or `==`, and a length that divides evenly by 4. Hex is another encoding you will see, written only with 0 to 9 and a to f.

So the answer to Jordan is no. That password is readable by anyone who opens the file. Treat it as exposed.

### Encryption: the locked box

Encryption scrambles data with a key. With the right key you get the exact original back. With any other key you get nothing useful. The Encryption and Keys section covers how keys work and where encryption goes wrong.

On screen, encrypted data looks like random characters, usually shown as Base64 or hex. Its length grows with the input. Good encryption also gives a different result each time you encrypt the same thing, because it mixes in a random value. If two encrypted values match exactly, be suspicious of how the encryption was built.

### Hashing: the fingerprint

A hash is a fixed-length fingerprint of the data. The same input always gives the same fingerprint, and there is no key and no way back. That is why hashes are used to prove a file was not changed, and why systems store password hashes instead of passwords.

How to spot a hash: always the same length for a given algorithm, no matter how big the input was. An MD5 hash is 32 hex characters, SHA-1 is 40, and SHA-256 is 64.

### Where this turns into a security problem

- **Passwords in scripts and config files.** A password stored in Base64 is a password stored in plain text. When you find one, do not just decode it and move on. Report it so the password is changed and the script is fixed.
- **Hidden commands.** Attackers encode PowerShell commands so they are harder to read in a log. PowerShell accepts Base64 after `-EncodedCommand` (often shortened to `-enc`). The text inside is UTF-16, so plain Base64 decoding shows a dot between every letter. In CyberChef, add **Decode text** set to UTF-16LE after From Base64. `RwBlAHQALQBEAGEAdABlAA==` decodes to `Get-Date`. A SOC analyst who sees `powershell -enc` followed by a long Base64 string decodes it before deciding anything.
- **False comfort.** "It was encrypted" is only good news if the key was not stored next to the data. A vendor that encrypts passwords with a key kept on the same server has lost both in one breach.

### Check yourself

A log shows `powershell.exe -enc` followed by 400 characters of Base64 on a Finance laptop at 2:14 in the morning. Is the command hidden from you? What is your first step, and which tool do you use?
