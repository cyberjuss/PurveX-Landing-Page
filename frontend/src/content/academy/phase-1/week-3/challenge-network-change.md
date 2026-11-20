<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>The Network Change That Went Wrong</h3>
<p class="ad-brief__ask">A contractor, NetBridge Services, ran a network change on DC01 over the weekend and signed it off as "nothing outstanding". It is Monday morning and the help desk phone has not stopped. Every caller has a different error, and every error leaves a different trace on the wire. Find each one in Wireshark, fix the configuration, then capture again to prove it works.</p>
<ul>
<li>The contractor's change log is <code>C:\PurveX\Shares\IT\Network_Change_Log_Nov.txt</code>. It tells you what changed, not what broke.</li>
<li>The apps the callers use run on DC01 and try again every minute, so there is always fresh traffic to capture.</li>
<li>Traffic DC01 sends to itself, including to its own address, shows on <strong>Adapter for loopback traffic capture</strong>. Traffic leaving the machine shows on its <strong>Ethernet</strong> adapter. When you are not sure, select both adapters with Ctrl and capture on them together.</li>
<li>If you have not yet, install <strong>Wireshark</strong> from <code>wireshark.org/download</code>. When the installer offers Npcap, keep its loopback option ticked.</li>
</ul>
<table>
<thead><tr><th>What the capture shows</th><th>What it means</th></tr></thead>
<tbody>
<tr><td>A DNS answer, then SYNs with nothing coming back</td><td>The name points at an address where nothing answers</td></tr>
<tr><td>A DNS answer of <strong>No such name</strong>, and no TCP at all</td><td>The name does not exist, so the app never even tried to connect</td></tr>
<tr><td>A SYN answered by a <strong>RST</strong></td><td>The machine is there, but nothing is listening on that address and port</td></tr>
<tr><td>A full handshake, then an HTTP 4xx or 5xx status</td><td>The network is fine. The app refused the request</td></tr>
</tbody>
</table>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 5 solved</span>
</div>

<div class="ad-mission" data-id="w3-01" data-attempts="0">
<span class="ad-mission__num">Ticket 01 · Warm-up · DNS · High · Wireshark · CHG-3301 · INC-1092</span>
<h4>The Portal Spins and Gives Up</h4>
<p><strong>Jordan Ellis · Finance · 8:20 AM</strong><br>The intranet portal stopped loading for everyone in Finance this morning. It worked fine on Friday. The browser just spins for ages and then says the site can't be reached.</p>
<p><strong>Look for:</strong> the DNS answer for <code>portal</code>, and what happens to the connection after it.</p>
<p><strong>Find it in Wireshark:</strong></p>
<ol>
<li>Start a capture on both the loopback and Ethernet adapters. Use the display filter <code>dns.qry.name contains "portal" || tcp.port == 80</code>.</li>
<li>In PowerShell, run <code>Clear-DnsClientCache</code>, then <code>Test-NetConnection portal -Port 80</code>, and wait for it to finish.</li>
<li>Open the DNS response and read the address in its Answers section. Write it down. It is your answer.</li>
<li>Look at the TCP packets to that address: SYNs going out again and again, and nothing coming back.</li>
</ol>
<p><strong>Fix it:</strong> CHG-3301 says where the portal lives now. Point the <code>portal</code> record there.</p>
<p><strong>Prove it:</strong> capture the same test again. DNS now answers with DC01's address, the handshake completes with a SYN-ACK, and <code>Test-NetConnection</code> reports <strong>TcpTestSucceeded : True</strong>.</p>
<p><strong>Fixed when:</strong> <code>portal</code> resolves to DC01.</p>
<p><strong>Report:</strong> the address DNS gave for <code>portal</code> before your fix.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for The Portal Spins and Gives Up" placeholder="an IP address" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{10.255.255.10}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Spinning for ages, then failing, is a timeout, and on the wire a timeout is a SYN nobody answers. The browser asked DNS for an address, got one, and is knocking on a door with nobody behind it.</p>
<ul>
<li>The DNS lookup goes to DC01's own DNS server, so it shows on loopback. The SYNs leave the machine, so they show on Ethernet.</li>
<li>No DNS packets? The answer was cached. Run <code>Clear-DnsClientCache</code> and test again.</li>
<li>To fix the record, open DNS Manager with Win+R and <code>dnsmgmt.msc</code>. Open Forward Lookup Zones and your domain, then change <code>portal</code> to the domain controller's address, which <code>ipconfig</code> shows.</li>
</ul>
<p>In PowerShell:</p>
<ul>
<li><code>$zone = (Get-ADDomain).DNSRoot; Remove-DnsServerResourceRecord -ZoneName $zone -RRType A -Name portal -Force</code></li>
<li><code>Add-DnsServerResourceRecordA -ZoneName $zone -Name portal -IPv4Address (Get-DnsServerResourceRecord -ZoneName $zone -Name $env:COMPUTERNAME -RRType A)[0].RecordData.IPv4Address</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="@dcip">That is where the portal lives now, the address you fixed it to. Report the address DNS gave before your fix.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{10.255.255.10}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The capture tells the whole story in two lines: DNS answered with PORTAL01's old address, and every SYN to it went unanswered because that server was switched off on Saturday. The change log says "DNS cut over", and it wasn't. A stale record after a migration is one of the most common Monday tickets there is, and the dead handshake is how you tell a name problem from a server problem in seconds.</p>
</div>
<div>
<span>What to do</span>
<p>Attach the before and after captures to CHG-3301, ask Jordan to refresh the page, and add "update DNS and test it" to the migration checklist.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="w3-02" data-attempts="0">
<span class="ad-mission__num">Ticket 02 · Apply it · DNS · High · Wireshark · CHG-3302 · INC-1092</span>
<h4>"Server Not Found" on the Dashboard</h4>
<p><strong>Sam Whitfield · Wealth Management · 8:45 AM</strong><br>The Reports Dashboard on my screen just says "Server not found" this morning. It doesn't even try to load. Nothing else seems wrong.</p>
<p><strong>Look for:</strong> the exact name the dashboard asks DNS for, and what DNS says back.</p>
<p><strong>Find it in Wireshark:</strong></p>
<ol>
<li>Start a capture on the loopback adapter with the display filter <code>dns</code>. The dashboard refreshes every minute, so wait for the next one.</li>
<li>Find the query that comes back with an error. Open it and read the name in the Queries section, and the Reply code in the Flags.</li>
<li>Notice what is missing after it: no SYN, no connection attempt at all.</li>
</ol>
<p><strong>Fix it:</strong> CHG-3302 removed records PORTAL01 "no longer needs". The dashboard is served by the portal on DC01, so create an A record for the name the dashboard asks for, pointing at DC01.</p>
<p><strong>Prove it:</strong> wait for the next refresh. The query now gets an answer with DC01's address, and HTTP traffic to it follows, ending in <strong>200 OK</strong>.</p>
<p><strong>Fixed when:</strong> the name the dashboard asks for resolves to DC01.</p>
<p><strong>Report:</strong> the name the dashboard looks up, without the domain.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Server Not Found on the Dashboard" placeholder="a host name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{rptdash}" data-accept="rptdash.purvexfinancial.local">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>"Server not found" straight away, with no spinning, is the opposite of Ticket 01. DNS did not give a wrong address. It said the name does not exist at all, so there was nothing to connect to. Users rarely know an app's real host name, which is why you read it off the wire instead of guessing.</p>
<ul>
<li><code>dns.flags.rcode == 3</code> shows only the "No such name" answers.</li>
<li>Create the record in DNS Manager: right-click your zone, choose New Host (A or AAAA), type the name and DC01's address.</li>
</ul>
<p>In PowerShell:</p>
<ul>
<li><code>Add-DnsServerResourceRecordA -ZoneName (Get-ADDomain).DNSRoot -Name &lt;the name&gt; -IPv4Address &lt;DC01's address&gt;</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="dashboard|reportsdashboard|reports">That is what Sam calls it. Report the exact name in the DNS query.</div>
<div class="ad-miss" data-guess="nosuchname|nxdomain|3">That is what DNS answered. Report the name it was asked about.</div>
<div class="ad-miss" data-guess="portal">The dashboard asks for its own name, not the portal's. Look for the query that comes back with No such name.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{rptdash}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The dashboard looks up <code>rptdash</code>, an old alias that lived on PORTAL01, and CHG-3302 deleted it along with records that really were unused. An NXDOMAIN with no connection after it pins the fault on DNS in one packet. Without the capture, "Server not found" sends people off rebooting the PC or blaming the dashboard vendor.</p>
</div>
<div>
<span>What to do</span>
<p>Note the record you added in CHG-3302, and ask for a list of every name a server answers to before its records are removed next time.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="w3-03" data-attempts="0">
<span class="ad-mission__num">Ticket 03 · Apply it · TCP/IP · High · Wireshark · CHG-3303 · INC-1092</span>
<h4>Timesheets: "Connection Refused"</h4>
<p><strong>Riley Kwan · Operations · 9:30 AM</strong><br>The timesheet app won't let anyone in Operations submit this week's hours. It fails instantly with "Connection refused". Payroll closes on Wednesday.</p>
<p><strong>Look for:</strong> how DC01 answers the timesheet app's connection, and why.</p>
<p><strong>Find it in Wireshark:</strong></p>
<ol>
<li>Start a capture on the loopback adapter with the display filter <code>tcp.flags.reset == 1 || tcp.flags.syn == 1</code>. Wait for the app's next try.</li>
<li>Find the SYN to DC01's address and the RST that answers it. Note the port.</li>
<li>A RST means DC01 is there but nothing is listening on that address and port. Check what is listening with <code>Get-NetTCPConnection -LocalPort &lt;the port&gt; -State Listen</code> and read <strong>LocalAddress</strong>.</li>
</ol>
<p><strong>Fix it:</strong> the service's settings are in <code>C:\PurveX\Apps\Timesheet\timesheet.ini</code>, from CHG-3303. Set it to listen on every address, <code>0.0.0.0</code>, then restart the <strong>PurveX Timesheet Service</strong> task in Task Scheduler.</p>
<p><strong>Prove it:</strong> on the app's next try, the SYN gets a SYN-ACK, and the HTTP reply is <strong>200 OK</strong>.</p>
<p><strong>Fixed when:</strong> the timesheet service is listening on DC01's network address.</p>
<p><strong>Report:</strong> the address the service was listening on before your fix.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Timesheets: Connection Refused" placeholder="an IP address" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{127.0.0.1}" data-accept="localhost|127.0.0.1:8085">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>"Connection refused" is fast because something did answer: DC01's own network stack, with a RST. That rules out a dead server or a wrong address, and points at the service. A service only accepts connections on the addresses it listens on, so compare its LocalAddress with the address the app connects to.</p>
<ul>
<li>A LocalAddress of <code>0.0.0.0</code> means every IPv4 address. A loopback address means this machine talking to itself, and nobody else can reach it.</li>
<li>Edit the file in Notepad, run as administrator. In Task Scheduler, right-click the task, End it, then Run it.</li>
</ul>
<p>In PowerShell:</p>
<ul>
<li><code>(Get-Content C:\PurveX\Apps\Timesheet\timesheet.ini) -replace '^ListenAddress=.*', 'ListenAddress=0.0.0.0' | Set-Content C:\PurveX\Apps\Timesheet\timesheet.ini</code></li>
<li><code>Stop-ScheduledTask "PurveX Timesheet Service"; Start-ScheduledTask "PurveX Timesheet Service"</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="8085">That is the port. Report the address the service was listening on, from LocalAddress.</div>
<div class="ad-miss" data-guess="0.0.0.0">That is the fix. Report the address it was listening on before you changed it.</div>
<div class="ad-miss" data-guess="@dcip">That is the address the app connects to, and the reason it is refused: the service was not listening there. Report the address it was listening on.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{127.0.0.1}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The upgrade's new settings file came with the vendor's default, listen on loopback only, which is safe for testing and useless in production. It worked when the contractor tested it on the server itself, which is exactly why nobody noticed. A RST told you in one packet that the network was fine and the service was the problem, and LocalAddress told you why.</p>
</div>
<div>
<span>What to do</span>
<p>Note the setting in CHG-3303, tell Riley's team to resubmit, and add "test from a client, not from the server" to the upgrade checklist.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="w3-04" data-attempts="0">
<span class="ad-mission__num">Ticket 04 · Apply it · Protocols: HTTP · High · Wireshark · CHG-3304 · INC-1092</span>
<h4>Expense Claims Won't Go Through</h4>
<p><strong>Taylor Osei · Finance · 10:15 AM</strong><br>None of this morning's expense claims have reached the approval queue. The expense sync just logs "The remote server returned an error". The network seems fine, since everything else works.</p>
<p><strong>Look for:</strong> what the expense sync asks the Expenses API for, and what the API says back.</p>
<p><strong>Find it in Wireshark:</strong></p>
<ol>
<li>Start a capture on the loopback adapter with the display filter <code>http</code>. Wait for the sync's next run.</li>
<li>Find the POST from the sync and the response to it. Read the status code in the response's first line.</li>
<li>Right-click the response and choose Follow, then HTTP Stream, to read the whole exchange, including the message the API sends back.</li>
</ol>
<p><strong>Fix it:</strong> the sync's settings are in <code>C:\PurveX\Apps\Expenses\expenses.ini</code>. Point <code>ApiUrl</code> where the API's message tells you to. CHG-3304 said clients need no changes. It was wrong.</p>
<p><strong>Prove it:</strong> on the next run, the POST goes to the new path and the response is <strong>200 OK</strong>.</p>
<p><strong>Fixed when:</strong> the expense sync calls the v2 API.</p>
<p><strong>Report:</strong> the HTTP status code the API returned before your fix.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Expense Claims Won't Go Through" placeholder="a status code" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{410}" data-accept="410 Gone">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>This time the handshake completes and the request arrives, so DNS, routing and the port are all fine. The problem is one layer up: the API understood the request and refused it. HTTP status codes say why. Codes in the 400s mean the client asked for something wrong, and codes in the 500s mean the server failed.</p>
<ul>
<li><code>http.response.code &gt;= 400</code> shows only the error responses.</li>
<li>Edit the file in Notepad, run as administrator. The sync reads it on every run, so there is nothing to restart.</li>
</ul>
<p>In PowerShell:</p>
<ul>
<li><code>(Get-Content C:\PurveX\Apps\Expenses\expenses.ini) -replace '/api/v1/expenses', '/api/v2/expenses' | Set-Content C:\PurveX\Apps\Expenses\expenses.ini</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="404|404 not found">Close, but read the status line itself. This API says more than "not found".</div>
<div class="ad-miss" data-guess="200|200 ok">That is the answer after the fix. Report the code from before it.</div>
<div class="ad-miss" data-guess="500|503">Those are server failures. Read the status line in the response to the sync's POST.</div>
<div class="ad-miss" data-guess="/api/v2/expenses|api/v2/expenses">That is the fix. Report the status code the API returned before it.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{410}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>410 Gone means "this existed and was removed on purpose", and the API's message even said where to go instead. The upgrade retired v1, and the client still called it, so every claim bounced while the network looked perfectly healthy. Reading the HTTP exchange turned a vague "remote server returned an error" into a one-line fix.</p>
</div>
<div>
<span>What to do</span>
<p>Ask Taylor to check that this morning's claims arrive, and note in CHG-3304 that clients did need a change, so the vendor's release notes get read next time.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="w3-05" data-attempts="0">
<span class="ad-mission__num">Ticket 05 · Stretch · Protocols and TLS · Critical · Wireshark · INC-1092</span>
<h4>Read the Password Off the Wire</h4>
<p><strong>Jordan Ellis · Finance · 11:30 AM</strong><br>While you're in there: our old report sync sends the daily ledger report every minute, signing in with its service account. The vendor promised the password is "stored encrypted", so we've never worried about it. Is that the whole story?</p>
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
