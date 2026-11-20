<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Monday After the Cutover</h3>
<p class="ad-brief__ask">Over the weekend a contractor, NetBridge Services, moved PurveX Financial's intranet apps off an old server, PORTAL01, onto <strong>web01</strong>, the firm's Ubuntu application server, and signed the change off as "nothing outstanding". It is Monday morning and the help desk phone has not stopped. You work from <strong>DC01</strong>, the IT workstation, with a shell on web01. Work each ticket the way a network technician would: reproduce the problem from the user's side, narrow it down with the command line, find the cause on the server or in its logs, fix it, then test again from the user's side.</p>
<p>Hosted lab required, with web01 running. A lab you built yourself has the DC01-only version of this challenge instead.</p>
<ul>
<li>The contractor's change log is <code>C:\PurveX\Shares\IT\Network_Change_Log_Nov.txt</code> on DC01. It tells you what changed, not what broke, and it may not list everything.</li>
<li>DC01 stands in for the staff PCs: the apps they use run there, and try again every minute, so there is always fresh traffic to test and capture.</li>
<li>Open web01 from your lab panel, or from DC01 with <code>ssh student@web01</code>. Your web01 password, shown in the lab panel, is also your sudo password.</li>
<li>In Windows PowerShell, type <code>curl.exe</code>, not <code>curl</code>: <code>curl</code> there is a different command.</li>
<li>In Wireshark on DC01, traffic to and from web01 shows on the <strong>Ethernet</strong> adapter. DC01's own lookups to its own DNS server show on <strong>Adapter for loopback traffic capture</strong>. Select both with Ctrl when you are not sure.</li>
</ul>
<table>
<thead><tr><th>What you see from the user's side</th><th>What it means</th></tr></thead>
<tbody>
<tr><td>The name resolves, then the connection times out: SYNs with no reply</td><td>Nothing answers at that address, or a firewall is silently dropping the traffic</td></tr>
<tr><td><strong>Non-existent domain</strong> or <strong>No such name</strong></td><td>The name is missing from DNS, so nothing connects at all</td></tr>
<tr><td><strong>Connection refused</strong>: a SYN answered by a RST</td><td>The server is there, but nothing listens on that address and port</td></tr>
<tr><td>The connection works, then an HTTP error status</td><td>The network is fine. The app refused the request</td></tr>
</tbody>
</table>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 6 solved</span>
</div>

<div class="ad-mission" data-id="w3h-01" data-attempts="0">
<span class="ad-mission__num">Ticket 01 · Warm-up · DNS and Routing · High · ping · nslookup · tracert · CHG-3301 · INC-1095</span>
<h4>The Portal Spins and Gives Up</h4>
<p><strong>Jordan Ellis · Finance · 8:20 AM</strong><br>The intranet portal stopped loading for everyone in Finance this morning. It worked fine on Friday. The browser just spins for ages and then says the site can't be reached.</p>
<p><strong>Task:</strong> From DC01, use ping, nslookup and tracert to find which address <code>portal</code> resolves to and why nothing answers there, then point it at web01, ideally as a CNAME. Report the address it resolved to before your fix.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for The Portal Spins and Gives Up" placeholder="an IP address" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{10.255.255.10}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Spinning for ages, then failing, is a timeout. DNS gave the browser an address, and nothing at that address answers. Work outward one layer at a time: does the name resolve, does the address answer, and does the server the change log names answer instead?</p>
<p>Step by step:</p>
<ol>
<li><code>ping portal</code>. Note the address in the first line, and whether any replies come back.</li>
<li><code>nslookup portal</code>. The <strong>Address</strong> under <strong>Name</strong> is what DNS says. The first Server and Address lines are only the DNS server that answered. Write the portal's address down. It is your answer.</li>
<li><code>tracert -d -h 5</code> followed by that address. Watch where the replies stop.</li>
<li>Compare with web01, where CHG-3301 says the portal lives now: <code>ping web01</code> and <code>curl.exe http://web01/</code>. The server is up and the portal answers there.</li>
</ol>
<ul>
<li>ping may say <strong>Request timed out</strong> or <strong>Destination host unreachable</strong>. Either way, nothing answered at that address.</li>
<li>tracert lists each router on the way. Lines of <code>*</code> mean no reply from that hop. When every line after the first hop or two is stars, the traffic leaves but the destination never answers.</li>
<li>To fix the record, open DNS Manager with Win+R and <code>dnsmgmt.msc</code>. Open Forward Lookup Zones and your domain, delete the <code>portal</code> host record, then right-click the zone and choose New Alias (CNAME), with <code>web01</code> as the target.</li>
</ul>
<p>In PowerShell:</p>
<ul>
<li><code>$zone = (Get-ADDomain).DNSRoot; Remove-DnsServerResourceRecord -ZoneName $zone -RRType A -Name portal -Force</code></li>
<li><code>Add-DnsServerResourceRecordCName -ZoneName $zone -Name portal -HostNameAlias "web01.$zone"</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="127.0.0.1|::1">That is the DNS server nslookup asked, DC01 itself. Report the Address under the Name line.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{10.255.255.10}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>DNS answered with PORTAL01's old address, and every connection to it went unanswered because that server was switched off on Saturday. web01 answered the moment you asked it directly, so the portal was never broken: the change log says "DNS cut over", and it wasn't. ping, nslookup and tracert told you that in under a minute, which is a DNS fix rather than a server fix.</p>
</div>
<div>
<span>What to do</span>
<p>Note the before and after records in CHG-3301, ask Jordan to refresh the page, and add "update DNS and test it from a client" to the migration checklist.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="w3h-02" data-attempts="0">
<span class="ad-mission__num">Ticket 02 · Apply it · DNS · High · Wireshark · nslookup · CHG-3302 · INC-1095</span>
<h4>"Server Not Found" on the Dashboard</h4>
<p><strong>Sam Whitfield · Wealth Management · 8:45 AM</strong><br>The Reports Dashboard on my screen just says "Server not found" this morning. It doesn't even try to load. Nothing else seems wrong.</p>
<p><strong>Task:</strong> Capture the dashboard's DNS lookup in Wireshark to find the exact name it asks for, confirm it with nslookup, then recreate it as a CNAME to web01. Report the name, without the domain.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Server Not Found on the Dashboard" placeholder="a host name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{rptdash}" data-accept="rptdash.purvexfinancial.local">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>"Server not found" straight away, with no spinning, is the opposite of Ticket 01. DNS did not give a wrong address. It said the name does not exist, so there was nothing to connect to. nslookup shows that as <strong>Non-existent domain</strong>, and Wireshark as <strong>No such name</strong>.</p>
<p>Step by step:</p>
<ol>
<li>Users rarely know an app's real host name, so read it off the wire. Start a Wireshark capture on the loopback adapter with the display filter <code>dns</code>, and wait for the dashboard's next refresh.</li>
<li>Find the query that comes back with an error. Read the name in its Queries section and the Reply code in its Flags.</li>
<li>Check it from the command line: <code>nslookup</code> followed by that name. Note what it says instead of an address.</li>
</ol>
<ul>
<li><code>dns.flags.rcode == 3</code> shows only the "No such name" answers.</li>
<li>In DNS Manager, right-click your zone, choose New Alias (CNAME), type the name, and set the target to <code>web01</code>.</li>
</ul>
<p>In PowerShell:</p>
<ul>
<li><code>Add-DnsServerResourceRecordCName -ZoneName (Get-ADDomain).DNSRoot -Name &lt;the name&gt; -HostNameAlias "web01.$((Get-ADDomain).DNSRoot)"</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="dashboard|reportsdashboard|reports">That is what Sam calls it. Report the exact name in the DNS query.</div>
<div class="ad-miss" data-guess="nosuchname|nxdomain|nonexistentdomain|3">That is what DNS answered. Report the name it was asked about.</div>
<div class="ad-miss" data-guess="portal|web01">The dashboard asks for its own name. Look for the query that comes back with No such name.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{rptdash}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The dashboard looks up <code>rptdash</code>, an old alias that pointed at PORTAL01, and CHG-3302 deleted it along with records that really were unused. One "No such name" answer pins the fault on DNS. Without it, "Server not found" sends people off rebooting the PC or blaming the dashboard vendor. A CNAME to web01 means the next server move needs one record changed, not two.</p>
</div>
<div>
<span>What to do</span>
<p>Note the record in CHG-3302, and ask for a list of every name a server answers to before its records are removed next time.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="w3h-03" data-attempts="0">
<span class="ad-mission__num">Ticket 03 · Apply it · TCP/IP · High · curl · ss · systemctl · journalctl · CHG-3303 · INC-1095</span>
<h4>Timesheets: "Connection Refused"</h4>
<p><strong>Riley Kwan · Operations · 9:30 AM</strong><br>The timesheet app won't let anyone in Operations submit this week's hours. It fails instantly with "Connection refused". Payroll closes on Wednesday.</p>
<p><strong>Task:</strong> Reproduce the refusal from DC01 with curl, then on web01 use ss and journalctl to see which address the timesheet service listens on. Fix <code>/etc/purvex/timesheet.conf</code> and restart the service. Report the address it was listening on before your fix.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Timesheets: Connection Refused" placeholder="an IP address" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{127.0.0.1}" data-accept="localhost|127.0.0.1:8085">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>"Connection refused" is fast because something did answer: web01 itself, with a RST. That rules out a dead server, a wrong address and a firewall drop, and points at the service. A service only accepts connections on the addresses it listens on, so compare its Local Address with the address DC01 connects to.</p>
<p>Step by step:</p>
<ol>
<li>From DC01, reproduce the error: <code>curl.exe http://web01:8085/submit</code>. Note the error.</li>
<li>Confirm it on the wire: in Wireshark on DC01's Ethernet adapter, filter <code>tcp.port == 8085</code> and run curl again. web01 answers the SYN with a RST.</li>
<li>On web01, see what is listening: <code>sudo ss -ltnp | grep 8085</code>. Read the Local Address column.</li>
<li>Check the service and its log: <code>systemctl status purvex-timesheet</code>, then <code>journalctl -u purvex-timesheet -n 20</code>.</li>
</ol>
<ul>
<li>In <code>ss</code>, <code>0.0.0.0</code> or <code>*</code> means every address. A loopback address means web01 talking to itself, and nobody else can reach it.</li>
<li>The service prints the address it bound to when it starts, so the journal says it too.</li>
<li>Edit the file with <code>sudo nano /etc/purvex/timesheet.conf</code>. Ctrl+O saves and Ctrl+X exits.</li>
</ul>
<p>In one line:</p>
<ul>
<li><code>sudo sed -i 's/^listen_address = .*/listen_address = 0.0.0.0/' /etc/purvex/timesheet.conf &amp;&amp; sudo systemctl restart purvex-timesheet</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="8085">That is the port. Report the address the service was listening on, from the Local Address column.</div>
<div class="ad-miss" data-guess="0.0.0.0|*">That is the fix. Report the address it was listening on before you changed it.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{127.0.0.1}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The upgrade's new settings file came with the vendor's default, listen on loopback only, which is safe for testing and useless in production. It worked when the contractor tested it on web01 itself, which is exactly why nobody noticed. The RST told you the network and the firewall were fine and the service was the problem, and <code>ss</code> told you why in one line.</p>
</div>
<div>
<span>What to do</span>
<p>Note the setting in CHG-3303, tell Riley's team to resubmit, and add "test from a client, not from the server" to the upgrade checklist.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="w3h-04" data-attempts="0">
<span class="ad-mission__num">Ticket 04 · Apply it · Firewalls · High · Nmap · ufw · Firewall log · CHG-3304 · INC-1095</span>
<h4>Expense Claims Time Out</h4>
<p><strong>Taylor Osei · Finance · 10:15 AM</strong><br>None of this morning's expense claims have reached the approval queue. The expense sync just says "The operation has timed out". Everything else on web01 seems to work.</p>
<p><strong>Task:</strong> Use Nmap from DC01 to see how the Expenses API's port answers, then on web01 check the service with ss and the firewall with ufw and its log, and fix the firewall. Report the port the old rule still allowed.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Expense Claims Time Out" placeholder="a port number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{8080}" data-accept="8080/tcp">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A timeout with a server that answers ping and serves other ports points at a firewall. Nmap tells the two failures apart: <strong>closed</strong> means the server sent a RST, and <strong>filtered</strong> means nothing came back at all, because something dropped the probe. The service listening in <code>ss</code> proves the app is fine, and the ufw log proves who dropped the traffic.</p>
<p>Step by step:</p>
<ol>
<li>On DC01, read where the sync sends its claims: <code>Get-Content C:\PurveX\Apps\Expenses\expenses.ini</code>. Note the port.</li>
<li>Scan that port and the timesheet port together: <code>nmap -p 8085,&lt;the port&gt; web01</code>. Compare their states.</li>
<li>On web01, check the service is listening: <code>sudo ss -ltn | grep &lt;the port&gt;</code>. Then look at the firewall: <code>sudo ufw status numbered</code>.</li>
<li>Find the evidence in the firewall log: <code>sudo grep "DPT=&lt;the port&gt;" /var/log/ufw.log | tail -5</code>. Each line is a packet ufw dropped. Read its SRC and DST.</li>
</ol>
<ul>
<li>ufw lists its rules by port, with the comment the person who added them left.</li>
<li><code>sudo journalctl -k | grep "UFW BLOCK"</code> shows the same drops from the kernel's log.</li>
</ul>
<p>On web01:</p>
<ul>
<li><code>sudo ufw allow &lt;the new port&gt;/tcp comment 'Expenses API'</code></li>
<li><code>sudo ufw delete allow &lt;the old port&gt;/tcp</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="8090|8090/tcp">That is the port being dropped, the one the API listens on now. Report the port the old rule still allows.</div>
<div class="ad-miss" data-guess="8085|22|80|3389|9500">That rule belongs to another service. Find the rule whose comment names the Expenses API.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{8080}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The upgrade moved the API from 8080 to 8090 and the firewall rule stayed on 8080, so web01 silently dropped every claim. "Firewall updated" was the change log's claim, and the ufw log was the proof it wasn't. Filtered in Nmap, listening in ss and a BLOCK line naming DC01 is a complete case: the app is up, the network is fine, and one rule is wrong.</p>
</div>
<div>
<span>What to do</span>
<p>Note both rule changes in CHG-3304, ask Taylor to check this morning's claims arrive, and make "update the firewall rule, then test from a client" part of every port change.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="w3h-06" data-attempts="0">
<span class="ad-mission__num">Ticket 05 · Apply it · Common Ports · High · Nmap · systemctl · auth.log · INC-1095</span>
<h4>The Backup Agent Nobody Turned Back On</h4>
<p><strong>Alex Rivera · IT · 10:45 AM</strong><br>This morning's backup report says web01 is unreachable. Find out why, get the agent back, and tell me who stopped it. It isn't in the change log.</p>
<p><strong>Task:</strong> Check the backup agent with Nmap from DC01 and systemctl on web01, find who stopped it in the sudo log, then enable and start it. Report the account that stopped it.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for The Backup Agent Nobody Turned Back On" placeholder="an account name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{nb.ellison}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A port Nmap reports as <strong>closed</strong> means web01 answered with a RST: it is up and reachable, and the firewall let the probe through, but nothing is listening. So the problem is the program that should be listening. systemd says what state it is in, and sudo logs who ran the command that put it there.</p>
<p>Step by step:</p>
<ol>
<li>On DC01, read <code>C:\PurveX\Shares\IT\Backup_Report_Mon.txt</code>. Note the port the backup server connects to.</li>
<li>Scan it the way the backup server sees it: <code>nmap -sV -p</code> followed by the port and <code>web01</code>. Note the state.</li>
<li>On web01: <code>systemctl status purvex-backup-agent</code>. Read the <strong>Loaded</strong> and <strong>Active</strong> lines.</li>
<li>Find who did it. Every sudo command is logged: <code>sudo grep purvex-backup-agent /var/log/auth.log</code>.</li>
</ol>
<p>The fix:</p>
<p class="ad-cmd"><code>sudo systemctl enable --now purvex-backup-agent</code></p>
<ul>
<li><strong>disabled</strong> on the Loaded line means it will not start at boot. <strong>inactive (dead)</strong> means it is not running now.</li>
<li>In auth.log, a sudo line reads: the account, then where they were, then <code>USER=root ; COMMAND=</code> and what they ran.</li>
<li><code>sudo journalctl _COMM=sudo | grep purvex-backup</code> finds the same line in the journal.</li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="9500">That is the port. Report the account the sudo log shows running the command.</div>
<div class="ad-miss" data-guess="root">sudo runs the command as root. Report the account that ran sudo, the first name on the line.</div>
<div class="ad-miss" data-guess="student">That is you. Look for the line from before you logged in, the one that disabled the agent.</div>
<div class="ad-miss" data-guess="netbridge|netbridgeservices">That is the company. Report the account named in the sudo log.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{nb.ellison}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The contractor's engineer stopped and disabled the backup agent "for the cutover", never turned it back on, and never logged it, so nobody knew to check. Nmap said closed, systemd said disabled, and the sudo log said who. A server with no backups is the kind of gap you only find out about when you need a restore.</p>
</div>
<div>
<span>What to do</span>
<p>Ask the backup team to run a backup of web01 now, raise the unlogged change with NetBridge, and add "every service stopped during a change is listed in the change" to the contract. The account is already locked, which is right for a contractor who has finished.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="w3h-05" data-attempts="0">
<span class="ad-mission__num">Ticket 06 · Stretch · Protocols and TLS · Critical · Wireshark · INC-1057</span>
<h4>A Password Crossing the Wire</h4>
<p><strong>Alex Rivera · IT · 11:30 AM</strong><br>While you're capturing: web01's settlement job signs in to the directory every few minutes with svc-settlements, then pulls the settlement batch from the Finance share. Is that sign-in protected on the wire?</p>
<p><strong>Task:</strong> Capture the settlement job's LDAP sign-in on DC01's Ethernet adapter, read its password, then disable <code>svc-settlements</code>. Report the password.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for A Password Crossing the Wire" placeholder="the password" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{Autumn2026}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>An LDAP <strong>simple</strong> bind sends the account name and password exactly as typed. On port 389, without TLS, that means in clear text, and Wireshark shows it in the <code>simple</code> field of the bind request.</p>
<p>Step by step:</p>
<ol>
<li>On DC01, capture on the Ethernet adapter. This traffic comes from web01, so it really crosses the network.</li>
<li>The job runs every three minutes. Filter <code>ldap</code> and wait for a <strong>bindRequest</strong>.</li>
<li>Open it, expand Lightweight Directory Access Protocol, and read the authentication it sent.</li>
</ol>
<ul>
<li><code>ldap.simple</code> as a display filter shows only binds that carry a password.</li>
<li>Disable the account in Active Directory Users and Computers, or with <code>Disable-ADAccount svc-settlements</code>.</li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="svc-settlements|svc-settlements@purvexfinancial.local">That is the account name, in the bind's name field. Report the password in the simple field.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{Autumn2026}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A simple bind on plain LDAP is a password sent in clear text across the network every three minutes. Anyone with a capture point between web01 and DC01 has the account, and through it the settlement batch on the Finance share. The job worked, so nobody looked at how.</p>
</div>
<div>
<span>What to do</span>
<p>Keep the account disabled, give the job a new password, and bring it back on LDAPS (port 636) or with a signed bind, then capture again to prove the password no longer shows.</p>
</div>
</div>
</div>
</div>
