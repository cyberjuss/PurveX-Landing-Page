<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>How do analysts tell ordinary network traffic from something worth a second look?</p>
</div>

### Overview

Opening a network capture for the first time is disorienting: thousands of rows, all numbers, none of them announcing which ones matter. There is no packet marked suspicious. A healthy environment produces just as many rows as a compromised one.

What makes a capture readable is knowing every conversation is built from the same small set of pieces, in the same order:

- An **address**, so the traffic knows where to go
- A **reliable connection**, established before any data moves
- A **port**, selecting a particular service on the other machine
- A **protocol**, governing what the two sides actually say
- Often **encryption**, layered on top of all of it

This week takes them one at a time: TCP/IP addressing, the TCP three-way handshake, the ports and protocols you'll meet most often, and how TLS wraps a connection once TCP has already brought it up. Each is simple alone; the difficulty is absorbing them all at once.

The labs then put you in Wireshark with real traffic. You're not hunting for a packet marked malicious — none exists. You're hunting for something that doesn't fit a pattern you've already learned, which is why the learning has to come first. Know what normal looks like at each layer and the exception jumps out; don't, and you'll stare at a healthy capture for an hour.

By the end of the week, any conversation in a capture should answer four questions for you: Where is it going? Which port did it use? Did the handshake complete? Could anybody watching the wire read what was said? Those four answers decide whether it deserves more of your attention — and deciding that fast is most of the job.
