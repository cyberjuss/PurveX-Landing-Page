<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Before an attacker breaks in, they knock on every door to see which ones open. Captured from the defender's side, can you tell an open door from a closed one from a door a firewall is holding shut?</p>
</div>

**Situation:** Almost every intrusion starts with reconnaissance. The attacker scans a machine to learn which ports are open before choosing where to push. The scan breaks nothing, which is why it slips past, and reading one in a capture is often the only early warning a team gets.

**Task:** From the Ubuntu server, scan the domain controller's ports with a plain built-in tool, the way an administrator inventories a machine. Capture it in Wireshark and learn the three answers a port can give. Predict each before you run it.

**What you need:** Your hosted lab running, with both machines started and able to reach each other. If the capture lab before this one worked, this one will. You use only tools already on the Ubuntu box, so this is reconnaissance read from the defender's side.

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

Open Wireshark on the Ubuntu desktop and start capturing on `ens5`, the same way you did in the last lab. In the filter bar, narrow it to the domain controller now so the scan is easy to read.

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

### Confirm It With the Tool the Job Actually Uses

You just read a scan by hand, one packet at a time. On the job, almost every posting for this role names the same tool for this exact task: Nmap. It is not doing anything the bash loop did not already do. It is reporting the same three answers, just faster and in its own column.

Install it on the Ubuntu server.

```bash
sudo apt install -y nmap
```

Then scan the same ports with a connect scan, the same handshake you just read packet by packet.

```bash
nmap -sT -p 53,88,389,445,3389,23,8080,9999 dc01
```

Nmap prints one word per port: `open`, `closed`, or `filtered`. Those are the exact three answers you already read from raw packets, just labeled for you instead of worked out by hand.

<div class="ad-mission" data-id="w3m-c5" data-attempts="0">
<p><strong>Task:</strong> Run the Nmap scan above. What does it report for port 445?</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what Nmap reports on port 445" placeholder="open, closed, or filtered" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{open}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>open</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A real scanner lands on the same answer as the raw packets did, because it is reading the same handshake. Knowing the tool matters on the job, but reading the traffic underneath it is what tells you whether the tool is right.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="w3m-c6" data-attempts="0">
<p><strong>Task:</strong> The scan you just ran (<code>-sT</code>) completes the full three-way handshake on every open port, same as your bash loop. A SYN scan (<code>-sS</code>) instead sends SYN, reads SYN-ACK, then sends RST instead of finishing with ACK. Why might an attacker prefer that? Type its letter.<br><strong>A</strong> It is faster, and it never fully opens a connection the target's own application might log.<br><strong>B</strong> It is slower but gives a more accurate result.<br><strong>C</strong> There is no real difference between the two on the wire.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for why an attacker might prefer a SYN scan" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{a}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>A. Faster, and it never fully opens a connection the target's own application might log</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Some application-level logging only records a connection once it is fully established, so a SYN scan can slip past that layer entirely. It cannot slip past the packet capture, though, which is exactly why a defender who reads the wire catches what an application log alone would miss.</p>
</div>
</div>
</div>
</div>

### Check Yourself

Answer from what you captured, not from what you remember reading.

<div class="ad-mission" data-id="w3m-c1" data-attempts="0">
<p><strong>Task:</strong> For an open port like 445 in your capture, how did the handshake end? Name all three packets in order, comma-separated.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for how the handshake ended on an open port" placeholder="first, second, third" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{syn, syn-ack, ack}" data-accept="syn,syn-ack,ack|syn, syn ack, ack">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
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

<div class="ad-mission" data-id="w3m-c2" data-attempts="0">
<p><strong>Task:</strong> A port where the firewall drops the traffic looks like what in your capture? Type its letter.<br><strong>A</strong> A completed handshake.<br><strong>B</strong> A single RST.<br><strong>C</strong> A SYN sent again and again with no reply.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what a filtered port looks like in the capture" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{c}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
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

<div class="ad-mission" data-id="w3m-c3" data-attempts="0">
<p><strong>Task:</strong> What is the difference between a closed port and a filtered port? Type its letter.<br><strong>A</strong> There is none, both are shut.<br><strong>B</strong> Closed answers with a RST, filtered answers with silence.<br><strong>C</strong> Closed is slower than filtered.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the difference between closed and filtered" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
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

<div class="ad-mission ad-mission--capstone" data-id="w3m-c4" data-attempts="0">
<p><strong>Task:</strong> The scan used a plain bash loop, not a hacking tool. What does that mean for detection? Type its letter.<br><strong>A</strong> Scans cannot be detected.<br><strong>B</strong> You detect the pattern in the traffic, not a banned tool.<br><strong>C</strong> Only special attacker tools leave a trace.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what detection actually relies on" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. You detect the pattern in the traffic, not a banned tool</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The same loop inventories a server or maps it for attack. You cannot ban the tool, so detection rests on the behavior, the burst of SYNs to many ports. The next lab turns that exact behavior into a rule an IDS checks for automatically, instead of a pattern only a human reading a capture would ever notice.</p>
</div>
</div>
</div>
</div>

### Take It Further

A week later the security team pulls a capture from the file server. One workstation sent SYN packets to forty ports in under ten seconds. Two ports completed a handshake, a handful answered with RST, and the rest got no reply.

Say what that workstation was doing, and explain what the team learns from the two that answered versus the many that stayed silent.

### Why It Matters

Reconnaissance is the quietest stage of an attack and the best chance to stop it, because nothing is broken yet. A team that can read a scan, and can tell a closed port from one a firewall is guarding, catches the knock before the break-in and knows how well its own doors are holding.
