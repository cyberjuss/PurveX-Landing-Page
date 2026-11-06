### Tools You'll Use

The challenge this week has you work on your own domain controller in an admin PowerShell window. Here are the five commands it leans on.

| Command | What it does |
| :---- | :---- |
| `Get-NetFirewallRule` | Lists firewall rules, with their name, direction and whether they're on |
| `Get-NetFirewallPortFilter` | Shows the port a rule covers (pipe a rule into it) |
| `Disable-NetFirewallRule` | Turns a rule off without deleting it, so you can turn it back on |
| `Move-Item` / `Copy-Item` | Moves or copies a file to where it belongs |
| `Get-FileHash` | Gives a file's fingerprint, so you can tell if two copies match |

`Get-FileHash` is a preview. Week 2 explains what a hash is. For now, it's enough to know that two files with the same hash have the same contents.

### Try it

Run this on your domain controller and read the list it returns:

```
Get-NetFirewallRule -DisplayName "PurveX*" | Select-Object DisplayName, Direction, Action, Enabled
```

```match
prompt: Match each command to its job.
Get-NetFirewallPortFilter = Find which port a rule blocks
Disable-NetFirewallRule = Switch off a bad rule but keep it
Get-FileHash = Check two copies of a file match
```
