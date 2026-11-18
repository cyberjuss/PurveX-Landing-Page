### The Three-Way Handshake

You have just seen that TCP keeps checking the other side heard it. That checking starts before any data moves, with a short exchange of three messages that confirms both sides are present and ready. It is called the three-way handshake, and it happens at the start of every TCP connection.

<div style="margin:1rem 0;font-family:var(--font-mono, ui-monospace, monospace);">
<div style="display:flex;justify-content:space-between;font-size:0.72em;text-transform:uppercase;letter-spacing:0.05em;color:var(--rd-ink-3, #94a3b8);margin-bottom:0.3rem;">
<span>Opener</span><span>Receiver</span>
</div>
<div style="padding:0.35rem 0;border-bottom:3px solid var(--rd-accent);">
<span style="color:var(--rd-accent);font-weight:700;">SYN ⟶</span>
<div style="font-family:var(--font-display, sans-serif);font-size:0.78em;color:var(--rd-ink-3, #94a3b8);margin-top:2px;">Requests a connection, states a starting sequence number</div>
</div>
<div style="padding:0.35rem 0;border-bottom:3px solid var(--rd-good, #16a34a);text-align:right;">
<span style="color:var(--rd-good, #16a34a);font-weight:700;">⟵ SYN-ACK</span>
<div style="font-family:var(--font-display, sans-serif);font-size:0.78em;color:var(--rd-ink-3, #94a3b8);margin-top:2px;">Accepts, and states its own starting sequence number</div>
</div>
<div style="padding:0.35rem 0;border-bottom:3px solid var(--rd-accent);">
<span style="color:var(--rd-accent);font-weight:700;">ACK ⟶</span>
<div style="font-family:var(--font-display, sans-serif);font-size:0.78em;color:var(--rd-ink-3, #94a3b8);margin-top:2px;">Confirms the reply arrived</div>
</div>
</div>

Notice that data only starts to flow once all three steps are complete, and that distinction matters a great deal when you are reading a capture.

Those sequence numbers are the reason TCP can call itself reliable, because the handshake is where each side declares the number it will count from. UDP, the other transport protocol you will meet constantly, skips the handshake and the acknowledgements entirely, trading reliability for speed. That is the right trade for voice and video calls, where a packet that arrives late is useless anyway.

So when you are working through a capture, look for all three steps before you trust a conversation:

- A **SYN with no SYN-ACK** means the far side never answered. A few things can cause that:
  - The host could be down
  - A firewall could have dropped the request
  - Nothing may be at that address

  A live host with the port closed answers with a reset (RST) instead. A long run of unanswered SYNs across many addresses or ports is a recognizable pattern, and it usually means somebody is scanning.
- **Data with no handshake in front of it** means the capture does not show you a completed session. Often the capture simply started after the connection opened, but whatever you conclude from that data rests on an assumption you have not checked.

```order
prompt: Put the TCP handshake in order.
level: 1
SYN: the computer opening the connection asks to connect
SYN-ACK: the computer being contacted accepts
ACK: the opener confirms it got the reply
```
