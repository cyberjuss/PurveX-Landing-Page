### The Three-Way Handshake

You've just seen that TCP keeps checking the other side heard it. That checking starts before any data moves at all, with a short exchange that confirms both sides are present, willing and ready. Because the exchange takes three messages, it's called the three-way handshake, and it happens at the start of every TCP connection without exception.

| Step | Sent by | Meaning |
|---|---|---|
| **SYN** | The computer opening the connection | Requests a connection and states its starting sequence number |
| **SYN-ACK** | The computer being contacted | Accepts, and states its own starting sequence number |
| **ACK** | The computer opening the connection | Confirms it received the reply |

Data only starts to flow once all three steps are complete. Until then, the two machines have agreed to talk but haven't actually said anything yet, and that distinction matters a great deal when you're reading a capture.

Those sequence numbers are the reason TCP can call itself reliable. TCP numbers every byte it sends and expects the other side to acknowledge what it received, resending anything that goes unconfirmed. The handshake is what starts that bookkeeping, because it's where each side declares the number it will count from. By contrast, UDP, the other transport protocol you'll meet constantly, does none of this. It skips the handshake and the acknowledgements entirely, trading reliability for speed. That's the right trade for voice and video calls, where a packet that arrives late is useless anyway.

So when you're working through a capture, look for all three steps before you trust a conversation at all:

- A **SYN with no SYN-ACK** means the far side never answered, because the host is down, a firewall dropped the request, or nothing is at that address. A live host with the port closed answers with a reset (RST). A long run of those across many addresses or ports is a recognizable pattern. It usually means somebody scanning, not a network fault.
- **Data with no handshake in front of it** means the capture does not show you a completed TCP session. Often the capture simply started after the connection opened, but whatever you conclude from that data rests on an assumption you have not checked.

```order
prompt: Put the TCP handshake in order.
SYN: the computer opening the connection asks to connect
SYN-ACK: the computer being contacted accepts
ACK: the opener confirms it got the reply
```
