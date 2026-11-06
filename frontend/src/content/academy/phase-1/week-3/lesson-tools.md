### Tools You'll Use

Install both on your domain controller from nmap.org and wireshark.org. Only scan machines you own or are allowed to test.

**Nmap:** `nmap -sT -sV <IP address>` lists ports and what answers on them.

| State | Means |
| :---- | :---- |
| open | A service answered |
| closed | Nothing is listening |
| filtered | No answer, usually a firewall |

**Wireshark:** pick an adapter, capture, then filter.

| Filter | Shows |
| :---- | :---- |
| `dns` | Name lookups |
| `http` | Unencrypted web traffic |
| `tcp.port == 23` | Port 23 only |

For traffic between programs on the same machine, capture on **Adapter for loopback traffic capture**.

**PowerShell:** `Resolve-DnsName <name>` shows the address a name points to.

**Try it:** `Resolve-DnsName $env:COMPUTERNAME`

```match
prompt: Match each tool to the question it answers.
Nmap = Which ports does this server expose?
Wireshark = What crossed the wire, and what did it say?
Resolve-DnsName = Which address does this name point to?
```
