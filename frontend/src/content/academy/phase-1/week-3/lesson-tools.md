### Tools You'll Use

The challenge this week uses the two tools network and security teams reach for most. Install both on your domain controller from their official sites, nmap.org and wireshark.org.

**Nmap** asks a machine which ports are open. `nmap -sT -sV <IP address>` connects to each port and asks what's listening. Each port comes back as one of three states:

- **open** means a service answered.
- **closed** means the machine answered but nothing is listening.
- **filtered** means no answer came, usually because a firewall dropped it.

Only scan machines you own or have written permission to test.

**Wireshark** records the traffic on a network adapter. Pick an adapter to start a capture, then type a **display filter** to narrow it down:

| Filter | Shows |
| :---- | :---- |
| `dns` | Name lookups |
| `http` | Unencrypted web traffic |
| `tcp.port == 23` | Anything on port 23 |

Traffic between programs on the same machine never touches the network card. To see it, capture on **Adapter for loopback traffic capture**.

`Resolve-DnsName <name>` in PowerShell shows which address a name points to.

### Try it

Run `Resolve-DnsName $env:COMPUTERNAME` and check the address matches your domain controller.

```match
prompt: Match each tool to the question it answers.
Nmap = Which ports does this server expose?
Wireshark = What crossed the wire, and what did it say?
Resolve-DnsName = Which address does this name point to?
```
