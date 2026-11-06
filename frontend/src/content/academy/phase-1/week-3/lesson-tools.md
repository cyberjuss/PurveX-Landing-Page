### Tools You'll Use

This week's challenge uses the two tools network and security teams reach for most often, so install both on your domain controller from their official sites, nmap.org and wireshark.org. One rule comes first, though: only scan machines you own or have written permission to test.

**Nmap** asks a machine which ports are open. Running `nmap -sT -sV <IP address>` connects to each port and asks what's listening, and every port comes back in one of three states:

| State | What it means |
| :---- | :---- |
| open | A service answered |
| closed | The machine answered, but nothing is listening on that port |
| filtered | Nothing answered at all, usually because a firewall dropped the request |

**Wireshark** records the traffic on a network adapter. You pick an adapter to start a capture, then type a **display filter** to narrow down what you see:

| Filter | What it shows |
| :---- | :---- |
| `dns` | Name lookups |
| `http` | Unencrypted web traffic |
| `tcp.port == 23` | Anything on port 23 |

One detail will matter in the challenge. Traffic between two programs on the same machine never touches the network card, so to see it, you capture on **Adapter for loopback traffic capture**.

Finally, `Resolve-DnsName <name>` in PowerShell shows you which address a name points to. **Try it** with `Resolve-DnsName $env:COMPUTERNAME` and check that the address matches your domain controller.

```match
prompt: Match each tool to the question it answers.
Nmap = Which ports does this server expose?
Wireshark = What crossed the wire, and what did it say?
Resolve-DnsName = Which address does this name point to?
```
