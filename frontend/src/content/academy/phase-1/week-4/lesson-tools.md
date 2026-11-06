### Tools You'll Use

This week's challenge is an access review, which means gathering evidence from the Security log and then fixing group membership in Active Directory. Let's look at the tools for each half.

For the evidence, you'll use **Event Viewer**. Open it with Win+R and `eventvwr.msc`, go to **Windows Logs → Security**, then choose **Filter Current Log** and type the event ID you want. The two you'll use most are these:

| Event ID | What it records |
| :---- | :---- |
| 4624 | A successful sign-in |
| 4625 | A failed sign-in, where the **Account Name** and **Sub Status** fields tell you who and why |

When you need a count rather than a list, `Get-WinEvent` runs the same search in PowerShell.

For the fixes, these Active Directory commands cover everything the challenge asks of you:

| Command | What it does |
| :---- | :---- |
| `Get-ADGroupMember "<group>"` | Lists everyone in a group |
| `Get-ADPrincipalGroupMembership <user>` | Lists every group a user belongs to |
| `Remove-ADGroupMember` | Takes a user out of a group |
| `Disable-ADAccount <user>` | Stops an account signing in, while keeping it for the record |

**Try it:** filter the Security log for 4624 and find the sign-in from when you logged on to your domain controller today.

```match
prompt: Match each tool to the review question it answers.
Event Viewer, event 4625 = Has someone been guessing this password?
Get-ADGroupMember = Who holds Domain Admins?
Get-ADPrincipalGroupMembership = What can this one user reach?
```
