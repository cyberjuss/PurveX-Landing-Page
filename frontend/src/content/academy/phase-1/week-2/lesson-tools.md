### Tools You'll Use

The challenge this week uses two tools to tell encoded, encrypted and hashed values apart.

**CyberChef** is a free tool from GCHQ that runs in your browser at gchq.github.io/CyberChef. You paste a value into **Input**, drag steps into the **Recipe**, and read the **Output**. The three steps you'll need:

- **From Hex** turns hex (only 0 to 9 and a to f) back into text.
- **From Base64** decodes Base64 (letters, digits, `+` `/`, often ending in `=`).
- **SHA2** with size 256 hashes whatever is in Input.

**PowerShell** covers the rest:

| Command | What it does |
| :---- | :---- |
| `Get-FileHash` | Hashes a file with SHA-256 |
| `Set-ADUser <name> -ChangePasswordAtLogon $true` | Makes a user pick a new password at their next sign-in |

### Try it

Paste `SGVsbG8gUHVydmVY` into CyberChef and add **From Base64**. If the output reads as a greeting, you've decoded your first value.

```match
prompt: Match each CyberChef step to the value it handles.
From Hex = 507572766558
From Base64 = UHVydmVY
SHA2 (256) = A file you need to verify
```
