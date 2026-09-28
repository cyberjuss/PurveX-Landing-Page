<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>How do you tell ordinary network traffic from the traffic that does not belong?</p>
</div>

### Overview

In this lab you open a capture in Wireshark and learn its three panes. You learn what makes traffic look suspicious before you apply a single filter.

Then you use three basic filters and Follow → HTTP Stream to turn a full conversation into something readable.


### What Wireshark Shows You

Every time one computer talks to another, it sends small chunks of data called packets. Wireshark records and displays those packets, so you can see what was sent, where it went, and when.

That record answers the question "what happened on the wire?"

Encrypted traffic works like a mail log. A sealed envelope hides its contents, but you can still see who wrote to whom and how often.

Unencrypted traffic is an unsealed envelope, so you can sometimes read the contents too.

### The Three Panes

* **Top (Packet List):** one line per packet. This is your timeline.
* **Middle (Packet Details):** click a packet, see what is inside it, layer by layer.
* **Bottom (Bytes):** the raw data, for when you need to go deeper than the parsed view.


> **Fundamental #1:** Click through a few packets in the top pane and watch the middle pane change with each one. You will repeat that loop for most of your time in Wireshark.

### What "Suspicious" Looks Like Before You Filter

Normal web browsing produces quick GET requests to many different sites. Malware traffic tends to look different, and an analyst can often spot the pattern before running a single filter:

* Talking to one address again and again (Statistics → Conversations shows this at a glance)
* Sending data out as well as requesting pages. Watch for POST requests
* An odd or fabricated-looking browser identity (the User-Agent field)
* Data that does not resemble normal text. Malware often scrambles or encodes what it steals


> **Fundamental #2:** Malware traffic follows a pattern that does not match normal use. Learning to see that pattern is most of the skill.

### Getting There: Three Filters

Type these one at a time and watch what changes with each:

| Filter | Shows |
| ----- | ----- |
| `http` | Just web traffic |
| `http.request.method == "POST"` | Just data being sent out |
| `ip.addr == <IP>` | Just one computer's traffic |


> **Fundamental #3:** A filter narrows what you are looking at. Finding the problem is still your job.

### Follow the HTTP Stream

Right-click any packet → Follow → HTTP Stream.

This reassembles the full back-and-forth into something readable. In that view you can see the malware talking: the address it sends to and the data it sends.


### Write Down What You See

* Infected computer's address: _________________________
* Address it is talking to: _________________________
* What looked unusual: _________________________

> **Discussion:** If this traffic pattern is visible to us only after the fact, what would it take to catch it while it is happening?
