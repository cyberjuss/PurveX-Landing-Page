### Tools You'll Use

The challenge this week is an access review. You'll gather evidence from the Security log and change group membership in Active Directory.

**Event Viewer** reads the Windows logs. Open it with Win+R and `eventvwr.msc`, then go to **Windows Logs → Security**. Choose **Filter Current Log**, type an event ID and click OK:

- **4624** is a successful sign-in.
- **4625** is a failed one. Its **Account Name** and **Sub Status** fields tell you who and why.

`Get-WinEvent` does the same search in PowerShell, which is handy when you need a count.

**Active Directory PowerShell** covers the fixes:

| Command | What it does |
| :---- | :---- |
| `Get-ADGroupMember "<group>"` | Lists who is in a group |
| `Get-ADPrincipalGroupMembership <user>` | Lists every group a user is in |
| `Remove-ADGroupMember` | Takes a user out of a group |
| `Disable-ADAccount <user>` | Stops an account signing in, but keeps it for the record |

### Try it

Filter the Security log for **4624** and find the sign-in from when you logged on to your domain controller today.

```match
prompt: Match each tool to the review question it answers.
Event Viewer, event 4625 = Has someone been guessing this password?
Get-ADGroupMember = Who holds Domain Admins?
Get-ADPrincipalGroupMembership = What can this one user reach?
```
