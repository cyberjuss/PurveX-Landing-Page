<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>How do analysts tell ordinary network traffic from something worth a second look?</p>
</div>

### Overview

The first time you open a network capture, it's disorienting. Thousands of rows scroll past, every one of them full of numbers, and none of them gives you an obvious clue about which ones matter. The reason is simple, even if it's frustrating at first: nothing in a packet announces itself as suspicious. A network that's working perfectly produces just as many rows as one that's been compromised.

What makes a capture readable, then, is knowing that every conversation is built from the same small set of pieces, always in the same order:

- An **address**, so the traffic knows where to go
- A **reliable connection**, established before any data moves
- A **port**, selecting a particular service on the other machine
- A **protocol**, governing what the two sides actually say
- Often **encryption**, layered on top of all of it

This week, we'll take those pieces one at a time: TCP/IP addressing, the TCP three-way handshake, the ports and protocols you'll meet most often, and finally how TLS wraps a connection once TCP has brought it up. Each piece is simple on its own. The real difficulty is taking them all in at once, which is why we'll build them up step by step.

After that, the labs put you in Wireshark with real traffic. You won't be hunting for a packet marked "malicious", because no such packet exists. Instead, you'll be looking for something that doesn't fit a pattern you've already learned, and that's why the learning has to come first. Once you know what normal looks like at each layer, the exception jumps out at you. Without that, you could stare at a perfectly healthy capture for an hour.

By the end of the week, every conversation in a capture should answer four questions for you. Where is it going? Which port did it use? Did the handshake complete? And could anybody watching the wire read what was said? Those four answers tell you whether a conversation deserves more of your attention, and deciding that quickly is most of the job.
