<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Scan It by Hand, Then Read the Three Answers</h3>
<p class="ad-brief__ask">Can you tell an open port, a closed port, and a port that a firewall is holding shut apart from one another?</p>
<p>Hosted lab required, with both machines reachable.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 3 solved</span>
</div>

### Before You Start

Make a prediction for each of these first. Nothing gets marked here, and the capture will show you whether you were right.

<div class="ad-check ad-check--predict" data-check="w3m-p1">
<p class="ad-check__q">You connect to a port where a service is listening and the firewall allows it. How does the handshake go?</p>
<button type="button" class="ad-check__opt" data-i="0">It completes, SYN then SYN-ACK then ACK</button>
<button type="button" class="ad-check__opt" data-i="1">Nothing comes back</button>
<p class="ad-check__note">Got it. You'll watch an open port answer in the capture.</p>
</div>

<div class="ad-check ad-check--predict" data-check="w3m-p2">
<p class="ad-check__q">You connect to a port the firewall is told to block. What comes back?</p>
<button type="button" class="ad-check__opt" data-i="0">A clear RST, refusing the connection</button>
<button type="button" class="ad-check__opt" data-i="1">Nothing, the firewall drops it in silence</button>
<button type="button" class="ad-check__opt" data-i="2">A SYN-ACK, same as an open port</button>
<p class="ad-check__note">Got it. Watch for the difference between a refusal and silence, because that's what tells you a firewall is there.</p>
</div>

<div class="ad-check ad-check--predict" data-check="w3m-p3">
<p class="ad-check__q">What makes a scan stand out from normal traffic in a capture?</p>
<button type="button" class="ad-check__opt" data-i="0">One machine touching many ports in a short burst</button>
<button type="button" class="ad-check__opt" data-i="1">A single long file download</button>
<button type="button" class="ad-check__opt" data-i="2">Nothing, a scan looks like ordinary use</button>
<p class="ad-check__note">Got it. You'll see the shape of it in your own capture.</p>
</div>

### Start the Capture

Every quarter, Alex Rivera runs this exact inventory scan against the domain controller, and today you'll run it yourself. Open Wireshark on the Ubuntu desktop and start capturing on `ens5`, just as you did in the last lab. Then, so the scan is easy to read, narrow the filter bar to the domain controller straight away.

```
ip.addr == 10.60.1.x
```

Use the domain controller's address from before, and leave Wireshark running.

### Scan the Domain Controller's Ports

An administrator checks which services are up by testing a list of ports, and an attacker does exactly the same thing to find a way in. Because the command is identical either way, the pattern of the traffic tells you more than who happens to be running it.

In a terminal, test a mix of ports: some that the domain controller runs, and some that it shouldn't.

```bash
for p in 53 88 389 445 3389 23 8080 9999; do
  timeout 2 bash -c "</dev/tcp/dc01/$p" 2>/dev/null \
    && echo "$p open" \
    || echo "$p no connection"
done
```

Read through the list, and you'll see that some ports connect while others don't. The capture is about to explain why each one answered the way it did.

### Read the Three Answers

Now stop the capture in Wireshark. The Info column on each line tells you how a port replied, and a port can answer in three different ways.

* **Open.** The handshake completes. The Info column reads `[SYN]`, then `[SYN, ACK]` back, then `[ACK]`. A service is listening and the firewall allows it. Look at port 445 or 389.
* **Closed.** The domain controller answers the SYN with `[RST, ACK]`, a reset. Nothing is listening, but the machine is reachable and says so plainly.
* **Filtered.** The `[SYN]` goes out and nothing comes back. Wireshark shows the same SYN sent again a second or two later, still with no reply. A firewall is dropping it in silence rather than refusing it.

See if you can find one of each in the Packet List. The difference between an RST and total silence is the whole point here, because an RST tells the scanner a port is simply shut, while silence tells them a firewall is in the way.

### See the Whole Scan at Once

Individual packets only tell part of the story, so let's step back and look at the shape of the whole scan. Open Statistics → Conversations and select the TCP tab. Each row there is one connection, showing its port and how many packets it carried.

What you're looking at is a scan laid out as a table: one machine opening a row for port after port on the same target, each with only a packet or two. A normal session looks the other way round, with a few rows that each carry many packets.

That shape, one source spraying SYNs across many ports quickly, is the signature of a scan. It looks nothing like normal traffic, which settles into a few steady conversations. So when you spot it in a real capture, it's often the first sign that someone is mapping a machine before they make a move on it.

### Check Yourself

Answer based on what you actually captured, rather than on what you remember reading.

<div class="ad-mission" data-id="w3m-c1" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1109 · Low</span>
<p><strong>Task:</strong> For an open port like 445 in your capture, how did the handshake end? Name all three packets in order, comma-separated.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for how the handshake ended on an open port" placeholder="first, second, third" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{syn, syn-ack, ack}" data-accept="syn,syn-ack,ack|syn, syn ack, ack">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>It's the same three-way handshake you read in the earlier Wireshark challenge, so name its three packets in order.</p>
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
<p>When a service is listening and the firewall allows it, the handshake completes, and that completion is exactly how a scanner confirms the port is open.</p>
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
<p>Think about the sender's point of view. A firewall that drops traffic in silence leaves the sender with nothing to go on, so what does it do next?</p>
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
<p>A firewall that drops traffic, rather than refusing it, leaves the sender guessing, so it keeps resending. Those repeated SYNs with no answer are the signature of a filtered port, and they tell you a firewall is doing its job.</p>
</div>
</div>
</div>
</div>

### Tell Closed From Filtered

<div class="ad-mission" data-id="w3m-c3" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1111 · Low</span>
<p><strong>Task:</strong> What is the difference between a closed port and a filtered port? Type its letter.<br><strong>A</strong> There is none, both are shut.<br><strong>B</strong> Closed answers with an RST, filtered answers with silence.<br><strong>C</strong> Closed is slower than filtered.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the difference between closed and filtered" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Both of them keep a scanner out, but one tells the scanner so, while the other says nothing at all.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">Look again at your capture, because they don't look the same: one gets a clear refusal and the other gets no reply at all. That difference is what tells a defender a firewall is in the picture.</div>
<div class="ad-miss" data-guess="c">Speed is not what tells these apart. Whether the machine answers at all is the difference.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. Closed answers with an RST, filtered answers with silence</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A closed port is reachable and refuses the connection with an RST. A filtered port, by contrast, sits behind a firewall that drops the packet, so nothing comes back at all. That's why a scanner learns different things from each one.</p>
</div>
</div>
</div>
</div>

### Why It Matters

You've now read three different answers from three different port states, using nothing but the raw packets. In the next challenge, you'll confirm the same reading with Nmap, the tool you'd actually use on the job.
