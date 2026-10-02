### The Three-Way Handshake

Before two computers exchange data over TCP, they confirm both sides are ready:

<div class="academy-analogy">
<span class="academy-analogy__tag">Think of it like a phone call</span>
<ul>
<li><strong>SYN</strong>: Computer A says, "I would like to connect."</li>
<li><strong>SYN-ACK</strong>: Computer B says, "Understood, I am ready too."</li>
<li><strong>ACK</strong>: Computer A says, "Good, let us proceed."</li>
</ul>
</div>

Data starts to flow only after these three steps.

TCP is called reliable because it numbers every byte it sends and resends anything that is not acknowledged.

The handshake starts that process by agreeing on the starting sequence numbers. UDP is the other common transport protocol. It skips all of this and trades reliability for speed.

In a capture, look for all three steps before you trust the conversation. If a SYN never gets a SYN-ACK, the other side did not agree to talk.

If data appears with no handshake in front of it, the capture does not show a completed TCP session.
