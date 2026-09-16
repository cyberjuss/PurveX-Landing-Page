### The Three-Way Handshake

Before two computers exchange data over TCP, they "shake hands" to confirm both sides are actually ready:

<div class="academy-analogy">
<span class="academy-analogy__tag">Think of it like a phone call</span>
<ul>
<li><strong>SYN</strong>: Computer A says, "I would like to connect."</li>
<li><strong>SYN-ACK</strong>: Computer B says, "Understood, I am ready too."</li>
<li><strong>ACK</strong>: Computer A says, "Good, let us proceed."</li>
</ul>
</div>

Only after these three steps does actual data begin to flow.

* **Fundamental:** This handshake is the reason TCP is called "reliable." Both sides confirm the connection exists before anything important is sent, which is precisely what a protocol like UDP skips, and why UDP trades reliability for speed.
