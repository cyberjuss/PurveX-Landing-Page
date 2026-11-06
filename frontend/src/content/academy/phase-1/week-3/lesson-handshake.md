### The Three-Way Handshake

You've just seen that TCP keeps checking the other side heard it. That checking starts before any data moves, with a short exchange of three messages that confirms both sides are present and ready. It's called the three-way handshake, and it happens at the start of every TCP connection.

| Step | Sent by | Meaning |
|---|---|---|
| **SYN** | The computer opening the connection | Requests a connection and states its starting sequence number |
| **SYN-ACK** | The computer being contacted | Accepts, and states its own starting sequence number |
| **ACK** | The computer opening the connection | Confirms it received the reply |

Notice that data only starts to flow once all three steps are complete, and that distinction matters a great deal when you're reading a capture.

Those sequence numbers are the reason TCP can call itself reliable, because the handshake is where each side declares the number it will count from. UDP, the other transport protocol you'll meet constantly, skips the handshake and the acknowledgements entirely, trading reliability for speed. That's the right trade for voice and video calls, where a packet that arrives late is useless anyway.

So when you're working through a capture, look for all three steps before you trust a conversation:

- A **SYN with no SYN-ACK** means the far side never answered, because the host is down, a firewall dropped the request, or nothing is at that address. A live host with the port closed answers with a reset (RST). A long run of those across many addresses or ports is a recognizable pattern, and it usually means somebody is scanning.
- **Data with no handshake in front of it** means the capture doesn't show you a completed session. Often the capture simply started after the connection opened, but whatever you conclude from that data rests on an assumption you haven't checked.

```order
prompt: Put the TCP handshake in order.
level: 1
SYN: the computer opening the connection asks to connect
SYN-ACK: the computer being contacted accepts
ACK: the opener confirms it got the reply
```
