## **Wireshark Basics: Spotting Malware Traffic**

### **Essential Question**

What does normal network traffic look like, and how do you use Wireshark to find the traffic that isn't?

### **Overview**

This lab is hands-on: opening a capture in Wireshark, learning the three panes, recognizing what makes traffic look suspicious before you even apply a filter, and using three basic filters plus "Follow → HTTP Stream" to reassemble a full conversation.

**\[SCREENSHOT: Wireshark start screen — interface list (optional, for first-time users)\]**

### **What Wireshark Actually Shows You**

Every time a computer talks to another computer, it sends small chunks of data called packets. Wireshark records and displays those packets so you can see exactly what was sent, to where, and when.

Think of it like reading someone's mail log — you can't see inside a sealed envelope, but you can see who wrote to whom, how often, and sometimes read the letter itself if it wasn't sealed (encrypted).

### **The 3 Panes (What You're Looking At)**

* Top — Packet List: one line per packet. This is your timeline.  
* Middle — Packet Details: click a packet, see what's inside it, layer by layer.  
* Bottom — Bytes: the raw data, for when you need to go deeper.

**\[SCREENSHOT: Full Wireshark window — label the 3 panes (top / middle / bottom)\]**

> **Fundamental \#1:** Click through a few packets in the top pane and just watch the middle pane change. That's the whole interaction loop.

### **What "Suspicious" Looks Like (Before You Even Filter)**

Normal web browsing is quick GET requests to lots of different sites. Malware traffic often looks different:

* Talking to one address a lot (Statistics → Conversations shows this immediately)  
* Sending data OUT, not just asking for pages in — look for POST requests  
* Odd or fake-looking browser identity (the User-Agent field)  
* Data that doesn't look like normal text — malware often scrambles/encodes what it steals

**\[SCREENSHOT: Statistics → Conversations, sorted by bytes — highlight the heaviest conversation\]**

> **Fundamental \#2:** Malware traffic is not invisible. It's traffic with a pattern that doesn't match normal use.

### **Getting There (Just 3 Filters)**

Type these one at a time — try each, look at what changes:

| Filter | Shows |
| ----- | ----- |
| `http` | Just web traffic |
| `http.request.method == "POST"` | Just data being sent out |
| `ip.addr == <IP>` | Just one computer's traffic |

**\[SCREENSHOT: Filter bar with http.request.method \== "POST" typed in, filtered list below\]**

> **Fundamental \#3:** Filters don't find anything for you — they narrow what you're looking at so you can find it.

### **The One Move That Matters Most**

Right-click any packet → Follow → HTTP Stream

This reassembles the full back-and-forth into something readable. This is where students will actually see the malware talking — the address it's sending to, and what it's sending.

**\[SCREENSHOT: Follow HTTP Stream window — User-Agent header and POST body visible (crop/blur payload bytes as needed)\]**

### **Write Down What You See**

* Infected computer's address: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  
* Address it's talking to: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  
* What looked unusual: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

> **Discussion:** If this traffic pattern is visible to us after the fact, what would it take to catch it while it's happening?

