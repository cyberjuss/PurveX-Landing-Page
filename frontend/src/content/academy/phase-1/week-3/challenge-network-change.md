<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>The Network Change That Went Wrong</h3>
<p class="ad-brief__ask">A contractor ran a network change at PurveX Financial over the weekend. It's Monday, and the cleanup they promised never happened. Can you read their change log, find what they left behind, and put it right?</p>
<p>The contractor's changes are already in your lab, and their change log is in the IT share. Read it the way you would on the job, treating every line as a change that someone now has to check.</p>
<p>If you haven't yet, install <strong>Nmap</strong> and <strong>Wireshark</strong> on your domain controller from <code>nmap.org/download</code> and <code>wireshark.org/download</code>, and keep the Npcap option ticked, including loopback support, when the installers offer it.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 5 solved</span>
</div>

<div class="ad-mission" data-id="w3-01" data-attempts="0">
<span class="ad-mission__num">Ticket 01 · TCP/IP · High · CHG-3301 · INC-1092</span>
<h4>Fix the Portal's Address</h4>
<p><strong>Jordan Ellis · Finance · 8:20 AM</strong><br>The intranet portal won't load for anyone in Finance this morning. It worked on Friday. The browser just spins and gives up.</p>
<p><strong>Task:</strong> Find out what address <code>portal</code> resolves to, compare it with the change log, and point the record at the portal's new home. Then report the address it was stuck on.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Fix the Portal's Address" placeholder="an IP address" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{10.255.255.10}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Before any connection can start, the name has to become an address. If DNS still points at a server that was switched off, every connection goes to a machine that isn't there.</p>
<ol>
<li>Resolve <code>portal</code> and note the address it returns.</li>
<li>Read CHG-3301 in <code>C:\PurveX\Shares\IT\Network_Change_Log_Nov.txt</code> to see where the portal lives now.</li>
<li>Open DNS Manager with Win+R and <code>dnsmgmt.msc</code>, open Forward Lookup Zones and your domain, and change the <code>portal</code> record to the domain controller's address.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Resolve-DnsName portal</code></li>
<li><code>$zone = (Get-ADDomain).DNSRoot; Remove-DnsServerResourceRecord -ZoneName $zone -RRType A -Name portal -Force</code></li>
<li><code>Add-DnsServerResourceRecordA -ZoneName $zone -Name portal -IPv4Address (Get-DnsServerResourceRecord -ZoneName $zone -Name $env:COMPUTERNAME -RRType A)[0].RecordData.IPv4Address</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="@dcip">That's the address it should point at now. Report the old address the record was stuck on.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{10.255.255.10}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The portal itself was fine. The name still pointed at PORTAL01, a server that was switched off on Saturday, so every browser sent its connection to a machine that would never answer. A stale record after a migration is one of the most common Monday tickets there is.</p>
</div>
<div>
<span>What to do</span>
<p>Update the record, confirm <code>portal</code> now resolves to the domain controller, and ask Jordan to try again. Then add "update DNS" to the migration checklist, so the next move doesn't repeat this.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="w3-02" data-attempts="0">
<span class="ad-mission__num">Ticket 02 · Three-Way Handshake · High · Nmap · INC-1092</span>
<h4>Scan What the Change Left Open</h4>
<p><strong>Alex Rivera · IT · 9:05 AM</strong><br>Before we trust anything in that change log, I want to see DC01 the way an attacker on our network would. Scan it and tell me what's listening that shouldn't be.</p>
<p><strong>Task:</strong> Scan the domain controller's own address with Nmap. Compare the open ports with what a domain controller normally runs, and report the port that doesn't belong.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Scan What the Change Left Open" placeholder="a port number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{23}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A connect scan, <code>-sT</code>, completes the three-way handshake with each port. A SYN-ACK back means open, a reset means closed, and silence means something filtered it. <code>-sV</code> also asks each open port what it is. Only scan systems you're authorized to scan, which on the job means a signed-off scope.</p>
<ol>
<li>Find the domain controller's address with <code>ipconfig</code>.</li>
<li>Run <code>nmap -sT -sV</code> followed by that address.</li>
<li>Read the PORT, STATE and SERVICE columns. A domain controller normally shows DNS, Kerberos, LDAP, SMB, RPC and Remote Desktop. Look for the one that isn't on that list.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="53|88|135|139|389|445|464|593|636|3268|3269|3389|5985|9389">That's a normal domain controller service. Look down the list for a port and service that came from the contractor.</div>
<div class="ad-miss" data-guess="25">Port 25 is outbound in the change log, so a scan of what DC01 listens on won't show it. Look for a port that's open inbound.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{23}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Nmap showed port 23 open, with the vendor's console answering as Telnet. The change log told you to expect it, but the scan is what proves it's still there. Checking a server with a scan after every change is how network and security teams catch what a change log forgets to mention.</p>
</div>
<div>
<span>What to do</span>
<p>Save the scan output in the ticket as your before picture. Close the port in the next ticket, then scan again to show the after picture.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="w3-03" data-attempts="0">
<span class="ad-mission__num">Ticket 03 · Common Ports · High · Change Control · INC-1092</span>
<h4>Close the Vendor's Door</h4>
<p><strong>Alex Rivera · IT · 9:40 AM</strong><br>Telnet on our domain controller, open to the whole network. Shut it down: the rule and the console behind it. And tell me which change in the log opened it, so I can raise it with the contractor.</p>
<p><strong>Task:</strong> Disable the inbound rule that lets port 23 in, stop and disable the vendor's console task, and report the change number that opened it.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Close the Vendor's Door" placeholder="a change number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{CHG-3302}" data-accept="3302">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Closing it properly takes two steps: the firewall rule that lets traffic in, and the program that answers. The change log names the change.</p>
<ol>
<li>Open <code>wf.msc</code>, find the vendor rule under Inbound Rules, and disable it.</li>
<li>Open Task Scheduler with <code>taskschd.msc</code>, then end and disable the NetBridge console task.</li>
<li>Read <code>C:\PurveX\Shares\IT\Network_Change_Log_Nov.txt</code> for the change that started it.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Disable-NetFirewallRule -DisplayName "PurveX Legacy - Vendor Telnet"</code></li>
<li><code>Stop-ScheduledTask "NetBridge Vendor Console"; Disable-ScheduledTask "NetBridge Vendor Console"</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="chg-3301|chg-3303|3301|3303">That change is about something else. Find the one that started the console and opened its port.</div>
<div class="ad-miss" data-guess="23">That's the port. Report the change number from the log that opened it.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{CHG-3302}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Telnet sends everything, passwords included, in plain text. It sat open on the domain controller for a job that ended on Sunday night. Tying the finding to CHG-3302 turns "someone left a port open" into a change that can be reopened, closed properly and raised with the contractor.</p>
</div>
<div>
<span>What to do</span>
<p>Scan again to confirm port 23 is no longer listening, record the before and after in CHG-3302, and close it. Make removing temporary access part of signing off every change.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="w3-04" data-attempts="0">
<span class="ad-mission__num">Ticket 04 · Protocols · High · CHG-3303 · INC-1092</span>
<h4>Why Is the DC Sending Mail?</h4>
<p><strong>Alex Rivera · IT · 10:10 AM</strong><br>A domain controller has no business sending email. The last line of the change log says they opened something outbound for a test. Find it and shut it.</p>
<p><strong>Task:</strong> Find the outbound rule from CHG-3303, switch it off, and name the protocol it let out.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Why Is the DC Sending Mail?" placeholder="a protocol" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{smtp}" data-accept="simple-mail-transfer-protocol">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>This one is an Outbound rule, not an Inbound one. Its port tells you the protocol, because email leaves a server on a well-known port.</p>
<ol>
<li>In <code>wf.msc</code>, open Outbound Rules and find the contractor's relay rule.</li>
<li>Read its remote port, then disable the rule.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-NetFirewallRule -DisplayName "PurveX Relay*" | Get-NetFirewallPortFilter</code></li>
<li><code>Disable-NetFirewallRule -DisplayName "PurveX Relay - Outbound Mail"</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="25">That's the port. Name the protocol that uses it.</div>
<div class="ad-miss" data-guess="pop3|imap">Those protocols pull mail down to a reader. This rule lets mail go out from the server.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{SMTP}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>SMTP carries mail outward, and a domain controller has no reason to send any. An open path like this is what an attacker on a compromised server uses to send phishing or email data out. It looks like ordinary mail traffic unless you know the host shouldn't be sending it.</p>
</div>
<div>
<span>What to do</span>
<p>Disable the rule and close CHG-3303. If the scanner really needs to email, send its mail through the firm's mail server rather than straight out from the domain controller.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="w3-05" data-attempts="0">
<span class="ad-mission__num">Ticket 05 · Protocols and TLS · Critical · Wireshark · INC-1092</span>
<h4>Read the Password Off the Wire</h4>
<p><strong>Jordan Ellis · Finance · 11:30 AM</strong><br>Our old report sync sends the daily ledger report to the reporting service every minute, signing in with its service account. The vendor promised the password is "stored encrypted", so we've never worried about it. Is that the whole story?</p>
<p><strong>Task:</strong> Capture the domain controller's own traffic with Wireshark for a couple of minutes, find the report sync's upload, and read the password it signs in with. Then disable <code>svc-reportsync</code> and report the password.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Read the Password Off the Wire" placeholder="the password" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{Ledger-Sync-77}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The job and the reporting service both run on the domain controller, so the traffic never leaves the machine. Capture on the loopback adapter. The job uses plain HTTP with Basic authentication, which only Base64-encodes the name and password, and Wireshark decodes it for you.</p>
<ol>
<li>Open Wireshark and start a capture on <strong>Adapter for loopback traffic capture</strong>.</li>
<li>Wait a minute or two for the job to run, then type <code>http</code> in the display filter.</li>
<li>Open the <strong>POST /reports/upload</strong> request, expand Hypertext Transfer Protocol, then the <strong>Authorization</strong> line, and read the <strong>Credentials</strong> field.</li>
<li>Disable <code>svc-reportsync</code> in Active Directory Users and Computers, and disable the job in Task Scheduler.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Disable-ADAccount svc-reportsync; Disable-ScheduledTask "PurveX Legacy Report Sync"</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="svc-reportsync|svc-reportsync@purvexfinancial.local">That's the account name. Report the password after the colon in the Credentials field.</div>
<div class="ad-miss" data-guess="c3ZjLXJlcG9ydHN5bmM6TGVkZ2VyLVN5bmMtNzc=">That's the Authorization header still Base64-encoded. Decode it, or read Wireshark's Credentials line under it.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{Ledger-Sync-77}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The vendor was telling the truth: on disk, the password is encrypted. But every minute the job sends it over plain HTTP, where Basic authentication is only Base64, so anyone who can capture traffic reads it in seconds. Protecting data at rest says nothing about data in transit, and that's the gap TLS exists to close.</p>
</div>
<div>
<span>What to do</span>
<p>Treat the password as burned. Disable the account now, then move the job to HTTPS with a new password. Capture again afterwards to prove the upload is no longer readable.</p>
</div>
</div>
</div>
</div>
