### Tools You'll Use

This week's challenge asks you to tell encoded, encrypted and hashed values apart in real files, so let's set up the two tools you'll lean on.

The first is **CyberChef**, a free tool from GCHQ that runs in your browser at gchq.github.io/CyberChef. You paste a value into **Input**, drag steps into the **Recipe**, and read the result in **Output**. These are the three steps you'll need:

| Step | When to use it |
| :---- | :---- |
| From Hex | The value uses only the digits 0 to 9 and the letters a to f |
| From Base64 | The value uses letters, digits, `+` and `/`, and often ends in `=` |
| SHA2 (size 256) | You need to hash whatever is in Input |

The second is PowerShell on your domain controller, which covers the rest of the work:

| Command | What it does |
| :---- | :---- |
| `Get-FileHash` | Hashes a file with SHA-256 |
| `Set-ADUser <name> -ChangePasswordAtLogon $true` | Makes a user choose a new password at their next sign-in |

**Try it:** paste `SGVsbG8gUHVydmVY` into CyberChef and add **From Base64**. If the output reads as a greeting, you've just decoded your first value.

```match
prompt: Match each CyberChef step to the value it handles.
From Hex = 507572766558
From Base64 = UHVydmVY
SHA2 (256) = A file you need to verify
```
