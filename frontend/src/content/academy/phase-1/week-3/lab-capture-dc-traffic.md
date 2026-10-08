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

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-3/PLACEHOLDER-getent-dc.png" alt="Terminal on the Ubuntu server showing the domain controller's name resolved to an IP address" />
<figcaption>Screenshot 1. [ADD IMAGE] The domain controller's address, from the Ubuntu box.</figcaption>
</figure>
</div>

### Start Wireshark on the Right Interface

Open Wireshark from the desktop. Applications → Internet → Wireshark. It lists the network interfaces it can capture on.

Choose the interface named `ens5`, the Ubuntu server's network card. Double-click it to start capturing. Packets begin scrolling immediately.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-3/PLACEHOLDER-wireshark-interface.png" alt="Wireshark welcome screen with the ens5 interface selected" />
<figcaption>Screenshot 2. [ADD IMAGE] Capturing on ens5, the Ubuntu card.</figcaption>
</figure>
</div>

### Make the Two Machines Talk

Leave Wireshark running. In the terminal, send the domain controller two kinds of request. The first asks it to resolve a name, the second asks its directory for its naming contexts.

```bash
dig @dc01 purvexfinancial.local
ldapsearch -x -H ldap://dc01 -s base -b "" namingContexts
```

Each command produces a short conversation with the domain controller, and Wireshark records both as they happen.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-3/PLACEHOLDER-dc-queries.png" alt="Terminal showing a dig query and an ldapsearch query to the domain controller returning results" />
<figcaption>Screenshot 3. [ADD IMAGE] Two requests to the domain controller.</figcaption>
</figure>
</div>

### Filter to the Domain Controller

Wireshark is now full of unrelated packets. In the filter bar at the top, type the filter below, using the address you wrote down, and press Enter.

```
ip.addr == 10.60.1.x
```

Only the traffic to and from the domain controller remains. This is the conversation you just created, and nothing else.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-3/PLACEHOLDER-wireshark-filtered.png" alt="Wireshark filtered to the domain controller's address showing DNS and LDAP packets" />
<figcaption>Screenshot 4. [ADD IMAGE] Only the domain controller's traffic.</figcaption>
</figure>
</div>

### Find the Handshake and the Ports

Look at the Protocol column and the Info column. You will see several things from this week.

* A TCP handshake opening the LDAP connection. Find the packet marked SYN, the SYN-ACK coming back from the domain controller, and the ACK.
* The LDAP query itself on port 389, after the handshake.
* The DNS request and reply on port 53, which is UDP and needs no handshake at all.

Notice that DNS did its whole job in two packets while LDAP set up a connection first. That is the difference between UDP and TCP, seen once rather than described.

### The Command-Line View

Wireshark has a terminal twin called tshark, which prints the same capture as text. It is what you reach for on a server with no desktop, and the answer is a line you can read rather than a screen to scan.

```bash
sudo tshark -i ens5 -f "host dc01" -c 20
```

Run that, then repeat the two queries from another terminal. tshark prints twenty packets of the same conversation.

### Check Yourself

Answer from what you captured, not from what you remember reading.

<div class="ad-check" data-check="w3e-c1" data-answer="1">
<p class="ad-check__q">Could this Ubuntu capture show you a conversation between the domain controller and a third machine it never involved?</p>
<button type="button" class="ad-check__opt" data-i="0">Yes, it sees everything on the network</button>
<button type="button" class="ad-check__opt" data-i="1">No, it only sees traffic it is part of</button>
<p class="ad-check__note">A machine captures its own card. On a switched network it sees only what it sends or receives, which is why analysts need a capture from the right place.</p>
</div>

<div class="ad-check" data-check="w3e-c2" data-answer="0">
<p class="ad-check__q">For the LDAP connection, which packet came back from the domain controller to open the handshake?</p>
<button type="button" class="ad-check__opt" data-i="0">SYN-ACK</button>
<button type="button" class="ad-check__opt" data-i="1">A second SYN</button>
<button type="button" class="ad-check__opt" data-i="2">The directory results</button>
<p class="ad-check__note">The Ubuntu box sent SYN, the domain controller answered SYN-ACK, the Ubuntu box sent ACK. Only then did the LDAP query move.</p>
</div>

<div class="ad-check" data-check="w3e-c3" data-answer="1">
<p class="ad-check__q">The DNS request and reply needed how many packets, and why?</p>
<button type="button" class="ad-check__opt" data-i="0">Three, because every service uses a handshake</button>
<button type="button" class="ad-check__opt" data-i="1">Two, because DNS uses UDP and skips the handshake</button>
<button type="button" class="ad-check__opt" data-i="2">Twenty, one per name</button>
<p class="ad-check__note">DNS runs over UDP, which has no handshake. One question, one answer, done. LDAP runs over TCP, so it sets up a connection first.</p>
</div>

<div class="ad-check" data-check="w3e-c4" data-answer="1">
<p class="ad-check__q">When would you reach for tshark instead of the Wireshark window?</p>
<button type="button" class="ad-check__opt" data-i="0">When the capture is wrong and needs fixing</button>
<button type="button" class="ad-check__opt" data-i="1">On a server with no desktop, where you need a readable line</button>
<button type="button" class="ad-check__opt" data-i="2">Never, the window is always better</button>
<p class="ad-check__note">Most servers have no desktop. tshark gives you the same capture as text over an SSH session, which is where a lot of real capture work happens.</p>
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
