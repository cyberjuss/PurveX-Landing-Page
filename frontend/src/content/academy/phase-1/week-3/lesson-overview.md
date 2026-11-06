<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>How do analysts tell ordinary network traffic from something worth a second look?</p>
</div>

### Overview

The first time you open a network capture, it can feel disorienting. Thousands of rows scroll past, every one full of numbers, and nothing in a packet announces itself as suspicious. A network that's working perfectly produces just as many rows as one that's been compromised.

What makes a capture readable is knowing that every conversation is built from the same small set of pieces, always in the same order:

- An **address**, so the traffic knows where to go
- A **reliable connection**, established before any data moves
- A **port**, selecting a particular service on the other machine
- A **protocol**, governing what the two sides say
- Often **encryption**, layered on top of all of it

This week, we'll take those pieces one at a time, starting with addressing and the handshake, then moving on to ports and protocols, and finishing with how TLS wraps a connection once it's up.

After that, the challenge puts you on the job, cleaning up after a network change that went wrong in your own lab. Nothing you find there will be labeled "malicious". Instead, you'll be looking for what doesn't fit, and that only works once you know what normal looks like at each layer.

By the end of the week, every conversation in a capture should answer four questions for you. Where is it going? Which port did it use? Did the handshake complete? And could anybody watching the wire read what was said? Those answers tell you whether a conversation deserves more of your attention, and deciding that quickly is most of the job.
