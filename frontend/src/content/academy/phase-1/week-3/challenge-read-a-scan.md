<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Scan It by Hand, Then Read the Three Answers</h3>
<p class="ad-brief__ask">Can you tell an open port from a closed one from one a firewall is holding shut?</p>
<p>Hosted lab required, with both machines reachable.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 3 solved</span>
</div>

### Before You Start

Commit to an answer first. Nothing is marked yet. The capture settles each one.

<div class="ad-check ad-check--predict" data-check="w3m-p1">
<p class="ad-check__q">You connect to a port where a service is listening and the firewall allows it. How does the handshake go?</p>
<button type="button" class="ad-check__opt" data-i="0">It completes, SYN then SYN-ACK then ACK</button>
<button type="button" class="ad-check__opt" data-i="1">Nothing comes back</button>
<p class="ad-check__note">Locked in. You will watch an open port answer in the capture.</p>
</div>

<div class="ad-check ad-check--predict" data-check="w3m-p2">
<p class="ad-check__q">You connect to a port the firewall is told to block. What comes back?</p>
<button type="button" class="ad-check__opt" data-i="0">A clear RST, refusing the connection</button>
<button type="button" class="ad-check__opt" data-i="1">Nothing, the firewall drops it in silence</button>
<button type="button" class="ad-check__opt" data-i="2">A SYN-ACK, same as an open port</button>
<p class="ad-check__note">Locked in. The difference between a refusal and silence tells you a firewall is there.</p>
</div>

<div class="ad-check ad-check--predict" data-check="w3m-p3">
<p class="ad-check__q">What makes a scan stand out from normal traffic in a capture?</p>
<button type="button" class="ad-check__opt" data-i="0">One machine touching many ports in a short burst</button>
<button type="button" class="ad-check__opt" data-i="1">A single long file download</button>
<button type="button" class="ad-check__opt" data-i="2">Nothing, a scan looks like ordinary use</button>
<p class="ad-check__note">Locked in. You will see the shape of it in your own capture.</p>
</div>

### Start the Capture

Alex Rivera runs this exact inventory scan against the domain controller every quarter; today you run it yourself. Open Wireshark on the Ubuntu desktop and start capturing on `ens5`, the same way you did in the last lab. In the filter bar, narrow it to the domain controller now so the scan is easy to read.

```
ip.addr == 10.60.1.x
```

Use the domain controller's address from before. Leave Wireshark running.

### Scan the Domain Controller's Ports

An administrator checks which services are up by testing a list of ports. An attacker does the same to find a way in. The command is the same, which is why the pattern matters more than who runs it.

In a terminal, test a mix of ports, some the domain controller runs and some it should not.

```bash
for p in 53 88 389 445 3389 23 8080 9999; do
  timeout 2 bash -c "</dev/tcp/dc01/$p" 2>/dev/null \
    && echo "$p open" \
    || echo "$p no connection"
done
```

Read the list. Some ports connect and some do not. The capture is about to explain why each one answered the way it did.

### Read the Three Answers

Stop the capture in Wireshark. The Info column on each line tells you how a port replied, and a port can answer in three different ways.

* **Open.** The handshake completes. The Info column reads `[SYN]`, then `[SYN, ACK]` back, then `[ACK]`. A service is listening and the firewall allows it. Look at port 445 or 389.
* **Closed.** The domain controller answers the SYN with `[RST, ACK]`, a reset. Nothing is listening, but the machine is reachable and says so plainly.
* **Filtered.** The `[SYN]` goes out and nothing comes back. Wireshark shows the same SYN sent again a second or two later, still with no reply. A firewall is dropping it in silence rather than refusing it.

Find one of each in the Packet List. The gap between a RST and total silence is the whole point. One tells the scanner a port is simply shut, the other tells them a firewall is in the way.

### See the Whole Scan at Once

Wireshark can show the shape rather than the single packets. Open Statistics → Conversations and select the TCP tab. Each row is one connection, with its port and how many packets it carried.

One machine opening a row for port after port of the same target, each only a packet or two, is a scan laid out in a table. A normal session would be a few rows with many packets each. This is many rows with almost none.

That shape, one source spraying SYNs across many ports fast, is a scan. It looks nothing like normal traffic, which settles into a few steady conversations. Seeing it in a real capture is often the first sign that someone is mapping a machine before they move on it.

### Check Yourself

Answer from what you captured, not from what you remember reading.

<div class="ad-mission" data-id="w3m-c1" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1109 · Low</span>
<p><strong>Task:</strong> For an open port like 445 in your capture, how did the handshake end? Name all three packets in order, comma-separated.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for how the handshake ended on an open port" placeholder="first, second, third" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{syn, syn-ack, ack}" data-accept="syn,syn-ack,ack|syn, syn ack, ack">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>This is the exact same three-way handshake you read in the Wireshark lab before this one, just completing this time instead of failing.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="syn-ack|rst">A single packet is not the whole handshake. Name all three packets, in the order they crossed the wire.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>SYN, SYN-ACK, ACK</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A listening service with the firewall open completes the handshake. That completion is how a scanner confirms the port is open.</p>
</div>
</div>
</div>
</div>

### Read a Filtered Port

<div class="ad-mission" data-id="w3m-c2" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1110 · Low</span>
<p><strong>Task:</strong> A port where the firewall drops the traffic looks like what in your capture? Type its letter.<br><strong>A</strong> A completed handshake.<br><strong>B</strong> A single RST.<br><strong>C</strong> A SYN sent again and again with no reply.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what a filtered port looks like in the capture" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{c}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A firewall that drops traffic in silence leaves the sender with nothing to go on, so it keeps trying the same thing.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">A completed handshake is what an open port looks like, not one being blocked by a firewall.</div>
<div class="ad-miss" data-guess="b">A single RST is what a closed port sends, a machine actively refusing the connection. A filtered port gives no reply at all.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>C. A SYN sent again and again with no reply</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A firewall that drops rather than refuses leaves the sender guessing. Repeated SYNs with no answer are the filtered signature, and it tells you a firewall is working.</p>
</div>
</div>
</div>
</div>

### Tell Closed From Filtered

<div class="ad-mission" data-id="w3m-c3" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1111 · Low</span>
<p><strong>Task:</strong> What is the difference between a closed port and a filtered port? Type its letter.<br><strong>A</strong> There is none, both are shut.<br><strong>B</strong> Closed answers with a RST, filtered answers with silence.<br><strong>C</strong> Closed is slower than filtered.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the difference between closed and filtered" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Both keep a scanner out, but one of them tells the scanner so, and the other says nothing at all.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">They look different in a capture: one gets a clear refusal, the other gets no reply at all. That difference is what tells a defender a firewall is in the picture.</div>
<div class="ad-miss" data-guess="c">Speed is not what tells these apart. Whether the machine answers at all is the difference.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. Closed answers with a RST, filtered answers with silence</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A closed port is reachable and refuses with a RST. A filtered port is behind a firewall that drops the packet, so nothing comes back. The scanner learns different things from each.</p>
</div>
</div>
</div>
</div>

### Why It Matters

Three different answers from three different states, all readable from the raw packets alone. The next challenge in this set confirms the same read with the tool the job actually uses.
