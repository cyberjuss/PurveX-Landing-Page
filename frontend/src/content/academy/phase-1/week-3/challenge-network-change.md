<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>The Network Change That Went Wrong</h3>
<p class="ad-brief__ask">A contractor, NetBridge Services, ran a network change on DC01 over the weekend. It is Monday morning, the tickets are coming in, and the cleanup they promised never happened. Work each ticket the way you would at a real desk: confirm the problem yourself, find the evidence, fix it, then prove the fix worked.</p>
<ul>
<li>The contractor's changes are already in your lab.</li>
<li>Two files in <code>C:\PurveX\Shares\IT</code> are your references. <code>Network_Change_Log_Nov.txt</code> is what the contractor says they did. <code>DC01_Approved_Services.txt</code> is what IT has signed off as normal for DC01.</li>
<li>A change log tells you where to look, not what is true. Check every line against the lab itself.</li>
<li>If you have not yet, install <strong>Nmap</strong> and <strong>Wireshark</strong> from <code>nmap.org/download</code> and <code>wireshark.org/download</code>. When the installer offers the Npcap option, keep it ticked for loopback support.</li>
</ul>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 5 solved</span>
</div>

<div class="ad-mission" data-id="w3-01" data-attempts="0">
<span class="ad-mission__num">Ticket 01 · Warm-up · Protocols: DNS · High · CHG-3301 · INC-1092</span>
<h4>The Portal Won't Load</h4>
<p><strong>Jordan Ellis · Finance · 8:20 AM</strong><br>The intranet portal stopped loading for everyone in Finance this morning. It worked fine on Friday. Every browser just spins and eventually gives up.</p>
<p><strong>Look for:</strong> the address the name <code>portal</code> points to, and whether anything answers there.</p>
<p><strong>Task:</strong></p>
<ol>
<li>Reproduce the problem with <code>Test-NetConnection portal -Port 80</code>. Read <strong>RemoteAddress</strong> and <strong>TcpTestSucceeded</strong>.</li>
<li>Write that address down before you change anything. It is your answer.</li>
<li>Read CHG-3301 in the change log to find where the portal lives now, then point the <code>portal</code> record there.</li>
<li>Run the same test again. It should now succeed.</li>
</ol>
<p><strong>Fixed when:</strong> <code>portal</code> resolves to DC01 and <code>Test-NetConnection portal -Port 80</code> succeeds.</p>
<p><strong>Report:</strong> the address <code>portal</code> was pointing at before your fix.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for The Portal Won't Load" placeholder="an IP address" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{10.255.255.10}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Before any connection can start, the name has to become an address. If DNS still points at a server that was switched off, every connection goes to a machine that is not there, which looks exactly like a page that spins forever.</p>
<ul>
<li><code>Resolve-DnsName portal</code> shows the address on its own, if you want to check it twice.</li>
<li>Open DNS Manager with Win+R and <code>dnsmgmt.msc</code>. Open Forward Lookup Zones and your domain, then change the <code>portal</code> record to the domain controller's address. <code>ipconfig</code> shows that address.</li>
</ul>
<p>In PowerShell:</p>
<ul>
<li><code>$zone = (Get-ADDomain).DNSRoot; Remove-DnsServerResourceRecord -ZoneName $zone -RRType A -Name portal -Force</code></li>
<li><code>Add-DnsServerResourceRecordA -ZoneName $zone -Name portal -IPv4Address (Get-DnsServerResourceRecord -ZoneName $zone -Name $env:COMPUTERNAME -RRType A)[0].RecordData.IPv4Address</code></li>
<li><code>Clear-DnsClientCache; Test-NetConnection portal -Port 80</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="@dcip">That is where the portal lives now, the address you fixed it to. Report the old address the record was stuck on.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{10.255.255.10}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The portal itself was fine. The change log even says "DNS cut over", but the record still pointed at PORTAL01, a server switched off on Saturday, so every browser sent its connection to a machine that would never answer. Testing the name yourself, rather than trusting the log, is what found it. A stale record after a migration is one of the most common Monday tickets there is.</p>
</div>
<div>
<span>What to do</span>
<p>Note the before and after addresses in CHG-3301, ask Jordan to refresh the page, and add "update DNS and test it" to the migration checklist.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="w3-02" data-attempts="0">
<span class="ad-mission__num">Ticket 02 · Apply it · Three-Way Handshake · High · Nmap · INC-1092</span>
<h4>What Is Listening That Shouldn't Be?</h4>
<p><strong>Alex Rivera · IT · 9:05 AM</strong><br>Before we trust anything else in that change log, scan DC01 and compare what you find with our approved services list. Anything open that isn't on the list, I want to know about.</p>
<p><strong>Look for:</strong> an open port on DC01 that is not on <code>DC01_Approved_Services.txt</code>.</p>
<p><strong>Task:</strong></p>
<ol>
<li>Find DC01's address with <code>ipconfig</code>.</li>
<li>Scan it with <code>nmap -sT -sV</code> followed by that address.</li>
<li>Go down the PORT column and tick each open port off against the approved list.</li>
</ol>
<p><strong>Report:</strong> the open port that is not on the approved list.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for What Is Listening That Shouldn't Be?" placeholder="a port number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{23}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A connect scan, <code>-sT</code>, completes the three-way handshake with each port:</p>
<ul>
<li>A SYN-ACK back means open.</li>
<li>A reset means closed.</li>
<li>Silence means something filtered it.</li>
</ul>
<p><code>-sV</code> also asks each open port what it is, so the SERVICE and VERSION columns help you match it to the list. Only scan systems you are authorized to scan, which on the job means a signed-off scope.</p>
<p>One thing to know: you are scanning DC01 from DC01. Windows Firewall does not filter a machine's traffic to itself, so this scan shows everything listening. That is the right view for checking against an approved list. Someone elsewhere on the network would only see what the firewall lets through.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="53|88|135|139|389|445|464|593|636|3268|3269|3389|5357|5985|9389|47001|49152|49153|49154|49155|49156|49157|49158|49664|49665|49666|49667|49668|49669|49670">That port is on the approved list. Keep going down the scan for one that isn't.</div>
<div class="ad-miss" data-guess="80">Port 80 is on the approved list. It is the portal CHG-3301 moved onto DC01. Keep looking.</div>
<div class="ad-miss" data-guess="8080">Port 8080 only listens on the loopback address, so a scan of DC01's own address does not show it. Look at what your scan reports.</div>
<div class="ad-miss" data-guess="25">Port 25 is an outbound question for another ticket. This scan shows what DC01 listens on, inbound.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{23}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Port 23 is Telnet, and a NetBridge console is answering on it. It is not on the approved list, and CHG-3302 only says "its port", not which one, so the scan is what turned a vague log line into a finding. Comparing a scan against a written baseline after every change is how network and security teams catch what a change log leaves out.</p>
</div>
<div>
<span>What to do</span>
<p>Save the scan output in the ticket as your before picture. The next ticket closes the port. You will scan again afterwards for the after picture.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="w3-03" data-attempts="0">
<span class="ad-mission__num">Ticket 03 · Apply it · Common Ports · High · CHG-3302 · INC-1092</span>
<h4>Find What Is Answering on Port 23</h4>
<p><strong>Alex Rivera · IT · 9:40 AM</strong><br>Telnet on our domain controller. Before you shut it down, I need to know exactly which program is behind it, so I can put it in front of NetBridge. Then close it properly.</p>
<p><strong>Look for:</strong> the program that owns the listener on port 23.</p>
<p><strong>Task:</strong></p>
<ol>
<li>Run <code>Get-NetTCPConnection -LocalPort 23 -State Listen</code> and note the <strong>OwningProcess</strong> number. That is the process ID.</li>
<li>Run <code>Get-CimInstance Win32_Process -Filter "ProcessId = &lt;that number&gt;" | Select-Object Name, CommandLine</code> to see which script it is running.</li>
<li>Find the scheduled task that starts that script, then end it and disable it.</li>
<li>Disable the inbound firewall rule that lets port 23 in.</li>
<li>Scan DC01 again. Port 23 should no longer show as open.</li>
</ol>
<p><strong>Fixed when:</strong> the task is disabled, nothing listens on port 23, and the inbound rule is off.</p>
<p><strong>Report:</strong> the file name of the script that was answering on port 23.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Find What Is Answering on Port 23" placeholder="a file name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{vendor-console.ps1}" data-accept="vendor-console|C:\PurveX\Jobs\vendor-console.ps1">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A port is owned by a process, and a process was started by something. Follow that chain: port, then process, then what launched it. Closing a port properly takes two steps: stop the program that answers, and close the rule that lets traffic in. Turning off the rule alone leaves the program running, and your own scan will still show it open.</p>
<ul>
<li><code>netstat -ano | findstr :23</code> gives the same process ID if you prefer the classic tool.</li>
<li>The process name alone will not tell you much. Read the CommandLine.</li>
<li>Open Task Scheduler with <code>taskschd.msc</code>. Look in the Task Scheduler Library for a task whose Action runs that script.</li>
<li>Open <code>wf.msc</code> and find the vendor rule under Inbound Rules.</li>
</ul>
<p>In PowerShell:</p>
<ul>
<li><code>Stop-ScheduledTask "NetBridge Vendor Console"; Disable-ScheduledTask "NetBridge Vendor Console"</code></li>
<li><code>Stop-Process -Id (Get-NetTCPConnection -LocalPort 23 -State Listen).OwningProcess -Force</code></li>
<li><code>Disable-NetFirewallRule -DisplayName "PurveX Legacy - Vendor Telnet"</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="powershell.exe|powershell">Every PowerShell script runs inside powershell.exe, so the name alone does not say which one. Read the process's CommandLine for the script file.</div>
<div class="ad-miss" data-guess="NetBridge Vendor Console">That is the scheduled task that starts it. Report the script file the task runs.</div>
<div class="ad-miss" data-guess="chg-3302|3302|23|telnet">That is the change or the port you already have. Report the script file that was answering.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{vendor-console.ps1}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Telnet sends everything, passwords included, in plain text, and this console sat on the domain controller after a job that ended on Sunday night. Tracing port to process to task means you can hand NetBridge the exact file, task and change number, and it means you closed the listener itself. Switching off the firewall rule alone would have left it running for anyone who could reach DC01 another way.</p>
</div>
<div>
<span>What to do</span>
<p>Keep the before and after scans in CHG-3302, along with the file and task names, then close it. Make removing temporary access part of signing off every change.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="w3-04" data-attempts="0">
<span class="ad-mission__num">Ticket 04 · Apply it · Protocols · High · Wireshark · CHG-3303 · INC-1092</span>
<h4>Is DC01 Trying to Send Mail?</h4>
<p><strong>Alex Rivera · IT · 10:10 AM</strong><br>Our approved list says DC01 never sends email, but CHG-3303 talks about a "relay test". Find out whether DC01 is actually trying to send mail, and where to. Then make sure it can't.</p>
<p><strong>Look for:</strong> outbound connections from DC01 to TCP port 25, the port mail is sent on, and where they are going.</p>
<p><strong>Task:</strong></p>
<ol>
<li>Start a Wireshark capture on DC01's network adapter, the Ethernet one, not loopback. Use the display filter <code>tcp.port == 25</code>.</li>
<li>Wait two minutes. Read the destination address of the packets, and look at whether anything ever answers.</li>
<li>Find what is sending them. The change log names the job, and Task Scheduler will show you it. Disable it.</li>
<li>Windows allows outbound traffic unless a rule blocks it, so the contractor's outbound Allow rule never made a difference. Disable it, then add an outbound rule that blocks remote TCP port 25.</li>
<li>Capture again. Nothing should leave on port 25.</li>
</ol>
<p><strong>Fixed when:</strong> the relay test task is disabled, an outbound Block rule covers TCP 25, and the contractor's Allow rule is off.</p>
<p><strong>Report:</strong> the address DC01 was trying to send mail to.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Is DC01 Trying to Send Mail?" placeholder="an IP address" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{203.0.113.25}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>In Wireshark, the Source column is who sent the packet and the Destination column is where it was going. Every packet here goes from DC01 outward and carries only the SYN flag, the first step of the three-way handshake. A SYN that is sent again and again with no SYN-ACK coming back means nothing answered.</p>
<ul>
<li>Not seeing anything? The test runs once a minute, so give it a full two minutes.</li>
<li><code>Get-NetTCPConnection -RemotePort 25</code> run during an attempt shows the same address in the SynSent state.</li>
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
<p>DC01 was trying to open an SMTP connection every minute, long after the test was over. Here it never got an answer: 203.0.113.25 is a reserved test address that goes nowhere, so no mail ever left the lab. On the job it would be an outside server, and a domain controller sending mail out is exactly what an attacker uses to send phishing or smuggle data out. The contractor's Allow rule was a change that changed nothing, because outbound was already open. The control that actually stops it is a Block rule.</p>
</div>
<div>
<span>What to do</span>
<p>Close CHG-3303 with your capture attached. If the scanner really needs to send email, send it through the firm's mail server, and keep the block on DC01.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="w3-05" data-attempts="0">
<span class="ad-mission__num">Ticket 05 · Stretch · Protocols and TLS · Critical · Wireshark · INC-1092</span>
<h4>Read the Password Off the Wire</h4>
<p><strong>Jordan Ellis · Finance · 11:30 AM</strong><br>Our old report sync sends the daily ledger report to the reporting service every minute, signing in with its service account. The vendor promised the password is "stored encrypted", so we have never worried about it. Is that the whole story?</p>
<p><strong>Look for:</strong> the report sync's upload, and whether its sign-in can be read by anyone who captures it.</p>
<p><strong>Task:</strong></p>
<ol>
<li>The job and the reporting service both run on DC01, so the traffic never leaves the machine. Capture on <strong>Adapter for loopback traffic capture</strong>.</li>
<li>Wait a minute or two for the job to run, then type <code>http</code> in the display filter.</li>
<li>Open the <strong>POST /reports/upload</strong> request and read the password it signs in with.</li>
<li>The password is now burned. Disable <code>svc-reportsync</code>, and disable the job so it stops sending it.</li>
</ol>
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
