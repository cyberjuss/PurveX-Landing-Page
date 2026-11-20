<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>The Network Change That Went Wrong</h3>
<p class="ad-brief__ask">A contractor, NetBridge Services, ran a network change on DC01 over the weekend and signed it off as "nothing outstanding". It is Monday morning and the help desk phone has not stopped. Work each ticket the way a network technician would: start with the command-line tools to narrow the problem down, confirm it in Wireshark or the logs, fix the configuration, then test again to prove it works.</p>
<ul>
<li>The contractor's change log is <code>C:\PurveX\Shares\IT\Network_Change_Log_Nov.txt</code>. It tells you what changed, not what broke, and it may not list everything.</li>
<li>The apps the callers use run on DC01 and try again every minute, so there is always fresh traffic to test and capture.</li>
<li>Run the commands in PowerShell on DC01. Type <code>curl.exe</code>, not <code>curl</code>: in Windows PowerShell, <code>curl</code> is a different command.</li>
<li>Traffic DC01 sends to itself, including to its own address, shows in Wireshark on <strong>Adapter for loopback traffic capture</strong>. Traffic leaving the machine shows on its <strong>Ethernet</strong> adapter. Select both with Ctrl when you are not sure.</li>
<li>If you have not yet, install <strong>Wireshark</strong> and <strong>Nmap</strong> from <code>wireshark.org/download</code> and <code>nmap.org/download</code>. When the installer offers Npcap, keep its loopback option ticked.</li>
</ul>
<table>
<thead><tr><th>What you see</th><th>What it means</th></tr></thead>
<tbody>
<tr><td>The name resolves, then the connection times out: SYNs with no reply</td><td>The address is wrong, or nothing is there</td></tr>
<tr><td><strong>Non-existent domain</strong> from nslookup, <strong>No such name</strong> in Wireshark</td><td>The name is missing from DNS, so nothing connects at all</td></tr>
<tr><td><strong>Connection refused</strong>: a SYN answered by a RST</td><td>The machine is there, but nothing listens on that address and port</td></tr>
<tr><td>The connection works, then an HTTP 4xx or 5xx status</td><td>The network is fine. The app refused the request</td></tr>
</tbody>
</table>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 6 solved</span>
</div>

<div class="ad-mission" data-id="w3-01" data-attempts="0">
<span class="ad-mission__num">Ticket 01 · Warm-up · DNS and Routing · High · ping · nslookup · tracert · CHG-3301 · INC-1092</span>
<h4>The Portal Spins and Gives Up</h4>
<p><strong>Jordan Ellis · Finance · 8:20 AM</strong><br>The intranet portal stopped loading for everyone in Finance this morning. It worked fine on Friday. The browser just spins for ages and then says the site can't be reached.</p>
<p><strong>Look for:</strong> which address <code>portal</code> resolves to, and how far a connection to it gets.</p>
<p><strong>Narrow it down:</strong></p>
<ol>
<li><code>ping portal</code>. Note the address in the first line, and whether any replies come back.</li>
<li><code>nslookup portal</code>. The <strong>Address</strong> under <strong>Name</strong> is what DNS says. The first Server and Address lines are only the DNS server that answered. Write the portal's address down. It is your answer.</li>
<li><code>tracert -d -h 5</code> followed by that address. Watch where the replies stop.</li>
<li>Confirm it: <code>Test-NetConnection portal -Port 80</code> reports <strong>TcpTestSucceeded : False</strong>. In Wireshark on Ethernet, the SYNs to that address go out again and again with nothing coming back.</li>
</ol>
<p><strong>Fix it:</strong> CHG-3301 says where the portal lives now. Point the <code>portal</code> record there.</p>
<p><strong>Prove it:</strong> clear the DNS cache and test the name again. nslookup now returns DC01's address, ping gets replies, and the portal answers with the intranet page.</p>
<p class="ad-cmd"><code>Clear-DnsClientCache; nslookup portal; ping portal; curl.exe http://portal/</code></p>
<p><strong>Fixed when:</strong> <code>portal</code> resolves to DC01.</p>
<p><strong>Report:</strong> the address <code>portal</code> resolved to before your fix.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for The Portal Spins and Gives Up" placeholder="an IP address" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{10.255.255.10}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Spinning for ages, then failing, is a timeout. DNS gave the browser an address, and nothing at that address answers. Work outward one layer at a time: does the name resolve, does the address answer, and how far does the traffic get?</p>
<ul>
<li>ping may say <strong>Request timed out</strong> or <strong>Destination host unreachable</strong>. Either way, nothing answered at that address.</li>
<li>tracert lists each router on the way. Lines of <code>*</code> mean no reply from that hop. When every line after the first hop or two is stars, the traffic is leaving but the destination never answers.</li>
<li>To fix the record, open DNS Manager with Win+R and <code>dnsmgmt.msc</code>. Open Forward Lookup Zones and your domain, then change <code>portal</code> to the domain controller's address, which <code>ipconfig</code> shows.</li>
</ul>
<p>In PowerShell:</p>
<ul>
<li><code>$zone = (Get-ADDomain).DNSRoot; Remove-DnsServerResourceRecord -ZoneName $zone -RRType A -Name portal -Force</code></li>
<li><code>Add-DnsServerResourceRecordA -ZoneName $zone -Name portal -IPv4Address (Get-DnsServerResourceRecord -ZoneName $zone -Name $env:COMPUTERNAME -RRType A)[0].RecordData.IPv4Address</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="@dcip">That is where the portal lives now, the address you fixed it to. Report the address it resolved to before your fix.</div>
<div class="ad-miss" data-guess="127.0.0.1|::1">That is the DNS server nslookup asked, DC01 itself. Report the Address under the Name line.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{10.255.255.10}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>DNS answered with PORTAL01's old address, and every connection to it went unanswered because that server was switched off on Saturday. The change log says "DNS cut over", and it wasn't. ping, nslookup and tracert together told you in under a minute that the name resolves but the address is dead, which is a DNS problem rather than a broken portal or a broken network.</p>
</div>
<div>
<span>What to do</span>
<p>Note the before and after addresses in CHG-3301, ask Jordan to refresh the page, and add "update DNS and test it" to the migration checklist.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="w3-02" data-attempts="0">
<span class="ad-mission__num">Ticket 02 · Apply it · DNS · High · nslookup · Wireshark · CHG-3302 · INC-1092</span>
<h4>"Server Not Found" on the Dashboard</h4>
<p><strong>Sam Whitfield · Wealth Management · 8:45 AM</strong><br>The Reports Dashboard on my screen just says "Server not found" this morning. It doesn't even try to load. Nothing else seems wrong.</p>
<p><strong>Look for:</strong> the exact name the dashboard asks DNS for, and what DNS says back.</p>
<p><strong>Narrow it down:</strong></p>
<ol>
<li>Users rarely know an app's real host name, so read it off the wire. Start a Wireshark capture on the loopback adapter with the display filter <code>dns</code>, and wait for the dashboard's next refresh.</li>
<li>Find the query that comes back with an error. Read the name in its Queries section and the Reply code in its Flags.</li>
<li>Check it from the command line: <code>nslookup</code> followed by that name. Note what it says instead of an address.</li>
</ol>
<p><strong>Fix it:</strong> CHG-3302 removed the records PORTAL01 "no longer needs". The dashboard is served by the portal on DC01, so create an A record for that name, pointing at DC01.</p>
<p><strong>Prove it:</strong> <code>nslookup</code> for the name returns DC01's address. In Wireshark, the dashboard's next query gets an answer and its HTTP request ends in <strong>200 OK</strong>.</p>
<p><strong>Fixed when:</strong> the name the dashboard asks for resolves to DC01.</p>
<p><strong>Report:</strong> the name the dashboard looks up, without the domain.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Server Not Found on the Dashboard" placeholder="a host name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{rptdash}" data-accept="rptdash.purvexfinancial.local">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>"Server not found" straight away, with no spinning, is the opposite of Ticket 01. DNS did not give a wrong address. It said the name does not exist, so there was nothing to connect to. nslookup shows that as <strong>Non-existent domain</strong>, and Wireshark as <strong>No such name</strong>.</p>
<ul>
<li><code>dns.flags.rcode == 3</code> shows only the "No such name" answers.</li>
<li>Create the record in DNS Manager: right-click your zone, choose New Host (A or AAAA), and type the name and DC01's address.</li>
</ul>
<p>In PowerShell:</p>
<ul>
<li><code>Add-DnsServerResourceRecordA -ZoneName (Get-ADDomain).DNSRoot -Name &lt;the name&gt; -IPv4Address &lt;DC01's address&gt;</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="dashboard|reportsdashboard|reports">That is what Sam calls it. Report the exact name in the DNS query.</div>
<div class="ad-miss" data-guess="nosuchname|nxdomain|nonexistentdomain|3">That is what DNS answered. Report the name it was asked about.</div>
<div class="ad-miss" data-guess="portal">The dashboard asks for its own name, not the portal's. Look for the query that comes back with No such name.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{rptdash}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The dashboard looks up <code>rptdash</code>, an old alias that lived on PORTAL01, and CHG-3302 deleted it along with records that really were unused. One "No such name" answer pins the fault on DNS. Without it, "Server not found" sends people off rebooting the PC or blaming the dashboard vendor.</p>
</div>
<div>
<span>What to do</span>
<p>Note the record you added in CHG-3302, and ask for a list of every name a server answers to before its records are removed next time.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="w3-03" data-attempts="0">
<span class="ad-mission__num">Ticket 03 · Apply it · TCP/IP · High · curl · netstat · CHG-3303 · INC-1092</span>
<h4>Timesheets: "Connection Refused"</h4>
<p><strong>Riley Kwan · Operations · 9:30 AM</strong><br>The timesheet app won't let anyone in Operations submit this week's hours. It fails instantly with "Connection refused". The app connects to DC01 on port 8085. Payroll closes on Wednesday.</p>
<p><strong>Look for:</strong> why DC01 refuses a connection to its own address on port 8085.</p>
<p><strong>Narrow it down:</strong></p>
<ol>
<li>Find DC01's address with <code>ipconfig</code>, then reproduce the error: <code>curl.exe http://&lt;DC01's address&gt;:8085/submit</code>. Note the error.</li>
<li>See what is listening on that port: <code>netstat -ano | findstr :8085</code>. Read the Local Address column and the State.</li>
<li>Confirm it: in Wireshark on the loopback adapter, filter <code>tcp.port == 8085</code> and run the curl command again. The SYN is answered by a RST.</li>
</ol>
<p><strong>Fix it:</strong> the service's settings are in <code>C:\PurveX\Apps\Timesheet\timesheet.ini</code>, from CHG-3303. Set it to listen on every address, <code>0.0.0.0</code>, then restart the <strong>PurveX Timesheet Service</strong> task in Task Scheduler.</p>
<p><strong>Prove it:</strong> <code>netstat</code> now shows <code>0.0.0.0:8085</code> LISTENING, and the same curl command returns <strong>Timesheet saved.</strong></p>
<p><strong>Fixed when:</strong> the timesheet service is listening on DC01's network address.</p>
<p><strong>Report:</strong> the address the service was listening on before your fix.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Timesheets: Connection Refused" placeholder="an IP address" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{127.0.0.1}" data-accept="localhost|127.0.0.1:8085">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>"Connection refused" is fast because something did answer: DC01's own network stack, with a RST. That rules out a dead server or a wrong address, and points at the service. A service only accepts connections on the addresses it listens on, so compare netstat's Local Address with the address the app connects to.</p>
<ul>
<li>A Local Address of <code>0.0.0.0</code> means every IPv4 address. A loopback address means this machine talking to itself, and nobody else can reach it.</li>
<li>The last column of netstat is the process ID. <code>Get-Process -Id</code> followed by it shows which program owns the port.</li>
<li>Edit the file in Notepad, run as administrator. In Task Scheduler, right-click the task, End it, then Run it.</li>
</ul>
<p>In PowerShell:</p>
<ul>
<li><code>(Get-Content C:\PurveX\Apps\Timesheet\timesheet.ini) -replace '^ListenAddress=.*', 'ListenAddress=0.0.0.0' | Set-Content C:\PurveX\Apps\Timesheet\timesheet.ini</code></li>
<li><code>Stop-ScheduledTask "PurveX Timesheet Service"; Start-ScheduledTask "PurveX Timesheet Service"</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="8085">That is the port. Report the address the service was listening on, from netstat's Local Address.</div>
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
<p>The upgrade's new settings file came with the vendor's default, listen on loopback only, which is safe for testing and useless in production. It worked when the contractor tested it on the server itself, which is exactly why nobody noticed. The RST told you the network was fine and the service was the problem, and netstat told you why in one line.</p>
</div>
<div>
<span>What to do</span>
<p>Note the setting in CHG-3303, tell Riley's team to resubmit, and add "test from a client, not from the server" to the upgrade checklist.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="w3-04" data-attempts="0">
<span class="ad-mission__num">Ticket 04 · Apply it · Protocols: HTTP · High · curl · Wireshark · CHG-3304 · INC-1092</span>
<h4>Expense Claims Won't Go Through</h4>
<p><strong>Taylor Osei · Finance · 10:15 AM</strong><br>None of this morning's expense claims have reached the approval queue. The expense sync just logs "The remote server returned an error". The network seems fine, since everything else works.</p>
<p><strong>Look for:</strong> what the expense sync asks the Expenses API for, and what the API says back.</p>
<p><strong>Narrow it down:</strong></p>
<ol>
<li>Read where the sync sends its claims: <code>Get-Content C:\PurveX\Apps\Expenses\expenses.ini</code>.</li>
<li>Send the same request yourself and show the whole response: <code>curl.exe -i -X POST</code> followed by that ApiUrl. The first line is the status code, and the last line is the API's own message.</li>
<li>Confirm it: in Wireshark on the loopback adapter, filter <code>http</code> and wait for the sync's next run. Its POST gets the same response. Right-click it and choose Follow, then HTTP Stream, to read the whole exchange.</li>
</ol>
<p><strong>Fix it:</strong> point <code>ApiUrl</code> in <code>expenses.ini</code> where the API's message tells you to. CHG-3304 said clients need no changes. It was wrong.</p>
<p><strong>Prove it:</strong> curl to the new URL returns <strong>200 OK</strong>, and in Wireshark the sync's next POST does too.</p>
<p><strong>Fixed when:</strong> the expense sync calls the v2 API.</p>
<p><strong>Report:</strong> the HTTP status code the API returned before your fix.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Expense Claims Won't Go Through" placeholder="a status code" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{410}" data-accept="410 Gone">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>This time the connection is made and the request arrives, so DNS, routing and the port are all fine. The problem is one layer up: the API understood the request and refused it. HTTP status codes say why. Codes in the 400s mean the client asked for something wrong, and codes in the 500s mean the server failed.</p>
<ul>
<li><code>-i</code> tells curl to print the response headers, including the status line, and not only the body.</li>
<li><code>http.response.code &gt;= 400</code> in Wireshark shows only the error responses.</li>
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
<div class="ad-miss" data-guess="500|503">Those are server failures. Read the status line in the response to the POST.</div>
<div class="ad-miss" data-guess="/api/v2/expenses|api/v2/expenses">That is the fix. Report the status code the API returned before it.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{410}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>410 Gone means "this existed and was removed on purpose", and the API's message even said where to go instead. The upgrade retired v1, and the client still called it, so every claim bounced while the network looked perfectly healthy. One curl command turned a vague "remote server returned an error" into a one-line fix.</p>
</div>
<div>
<span>What to do</span>
<p>Ask Taylor to check that this morning's claims arrive, and note in CHG-3304 that clients did need a change, so the vendor's release notes get read next time.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="w3-06" data-attempts="0">
<span class="ad-mission__num">Ticket 05 · Apply it · Common Ports · High · Nmap · netstat · Event Viewer · INC-1092</span>
<h4>Two Nights Without a Backup</h4>
<p><strong>Alex Rivera · IT · 10:45 AM</strong><br>This morning's backup report says DC01 has been unreachable for two nights. Find out why, get the agent back, and tell me who stopped it. It isn't in the change log.</p>
<p><strong>Look for:</strong> whether DC01's backup agent port is open, whether anything is listening on it, and what the logs say happened to it.</p>
<p><strong>Narrow it down:</strong></p>
<ol>
<li>Read the report: <code>C:\PurveX\Shares\IT\Backup_Report_Mon.txt</code>. Note the port the backup server connects to.</li>
<li>Scan that port the way the backup server sees it: <code>nmap -sV -p</code> followed by the port and DC01's address. Note the state.</li>
<li>Check whether anything is listening: <code>netstat -ano | findstr :</code> followed by the port.</li>
<li>Find out what happened to it. Open Event Viewer with <code>eventvwr.msc</code>, go to Windows Logs, then Application, and look for events from the backup agent.</li>
</ol>
<p><strong>Fix it:</strong> the agent runs as the <strong>PurveX Backup Agent</strong> task. Enable it and start it.</p>
<p><strong>Prove it:</strong> netstat shows the port LISTENING, and the same nmap scan shows it <strong>open</strong>. Nmap does not recognise the agent, so its SERVICE column only guesses from the port number, but the fingerprint it prints under the results contains the agent's own greeting, <strong>PurveX Backup Agent</strong>.</p>
<p><strong>Fixed when:</strong> the backup agent is listening on its port on DC01's network address.</p>
<p><strong>Report:</strong> the account that stopped the agent, without the domain.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Two Nights Without a Backup" placeholder="an account name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{nb.ellison}" data-accept="PURVEX\nb.ellison">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A port Nmap reports as <strong>closed</strong> means the machine answered with a RST: it is up and reachable, but nothing is listening. netstat confirms it from the inside. So the problem is not the network or the firewall, it is the program that should be listening, and the logs record who touched it.</p>
<ul>
<li>In Event Viewer, click Filter Current Log on the right and choose the backup agent from the Event sources list.</li>
<li><code>Get-EventLog -LogName Application -Source "PurveX Backup Agent" -Newest 5 | Format-List TimeGenerated, Message</code> shows the same events in PowerShell.</li>
<li>In Task Scheduler, right-click the task, choose Enable, then Run.</li>
</ul>
<p>In PowerShell:</p>
<ul>
<li><code>Enable-ScheduledTask "PurveX Backup Agent"; Start-ScheduledTask "PurveX Backup Agent"</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="9500">That is the port. Report the account the Application log says stopped the agent.</div>
<div class="ad-miss" data-guess="system|nt authority\system|administrator">That is not the account in the backup agent's event. Read the message of the event the agent's source logged.</div>
<div class="ad-miss" data-guess="netbridge|netbridge services">That is the company. Report the account named in the event.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{nb.ellison}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The contractor's engineer paused the backup agent "for the cutover" and never turned it back on, and because it was never logged as a change, nobody knew to check. Nmap said the port was closed, netstat said nothing was listening, and the Application log said who did it and why. Two nights of missed backups on a domain controller is the kind of gap you only find out about when you need a restore.</p>
</div>
<div>
<span>What to do</span>
<p>Ask the backup team to run a backup of DC01 now, raise the unlogged change with NetBridge, and add "every service stopped during a change is listed in the change" to the contract.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="w3-05" data-attempts="0">
<span class="ad-mission__num">Ticket 06 · Stretch · Protocols and TLS · Critical · Wireshark · INC-1092</span>
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
