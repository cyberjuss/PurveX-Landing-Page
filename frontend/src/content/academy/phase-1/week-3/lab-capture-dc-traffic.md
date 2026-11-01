<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>From one machine, can you capture and read a conversation it is having with another? And what can that machine's capture never show you?</p>
</div>

**Situation:** Analysts rarely sit on the server they are investigating. They watch from a separate machine and read the traffic as it crosses the wire. Learning to capture from one box the conversation it holds with another is the everyday shape of the work.

**Task:** On the Ubuntu server, open Wireshark, make the machine talk to the domain controller, and capture the exchange. Find the handshake, the ports and the protocols from the domain controller's own replies. Predict what you will see, and what the capture cannot contain, before you start.

**What you need:** Your hosted lab running, with both machines started. Wireshark is already installed on the Ubuntu desktop. The two machines must be able to reach each other, so if a later step cannot connect, see Troubleshooting at the end.

### Before You Start

Commit to an answer before you capture anything. Nothing is marked yet. The capture settles each one.

<div class="ad-check ad-check--predict" data-check="w3e-p1">
<p class="ad-check__q">Wireshark on the Ubuntu box captures its network card. Which traffic can it see?</p>
<button type="button" class="ad-check__opt" data-i="0">Every machine's traffic on the whole network</button>
<button type="button" class="ad-check__opt" data-i="1">Only traffic this machine is part of</button>
<p class="ad-check__note">Locked in. You will test this by capturing a conversation you start yourself.</p>
</div>

<div class="ad-check ad-check--predict" data-check="w3e-p2">
<p class="ad-check__q">You run a command on Ubuntu that queries the domain controller. What are the first three packets of that TCP connection?</p>
<button type="button" class="ad-check__opt" data-i="0">SYN, then SYN-ACK back, then ACK</button>
<button type="button" class="ad-check__opt" data-i="1">The query goes straight across, no setup</button>
<button type="button" class="ad-check__opt" data-i="2">A single CONNECT packet</button>
<p class="ad-check__note">Locked in. You will find this exact pattern filtered to the domain controller.</p>
</div>

<div class="ad-check ad-check--predict" data-check="w3e-p3">
<p class="ad-check__q">You send an LDAP query to the domain controller. Which port will the connection use?</p>
<button type="button" class="ad-check__opt" data-i="0">80</button>
<button type="button" class="ad-check__opt" data-i="1">389</button>
<button type="button" class="ad-check__opt" data-i="2">443</button>
<p class="ad-check__note">Locked in. The port numbers from this week are about to appear in a real capture.</p>
</div>

### Find the Domain Controller

Open a terminal on the Ubuntu desktop. The domain controller is already known to this machine by name, so look up its address.

```bash
getent hosts dc01
```

Write down the address it prints. Every packet in this lab goes to or from it.

### Start Wireshark on the Right Interface

Open Wireshark from the desktop. Applications → Internet → Wireshark. It lists the network interfaces it can capture on.

Choose the interface named `ens5`, the Ubuntu server's network card. Double-click it to start capturing. Packets begin scrolling immediately.

### Make the Two Machines Talk

Leave Wireshark running. In the terminal, send the domain controller two kinds of request. The first asks it to resolve a name, the second asks its directory for its naming contexts.

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

The pair is deliberate. One is a single exchange over UDP and the other is a conversation over TCP, both to the same host, and neither of them is encrypted.

### Filter to the Domain Controller

Wireshark is now full of unrelated packets. In the filter bar at the top, type the filter below, using the address you wrote down, and press Enter.

```
ip.addr == 10.60.1.x
```

Only the traffic to and from the domain controller remains. This is the conversation you just created, and nothing else.

### Read the Three Panes

Wireshark shows every capture in three stacked panes, and learning to move between them is most of the skill.

* **Packet List, at the top.** One line per packet. The Protocol column names what it is, and the Info column summarizes it. This is your timeline.
* **Packet Details, in the middle.** The selected packet opened up layer by layer, from Ethernet at the top down to the application at the bottom.
* **Packet Bytes, at the bottom.** The raw data, for when the parsed view is not enough.

Click a packet in the top pane and watch the middle pane fill with its layers. You will repeat that click for most of your time in Wireshark.

### Find the Handshake and the Ports

Read down the Protocol and Info columns. You will see several things from this week.

* A TCP handshake opening the LDAP connection. The Info column labels the packets `[SYN]`, then `[SYN, ACK]` coming back from the domain controller, then `[ACK]`.
* The LDAP query itself on port 389, after the handshake finishes.
* The DNS request and reply on port 53, which is UDP and needs no handshake at all.

DNS did its whole job in two packets while LDAP set up a connection first. That is the difference between UDP and TCP, seen once rather than described.

### Follow the Whole Conversation

Right-click any LDAP packet and choose Follow → TCP Stream. Wireshark pulls every packet of that one connection out of the noise and lays the exchange out in order, both directions, in a single window.

This is the move an analyst reaches for first when one conversation matters. Close the stream window and the filter it set stays in the bar, showing only that connection.

### Check Yourself

Answer from what you captured, not from what you remember reading.

<div class="ad-mission" data-id="w3e-c1" data-attempts="0">
<p><strong>Task:</strong> Could this Ubuntu capture show you a conversation between the domain controller and a third machine it never involved? Type yes or no.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for whether the capture could show a third machine's traffic" placeholder="yes or no" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{no}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>No</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A machine captures its own card. On a switched network it sees only what it sends or receives, which is why analysts need a capture from the right place.</p>
</div>
</div>
</div>
</div>

### Read the LDAP Handshake

<div class="ad-mission" data-id="w3e-c2" data-attempts="0">
<p><strong>Task:</strong> For the LDAP connection in your capture, which packet came back from the domain controller to open the handshake? Type it exactly as Wireshark's Info column shows it.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the handshake packet from the domain controller" placeholder="packet type" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{syn-ack}" data-accept="syn ack|syn,ack">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>SYN-ACK</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The Ubuntu box sent SYN, the domain controller answered SYN-ACK, the Ubuntu box sent ACK. Only then did the LDAP query move.</p>
</div>
</div>
</div>
</div>

### Count the DNS Exchange

<div class="ad-mission" data-id="w3e-c3" data-attempts="0">
<p><strong>Task:</strong> In your capture, how many packets did the DNS request and reply need? Type the number.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the number of DNS packets" placeholder="a number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{2}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>2</code></p>
</div>
<div>
<span>Why it matters</span>
<p>DNS runs over UDP, which has no handshake. One question, one answer, done. LDAP runs over TCP, so it sets up a connection first.</p>
</div>
</div>
</div>
</div>

### Read What Stays the Same

Look at the LDAP conversation's TCP handshake again. The source port, the one on the Ubuntu box, is a high, random-looking number. The destination port, the one on the domain controller, is 389 every single time.

<div class="ad-mission" data-id="w3e-c5" data-attempts="0">
<p><strong>Task:</strong> If you captured this same LDAP query again a minute later, which port would you expect to change, and which would stay fixed? Type its letter.<br><strong>A</strong> Both ports stay exactly the same on every connection.<br><strong>B</strong> The source port changes each time, a fresh one picked for the new connection. The destination port stays 389, the LDAP service's own fixed address.<br><strong>C</strong> The destination port changes each time, and the source port stays fixed.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for which port changes and which stays fixed" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. Source changes, destination stays fixed</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A client picks a fresh, random source port for every new connection so replies can find their way back to the right one. A server listens on the same fixed port every time, because that is the address its service is known by. That difference is why filtering a capture by destination port finds every LDAP query a machine ever made, while filtering by source port finds only one single connection.</p>
</div>
</div>
</div>
</div>

### Isolate One Conversation

<div class="ad-mission ad-mission--capstone" data-id="w3e-c4" data-attempts="0">
<p><strong>Task:</strong> You want to read one connection's whole exchange without the surrounding noise. Which Wireshark move does that? Type its letter.<br><strong>A</strong> Opening the Bytes pane.<br><strong>B</strong> Right-click a packet, Follow, TCP Stream.<br><strong>C</strong> Scrolling the Packet List faster.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the Wireshark move that reads a full conversation" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. Right-click a packet, Follow, TCP Stream</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Follow TCP Stream reassembles a single conversation into one readable window and sets a filter to just that connection. It is the first move when one exchange matters.</p>
</div>
</div>
</div>
</div>

### Troubleshooting

If `dig` or `ldapsearch` hangs or cannot reach the domain controller, the two machines cannot talk to each other yet. Test it first.

```bash
ping -c 2 dc01
```

No reply means the pod's own firewall is blocking traffic between the two machines, and the labs that use both will not work until that is fixed. A reply means the path is open and the capture steps will work.

### Take It Further

You capture from the Ubuntu box and see its conversation with the domain controller clearly. Your manager asks you to also capture what the domain controller says to a third server during a backup job.

Say why the Ubuntu capture cannot show that, and name where you would have to capture instead to see it.

### Why It Matters

Knowing where to capture is as important as knowing how to read the result. A capture taken in the wrong place is empty of the very traffic you were sent to find, and plenty of investigations stall on exactly that. The habit of capturing a conversation you understand, from a machine that is part of it, is where the skill starts.
