<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>A domain controller is talking to the network constantly. If you captured a few seconds of it, would you recognise what the conversations are?</p>
</div>

**Situation:** Analysts read network traffic every day, but most people first meet it as a textbook diagram rather than a real capture from a real machine. Traffic you have never captured yourself is traffic you cannot read under pressure.

**Task:** Capture a short window of live traffic on the domain controller, turn it into something readable, and find the handshakes, ports and protocols the week covered. Predict what you expect to see before you look.

**What you need:** Your hosted lab running, and the domain controller desktop open. You sign in as Administrator, so nothing needs installing. The capture tool, Packet Monitor, ships with Windows Server.

### Before You Start

Commit to an answer before you capture anything. Nothing is marked yet. The capture settles each one.

<div class="ad-check ad-check--predict" data-check="w3e-p1">
<p class="ad-check__q">A domain controller sitting idle, with nobody logged in, on the network. How much traffic is it sending?</p>
<button type="button" class="ad-check__opt" data-i="0">Almost none, since nobody is using it</button>
<button type="button" class="ad-check__opt" data-i="1">A steady stream of its own background traffic</button>
<p class="ad-check__note">Locked in. You will capture a few seconds and count what comes back.</p>
</div>

<div class="ad-check ad-check--predict" data-check="w3e-p2">
<p class="ad-check__q">Every TCP conversation opens the same way. What are the first three packets?</p>
<button type="button" class="ad-check__opt" data-i="0">SYN, then SYN-ACK, then ACK</button>
<button type="button" class="ad-check__opt" data-i="1">A single CONNECT packet</button>
<button type="button" class="ad-check__opt" data-i="2">The data goes straight across, no setup</button>
<p class="ad-check__note">Locked in. You will find this exact pattern in your own capture.</p>
</div>

<div class="ad-check ad-check--predict" data-check="w3e-p3">
<p class="ad-check__q">You see traffic on port 53. Before reading anything else, what service is almost certainly involved?</p>
<button type="button" class="ad-check__opt" data-i="0">Web browsing</button>
<button type="button" class="ad-check__opt" data-i="1">DNS, name resolution</button>
<button type="button" class="ad-check__opt" data-i="2">Email</button>
<p class="ad-check__note">Locked in. The port numbers you learned this week are about to do real work.</p>
</div>

### Find the Machine First

Open a PowerShell window on the domain controller. Right-click Start and choose Windows PowerShell (Admin). First confirm which machine you are on and its address.

```powershell
hostname
ipconfig | Select-String "IPv4"
```

Write down the IPv4 address. Every packet you capture either starts or ends at this machine.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-3/PLACEHOLDER-dc-ipconfig.png" alt="PowerShell on the domain controller showing the hostname and IPv4 address" />
<figcaption>Screenshot 1. [ADD IMAGE] The domain controller and its address.</figcaption>
</figure>
</div>

### Capture a Few Seconds

Packet Monitor records every packet that crosses the machine. Start it, wait about thirty seconds while the domain controller does its normal background work, then stop it.

```powershell
pktmon start --capture --pkt-size 0
Start-Sleep -Seconds 30
pktmon stop
```

The capture lands in the current folder as `PktMon.etl`. That file is not readable yet, which is the next step.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-3/PLACEHOLDER-pktmon-capture.png" alt="PowerShell showing pktmon start and stop with the capture file reported" />
<figcaption>Screenshot 2. [ADD IMAGE] Thirty seconds of the machine's own traffic.</figcaption>
</figure>
</div>

### Make It Readable

Convert the capture to a plain text log you can scroll through.

```powershell
pktmon format PktMon.etl -o capture.txt
notepad capture.txt
```

Each line is one packet with its time, its source and destination addresses, the ports and the protocol. Scroll through and notice how much is here from a machine nobody is actively using.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-3/PLACEHOLDER-capture-text.png" alt="Notepad showing the formatted packet capture with addresses, ports and protocols" />
<figcaption>Screenshot 3. [ADD IMAGE] The capture as readable lines.</figcaption>
</figure>
</div>

### Find the Handshake

Every TCP conversation starts with the three-way handshake from this week. Look for a packet flagged SYN, followed by one flagged SYN-ACK coming back, then an ACK. That is one connection being set up before any real data moves.

Pick one conversation and follow its first three packets in order. The two addresses stay the same while the flags change.

### Map the Ports

Now read the port numbers. Match what you see against the common ports from this week.

| Port | Service |
| ----- | ----- |
| 53 | DNS |
| 88 | Kerberos |
| 389 | LDAP |
| 445 | SMB |

A domain controller uses all of these constantly, so a short capture will show several. Each port is a service answering on the machine, which is the idea from the Common Ports lesson in front of you as real traffic.

### For the Job

On a real server you rarely read a text dump. You open the capture in Wireshark, the tool almost every analyst job expects. Packet Monitor can hand Wireshark a file it understands.

```powershell
pktmon pcapng PktMon.etl -o capture.pcapng
```

If Wireshark is on the machine, open `capture.pcapng` in it. The same packets appear with colour, filters and a readable handshake view. The capture is yours either way.

### Check Yourself

Answer from what you captured, not from what you remember reading.

<div class="ad-check" data-check="w3e-c1" data-answer="1">
<p class="ad-check__q">Your idle domain controller over thirty seconds produced roughly what?</p>
<button type="button" class="ad-check__opt" data-i="0">Almost nothing</button>
<button type="button" class="ad-check__opt" data-i="1">A steady stream of background packets</button>
<p class="ad-check__note">A domain controller is never quiet. It answers DNS, Kerberos and LDAP for the whole domain, which is why a real baseline capture is busy even with nobody logged in.</p>
</div>

<div class="ad-check" data-check="w3e-c2" data-answer="0">
<p class="ad-check__q">In a TCP handshake you followed, what was the second packet, coming back from the other side?</p>
<button type="button" class="ad-check__opt" data-i="0">SYN-ACK</button>
<button type="button" class="ad-check__opt" data-i="1">A second SYN</button>
<button type="button" class="ad-check__opt" data-i="2">The first line of data</button>
<p class="ad-check__note">SYN out, SYN-ACK back, ACK out. Three packets to agree the connection before a single byte of real data moves.</p>
</div>

<div class="ad-check" data-check="w3e-c3" data-answer="2">
<p class="ad-check__q">You find a burst of traffic on port 88. What is the machine most likely doing?</p>
<button type="button" class="ad-check__opt" data-i="0">Serving a web page</button>
<button type="button" class="ad-check__opt" data-i="1">Sending email</button>
<button type="button" class="ad-check__opt" data-i="2">Handling Kerberos authentication</button>
<p class="ad-check__note">Port 88 is Kerberos, the ticket system a domain uses to prove who an account is. Heavy traffic here is normal on a domain controller.</p>
</div>

<div class="ad-check" data-check="w3e-c4" data-answer="1">
<p class="ad-check__q">Why convert the capture to pcapng as the last step?</p>
<button type="button" class="ad-check__opt" data-i="0">The text log is wrong and pcapng fixes it</button>
<button type="button" class="ad-check__opt" data-i="1">So it opens in Wireshark, the tool a real job uses</button>
<button type="button" class="ad-check__opt" data-i="2">To make the file smaller</button>
<p class="ad-check__note">The text dump is fine for a quick look. On the job you read captures in Wireshark, and pcapng is the format it expects.</p>
</div>

### Take It Further

You capture thirty seconds on the domain controller and see steady traffic to addresses inside your own network. Then one connection goes out to an address you do not recognise, on a port nothing here should be using.

Say what makes that one connection worth a second look, and name the two things in the capture you would write down about it.

### Why It Matters

Every investigation that touches the network starts with a capture, and the first skill is telling ordinary traffic from the one line that does not belong. You cannot spot the odd connection until you have seen enough normal ones to know what normal looks like, which is exactly what a baseline capture like this one gives you.
