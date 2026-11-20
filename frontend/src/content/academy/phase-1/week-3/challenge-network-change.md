<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>The Network Change That Went Wrong</h3>
<p class="ad-brief__ask">A contractor, NetBridge Services, ran a network change on DC01 over the weekend. It is Monday morning, the tickets are coming in, and the cleanup they promised never happened. Work every ticket the way a network analyst would: find the problem on the wire in Wireshark, make the configuration change, then capture again to prove it is fixed.</p>
<ul>
<li>The contractor's changes are already in your lab.</li>
<li>Two files in <code>C:\PurveX\Shares\IT</code> are your references. <code>Network_Change_Log_Nov.txt</code> is what the contractor says they did. <code>DC01_Approved_Services.txt</code> is what IT has signed off as normal for DC01.</li>
<li>A change log tells you where to look, not what is true. The packets are the evidence.</li>
<li>If you have not yet, install <strong>Wireshark</strong> and <strong>Nmap</strong> from <code>wireshark.org/download</code> and <code>nmap.org/download</code>. When the installer offers the Npcap option, keep it ticked for loopback support.</li>
<li>Traffic DC01 sends to itself, including to its own address, shows on <strong>Adapter for loopback traffic capture</strong>. Traffic leaving the machine shows on its <strong>Ethernet</strong> adapter. When you are not sure, select both adapters with Ctrl and capture on them together.</li>
</ul>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 5 solved</span>
</div>

<div class="ad-mission" data-id="w3-01" data-attempts="0">
<span class="ad-mission__num">Ticket 01 · Warm-up · Protocols: DNS · High · Wireshark · CHG-3301 · INC-1092</span>
<h4>The Portal Won't Load</h4>
<p><strong>Jordan Ellis · Finance · 8:20 AM</strong><br>The intranet portal stopped loading for everyone in Finance this morning. It worked fine on Friday. Every browser just spins and eventually gives up.</p>
<p><strong>Look for:</strong> the DNS answer for <code>portal</code>, and what happens to the connection that follows it.</p>
<p><strong>Find it in Wireshark:</strong></p>
<ol>
<li>Start a capture on both the loopback and Ethernet adapters. Use the display filter <code>dns.qry.name contains "portal" || tcp.port == 80</code>.</li>
<li>In PowerShell, run <code>Clear-DnsClientCache</code>, then <code>Test-NetConnection portal -Port 80</code>, and wait for it to finish.</li>
<li>Open the DNS response and read the address in its Answers section. Write it down. It is your answer.</li>
<li>Look at the TCP packets to that address. You should see SYNs going out again and again, and nothing coming back.</li>
</ol>
<p><strong>Fix it:</strong> read CHG-3301 to find where the portal lives now, and point the <code>portal</code> record there.</p>
<p><strong>Prove it:</strong> capture the same test again. The DNS answer is now DC01's address, the handshake completes with a SYN-ACK, and <code>Test-NetConnection</code> reports <strong>TcpTestSucceeded : True</strong>.</p>
<p><strong>Fixed when:</strong> <code>portal</code> resolves to DC01.</p>
<p><strong>Report:</strong> the address the DNS answer gave for <code>portal</code> before your fix.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for The Portal Won't Load" placeholder="an IP address" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{10.255.255.10}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A browser has to turn the name into an address before it can connect. In the capture that is two steps: a DNS query and its response, then a TCP SYN to whatever address came back. A SYN sent again and again with no SYN-ACK in reply means nothing at that address is answering.</p>
<ul>
<li>The DNS lookup goes to DC01's own DNS server, so it shows on the loopback adapter. The SYNs to the old address leave the machine, so they show on Ethernet. That is why you capture on both.</li>
<li>No DNS packets? The answer was cached. Run <code>Clear-DnsClientCache</code> and test again.</li>
<li>To fix the record, open DNS Manager with Win+R and <code>dnsmgmt.msc</code>. Open Forward Lookup Zones and your domain, then change <code>portal</code> to the domain controller's address. <code>ipconfig</code> shows that address.</li>
</ul>
<p>In PowerShell:</p>
<ul>
<li><code>$zone = (Get-ADDomain).DNSRoot; Remove-DnsServerResourceRecord -ZoneName $zone -RRType A -Name portal -Force</code></li>
<li><code>Add-DnsServerResourceRecordA -ZoneName $zone -Name portal -IPv4Address (Get-DnsServerResourceRecord -ZoneName $zone -Name $env:COMPUTERNAME -RRType A)[0].RecordData.IPv4Address</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="@dcip">That is where the portal lives now, the address you fixed it to. Report the address the DNS answer gave before your fix.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{10.255.255.10}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The capture tells the whole story in two lines: DNS answered with PORTAL01's old address, and every SYN to it went unanswered because that server was switched off on Saturday. The portal itself was fine, and the change log even says "DNS cut over". Seeing the query, the answer and the dead handshake is how you tell a name problem from a server problem in seconds.</p>
</div>
<div>
<span>What to do</span>
<p>Attach the before and after captures to CHG-3301, ask Jordan to refresh the page, and add "update DNS and test it" to the migration checklist.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="w3-02" data-attempts="0">
<span class="ad-mission__num">Ticket 02 · Apply it · Three-Way Handshake · High · Wireshark · Nmap · INC-1092</span>
<h4>What Is Listening That Shouldn't Be?</h4>
<p><strong>Alex Rivera · IT · 9:05 AM</strong><br>Before we trust anything else in that change log, scan DC01 and compare what answers with our approved services list. I want to see it on the wire, not just in a scan report.</p>
<p><strong>Look for:</strong> a port on DC01 that answers a connection but is not on <code>DC01_Approved_Services.txt</code>.</p>
<p><strong>Find it in Wireshark:</strong></p>
<ol>
<li>Start a capture on the loopback adapter. You are scanning DC01 from DC01, so that is where the traffic shows.</li>
<li>Find DC01's address with <code>ipconfig</code>, then run <code>nmap -sT</code> followed by that address.</li>
<li>When the scan finishes, apply the display filter <code>tcp.flags.syn == 1 &amp;&amp; tcp.flags.ack == 1</code>. Every packet left is a port saying "yes, I am open".</li>
<li>Read the source port of each one and tick it off against the approved list.</li>
</ol>
<p><strong>Report:</strong> the port that answered but is not on the approved list. The next ticket closes it.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for What Is Listening That Shouldn't Be?" placeholder="a port number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{23}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A connect scan, <code>-sT</code>, starts a three-way handshake with each port, and the reply is the verdict:</p>
<ul>
<li>A SYN-ACK back means open.</li>
<li>A RST back means closed.</li>
<li>Silence means something filtered it.</li>
</ul>
<p>Nmap's report is a summary of exactly these packets. Only scan systems you are authorized to scan, which on the job means a signed-off scope.</p>
<ul>
<li>Use Statistics, then Conversations, then the TCP tab, or add <code>tcp.srcport</code> as a column, to list the ports quickly.</li>
<li>Windows Firewall does not filter a machine's traffic to itself, so this shows everything listening. Someone elsewhere on the network would only see what the firewall lets through.</li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="53|88|135|139|389|445|464|593|636|3268|3269|3389|5357|5985|9389|47001|49152|49153|49154|49155|49156|49157|49158|49664|49665|49666|49667|49668|49669|49670">That port is on the approved list. Keep going through the SYN-ACKs for one that isn't.</div>
<div class="ad-miss" data-guess="80">Port 80 is on the approved list. It is the portal CHG-3301 moved onto DC01. Keep looking.</div>
<div class="ad-miss" data-guess="8080">Port 8080 only listens on the loopback address, so a scan of DC01's own address never reaches it. Look at what answered your scan.</div>
<div class="ad-miss" data-guess="25">Port 25 is an outbound question for another ticket. This scan shows what DC01 answers on, inbound.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{23}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Port 23, Telnet, answered with a SYN-ACK, and it is not on the approved list. CHG-3302 only says "its port", not which one, so the capture is what turned a vague log line into a finding. Reading a scan as packets is also how you learn what a scanner actually does, which is what lets you spot someone else's scan in a capture later.</p>
</div>
<div>
<span>What to do</span>
<p>Save the capture in the ticket as your before picture. The next ticket finds what is behind the port and closes it.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="w3-03" data-attempts="0">
<span class="ad-mission__num">Ticket 03 · Apply it · Common Ports · High · Wireshark · CHG-3302 · INC-1092</span>
<h4>What Is Answering on Port 23?</h4>
<p><strong>Alex Rivera · IT · 9:40 AM</strong><br>Telnet on our domain controller. Before you shut it down, I want to know what it says to anyone who connects, because whatever it says, it says in plain text. Then close it properly.</p>
<p><strong>Look for:</strong> what the service on port 23 sends to anyone who connects.</p>
<p><strong>Find it in Wireshark:</strong></p>
<ol>
<li>Start a capture on the loopback adapter with the display filter <code>tcp.port == 23</code>.</li>
<li>Connect to the port and wait for it to talk, with <code>nmap -sV -p 23</code> followed by DC01's address. <code>-sV</code> holds the connection open for a few seconds to hear what the service says.</li>
<li>Right-click any packet in the conversation and choose Follow, then TCP Stream. The window shows, in plain text, what the service sent.</li>
</ol>
<p><strong>Fix it:</strong></p>
<ol>
<li>Find the program behind the port. <code>Get-NetTCPConnection -LocalPort 23 -State Listen</code> gives its process ID as <strong>OwningProcess</strong>, and <code>Get-CimInstance Win32_Process -Filter "ProcessId = &lt;that number&gt;" | Select-Object CommandLine</code> shows the script it is running.</li>
<li>Find the scheduled task that starts that script, then end it and disable it.</li>
<li>Disable the inbound firewall rule that lets port 23 in.</li>
</ol>
<p><strong>Prove it:</strong> capture the same connection again. Port 23 now answers with a RST, closed, and Follow TCP Stream has nothing to show.</p>
<p><strong>Fixed when:</strong> the task is disabled, nothing listens on port 23, and the inbound rule is off.</p>
<p><strong>Report:</strong> the first line the service sent, the one that names it.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for What Is Answering on Port 23?" placeholder="the line it sent" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{NetBridge switch console 2.1}" data-accept="NetBridge switch console|NetBridge switch console 2.1 login:">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Many services announce themselves the moment you connect, before you type anything. That greeting is called a banner. On an unencrypted protocol like Telnet, the banner, the prompt and anything typed after it all cross the wire as readable text, which is exactly what Follow TCP Stream shows you.</p>
<ul>
<li>Text in red in the Follow window came from your side, and text in blue came from the server.</li>
<li>The process name alone will not tell you much, since every PowerShell script runs in powershell.exe. Read the CommandLine.</li>
<li>Open Task Scheduler with <code>taskschd.msc</code> and look for the task whose Action runs that script. Open <code>wf.msc</code> and find the vendor rule under Inbound Rules.</li>
<li>Closing a port takes both steps. With only the rule off, the program still answers, and your own capture will still show its banner.</li>
</ul>
<p>In PowerShell:</p>
<ul>
<li><code>Stop-ScheduledTask "NetBridge Vendor Console"; Disable-ScheduledTask "NetBridge Vendor Console"</code></li>
<li><code>Stop-Process -Id (Get-NetTCPConnection -LocalPort 23 -State Listen).OwningProcess -Force</code></li>
<li><code>Disable-NetFirewallRule -DisplayName "PurveX Legacy - Vendor Telnet"</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="login|login:">That is the prompt asking for a username. Report the line before it, the one that names the service.</div>
<div class="ad-miss" data-guess="telnet|23">That is the protocol and the port you already have. Report what the service itself said when you connected.</div>
<div class="ad-miss" data-guess="vendor-console.ps1|vendor-console|NetBridge Vendor Console|powershell.exe">That is what runs it on DC01. Report what it sent over the wire, from Follow TCP Stream.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{NetBridge switch console 2.1}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Anyone who could reach DC01 got a NetBridge login prompt, in plain text, and anything they typed back, a password included, would have crossed the network readable by anyone capturing it. The banner also names the product and version, which is the first thing an attacker looks up. Following the stream showed you that in seconds. Tracing the port to vendor-console.ps1 and its task meant you closed the listener itself, not only the rule in front of it.</p>
</div>
<div>
<span>What to do</span>
<p>Attach the before and after captures to CHG-3302, along with the script and task names, so NetBridge can see exactly what was left running. Make removing temporary access part of signing off every change.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="w3-04" data-attempts="0">
<span class="ad-mission__num">Ticket 04 · Apply it · Protocols · High · Wireshark · CHG-3303 · INC-1092</span>
<h4>Is DC01 Trying to Send Mail?</h4>
<p><strong>Alex Rivera · IT · 10:10 AM</strong><br>Our approved list says DC01 never sends email, but CHG-3303 talks about a "relay test". Find out whether DC01 is actually trying to send mail, and where to. Then make sure it can't.</p>
<p><strong>Look for:</strong> outbound connections from DC01 to TCP port 25, the port mail is sent on, and where they are going.</p>
<p><strong>Find it in Wireshark:</strong></p>
<ol>
<li>Start a capture on DC01's Ethernet adapter, since this traffic is headed off the machine. Use the display filter <code>tcp.port == 25</code>.</li>
<li>Wait two minutes. Read the Destination column, and look at whether anything ever answers.</li>
</ol>
<p><strong>Fix it:</strong></p>
<ol>
<li>Find what is sending it. The change log names the job, and Task Scheduler shows you it. Disable it.</li>
<li>Windows allows outbound traffic unless a rule blocks it, so the contractor's outbound Allow rule never made a difference. Disable it, then add an outbound rule that blocks remote TCP port 25.</li>
</ol>
<p><strong>Prove it:</strong> capture for another two minutes with the same filter. Nothing should leave on port 25.</p>
<p><strong>Fixed when:</strong> the relay test task is disabled, an outbound Block rule covers TCP 25, and the contractor's Allow rule is off.</p>
<p><strong>Report:</strong> the address DC01 was trying to send mail to.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Is DC01 Trying to Send Mail?" placeholder="an IP address" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{203.0.113.25}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The Source column is who sent the packet and the Destination column is where it was going. Every packet here goes from DC01 outward and carries only the SYN flag, the first step of the three-way handshake. The same SYN sent again a few seconds later, with no SYN-ACK in between, means nothing answered.</p>
<ul>
<li>Not seeing anything? The test runs once a minute, so give it a full two minutes.</li>
<li>In <code>taskschd.msc</code>, look for a NetBridge task that runs every minute.</li>
</ul>
<p>In PowerShell:</p>
<ul>
<li><code>Disable-ScheduledTask "NetBridge Relay Test"</code></li>
<li><code>Disable-NetFirewallRule -DisplayName "PurveX Relay - Outbound Mail"</code></li>
<li><code>New-NetFirewallRule -DisplayName "PurveX Block - Outbound SMTP" -Direction Outbound -Protocol TCP -RemotePort 25 -Action Block</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="@dcip">That is DC01's own address, the source. Report the destination it was trying to reach.</div>
<div class="ad-miss" data-guess="127.0.0.1">That is loopback traffic. Capture on DC01's Ethernet adapter instead, since this traffic is headed off the machine.</div>
<div class="ad-miss" data-guess="25|smtp">That is the port and protocol. Report the address the packets were going to.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{203.0.113.25}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>DC01 was trying to open an SMTP connection every minute, long after the test was over. Here it never got an answer: 203.0.113.25 is a reserved test address that goes nowhere, so no mail ever left the lab. On the job it would be an outside server, and a domain controller sending mail out is exactly what an attacker uses to send phishing or smuggle data out. The contractor's Allow rule was a change that changed nothing, because outbound was already open. The control that actually stops it is a Block rule, and the empty second capture is your proof.</p>
</div>
<div>
<span>What to do</span>
<p>Close CHG-3303 with both captures attached. If the scanner really needs to send email, send it through the firm's mail server, and keep the block on DC01.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="w3-05" data-attempts="0">
<span class="ad-mission__num">Ticket 05 · Stretch · Protocols and TLS · Critical · Wireshark · INC-1092</span>
<h4>Read the Password Off the Wire</h4>
<p><strong>Jordan Ellis · Finance · 11:30 AM</strong><br>Our old report sync sends the daily ledger report to the reporting service every minute, signing in with its service account. The vendor promised the password is "stored encrypted", so we have never worried about it. Is that the whole story?</p>
<p><strong>Look for:</strong> the report sync's upload, and whether its sign-in can be read by anyone who captures it.</p>
<p><strong>Find it in Wireshark:</strong></p>
<ol>
<li>The job and the reporting service both run on DC01, so the traffic never leaves the machine. Capture on the loopback adapter.</li>
<li>Wait a minute or two for the job to run, then type <code>http</code> in the display filter.</li>
<li>Open the <strong>POST /reports/upload</strong> request and read the password it signs in with.</li>
</ol>
<p><strong>Fix it:</strong> the password is now burned. Disable <code>svc-reportsync</code>, and disable the job so it stops sending it.</p>
<p><strong>Prove it:</strong> capture for another two minutes. No more uploads should appear.</p>
<p><strong>Fixed when:</strong> <code>svc-reportsync</code> is disabled and the <strong>PurveX Legacy Report Sync</strong> task is disabled.</p>
<p><strong>Report:</strong> the password.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Read the Password Off the Wire" placeholder="the password" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{Ledger-Sync-77}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The job uses plain HTTP with Basic authentication, which only Base64-encodes the name and password. Wireshark decodes it for you.</p>
<ul>
<li>In the request, expand Hypertext Transfer Protocol, then the <strong>Authorization</strong> line, and read the <strong>Credentials</strong> field.</li>
<li>Follow, then HTTP Stream, shows the same request as plain text.</li>
<li>Disable <code>svc-reportsync</code> in Active Directory Users and Computers, and the job in Task Scheduler.</li>
</ul>
<p>In PowerShell:</p>
<ul>
<li><code>Disable-ADAccount svc-reportsync; Disable-ScheduledTask "PurveX Legacy Report Sync"</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="svc-reportsync|svc-reportsync@purvexfinancial.local">That is the account name. Report the password after the colon in the Credentials field.</div>
<div class="ad-miss" data-guess="c3ZjLXJlcG9ydHN5bmM6TGVkZ2VyLVN5bmMtNzc=">That is the Authorization header still Base64-encoded. Decode it, or read Wireshark's Credentials line under it.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{Ledger-Sync-77}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The vendor was telling the truth: on disk, the password is encrypted. But every minute the job sends it over plain HTTP, where Basic authentication is only Base64, so anyone who can capture traffic reads it in seconds. Protecting data at rest says nothing about data in transit, and that is the gap TLS exists to close.</p>
</div>
<div>
<span>What to do</span>
<p>Treat the password as burned. Keep the account and job disabled, then bring the job back on HTTPS with a new password. Capture again afterwards to prove the upload is no longer readable.</p>
</div>
</div>
</div>
</div>
