<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>How do analysts tell ordinary network traffic from something worth a second look?</p>
</div>

### Introduction

Opening a network capture for the first time is a disorienting experience. Thousands of rows scroll past, every one of them full of numbers, and none of it offers any obvious clue about which rows matter. The instinct is to start reading at the top and hope something stands out. It will not, because there is nothing in a packet that announces itself as suspicious, and an environment working perfectly produces just as many rows as one that is compromised.

What makes a capture readable is knowing that every conversation in it is built from the same small set of pieces. There is an address, so the traffic knows where to go. There is a reliable connection, established before any data moves. There is a port, which selects a particular service on the machine at the other end. There is a protocol, which governs what the two sides actually say to one another. And frequently there is encryption layered on top of all of it. Those pieces are always present and always in that order, which means a capture is not an undifferentiated wall of data. It is the same structure repeating.

This week takes those pieces one at a time. You will cover TCP/IP addressing, the TCP three-way handshake, the ports and protocols you will meet most often, and how TLS wraps a connection once TCP has already brought it up. Each one is straightforward on its own. The difficulty of network analysis comes almost entirely from trying to absorb them all at once, which is why they are separated here.

The labs then put you in Wireshark with real traffic and ask you to separate what is ordinary from what does not belong. This is the part worth setting expectations about. You are not looking for a packet marked malicious, because no such packet exists. You are looking for something that does not fit a pattern you have already learned, which means the learning has to come first. An analyst who knows what normal looks like at each layer notices the exception quickly, and an analyst who does not will stare at a perfectly healthy capture for an hour.

By the end of the week you should be able to look at any conversation in a capture and answer four questions about it. Where is it going? Which port did it use? Did the handshake complete? And could anybody watching the wire read what was said? Those four answers are enough to decide whether a conversation deserves more of your attention, and deciding that quickly is most of the job.

### Questions Answered in This Week

- What do IP and TCP each do, and why does the difference matter when a capture looks broken?
- What happens in the TCP three-way handshake, and what does an incomplete one tell you?
- What are the ports you will meet most often, and which of them deserve a second look?
- What is a protocol, and how is it different from the port it arrives on?
- Why do analysts check DNS activity so early in an investigation?
- What does TLS actually encrypt, and what can you still see in a capture when it is in use?
