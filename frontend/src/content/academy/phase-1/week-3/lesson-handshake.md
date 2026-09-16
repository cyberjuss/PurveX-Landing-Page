### **The Three-Way Handshake**

Before two computers exchange data over TCP, they "shake hands" to agree they're both ready:

<div class="academy-analogy">
<span class="academy-analogy__tag">Think of it like a phone call</span>
<ul>
<li><strong>SYN</strong>: Computer A says, "I'd like to connect."</li>
<li><strong>SYN-ACK</strong>: Computer B says, "Okay, I'm ready too."</li>
<li><strong>ACK</strong>: Computer A says, "Great, let's go."</li>
</ul>
</div>

Only after these three steps does actual data start flowing.

* **Fundamental:** This handshake is why TCP is called "reliable." Both sides confirm the connection before anything important is sent.
