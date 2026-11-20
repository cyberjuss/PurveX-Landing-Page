### Tools You Will Use

This week's challenge uses the two tools network and security teams reach for most often, so install both on your domain controller from their official sites, nmap.org and wireshark.org. One rule comes first, though: only scan machines you own or have written permission to test.

**Nmap** asks a machine which ports are open. Running `nmap -sT -sV <IP address>` connects to each port and asks what is listening, and every port comes back in one of three states:

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
| `tcp.port == 443` | Anything on port 443 |

One detail will matter in the challenge. Traffic between two programs on the same machine never touches the network card, so to see it, you capture on **Adapter for loopback traffic capture**.

Two facts about Windows Firewall matter in the challenge too. A scan of a machine run from that same machine skips its own firewall, so it shows everything listening, not only what the network can reach. And Windows allows **outbound** traffic unless a rule blocks it, so adding an outbound Allow rule usually changes nothing. Stopping traffic going out takes a Block rule.

Three PowerShell commands round out the kit:

| Command | What it answers |
| :---- | :---- |
| `Resolve-DnsName <name>` | Which address does this name point to? |
| `Test-NetConnection <name> -Port <port>` | Can I reach that port, and at which address? Read **RemoteAddress** and **TcpTestSucceeded**. |
| `Get-NetTCPConnection -LocalPort <port> -State Listen` | Which process is listening on this port? Its **OwningProcess** is the process ID, and `Get-CimInstance Win32_Process -Filter "ProcessId = <ID>"` shows the command that started it. |

`netstat -ano` is the classic version of the last one and works the same way.

Start with the first one. `Resolve-DnsName <name>` in PowerShell shows you which address a name points to. **Try it** with `Resolve-DnsName $env:COMPUTERNAME` and check that the address matches your domain controller.

<details class="lk-answer">
<summary>What you should see</summary>

Your domain controller's name and its IPv4 address, the same one `ipconfig` shows. Then open Wireshark, start a capture, type `dns` in the filter bar and run the same command again. You should see the lookup and its answer appear, which is the first time you have watched a protocol you have only read about cross the wire.

</details>


```match
prompt: Match each tool to the question it answers.
Nmap = Which ports does this server expose?
Wireshark = What crossed the wire, and what did it say?
Resolve-DnsName = Which address does this name point to?
Test-NetConnection = Can I reach this port from here?
Get-NetTCPConnection = Which process is listening on this port?
```
