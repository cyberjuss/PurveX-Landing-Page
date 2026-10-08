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

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-3/PLACEHOLDER-scan-results.png" alt="Terminal on the Ubuntu server showing each tested port of the domain controller marked open or no connection" />
<figcaption>Screenshot 1. [ADD IMAGE] Eight ports of the domain controller, tested from Ubuntu.</figcaption>
</figure>
</div>

### Read the Three Answers

Stop the capture in Wireshark. Now look at how each port replied, because a port can answer in three different ways and each one means something.

* **Open.** The handshake completes. SYN out, SYN-ACK back, ACK. A service is listening and the firewall allows it. Look at port 445 or 389.
* **Closed.** The domain controller answers the SYN with a RST, a reset. Nothing is listening, but the machine is reachable and says so plainly.
* **Filtered.** The SYN goes out and nothing comes back at all. Your machine sends it again, and still nothing. A firewall is dropping it in silence rather than refusing it.

Find one of each in the capture. The gap between a RST and total silence is the whole point. One tells the scanner a port is simply shut, the other tells them a firewall is in the way.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-3/PLACEHOLDER-scan-capture.png" alt="Wireshark showing an open port completing the handshake, a closed port answered with RST, and a filtered port with repeated SYNs and no reply" />
<figcaption>Screenshot 2. [ADD IMAGE] Open, closed and filtered, side by side.</figcaption>
</figure>
</div>

### The Signature of a Scan

Step back from the single ports and look at the whole capture. One machine, the Ubuntu box, sent a SYN to eight different ports of the domain controller in a couple of seconds. Most got no useful reply.

That shape, one source spraying SYNs across many ports fast, is a scan. It looks nothing like normal traffic, which settles into a few steady conversations. Seeing it in a real capture is often the first sign that someone is mapping a machine before they move on it.

### Check Yourself

Answer from what you captured, not from what you remember reading.

<div class="ad-check" data-check="w3m-c1" data-answer="0">
<p class="ad-check__q">For an open port like 445, how did the handshake end?</p>
<button type="button" class="ad-check__opt" data-i="0">It completed, SYN then SYN-ACK then ACK</button>
<button type="button" class="ad-check__opt" data-i="1">The domain controller sent a RST</button>
<button type="button" class="ad-check__opt" data-i="2">Nothing came back</button>
<p class="ad-check__note">A listening service with the firewall open completes the handshake. That completion is how a scanner confirms the port is open.</p>
</div>

<div class="ad-check" data-check="w3m-c2" data-answer="2">
<p class="ad-check__q">A port where the firewall drops the traffic looks like what in the capture?</p>
<button type="button" class="ad-check__opt" data-i="0">A completed handshake</button>
<button type="button" class="ad-check__opt" data-i="1">A single RST</button>
<button type="button" class="ad-check__opt" data-i="2">A SYN sent again and again with no reply</button>
<p class="ad-check__note">A firewall that drops rather than refuses leaves the sender guessing. Repeated SYNs with no answer is the filtered signature, and it tells you a firewall is working.</p>
</div>

<div class="ad-check" data-check="w3m-c3" data-answer="1">
<p class="ad-check__q">What is the difference between a closed port and a filtered port?</p>
<button type="button" class="ad-check__opt" data-i="0">There is none, both are shut</button>
<button type="button" class="ad-check__opt" data-i="1">Closed answers with a RST, filtered answers with silence</button>
<button type="button" class="ad-check__opt" data-i="2">Closed is slower than filtered</button>
<p class="ad-check__note">A closed port is reachable and refuses with a RST. A filtered port is behind a firewall that drops the packet, so nothing comes back. The scanner learns different things from each.</p>
</div>

<div class="ad-check" data-check="w3m-c4" data-answer="1">
<p class="ad-check__q">The scan used a plain bash loop, not a hacking tool. What does that mean for detection?</p>
<button type="button" class="ad-check__opt" data-i="0">Scans cannot be detected</button>
<button type="button" class="ad-check__opt" data-i="1">You detect the pattern in the traffic, not a banned tool</button>
<button type="button" class="ad-check__opt" data-i="2">Only special attacker tools leave a trace</button>
<p class="ad-check__note">The same loop inventories a server or maps it for attack. You cannot ban the tool, so detection rests on the behaviour, the burst of SYNs to many ports.</p>
</div>

### Take It Further

A week later the security team pulls a capture from the file server. One workstation sent SYN packets to forty ports in under ten seconds. Two ports completed a handshake, a handful answered with RST, and the rest got no reply.

Say what that workstation was doing, and explain what the team learns from the two that answered versus the many that stayed silent.

### Why It Matters

Reconnaissance is the quietest stage of an attack and the best chance to stop it, because nothing is broken yet. A team that can read a scan, and can tell a closed port from one a firewall is guarding, catches the knock before the break-in and knows how well its own doors are holding.
