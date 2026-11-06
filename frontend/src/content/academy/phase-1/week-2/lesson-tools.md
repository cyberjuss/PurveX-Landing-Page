### Tools You'll Use

**CyberChef** (gchq.github.io/CyberChef): paste into Input, drag steps into Recipe, read Output.

| Step | Use it on |
| :---- | :---- |
| From Hex | Only 0 to 9 and a to f |
| From Base64 | Letters, digits, `+` `/`, often ends in `=` |
| SHA2 (256) | Anything you need to hash |

**PowerShell:**

| Command | Does |
| :---- | :---- |
| `Get-FileHash` | Hashes a file with SHA-256 |
| `Set-ADUser <name> -ChangePasswordAtLogon $true` | Forces a new password at next sign-in |

**Try it:** decode `SGVsbG8gUHVydmVY` with From Base64.

```match
prompt: Match each CyberChef step to the value it handles.
From Hex = 507572766558
From Base64 = UHVydmVY
SHA2 (256) = A file you need to verify
```
