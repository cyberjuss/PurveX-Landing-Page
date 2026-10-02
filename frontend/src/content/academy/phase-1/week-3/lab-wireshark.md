<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>How do you tell ordinary network traffic from the traffic that does not belong?</p>
</div>

**Situation:** The SOC has a packet capture from a PurveX workstation that started behaving strangely. Before anyone can say whether the machine is infected, someone has to read the capture and find the traffic that does not belong.

**Your task:** Open the capture in Wireshark and learn its three panes. Then use three basic filters and Follow HTTP Stream to find the infected computer and the address it talks to. Note what looks unusual about that conversation.

**What you need:** Wireshark installed on your computer and the practice capture your instructor provides.

### What Wireshark Shows You

Every time one computer talks to another, it sends small chunks of data called packets. Wireshark records those packets and shows what was sent and where it went. That record answers the question of what happened on the wire.

Encryption changes how much of that you can see. In encrypted traffic you can still see who talked to whom and how often, but not the content. In unencrypted traffic you can often read the content as well.

### The Three Panes

Wireshark splits every capture into three panes:

* **Packet List (top):** one line per packet, which works as your timeline.
* **Packet Details (middle):** the contents of the selected packet, layer by layer.
* **Packet Bytes (bottom):** the raw data, for when the parsed view is not enough.

Click through a few packets in the top pane and watch the middle pane change. You will repeat that loop for most of your time in Wireshark.

### What Suspicious Traffic Looks Like

Normal browsing produces quick GET requests to many different sites. Malware traffic tends to follow a different pattern, and you can often spot it before you apply a single filter:

* Repeated connections to one address, which Statistics → Conversations shows at a glance
* Data going out as well as pages coming in, usually as POST requests
* An odd or made-up browser identity in the User-Agent field
* Data that does not look like normal text, because malware often encodes what it steals

### Three Filters

Type these one at a time and watch how the packet list changes. A filter narrows what you see, but deciding what is wrong is still your job.

| Filter | Shows |
| ----- | ----- |
| `http` | Just web traffic |
| `http.request.method == "POST"` | Just data being sent out |
| `ip.addr == <IP>` | Just one computer's traffic |

### Follow the HTTP Stream

Right-click a packet and choose Follow → HTTP Stream. Wireshark reassembles the whole exchange into readable text, so you can see the address the malware sends to and the data it sends.

### Record Your Findings

* Infected computer's address: _________________________
* Address it is talking to: _________________________
* What looked unusual: _________________________

> **Discussion:** This pattern is only visible after the fact. What would it take to catch it while it is happening?
