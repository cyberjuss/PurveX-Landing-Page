<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>The Network Change That Went Wrong</h3>
<p class="ad-brief__ask">A contractor ran a network change at PurveX Financial over the weekend. It's Monday, and the cleanup they promised never happened. Can you read their change log, find what they left behind, and put it right?</p>
<p>The contractor's change log is in the IT share. Read it the way you would on the job: every line is a change that someone now has to check.</p>
<p>First, set up the weekend. On your domain controller, open PowerShell as an administrator and run the block below once. It makes the contractor's changes and saves their change log.</p>
</div>

```powershell
& {
  $it = "C:\PurveX\Shares\IT"
  New-Item -ItemType Directory -Force -Path $it | Out-Null
  $log = Join-Path $it "Network_Change_Log_Nov.txt"
  if (Test-Path $log) { "The weekend change is already set up."; return }
  $zone = (Get-ADDomain).DNSRoot
  if (-not (Get-DnsServerResourceRecord -ZoneName $zone -Name "portal" -ErrorAction SilentlyContinue)) {
    Add-DnsServerResourceRecordA -ZoneName $zone -Name "portal" -IPv4Address "10.255.255.10"
  }
  New-NetFirewallRule -DisplayName "PurveX Legacy - Vendor Telnet" -Group "PurveX Lab" -Direction Inbound -Protocol TCP -LocalPort 23 -Action Allow | Out-Null
  New-NetFirewallRule -DisplayName "PurveX Relay - Outbound Mail" -Group "PurveX Lab" -Direction Outbound -Protocol TCP -RemotePort 25 -Action Allow | Out-Null
  Set-Content -Path $log -Encoding ascii -Value @(
    "PurveX Financial - network change log, weekend of Nov 8",
    "Contractor: NetBridge Services",
    "",
    "CHG-3301  Intranet portal moved off PORTAL01 (10.255.255.10). PORTAL01 retired.",
    "          The portal now runs on DC01 until the new server arrives.",
    "CHG-3302  Opened TCP 23 inbound on DC01 for our console during the switch upgrade.",
    "          Remove after cutover.",
    "CHG-3303  Allowed outbound TCP 25 from DC01 to test the scanner-to-email relay.",
    "          Remove after test.",
    "",
    "Status: cutover complete Sunday 22:40. Cleanup items not confirmed."
  )
  "Done. The contractor's change log is in the IT share."
}
```

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 5 solved</span>
</div>

<div class="ad-mission" data-id="w3-01" data-attempts="0">
<span class="ad-mission__num">Ticket 01 · TCP/IP · High · CHG-3301</span>
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
<li><code>Add-DnsServerResourceRecordA -ZoneName $zone -Name portal -IPv4Address (Resolve-DnsName $env:COMPUTERNAME -Type A).IPAddress</code></li>
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
<span class="ad-mission__num">Ticket 02 · Three-Way Handshake · Medium</span>
<h4>Timed Out or Refused?</h4>
<p><strong>Priya Nair · IT · 9:05 AM</strong><br>Two more calls about apps that won't connect. Jordan's reporting tool says "connection timed out" after thirty seconds. Riley's ledger app says "connection refused" straight away. Which one is a firewall silently dropping the traffic?<br><strong>A</strong> Jordan's. A timeout means the first SYN got no reply at all, which is what a firewall drop looks like. Riley's server answered with a reset, so it's up but nothing is listening on that port.<br><strong>B</strong> Riley's. "Refused" means a firewall blocked it, and Jordan's server is just slow.<br><strong>C</strong> Both. The two messages mean the same thing.</p>
<p><strong>Task:</strong> Choose the correct reading and type its letter.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Timed Out or Refused?" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{a}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Every TCP connection starts with a SYN. Think about the two possible replies, and what it means when there is no reply at all.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="b">A refusal is an answer: the server sent back a reset. A firewall that drops traffic sends nothing back, so the client waits until it times out.</div>
<div class="ad-miss" data-guess="c">They're different answers to the same SYN. One is silence, and the other is a reset from a running host.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{a}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The two errors send you to different people. A timeout points at the network or a firewall, so it goes to whoever owns the rules. A refusal means the host is up but the service isn't running, so it goes to whoever owns the app. Reading the error correctly saves an hour of passing the ticket around.</p>
</div>
<div>
<span>What to do</span>
<p>Test both from a workstation with <code>Test-NetConnection</code> and the port. Send Jordan's to the firewall owners with the port number, and Riley's to the ledger app's owner to check the service.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="w3-03" data-attempts="0">
<span class="ad-mission__num">Ticket 03 · Common Ports · High · CHG-3302</span>
<h4>Close the Vendor's Door</h4>
<p><strong>Alex Rivera · IT · 9:40 AM</strong><br>The change log says the contractor opened a port on DC01 for their console and would remove it after cutover. I'd bet it's still open. Find it and close it.</p>
<p><strong>Task:</strong> Find the inbound rule from CHG-3302, switch it off, and report the port it opened.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Close the Vendor's Door" placeholder="a port number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{23}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The change log tells you what to look for. Find the inbound rule that allows it, read its port, and disable it.</p>
<ol>
<li>Open Windows Defender Firewall with Advanced Security with Win+R and <code>wf.msc</code>.</li>
<li>Open Inbound Rules and find the contractor's vendor rule.</li>
<li>Read the port on its Protocols and Ports tab, then right-click it and choose Disable Rule.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-NetFirewallRule -DisplayName "PurveX Legacy*" | Get-NetFirewallPortFilter</code></li>
<li><code>Disable-NetFirewallRule -DisplayName "PurveX Legacy - Vendor Telnet"</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="22">That's SSH. Read the port the contractor's rule actually opens.</div>
<div class="ad-miss" data-guess="#">Open the vendor rule's Protocols and Ports tab and read its local port.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{23}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Port 23 is Telnet, which sends everything, passwords included, in plain text. It was open on the domain controller to anyone on the network, for a job that finished on Sunday night. A temporary rule that's never removed is how most exposed ports come about.</p>
</div>
<div>
<span>What to do</span>
<p>Disable the rule, confirm it in the firewall, and mark CHG-3302 closed with the time you did it. Ask the contractor to use a secure, time-limited method next time, and make removing temporary rules part of signing off a change.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="w3-04" data-attempts="0">
<span class="ad-mission__num">Ticket 04 · Protocols · High · CHG-3303</span>
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
<li><code>Get-NetFirewallRule -Direction Outbound -DisplayName "PurveX Relay*" | Get-NetFirewallPortFilter</code></li>
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
<p>SMTP carries mail outward, and a domain controller should never need to send any. An open path like this is exactly what an attacker on a compromised server uses to send phishing or to email data out, and it looks like ordinary mail traffic unless you know the host shouldn't be sending it.</p>
</div>
<div>
<span>What to do</span>
<p>Disable the rule and close CHG-3303. If the scanner really needs to email, send its mail through the firm's mail server rather than straight out from the domain controller.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="w3-05" data-attempts="0">
<span class="ad-mission__num">Ticket 05 · SSL/TLS · Manager Request</span>
<h4>What HTTPS Still Shows</h4>
<p><strong>Devon Brooks · Compliance · 11:30 AM</strong><br>We think someone uploaded client files to a personal cloud account on Friday. IT has a packet capture of that laptop's traffic. Everything was HTTPS. What can the capture tell us?<br><strong>A</strong> The names and contents of every file that was uploaded.<br><strong>B</strong> That the laptop connected to the cloud service, which site it named, when, and how much data it sent. It can't show which files or what was in them.<br><strong>C</strong> Nothing at all, because HTTPS hides everything.</p>
<p><strong>Task:</strong> Choose what the capture can show and type its letter.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for What HTTPS Still Shows" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>TLS encrypts the content of the conversation. Think about what has to stay visible for the traffic to reach the right place at all.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">The content is encrypted, so file names and contents aren't readable in the capture.</div>
<div class="ad-miss" data-guess="c">Encryption hides the content, not the conversation. The addresses, the timing, the amount of data and usually the site name are all still visible.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{b}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A capture won't prove which files left, but a large upload to a personal cloud service, from a laptop that holds client data, at a time you can name, is strong evidence on its own. Analysts work from this kind of outside information far more often than they read content.</p>
</div>
<div>
<span>What to do</span>
<p>Tell Devon what the capture can and can't show, and point them to where the file names live: the laptop itself and the cloud service's own activity log. Keep the capture as evidence either way.</p>
</div>
</div>
</div>
</div>
