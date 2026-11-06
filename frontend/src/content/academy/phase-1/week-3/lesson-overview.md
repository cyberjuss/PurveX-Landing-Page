<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>How do analysts tell ordinary network traffic from something worth a second look?</p>
</div>

### Overview

A network capture is thousands of rows of numbers, and nothing in a packet announces itself as suspicious. A healthy network produces as many rows as a compromised one.

What makes it readable is that every conversation is built from the same pieces, in the same order:

- An **address**, so the traffic knows where to go
- A **reliable connection**, established before any data moves
- A **port**, selecting a particular service on the other machine
- A **protocol**, governing what the two sides say
- Often **encryption**, layered on top of all of it

This week takes them one at a time: addressing, the handshake, ports, protocols, then TLS.

Then the challenge has you clean up a network change that went wrong in your lab. Nothing there is labeled "malicious". You'll spot what doesn't fit, which only works once you know what normal looks like.

By the end of the week, ask four questions of any conversation: Where is it going? Which port? Did the handshake complete? Could anyone watching read it? The answers tell you whether it deserves a closer look.
