<div class="ad-brief">
<p class="rd-kicker">Campaign 2 of 4</p>
<h3>The Phishing Chain</h3>
<p class="ad-brief__ask">A different attacker, a different way in. Can you work this one Reconnaissance to Actions on Objectives, using the tools a real SOC analyst actually has open?</p>
<p>No guessed passwords this time. It starts with a disguised attachment, and it runs the full chain a credential-only attack never fully shows: Reconnaissance, Delivery, Exploitation, Installation, Command and Control, Actions on Objectives. You will hash a real file and check it against VirusTotal, capture a real beacon live in Wireshark, and read the firm's own Security log. Nine tickets, each tagged with its Kill Chain stage and its MITRE ATT&CK technique.</p>
<p>Most steps check your Phase 1 lab, so keep it running. Each step takes a short answer, you get three tries per step, and the hint unlocks after two misses.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 9 solved</span>
</div>

<div class="ad-mission ad-mission--capstone" data-id="rc-01" data-attempts="0">
<span class="ad-mission__num">Stage 1 · Reconnaissance · T1589.003 Gather Victim Identity Information · INC-1073 · Low</span>
<h4>Four Names That Were Never Real</h4>
<p><strong>IT Lead · Routine log review · 9:00 AM</strong><br>A handful of failed sign-ins showed up in the Security log recently. None of the account names match anyone who actually works here.</p>
<p><strong>Task:</strong> Find the failed sign-ins (event 4625) whose status code says the account itself does not exist, not that the password was wrong, and count the distinct fake usernames tried.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Four Names That Were Never Real" placeholder="a number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{4}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A wrong password and a nonexistent account fail for different reasons, and Windows records which one happened.</p>
<ol>
<li>Open Event Viewer, Windows Logs → Security, and filter for Event ID 4625.</li>
<li>Open a few and read the Status code in the Failure Information section.</li>
<li><code>0xC000006A</code> means the account exists and the password was wrong. <code>0xC0000064</code> means the account does not exist at all.</li>
<li>Count the distinct account names behind the <code>0xC0000064</code> rows.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-WinEvent -LogName Security -FilterHashtable @{Id=4625} -MaxEvents 50 | Format-List TimeCreated, Message</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="1|2|3">Keep reading. More than one made-up name was tried; this is a short list being worked through, not a single guess.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{4}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Nobody can guess a password for an account that does not exist. MITRE catalogs probing for real identities before an attack under the Reconnaissance tactic (T1589, Gather Victim Identity Information). It leaves no victim account to flag, which is exactly why it is easy to miss.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="dl-01" data-attempts="0">
<span class="ad-mission__num">Stage 2 · Delivery · T1566.001 Spearphishing Attachment · INC-1074 · Medium</span>
<h4>Find the Disguise</h4>
<p><strong>IT Lead · Mail gateway flag · 8:45 AM</strong><br>The mail gateway flagged an attachment and pulled a copy onto the Wealth Management share for review before anyone opens it. Windows Explorer hides file extensions by default, which is exactly what this one is counting on.</p>
<p><strong>Task:</strong> Find the file in <code>C:\PurveX\Shares\WealthManagement</code> and report its full name, both extensions included.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Find the Disguise" placeholder="a file name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{q3_rebalance_summary.pdf.exe}" data-accept="q3 rebalance summary.pdf.exe">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A file ending in two extensions shows a program dressed as a document. Windows runs whatever the last one says, not the one in the middle of the name.</p>
<ol>
<li>Open File Explorer, go to the View tab, and tick File name extensions if it is not already on.</li>
<li>Open <code>C:\PurveX\Shares\WealthManagement</code> and read every file's full name.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-ChildItem C:\PurveX\Shares\WealthManagement | Select-Object Name</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="q3_rebalance_summary.pdf">That is only the first extension, the one meant to be seen. Report the file's full name, exactly as Windows stores it.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{Q3_Rebalance_Summary.pdf.exe}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A spearphishing attachment (T1566.001) is the most common way a real intrusion begins. A double extension is one of the oldest tricks in the book, and it still works because Explorer hides extensions by default.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="pc-03" data-attempts="0">
<span class="ad-mission__num">Stage 2 · Delivery · T1036.008 Masquerade File Type · INC-1074 · Medium</span>
<h4>Hash It and Check It</h4>
<p><strong>IT Lead · Mail gateway flag · 8:50 AM</strong><br>Naming the disguise is not the same as proving what the file is. Before this goes in a report, hash it and check that hash against a real reputation database.</p>
<p><strong>Task:</strong> Compute the file's SHA-256 hash, then paste that exact hash into <a href="https://www.virustotal.com/gui/home/search" target="_blank" rel="noopener">VirusTotal's search</a>. Report how many bits long this algorithm's hash value is.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Hash It and Check It" placeholder="a number of bits" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{256}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>SHA-256 produces a 256-bit value, written as 64 hexadecimal characters. That is true of every file you hash with it, this one included.</p>
<ol>
<li>On the domain controller, open PowerShell and run <code>Get-FileHash "C:\PurveX\Shares\WealthManagement\Q3_Rebalance_Summary.pdf.exe" -Algorithm SHA256</code>.</li>
<li>Copy the Hash value it prints.</li>
<li>Paste that exact value into VirusTotal's search bar and press enter. Read what comes back.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="128|160">Those bit lengths belong to MD5 and SHA-1. This command used SHA-256. Read the algorithm you actually ran.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{256}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>This exact hash is real and already in VirusTotal's database: the file's content is the EICAR standard antivirus test string, a 68-byte file every major engine flags on sight, which is why the lookup shows real detections rather than "no results." A lookup against an unknown, freshly-built payload often comes back with nothing, because a brand-new file has no reputation yet. Either answer, flagged or unknown, is real information. Renaming the extension (T1036.008, Masquerade File Type) is step one. A hash is what lets you prove what the file actually is underneath the name.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="pi-01" data-attempts="0">
<span class="ad-mission__num">Stage 3 · Installation · T1053.005 Scheduled Task · INC-1075 · High</span>
<h4>Find What Got Planted</h4>
<p><strong>IT Lead · Follow-up · 9:30 AM</strong><br>Something is now set to run on the domain controller on its own, with nobody at the keyboard. Nobody on the team scheduled it.</p>
<p><strong>Task:</strong> Find the scheduled task nobody on the team created, and report its exact name.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Find What Got Planted" placeholder="task name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{officetelemetryagent}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A task built to blend in takes a name that sounds like routine Office activity. Read what it actually runs, not just its name.</p>
<ol>
<li>Open Task Scheduler with Win+R and <code>taskschd.msc</code>.</li>
<li>Open Task Scheduler Library and sort by Name.</li>
<li>Find the task nobody recognizes, then open its Actions tab to see what it runs.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-ScheduledTask | Where-Object TaskPath -eq "\" | Select-Object TaskName, State</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{officetelemetryagent}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Installation is what turns a single opened attachment into standing access. A task that runs on a timer does not need the attachment reopened, and does not need the attacker present, to keep working.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="pc-05" data-attempts="0">
<span class="ad-mission__num">Stage 4 · Command and Control · T1071 Application Layer Protocol · INC-1075 · High</span>
<h4>Capture the Beacon Live</h4>
<p><strong>IT Lead · Follow-up · 9:35 AM</strong><br>Before you close anything, see it for yourself. The task is set to run again every 15 minutes, and each run reaches out over the network.</p>
<p><strong>Task:</strong> Open Wireshark on the domain controller, start a capture, and wait for the task's next run. Filter to the address it reaches and report the destination port in the SYN packet.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Capture the Beacon Live" placeholder="port number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{9443}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The task's Actions tab already told you the address. This step is about watching the connection attempt happen, not just reading about it.</p>
<ol>
<li>Open Wireshark and start capturing on the domain controller's main interface.</li>
<li>In the filter bar, type <code>ip.addr == 203.0.113.91</code> and press Enter.</li>
<li>Wait. The task fires on a 15-minute cycle, so this may take a few minutes.</li>
<li>When a packet appears, open it and read Transmission Control Protocol → Destination Port in the Packet Details pane.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="8080|4444">Those ports belong to a different, already-closed beacon from this phase's other campaign. Capture this task's own connection instead.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{9443}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>You do not need someone else's packet capture to find a beacon. If it is still running, it is still generating real traffic you can see yourself. Command and Control over a non-standard port, dressed up to look like ordinary application traffic, is exactly what T1071 (Application Layer Protocol) describes, and 203.0.113.0/24 routes nowhere, so the connection itself will time out even while you watch it attempt.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="pi-02" data-attempts="0">
<span class="ad-mission__num">Stage 4 · Command and Control · T1071 Application Layer Protocol · INC-1075 · High</span>
<h4>Close Its Channel</h4>
<p><strong>IT Lead · Follow-up · 9:40 AM</strong><br>You have seen it happen. Now stop it from happening again.</p>
<p><strong>Task:</strong> Find the outbound firewall rule that lets this traffic leave the domain controller and disable it. Leave every other rule alone, then report the port it allowed.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Close Its Channel" placeholder="port number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{9443}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The task's Actions tab and your own capture both named the port. Find the outbound rule that allows traffic to it.</p>
<ol>
<li>Open Windows Defender Firewall with Advanced Security with Win+R and <code>wf.msc</code>.</li>
<li>Select Outbound Rules and sort by Group to find the PurveX Lab rules.</li>
<li>Read each rule's Remote Port against what you captured, then right-click the rule and choose Disable Rule.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-NetFirewallRule -Group "PurveX Lab" -Direction Outbound | Where-Object DisplayName -like "*Telemetry*" | Disable-NetFirewallRule</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{9443}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Disabling the rule stops the beacon even while the task is still sitting there. If you still have Wireshark open, run the capture again after disabling it: the SYN still leaves, but nothing routes it out, because the rule, not the task, was what let it through.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="ao-01" data-attempts="0">
<span class="ad-mission__num">Stage 5 · Actions on Objectives · T1074.001 Local Data Staging · INC-1076 · High</span>
<h4>Find What Got Collected</h4>
<p><strong>IT Lead · Post-incident review · 10:00 AM</strong><br>A file is sitting on the IT share with no reason to be there. IT does not hold Wealth Management client data, and nobody on the team put it there.</p>
<p><strong>Task:</strong> Find the file in <code>C:\PurveX\Shares\IT</code> that has no business being there, and report its name.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Find What Got Collected" placeholder="a file name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{staged-export.zip}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Every other file on this share belongs to IT's own work. One does not fit the pattern at all.</p>
<ol>
<li>Open <code>C:\PurveX\Shares\IT</code> in File Explorer.</li>
<li>Read every file name. IT's own files are about mirrors, checksums and hashes from earlier work.</li>
<li>Find the one named like an archive, not like anything IT actually produces.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-ChildItem C:\PurveX\Shares\IT | Select-Object Name, LastWriteTime</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{staged-export.zip}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Collected data has to sit somewhere before it leaves the network, and that somewhere is rarely where it actually belongs. T1074.001 (Local Data Staging) is exactly this: a file shaped like an archive on a share that has no reason to hold client data.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="ao-02" data-attempts="0">
<span class="ad-mission__num">Stage 5 · Actions on Objectives · T1074.001 Local Data Staging · INC-1076 · High</span>
<h4>Take It Off the Share</h4>
<p><strong>IT Lead · Post-incident review · 10:05 AM</strong><br>The channel is already closed, so nothing can pull this file out from here. It still needs to come off the share it was never supposed to be on.</p>
<p><strong>Task:</strong> Move the staged file from <code>C:\PurveX\Shares\IT</code> to <code>C:\PurveX\Quarantine</code>, then report the name of the folder it is in now.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Take It Off the Share" placeholder="a folder name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{quarantine}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Moving keeps the file as evidence. Deleting it would destroy what a review still needs.</p>
<ol>
<li>On the domain controller, open PowerShell and change to <code>C:\PurveX\Shares\IT</code>.</li>
<li>Move the file with <code>Move-Item staged-export.zip C:\PurveX\Quarantine</code>.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{Quarantine}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The channel was closed before this chain reached any further, which is why this file was found staged rather than confirmed gone.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="pc-10" data-attempts="0">
<span class="ad-mission__num">Stage 6 · Write-Up · Medium</span>
<h4>Two Chains and One Pattern</h4>
<p><strong>SOC Lead · Final write-up · 10:30 AM</strong><br>This phase ran two separate campaigns: one that opened with a password spray, and this one, which opened with a phishing attachment.</p>
<p><strong>Task:</strong> Name the one Kill Chain stage where the exact same fix stopped both campaigns from ever getting anything they touched back out of the network.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Two Chains and One Pattern" placeholder="a stage name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{command and control}" data-accept="commandandcontrol|c2">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Both campaigns planted a scheduled task, and both tasks needed the same kind of thing to keep working: a way to reach outside the firm.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="installation">Both campaigns did reach Installation, but they also got past it. Name the stage where the same fix cut off their way out.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{Command and Control}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Two different entry vectors, credential guessing and a phishing attachment, converged on the exact same chokepoint: a firewall rule that let a task reach outside the firm. This campaign got one stage further than the first, far enough to stage a file for exfiltration, but disabling that one rule meant neither attacker ever got what they touched back out of the network. Different Delivery, different Exploitation, same place both chains actually lost their exit. A domain controller that cannot freely talk to the outside internet turns every attacker's last mile into the same narrow, closely-watched door.</p>
</div>
</div>
</div>
</div>
