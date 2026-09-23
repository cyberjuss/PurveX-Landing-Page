### The Three-Way Handshake

Before two computers exchange data over TCP they confirm both sides are ready:

<div class="academy-analogy">
<span class="academy-analogy__tag">Think of it like a phone call</span>
<ul>
<li><strong>SYN</strong>: Computer A says, "I would like to connect."</li>
<li><strong>SYN-ACK</strong>: Computer B says, "Understood, I am ready too."</li>
<li><strong>ACK</strong>: Computer A says, "Good, let us proceed."</li>
</ul>
</div>

Only after these three steps does actual data begin to flow.

This handshake is why TCP is called reliable. Both sides confirm the connection exists before anything important is sent. UDP skips that check and trades reliability for speed.

In a capture look for the three steps before you trust the conversation. If SYN never gets a SYN-ACK the other side did not agree to talk. If you see data with no handshake in front of it you are not looking at a finished TCP session.
