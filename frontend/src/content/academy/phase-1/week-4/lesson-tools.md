### Tools You'll Use

**Event Viewer:** Win+R, `eventvwr.msc`, then **Windows Logs → Security → Filter Current Log**.

| Event ID | Means |
| :---- | :---- |
| 4624 | Successful sign-in |
| 4625 | Failed sign-in. Read Account Name and Sub Status. |

`Get-WinEvent` runs the same search in PowerShell when you need a count.

**Active Directory PowerShell:**

| Command | Does |
| :---- | :---- |
| `Get-ADGroupMember "<group>"` | Lists a group's members |
| `Get-ADPrincipalGroupMembership <user>` | Lists a user's groups |
| `Remove-ADGroupMember` | Removes a user from a group |
| `Disable-ADAccount <user>` | Blocks sign-in, keeps the account |

**Try it:** filter for 4624 and find your own sign-in today.

```match
prompt: Match each tool to the review question it answers.
Event Viewer, event 4625 = Has someone been guessing this password?
Get-ADGroupMember = Who holds Domain Admins?
Get-ADPrincipalGroupMembership = What can this one user reach?
```
