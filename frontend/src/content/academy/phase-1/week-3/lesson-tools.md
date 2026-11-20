### Tools You Will Use

This week's challenge is a Monday morning on the help desk: four users, four different errors, and one tool that shows you the cause of every one. That tool is **Wireshark**, so install it on your domain controller from its official site, wireshark.org. When the installer offers Npcap, keep its loopback option ticked.

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

### PowerShell, Alongside the Capture

A capture tells you what happened. These commands help you find out why:

| Command | What it answers |
| :---- | :---- |
| `Resolve-DnsName <name>` | Which address does this name point to? |
| `Test-NetConnection <name> -Port <port>` | Can I reach that port, and at which address? Read **RemoteAddress** and **TcpTestSucceeded**. |
| `Get-NetTCPConnection -LocalPort <port> -State Listen` | Is anything listening on this port, and on which address? Read **LocalAddress**: `0.0.0.0` means every address, and `127.0.0.1` means this machine only. |
| `Clear-DnsClientCache` | Forget cached lookups, so the next one really asks DNS. |

Every ticket works the same way: find the problem in a capture, make the change, then capture again to prove it is gone.

**Try it** with `Resolve-DnsName $env:COMPUTERNAME` and check that the address matches your domain controller.

<details class="lk-answer">
<summary>What you should see</summary>

Your domain controller's name and its IPv4 address, the same one `ipconfig` shows. Then open Wireshark, start a capture on the loopback adapter, type `dns` in the filter bar, run `Clear-DnsClientCache` and the same command again. You should see the lookup and its answer appear, which is the first time you have watched a protocol you have only read about cross the wire.

</details>


```match
prompt: Match what the capture shows to what the user sees.
SYNs with no reply = It spins for ages, then times out
No such name = "Server not found", straight away
A RST = "Connection refused", straight away
HTTP 410 = It was there and has been removed on purpose
Follow HTTP Stream = Read a whole web exchange as text
```
