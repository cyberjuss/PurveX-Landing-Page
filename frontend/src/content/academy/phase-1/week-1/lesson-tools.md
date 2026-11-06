### Tools You'll Use

Run these in an admin PowerShell window on your domain controller.

| Command | Does |
| :---- | :---- |
| `Get-NetFirewallRule` | Lists firewall rules |
| `Get-NetFirewallPortFilter` | Shows a rule's port |
| `Disable-NetFirewallRule` | Turns a rule off, without deleting it |
| `Move-Item` / `Copy-Item` | Moves or copies a file |
| `Get-FileHash` | Fingerprints a file. Same hash, same contents. |

**Try it:** `Get-NetFirewallRule -DisplayName "PurveX*" | Select-Object DisplayName, Action, Enabled`

```match
prompt: Match each command to its job.
Get-NetFirewallPortFilter = Find which port a rule blocks
Disable-NetFirewallRule = Switch off a bad rule but keep it
Get-FileHash = Check two copies of a file match
```
