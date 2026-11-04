<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Capture a Real Conversation and Read It</h3>
<p class="ad-brief__ask">Can you capture a conversation between two machines and read what actually happened on the wire?</p>
<p>Hosted lab required, with both machines started. Wireshark is installed.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 3 solved</span>
</div>

### Before You Start

Make a prediction for each of these before you capture anything. Nothing gets marked here, and the capture will show you whether you were right.

<div class="ad-check ad-check--predict" data-check="w3e-p1">
<p class="ad-check__q">Wireshark on the Ubuntu box captures its network card. Which traffic can it see?</p>
<button type="button" class="ad-check__opt" data-i="0">Every machine's traffic on the whole network</button>
<button type="button" class="ad-check__opt" data-i="1">Only traffic this machine is part of</button>
<p class="ad-check__note">Got it. You'll test this by capturing a conversation you start yourself.</p>
</div>

<div class="ad-check ad-check--predict" data-check="w3e-p2">
<p class="ad-check__q">You run a command on Ubuntu that queries the domain controller. What are the first three packets of that TCP connection?</p>
<button type="button" class="ad-check__opt" data-i="0">SYN, then SYN-ACK back, then ACK</button>
<button type="button" class="ad-check__opt" data-i="1">The query goes straight across, no setup</button>
<button type="button" class="ad-check__opt" data-i="2">A single CONNECT packet</button>
<p class="ad-check__note">Got it. You'll find this exact pattern filtered to the domain controller.</p>
</div>

<div class="ad-check ad-check--predict" data-check="w3e-p3">
<p class="ad-check__q">You send an LDAP query to the domain controller. Which port will the connection use?</p>
<button type="button" class="ad-check__opt" data-i="0">80</button>
<button type="button" class="ad-check__opt" data-i="1">389</button>
<button type="button" class="ad-check__opt" data-i="2">443</button>
<p class="ad-check__note">Got it. The port numbers you learned this week are about to show up in a real capture.</p>
</div>

### Find the Domain Controller

Alex Rivera wants confirmation that the domain controller's core services are reachable, read from a real capture rather than taken on faith. To start, open a terminal on the Ubuntu desktop. This machine already knows the domain controller by name, so you can look up its address directly.

```bash
getent hosts dc01
```

Write down the address it prints, because every packet in this lab will go to or from it.

### Start Wireshark on the Right Interface

Next, open Wireshark from the desktop by going to Applications → Internet → Wireshark. When it opens, it lists the network interfaces it can capture on.

Choose the interface named `ens5`, which is the Ubuntu server's network card, and double-click it to start capturing. You'll see packets start scrolling right away.

### Make the Two Machines Talk

With Wireshark still running, go back to the terminal and send the domain controller two kinds of request. The first asks it to resolve a name, and the second asks its directory for its naming contexts.

```bash
dig @dc01 purvexfinancial.local
ldapsearch -x -H ldap://dc01 -s base -b "" namingContexts
```

<p class="ad-flags__lead">What the first command asks for</p>
<ul class="ad-flags" role="list">
<li><code>dig</code><span>A DNS client. It puts a name question to a server and prints what comes back.</span></li>
<li><code>@dc01</code><span>Ask that server directly, rather than whatever resolver Ubuntu would normally use.</span></li>
<li><code>purvexfinancial.local</code><span>The name being asked about. No record type is given, so dig asks for an address record.</span></li>
<li><em>On the wire</em><span>One question and one answer over UDP port 53. The answer is the address you wrote down earlier.</span></li>
</ul>

<p class="ad-flags__lead">What the second command asks for</p>
<ul class="ad-flags" role="list">
<li><code>ldapsearch</code><span>A directory client. It queries a directory the way an application would.</span></li>
<li><code>-H ldap://dc01</code><span>The directory service on dc01, plain LDAP on port 389.</span></li>
<li><code>-x</code><span>Simple authentication. No account is named, so the connection is anonymous.</span></li>
<li><code>-s base -b ""</code><span>One entry rather than a tree. The empty name is the rootDSE, the record a directory publishes about itself.</span></li>
<li><code>namingContexts</code><span>The attribute asked for. It comes back as the directory trees this server holds.</span></li>
<li><em>On the wire</em><span>A TCP connection, so a handshake opens it before any directory traffic.</span></li>
</ul>

These two were chosen on purpose. One is a single exchange over UDP and the other is a full conversation over TCP, both with the same host, and neither one is encrypted, so you'll be able to see everything.

### Filter to the Domain Controller

By now, Wireshark is full of unrelated packets, so let's narrow it down. In the filter bar at the top, type the filter below using the address you wrote down, and press Enter.

```
ip.addr == 10.60.1.x
```

Now only the traffic to and from the domain controller remains, which means you're looking at exactly the conversation you just created and nothing else.

### Read the Three Panes

Before reading the packets, it helps to know the layout. Wireshark shows every capture in three stacked panes, and learning to move between them is most of the skill.

* **Packet List, at the top.** One line per packet. The Protocol column names what it is, and the Info column summarizes it. This is your timeline.
* **Packet Details, in the middle.** The selected packet opened up layer by layer, from Ethernet at the top down to the application at the bottom.
* **Packet Bytes, at the bottom.** The raw data, for when the parsed view is not enough.

Try clicking a packet in the top pane, and watch the middle pane fill with its layers. That one click is something you'll repeat constantly in Wireshark.

### Find the Handshake and the Ports

Now read down the Protocol and Info columns. You should recognize several things from this week's lessons.

* A TCP handshake opening the LDAP connection. The Info column labels the packets `[SYN]`, then `[SYN, ACK]` coming back from the domain controller, then `[ACK]`.
* The LDAP query itself on port 389, after the handshake finishes.
* The DNS request and reply on port 53, which is UDP and needs no handshake at all.

Notice that DNS did its whole job in two packets, while LDAP set up a connection first. That's the difference between UDP and TCP, and now you've seen it for yourself rather than just read about it.

### Follow the Whole Conversation

When one conversation matters, there's a quicker way to read it. Right-click any LDAP packet and choose Follow → TCP Stream. Wireshark pulls every packet of that one connection out of the noise and lays out the whole exchange in order, in both directions, in a single window.

That's usually the first move an analyst makes when a single conversation matters. When you close the stream window, the filter it set stays in the bar, so you'll still see only that connection.

### Troubleshooting

If `dig` or `ldapsearch` hangs or can't reach the domain controller, the two machines can't talk to each other yet. In that case, test the connection first.

```bash
ping -c 2 dc01
```

If you get no reply, your lab's own firewall is blocking traffic between the two machines, and the labs that use both won't work until that's fixed. If you do get a reply, the path is open and the capture steps will work.

### Check Yourself

Answer based on what you actually captured, rather than on what you remember reading.

<div class="ad-mission" data-id="w3e-c1" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1102 · Low</span>
<p><strong>Task:</strong> Could this Ubuntu capture show you a conversation between the domain controller and a third machine it never involved? Type yes or no.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for whether the capture could show a third machine's traffic" placeholder="yes or no" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{no}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>You started the capture on the Ubuntu box's own network card, `ens5`. So think about whose traffic a network card actually sees on a switched network.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="yes">A network card on a switched network sees only what it sends or receives, not traffic between two other machines entirely.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>No</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A machine can only capture what passes through its own network card. On a switched network, that means it sees only what it sends or receives, which is why analysts need to capture from the right place.</p>
</div>
</div>
</div>
</div>

### Read the LDAP Handshake

<div class="ad-mission" data-id="w3e-c2" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1103 · Low</span>
<p><strong>Task:</strong> For the LDAP connection in your capture, which packet came back from the domain controller to open the handshake? Type it exactly as Wireshark's Info column shows it.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the handshake packet from the domain controller" placeholder="packet type" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{syn-ack}" data-accept="syn ack|syn,ack">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The three-way handshake goes SYN, then a reply, then ACK. Your Ubuntu box sent the first and third packets, so the domain controller sent the one in between.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="syn">That packet opened the handshake, but it came from your Ubuntu box, not back from the domain controller.</div>
<div class="ad-miss" data-guess="ack">The final ACK in the handshake came from your Ubuntu box too, closing the three-way exchange. The domain controller's own packet sits between the two.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>SYN-ACK</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The Ubuntu box sent SYN, the domain controller answered with SYN-ACK, and then the Ubuntu box sent ACK. Only after that did the LDAP query itself move.</p>
</div>
</div>
</div>
</div>

### Count the DNS Exchange

<div class="ad-mission" data-id="w3e-c3" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1104 · Low</span>
<p><strong>Task:</strong> In your capture, how many packets did the DNS request and reply need? Type the number.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the number of DNS packets" placeholder="a number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{2}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>DNS runs over UDP, which has no handshake to set up first, so you only need to count the question and the answer.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="3">That is the LDAP handshake's packet count, not DNS. DNS over UDP needs no handshake at all.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>2</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Because DNS runs over UDP, there's no handshake: just one question and one answer, and it's done. LDAP runs over TCP instead, so it has to set up a connection first.</p>
</div>
</div>
</div>
</div>

### Why It Matters

Knowing where to capture matters just as much as knowing how to read the result, because a capture taken in the wrong place won't contain the very traffic you were sent to find. In the next challenge, you'll read two more things that this same capture is already holding.
