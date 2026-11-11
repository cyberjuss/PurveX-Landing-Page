<div class="ad-brief">
<p class="rd-kicker">Campaign 2 of 4</p>
<h3>The Phishing Chain</h3>
<p class="ad-brief__ask">A disguised attachment, a different way in. Can you work it Reconnaissance to Actions on Objectives?</p>
<p>Most steps check your Phase 1 lab, so keep it running.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 9 solved</span>
</div>

<div class="ad-mission ad-mission--capstone" data-id="rc-01" data-attempts="0">
<span class="ad-mission__num">Stage 1 · Reconnaissance · T1589.003 Employee Names · INC-1073 · Low</span>
<h4>Four Names That Were Never Real</h4>
<p><strong>IT Lead · Routine log review · 9:00 AM</strong><br>A handful of failed sign-ins have turned up in the Security log recently, and none of the account names match anyone who works here.</p>
<p><strong>Task:</strong> Find the failed sign-ins (event 4625) whose status code says the account itself does not exist, not that the password was wrong, and count the distinct fake usernames tried.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Four Names That Were Never Real" placeholder="a number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{4}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A wrong password and a nonexistent account fail for different reasons, and Windows records which of the two happened.</p>
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
<div class="ad-miss" data-guess="1|2|3">Keep reading. Someone tried more made-up names than that, working through a short list rather than making a single guess.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{4}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Nobody can guess a password for an account that doesn't exist, so these attempts weren't about passwords at all. They were probing for real identities before an attack, which MITRE catalogs under the Reconnaissance tactic as T1589, Gather Victim Identity Information. Because it leaves no victim account to flag, it's easy to miss.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="dl-01" data-attempts="0">
<span class="ad-mission__num">Stage 2 · Delivery · T1566.001 Spearphishing Attachment · INC-1074 · Medium</span>
<h4>Find the Disguise</h4>
<p><strong>IT Lead · Mail gateway flag · 8:45 AM</strong><br>The mail gateway flagged an attachment and placed a copy on the Wealth Management share so it can be reviewed before anyone opens it. Windows Explorer hides file extensions by default, and this file is counting on exactly that.</p>
<p><strong>Task:</strong> Find the file in <code>C:\PurveX\Shares\WealthManagement</code> and report its full name, both extensions included.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Find the Disguise" placeholder="a file name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{q3_rebalance_summary.pdf.exe}" data-accept="q3 rebalance summary.pdf.exe">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A file name with two extensions is often a program dressed up as a document. Windows goes by the last extension, not the one in the middle of the name.</p>
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
<div class="ad-miss" data-guess="q3_rebalance_summary.pdf">That stops at the first extension, the one you're meant to see. Report the file's full name, exactly as Windows stores it.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{Q3_Rebalance_Summary.pdf.exe}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A spearphishing attachment (T1566.001) is the most common way a real intrusion begins. The double extension is one of the oldest tricks there is, and it still works because Explorer hides extensions by default.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="pc-03" data-attempts="0">
<span class="ad-mission__num">Stage 2 · Delivery · T1036.007 Double File Extension · INC-1074 · Medium</span>
<h4>Hash It and Check It</h4>
<p><strong>IT Lead · Mail gateway flag · 8:50 AM</strong><br>Spotting the disguise isn't the same as proving what the file is. Before this goes in a report, hash the file and check that hash against a real reputation database.</p>
<p><strong>Task:</strong> Compute the file's SHA-256 hash, then paste that exact hash into <a href="https://www.virustotal.com/gui/home/search" target="_blank" rel="noopener">VirusTotal's search</a>. Report how many bits long this algorithm's hash value is.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Hash It and Check It" placeholder="a number of bits" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{256}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>SHA-256 produces a 256-bit value, written as 64 hexadecimal characters, and that's true of every file you hash with it, this one included.</p>
<ol>
<li>On the domain controller, open PowerShell and run <code>Get-FileHash "C:\PurveX\Shares\WealthManagement\Q3_Rebalance_Summary.pdf.exe" -Algorithm SHA256</code>.</li>
<li>Copy the Hash value it prints.</li>
<li>Paste that exact value into VirusTotal's search bar and press enter. Read what comes back.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="128|160">Those bit lengths belong to MD5 and SHA-1, but this command used SHA-256. Check the algorithm you ran.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{256}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>This exact hash is real and already in VirusTotal's database. The file contains the EICAR standard antivirus test string, a 68-byte file that every major engine flags on sight, so the lookup shows real detections rather than "no results." A lookup for a freshly built payload, by contrast, often comes back empty, because a brand-new file has no reputation yet. Either answer, flagged or unknown, tells you something real. The disguised extension (T1036.007, Double File Extension) is only the first clue. The hash is what proves what the file really is underneath its name.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="pi-01" data-attempts="0">
<span class="ad-mission__num">Stage 3 · Installation · T1053.005 Scheduled Task · INC-1075 · High</span>
<h4>Find What Got Planted</h4>
<p><strong>IT Lead · Follow-up · 9:30 AM</strong><br>Something is now set to run on the domain controller by itself, with nobody at the keyboard, and nobody on the team scheduled it.</p>
<p><strong>Task:</strong> Find the scheduled task nobody on the team created, and report its exact name.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Find What Got Planted" placeholder="task name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{officetelemetryagent}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A task built to blend in will have a name that sounds like routine Office activity, so read what it runs, not just what it's called.</p>
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
<p>Installation is what turns a single opened attachment into lasting access. A task that runs on a timer keeps working without anyone reopening the attachment, and without the attacker being present.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="pc-05" data-attempts="0">
<span class="ad-mission__num">Stage 4 · Command and Control · T1071 Application Layer Protocol · INC-1075 · High</span>
<h4>Capture the Beacon Live</h4>
<p><strong>IT Lead · Follow-up · 9:35 AM</strong><br>Before you close anything, see the task in action for yourself. It's set to run every 15 minutes, and each run reaches out over the network.</p>
<p><strong>Task:</strong> Open Wireshark on the domain controller, start a capture, and wait for the task's next run. Filter to the address it reaches and report the destination port in the SYN packet.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Capture the Beacon Live" placeholder="port number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{9443}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>You already have the address from the task's Actions tab. This step is about watching the connection attempt happen, not just reading about it.</p>
<ol>
<li>Open Wireshark and start capturing on the domain controller's main interface.</li>
<li>In the filter bar, type <code>ip.addr == 203.0.113.91</code> and press Enter.</li>
<li>Wait. The task fires on a 15-minute cycle, so this may take a few minutes.</li>
<li>When a packet appears, open it and read Transmission Control Protocol → Destination Port in the Packet Details pane.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="8080|4444">Those ports belong to a beacon from another campaign this phase, and that one is already closed. Capture this task's own connection instead.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{9443}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>You don't need someone else's packet capture to find a beacon. As long as it's running, it's generating real traffic you can see for yourself. Command and Control over a non-standard port, dressed up as ordinary application traffic, is what T1071 (Application Layer Protocol) describes. Since 203.0.113.0/24 routes nowhere, the connection will time out, but you can still watch the attempt happen.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="pi-02" data-attempts="0">
<span class="ad-mission__num">Stage 4 · Command and Control · T1071 Application Layer Protocol · INC-1075 · High</span>
<h4>Close Its Channel</h4>
<p><strong>IT Lead · Follow-up · 9:40 AM</strong><br>You've seen it happen, so now stop it from happening again.</p>
<p><strong>Task:</strong> Find the outbound firewall rule that lets this traffic leave the domain controller and disable it. Leave every other rule alone, then report the port it allowed.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Close Its Channel" placeholder="port number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{9443}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Both the task's Actions tab and your capture named the port, so find the outbound rule that allows traffic to it.</p>
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
<p>Disabling the rule stops the beacon, even while the task is still sitting there. If you still have Wireshark open, run the capture again now. The SYN still leaves the task, but nothing lets it out, because the rule, not the task, was what let the traffic through.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="ao-01" data-attempts="0">
<span class="ad-mission__num">Stage 5 · Actions on Objectives · T1074.001 Local Data Staging · INC-1076 · High</span>
<h4>Find What Got Collected</h4>
<p><strong>IT Lead · Post-incident review · 10:00 AM</strong><br>A file is sitting on the IT share with no reason to be there. IT doesn't hold Wealth Management client data, and nobody on the team put it there.</p>
<p><strong>Task:</strong> Find the file in <code>C:\PurveX\Shares\IT</code> that has no business being there, and report its name.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Find What Got Collected" placeholder="a file name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{staged-export.zip}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Every other file on this share belongs to IT's own work, so look for the one that doesn't fit.</p>
<ol>
<li>Open <code>C:\PurveX\Shares\IT</code> in File Explorer.</li>
<li>Read every file name. IT's own files are about mirrors, checksums and hashes from earlier work.</li>
<li>Find the one named like an archive, not like anything IT produces.</li>
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
<p>Collected data has to sit somewhere before it leaves the network, and that place is rarely where the data belongs. That's what T1074.001 (Local Data Staging) describes, and here it looks like an archive-style file on a share with no reason to hold client data.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="ao-02" data-attempts="0">
<span class="ad-mission__num">Stage 5 · Actions on Objectives · T1074.001 Local Data Staging · INC-1076 · High</span>
<h4>Take It Off the Share</h4>
<p><strong>IT Lead · Post-incident review · 10:05 AM</strong><br>The channel is already closed, so nothing can pull this file out from here. Even so, it needs to come off a share it was never supposed to be on.</p>
<p><strong>Task:</strong> Move the staged file from <code>C:\PurveX\Shares\IT</code> to <code>C:\PurveX\Quarantine</code>, then report the name of the folder it is in now.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Take It Off the Share" placeholder="a folder name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{quarantine}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Moving the file keeps it as evidence, whereas deleting it would destroy something the review still needs.</p>
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
<p>Because the channel was closed before this chain got any further, the file was found still staged rather than already gone.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="pc-10" data-attempts="0" data-hands-on="false">
<span class="ad-mission__num">Stage 6 · Write-Up · Medium</span>
<h4>Two Chains and One Pattern</h4>
<p><strong>SOC Lead · Final write-up · 10:30 AM</strong><br>This phase ran two separate campaigns. One opened with a password spray, and this one opened with a phishing attachment.</p>
<p><strong>Task:</strong> Name the one Kill Chain stage where the exact same fix stopped both campaigns from ever getting anything they touched back out of the network.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Two Chains and One Pattern" placeholder="a stage name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{command and control}" data-accept="commandandcontrol|c2">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Both campaigns planted a scheduled task, and both tasks needed the same thing to keep working, which was a way to reach outside the firm.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="installation">Both campaigns did reach Installation, but they also got past it. Name the stage where a single fix cut off their way out.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{Command and Control}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Credential guessing and a phishing attachment got in two different ways, but both chains lost their exit at the same chokepoint: once the outbound rule was disabled, neither attacker could get anything they touched back out of the network.</p>
</div>
</div>
</div>
</div>
