### The Three-Way Handshake

Before two computers exchange any data over TCP, they go through a short exchange to confirm that both sides are present, willing and ready. It takes three messages, which is where the name comes from, and it happens on every TCP connection without exception.

| Step | Sent by | Meaning |
|---|---|---|
| **SYN** | The computer opening the connection | Requests a connection and states its starting sequence number |
| **SYN-ACK** | The computer being contacted | Accepts, and states its own starting sequence number |
| **ACK** | The computer opening the connection | Confirms it received the reply |

Data begins to flow only after all three steps have completed. Until then the two machines have agreed to talk but have not said anything, which is a distinction that matters a great deal when you are reading a capture.

The sequence numbers exchanged during those three messages are the reason TCP can call itself reliable. It numbers every byte it sends and expects the far side to acknowledge what it received, resending anything that goes unconfirmed. The handshake starts that bookkeeping, by having each side declare the number it intends to count from. It is worth knowing that UDP, the other transport protocol you will meet constantly, does none of this. It skips the handshake and the acknowledgements entirely, trading reliability for speed, which is the right trade for things like voice and video where a late packet is worthless anyway.

When you are working through a capture, look for all three steps before you trust a conversation at all:

- A **SYN with no SYN-ACK** means the far side did not agree to talk. A long run of those across many addresses or ports is a recognizable pattern, not a network fault.
- **Data with no handshake in front of it** means the capture does not show you a completed TCP session. Whatever you conclude from that data rests on an assumption you have not checked.
