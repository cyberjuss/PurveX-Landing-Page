### Tools You'll Use

This week's challenge has you working on your own domain controller in an admin PowerShell window, so let's meet the commands before you need them.

| Command | What it does |
| :---- | :---- |
| `Get-NetFirewallRule` | Lists firewall rules, with their name and whether they're on |
| `Get-NetFirewallPortFilter` | Shows which port a rule covers when you pipe a rule into it |
| `Disable-NetFirewallRule` | Turns a rule off without deleting it, so you can turn it back on |
| `Move-Item` / `Copy-Item` | Moves or copies a file to where it belongs |
| `Get-FileHash` | Gives you a file's fingerprint, so you can tell whether two copies match |

`Get-FileHash` is a preview of next week, where you'll learn what a hash really is. For now, it's enough to know that two files with the same hash have the same contents.

**Try it:** run this on your domain controller and read through the rules it returns.

```
Get-NetFirewallRule -DisplayName "PurveX*" | Select-Object DisplayName, Action, Enabled
```

<details class="lk-answer">
<summary>What you should see</summary>

A short list of PurveX rules, each with an Action of Allow or Block and Enabled set to True or False. To practice reading a port, try a built-in rule: `Get-NetFirewallRule -DisplayName "Remote Desktop - User Mode (TCP-In)" | Get-NetFirewallPortFilter` should show port 3389. Being able to say what a rule does, and on which port, is exactly the skill the challenge asks for.

</details>


```match
prompt: Match each command to its job.
Get-NetFirewallPortFilter = Find which port a rule blocks
Disable-NetFirewallRule = Switch off a bad rule but keep it
Get-FileHash = Check two copies of a file match
```
