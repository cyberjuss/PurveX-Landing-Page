### The Three-Way Handshake

Every TCP connection starts with three messages that confirm both sides are ready. That's the three-way handshake.

| Step | Sent by | Meaning |
|---|---|---|
| **SYN** | The computer opening the connection | Requests a connection and states its starting sequence number |
| **SYN-ACK** | The computer being contacted | Accepts, and states its own starting sequence number |
| **ACK** | The computer opening the connection | Confirms it received the reply |

Data only flows after all three.

The sequence numbers are where TCP's reliability starts: each side declares the number it counts from. UDP, the other common transport protocol, skips the handshake and acknowledgements, trading reliability for speed. That suits voice and video, where a late packet is useless anyway.

In a capture, look for all three steps before you trust a conversation:

- A **SYN with no SYN-ACK** means the far side never answered, because the host is down, a firewall dropped the request, or nothing is at that address. A live host with the port closed answers with a reset (RST). A long run of those across many addresses or ports usually means someone is scanning.
- **Data with no handshake in front of it** means you don't see a completed session. Often the capture just started late, but don't assume it.

```order
prompt: Put the TCP handshake in order.
SYN: the computer opening the connection asks to connect
SYN-ACK: the computer being contacted accepts
ACK: the opener confirms it got the reply
```
