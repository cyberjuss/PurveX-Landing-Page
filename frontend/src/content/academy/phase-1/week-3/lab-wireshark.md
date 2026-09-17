<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>How do you tell ordinary network traffic from the traffic that does not belong?</p>
</div>

### Overview

This lab is hands-on. Opening a capture in Wireshark, learning the three panes, learning to recognize what makes traffic look suspicious before applying a single filter, and using three basic filters plus "Follow → HTTP Stream" to reassemble a full conversation into something readable.

**\[SCREENSHOT: Wireshark start screen, interface list (optional, for first-time users)\]**

### What Wireshark Actually Shows You

Every time a computer talks to another computer, it sends small chunks of data called packets. Wireshark records and displays those packets so you can see exactly what was sent, to where, and when, which is what makes it the single most important tool an analyst has for answering "what actually happened on the wire."

Think of it as reading someone's mail log rather than their mail. You cannot see inside a sealed envelope, but you can see who wrote to whom and how often. If a letter was never sealed, meaning the traffic was never encrypted, you can sometimes read it too.

### The Three Panes

* **Top (Packet List):** one line per packet. This is your timeline.
* **Middle (Packet Details):** click a packet, see what is inside it, layer by layer.
* **Bottom (Bytes):** the raw data, for when you need to go deeper than the parsed view.

**\[SCREENSHOT: Full Wireshark window, label the 3 panes (top / middle / bottom)\]**

> **Fundamental #1:** Click through a few packets in the top pane and watch the middle pane change with each one. That is the entire interaction loop this tool is built around.

### What "Suspicious" Looks Like, Before You Even Filter

Normal web browsing produces quick GET requests to a wide variety of sites. Malware traffic tends to look different, and a trained eye can often spot the pattern before running a single filter:

* Talking to one address repeatedly (Statistics → Conversations makes this visible immediately)
* Sending data out, not just requesting pages in. Watch for POST requests
* An odd or fabricated-looking browser identity (the User-Agent field)
* Data that does not resemble normal text. Malware often scrambles or encodes what it steals

**\[SCREENSHOT: Statistics → Conversations, sorted by bytes, highlight the heaviest conversation\]**

> **Fundamental #2:** Malware traffic is not invisible. It is traffic with a pattern that does not match normal use, and learning that pattern is most of the skill.

### Getting There: Three Filters

Type these one at a time, and observe what changes with each:

| Filter | Shows |
| ----- | ----- |
| `http` | Just web traffic |
| `http.request.method == "POST"` | Just data being sent out |
| `ip.addr == <IP>` | Just one computer's traffic |

**\[SCREENSHOT: Filter bar with http.request.method \== "POST" typed in, filtered list below\]**

> **Fundamental #3:** A filter does not find anything for you. It narrows what you are looking at so that you can.

### The One Move That Matters Most

Right-click any packet → Follow → HTTP Stream.

This reassembles the full back-and-forth into something readable. This is the moment you will actually see the malware talking, the address it is sending to, and precisely what it is sending.

**\[SCREENSHOT: Follow HTTP Stream window, User-Agent header and POST body visible (crop/blur payload bytes as needed)\]**

### Write Down What You See

* Infected computer's address: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
* Address it is talking to: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
* What looked unusual: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

> **Discussion:** If this traffic pattern is visible to us only after the fact, what would it take to catch it while it is happening?

