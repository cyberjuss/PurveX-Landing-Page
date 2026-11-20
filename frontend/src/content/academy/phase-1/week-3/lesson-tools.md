### Tools You Will Use

This week's challenge is a Monday morning on the help desk: six tickets, each with a different error. You will work them the way network technicians do, starting with the command-line tools that are already on every Windows machine, then confirming what they suggest in **Wireshark** or the logs. Install Wireshark and **Nmap** on your domain controller from their official sites, wireshark.org and nmap.org. When the installer offers Npcap, keep its loopback option ticked. One rule comes first: only scan machines you own or have written permission to test.

### The Command-Line Kit

Each of these answers one question, and together they take you outward one layer at a time: does the name resolve, does the address answer, how far does traffic get, is anything listening, and what does the app say?

| Command | What it answers | What to read |
| :---- | :---- | :---- |
| `ping <name>` | Does anything answer at that address? | The address in the first line, then Reply or Request timed out |
| `nslookup <name>` | What address does DNS give for this name? | The Address under Name. The first Server lines are only the DNS server that answered. **Non-existent domain** means the name is missing |
| `tracert -d <address>` | How far does traffic get on the way there? | Each line is one router. Lines of `*` mean no reply from that hop |
| `netstat -ano` | What is listening on this machine, and on which address? | Local Address and State. `0.0.0.0` means every address, `127.0.0.1` means this machine only. The last column is the process ID |
| `curl.exe -i <URL>` | What does a web service actually reply? | The status line at the top, then the body. Type `curl.exe`, since `curl` in Windows PowerShell is a different command |
| `nmap -sV -p <port> <address>` | Is this port open, closed or filtered, and what answers it? | STATE, then SERVICE and VERSION. For a service Nmap does not recognise, SERVICE is only a guess from the port number, and what the service sent appears in a fingerprint printed under the results |
| `Test-NetConnection <name> -Port <port>` | Can I open a TCP connection to that port? | RemoteAddress and TcpTestSucceeded |

On Linux and macOS you will meet the same jobs under other names, and in a hosted lab you will use them on **web01**, the Ubuntu application server:

| On Linux | What it answers | What to read |
| :---- | :---- | :---- |
| `dig <name>` | What address does DNS give for this name? | The ANSWER SECTION, and `status: NXDOMAIN` when the name is missing |
| `traceroute <address>` | How far does traffic get? | The same as tracert |
| `ip addr` | What addresses does this machine have? | The `inet` lines |
| `sudo ss -ltnp` | What is listening here, and on which address? | Local Address:Port. `0.0.0.0` or `*` means every address, `127.0.0.1` means this machine only |
| `systemctl status <service>` | Is this service running, and will it start at boot? | The Loaded line (enabled or disabled) and the Active line (running or dead) |
| `journalctl -u <service>` | What has this service logged? | The newest lines, at the bottom |
| `sudo ufw status numbered` | Which ports does the firewall allow in? | Each rule, its port and its comment |
| `/var/log/ufw.log` | What did the firewall drop? | `[UFW BLOCK]` lines, with SRC, DST and DPT, the port it was going to |
| `/var/log/auth.log` | Who signed in, and who ran what with sudo? | The account first, then `COMMAND=` and what they ran |

Nmap reports every port in one of three states:

| State | What it means |
| :---- | :---- |
| open | A service answered |
| closed | The machine answered with a reset, but nothing is listening on that port |
| filtered | Nothing answered at all, usually because a firewall dropped the request |

### Wireshark

**Wireshark** records the traffic on a network adapter. You pick an adapter to start a capture, then type a **display filter** to narrow down what you see:

| Filter | What it shows |
| :---- | :---- |
| `dns` | Name lookups and their answers |
| `dns.flags.rcode == 3` | Only the "No such name" answers |
| `tcp.port == 80` | Anything on port 80 |
| `tcp.flags.reset == 1` | Resets: "nothing is listening here" |
| `http` | Unencrypted web requests and responses |
| `http.response.code >= 400` | Only the web responses that are errors |

One detail matters in the challenge. Traffic between two programs on the same machine never touches the network card, and that includes traffic a machine sends to its own address. To see it, capture on **Adapter for loopback traffic capture**. Traffic leaving the machine shows on its Ethernet adapter, and you can capture on both at once by selecting both with Ctrl.

Two more moves do most of the work. Right-click any packet and choose **Follow, then TCP Stream** or **HTTP Stream** to read a whole conversation as text. And to read a packet's details, click it and expand the layers in the middle pane.

### Reading a Failure on the Wire

Users describe every network problem the same way: "it doesn't work". The capture tells you which of four very different problems it is, and so where the fix goes:

| What the capture shows | What the user sees | Where the fix goes |
| :---- | :---- | :---- |
| A DNS answer, then SYNs sent again and again with no reply | It spins for ages, then times out | The address is wrong or the server is down |
| A DNS answer of **No such name**, and no TCP at all | "Server not found", straight away | The name is missing from DNS |
| A SYN answered by a **RST** | "Connection refused", straight away | The machine is there, but the service is not listening on that address and port |
| A full handshake, then an HTTP error status | An error page or "the server returned an error" | The network is fine. The app refused the request |

The last row needs one more piece: HTTP **status codes**. Every web response starts with a three-digit code, and the first digit tells you whose problem it is.

| Code | Meaning |
| :---- | :---- |
| 200 OK | It worked |
| 301 or 302 | Moved, look over there |
| 401 Unauthorized | Sign in first, or the sign-in was wrong |
| 403 Forbidden | You are signed in, but not allowed |
| 404 Not Found | Nothing at that path |
| 410 Gone | It was there and has been removed on purpose |
| 500 Internal Server Error | The server itself failed |
| 503 Service Unavailable | The server is overloaded or down for maintenance |

Codes in the 400s mean the client asked for something wrong. Codes in the 500s mean the server failed.

### Performance and Logs

Not every problem is a wrong setting. When a user says "it's slow" or "it stopped at some point", look at the interface, the traffic and the logs:

| Where to look | What it tells you |
| :---- | :---- |
| `netstat -e`, or `Get-NetAdapterStatistics \| Format-List *` | Bytes sent and received, plus errors and discards. Without `Format-List *`, Get-NetAdapterStatistics shows only bytes and packets. Errors that keep climbing point at a bad cable, port or driver rather than a setting |
| Resource Monitor (`resmon`), Network tab | Which process is using the bandwidth right now, and to which address |
| Event Viewer (`eventvwr.msc`), Windows Logs, Application and System | Services starting, stopping and failing, with the time and often the account |
| Windows Firewall log, `%SystemRoot%\System32\LogFiles\Firewall\pfirewall.log` | Connections the firewall dropped or allowed, once logging is turned on in the firewall profile's properties |

One more command is worth knowing: `Clear-DnsClientCache` makes Windows forget cached lookups, so the next one really asks DNS.

Every ticket works the same way: narrow it down with the command line, confirm it on the wire or in the logs, make the change, then test again to prove it is gone.

**Try it** with `nslookup $env:COMPUTERNAME` and check that the address matches your domain controller.

<details class="lk-answer">
<summary>What you should see</summary>

Your domain controller's name and its IPv4 address, the same one `ipconfig` shows. Then open Wireshark, start a capture on the loopback adapter, type `dns` in the filter bar, run `Clear-DnsClientCache` and the same command again. You should see the lookup and its answer appear, which is the first time you have watched a protocol you have only read about cross the wire.

</details>


```match
prompt: Match each tool to the question it answers.
nslookup = What address does DNS give for this name?
tracert = How far does traffic get on the way there?
netstat -ano = What is listening here, and on which address?
curl.exe -i = What does the web service actually reply?
Nmap = Is this port open, closed or filtered?
Wireshark = What crossed the wire, and what did it say?
```

```connect
prompt: Connect what you see to what the user sees.
SYNs with no reply = It spins for ages, then times out
Non-existent domain = "Server not found", straight away
A RST = "Connection refused", straight away
HTTP 410 = It was there and has been removed on purpose
```
