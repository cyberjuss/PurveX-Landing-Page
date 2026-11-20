<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>How do analysts tell ordinary network traffic from something worth a second look?</p>
</div>

### Overview

The first time you open a network capture, it can feel disorienting. Thousands of rows scroll past, every one full of numbers, and nothing in a packet announces itself as suspicious. A network that is working perfectly produces just as many rows as one that has been compromised.

What makes a capture readable is knowing that every conversation is built from the same small set of pieces, always in the same order:

<ul>
<li>An <strong>address</strong>, so the traffic knows where to go</li>
<li>A <strong>reliable connection</strong>, established before any data moves</li>
<li>A <strong>port</strong>, selecting a particular service on the other machine</li>
<li>A <strong>protocol</strong>, governing what the two sides say</li>
<li>Often <strong>encryption</strong>, layered on top of all of it</li>
</ul>

This week, we will take those pieces one at a time:

<ul>
<li>Addressing and the handshake</li>
<li>Ports and protocols</li>
<li>How TLS wraps a connection once it is up</li>
</ul>

After that, the challenge puts you on the job, cleaning up after a network change that went wrong in your own lab. Nothing you find there will be labeled "malicious." Instead, you will be looking for what does not fit, and that only works once you know what normal looks like at each layer.

By the end of the week, every conversation in a capture should answer four questions for you:

<ul>
<li>Where is it going?</li>
<li>Which port did it use?</li>
<li>Did the handshake complete?</li>
<li>Could anybody watching the wire read what was said?</li>
</ul>

Those answers tell you whether a conversation deserves more of your attention, and deciding that quickly is most of the job.

```order
prompt: Every conversation in a capture is built from the same pieces. Put them in the order they come together.
level: 1
An address, so the traffic knows where to go
A reliable connection, set up by the handshake
A port, which picks the service on the far machine
A protocol, the rules for what the two sides say
Encryption, often wrapped around all of it
```
