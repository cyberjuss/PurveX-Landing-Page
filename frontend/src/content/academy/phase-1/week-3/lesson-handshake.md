### The Three-Way Handshake

Before two computers exchange data over TCP, they confirm both sides are ready:

| Step | Sent by | Meaning |
|---|---|---|
| **SYN** | The computer opening the connection | Requests a connection and states its starting sequence number |
| **SYN-ACK** | The computer being contacted | Accepts, and states its own starting sequence number |
| **ACK** | The computer opening the connection | Confirms it received the reply |

Data starts to flow only after these three steps.

TCP is called reliable because it numbers every byte it sends and resends anything that is not acknowledged.

The handshake starts that process by agreeing on the starting sequence numbers. UDP is the other common transport protocol. It skips all of this and trades reliability for speed.

In a capture, look for all three steps before you trust the conversation. If a SYN never gets a SYN-ACK, the other side did not agree to talk.

If data appears with no handshake in front of it, the capture does not show a completed TCP session.
