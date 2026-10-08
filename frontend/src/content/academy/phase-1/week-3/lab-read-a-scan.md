<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Before an attacker breaks in, they knock on every door to see which ones open. What does that knocking look like in a capture, and could you tell it from normal traffic?</p>
</div>

**Situation:** Almost every intrusion starts the same way, with reconnaissance. The attacker scans a machine to learn which ports are open before choosing where to push. The scan itself does no damage, which is exactly why it is missed, and spotting it early is often the only warning a team gets.

**Task:** Produce a port scan against the domain controller yourself, using a built-in tool the way an administrator would to inventory a machine. Capture it, then read the traffic and learn the signature that separates an open door from a closed one. Predict each result before you run it.

**What you need:** Your hosted lab running, and the domain controller desktop open, signed in as Administrator. You use only built-in Windows tools. This is network reconnaissance seen from the defender's side, so you understand the pattern rather than the attack.

### Before You Start

Commit to an answer first. Nothing is marked yet. The capture settles each one.

<div class="ad-check ad-check--predict" data-check="w3m-p1">
<p class="ad-check__q">You try to connect to a port where a service is listening. How does the handshake go?</p>
<button type="button" class="ad-check__opt" data-i="0">It completes, SYN then SYN-ACK then ACK</button>
<button type="button" class="ad-check__opt" data-i="1">Nothing comes back at all</button>
<p class="ad-check__note">Locked in. You will watch an open port answer in the capture.</p>
</div>

<div class="ad-check ad-check--predict" data-check="w3m-p2">
<p class="ad-check__q">You try a port where nothing is listening. What does the machine send back?</p>
<button type="button" class="ad-check__opt" data-i="0">A SYN-ACK, same as an open port</button>
<button type="button" class="ad-check__opt" data-i="1">A RST, refusing the connection</button>
<button type="button" class="ad-check__opt" data-i="2">It completes the handshake anyway</button>
<p class="ad-check__note">Locked in. The difference between this and an open port is the whole lab.</p>
</div>

<div class="ad-check ad-check--predict" data-check="w3m-p3">
<p class="ad-check__q">What makes a scan look different from normal traffic in a capture?</p>
<button type="button" class="ad-check__opt" data-i="0">One machine touching many ports in a short burst</button>
<button type="button" class="ad-check__opt" data-i="1">A single long download</button>
<button type="button" class="ad-check__opt" data-i="2">Nothing, a scan looks identical to normal use</button>
<p class="ad-check__note">Locked in. You will see the shape of it in your own capture.</p>
</div>

### Start the Capture

Open PowerShell as Administrator on the domain controller. Start Packet Monitor so it records while you run the scan.

```powershell
pktmon start --capture --pkt-size 0
```

Leave this running. Everything in the next step will be recorded.

### Scan the Machine's Own Ports

An administrator checks which services are up by testing a list of ports. An attacker does the same thing to find a way in. The command is identical, which is why the pattern matters more than the intent.

Test a mix of ports, some that a domain controller runs and some that nothing should.

```powershell
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" } | Select-Object -First 1).IPAddress
foreach ($port in 53,88,389,445,3389,23,8080,9999) {
  $r = Test-NetConnection -ComputerName $ip -Port $port -WarningAction SilentlyContinue
  "{0,-6} {1}" -f $port, $(if ($r.TcpTestSucceeded) {"OPEN"} else {"closed"})
}
```

Read the list it prints. Some ports answer OPEN and some come back closed. Write down which were which.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-3/PLACEHOLDER-scan-results.png" alt="PowerShell showing each tested port marked OPEN or closed" />
<figcaption>Screenshot 1. [ADD IMAGE] Eight ports tested, open and closed marked.</figcaption>
</figure>
</div>

### Stop and Read the Capture

Stop the capture and turn it into readable text.

```powershell
pktmon stop
pktmon format PktMon.etl -o scan.txt
notepad scan.txt
```

Now compare the traffic for an open port against a closed one. Find the lines for port 445 and the lines for port 9999.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-3/PLACEHOLDER-scan-capture.png" alt="Notepad showing the captured packets for an open port completing and a closed port reset" />
<figcaption>Screenshot 2. [ADD IMAGE] One port completes, one is refused.</figcaption>
</figure>
</div>

### The Two Signatures

Two outcomes, and the difference is the lesson.

* **Open port.** The handshake completes. SYN goes out, a SYN-ACK comes back, an ACK finishes it. The door opened.
* **Closed port.** The SYN goes out and the machine answers with a RST, a reset. The door is shut and says so.

An attacker learns exactly which doors are open from this, without touching a single service. One machine sending SYN to port after port in seconds, most answered by RST, is the shape of a scan. Seeing it in a real capture is often the first sign someone is looking.

### Check Yourself

Answer from what you captured, not from what you remember reading.

<div class="ad-check" data-check="w3m-c1" data-answer="0">
<p class="ad-check__q">For an open port like 445, how did the handshake end in your capture?</p>
<button type="button" class="ad-check__opt" data-i="0">It completed, SYN then SYN-ACK then ACK</button>
<button type="button" class="ad-check__opt" data-i="1">The machine sent a RST</button>
<button type="button" class="ad-check__opt" data-i="2">Nothing came back</button>
<p class="ad-check__note">A listening service accepts the connection, so the three-way handshake completes. That completion is how the scanner confirms the port is open.</p>
</div>

<div class="ad-check" data-check="w3m-c2" data-answer="1">
<p class="ad-check__q">For a closed port like 9999, what did the machine send back?</p>
<button type="button" class="ad-check__opt" data-i="0">A SYN-ACK</button>
<button type="button" class="ad-check__opt" data-i="1">A RST, resetting the connection</button>
<button type="button" class="ad-check__opt" data-i="2">A second SYN</button>
<p class="ad-check__note">A closed port refuses with a RST. The scanner learns the port is shut just as clearly as it learns an open one is open.</p>
</div>

<div class="ad-check" data-check="w3m-c3" data-answer="2">
<p class="ad-check__q">What in the capture marks this as a scan rather than normal use?</p>
<button type="button" class="ad-check__opt" data-i="0">The packets were encrypted</button>
<button type="button" class="ad-check__opt" data-i="1">It used port 80</button>
<button type="button" class="ad-check__opt" data-i="2">One source touching many ports in a short burst</button>
<p class="ad-check__note">Normal traffic settles into a few conversations. A scan is one machine knocking on many ports fast, most answered by RST, which stands out once you know the shape.</p>
</div>

<div class="ad-check" data-check="w3m-c4" data-answer="1">
<p class="ad-check__q">The scan command was a normal admin tool, Test-NetConnection. What does that tell you about detection?</p>
<button type="button" class="ad-check__opt" data-i="0">Scans are impossible to detect</button>
<button type="button" class="ad-check__opt" data-i="1">You detect the pattern in the traffic, not a forbidden tool</button>
<button type="button" class="ad-check__opt" data-i="2">Only special attacker tools leave a trace</button>
<p class="ad-check__note">The same command inventories a server or maps it for attack. You cannot ban the tool, so detection rests on the behaviour, which is the burst of SYNs to many ports.</p>
</div>

### Take It Further

A week after this, the security team pulls a capture from the file server. It shows one workstation sending SYN packets to forty different ports on the server in under ten seconds, most answered by RST.

Say what that workstation is doing, and whether the handful of ports that answered OPEN should worry the team more or less than the ones that were refused.

### Why It Matters

Reconnaissance is the quietest stage of an attack and the best chance to stop it, because nothing is broken yet. A team that can read a scan in a capture catches the knock before the break-in, and the signature you just produced by hand is the same one that shows up before real intrusions.
