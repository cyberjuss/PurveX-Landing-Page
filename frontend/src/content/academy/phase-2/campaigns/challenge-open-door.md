<div class="ad-brief">
<p class="rd-kicker">Campaign 3 of 4</p>
<h3>The Open Door</h3>
<p class="ad-brief__ask">An intrusion that starts with a door already open. Can you find it, prove it, and close the chain?</p>
<p>Most steps check your Phase 1 lab, so keep it running.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 9 solved</span>
</div>

<div class="ad-mission" data-id="zt-01" data-attempts="0">
<span class="ad-mission__num">Stage 1 · Exploitation · T1021.002 SMB/Windows Admin Shares · INC-1067 · High</span>
<h4>Find What It Actually Trusts</h4>
<p><strong>IT Lead · Zero Trust rollout review · 11:00 AM</strong><br>We moved the firm to Zero Trust months ago, but nobody has gone back over every rule that's older than that. One inbound rule on the domain controller still looks as if it trusts the whole network.</p>
<p><strong>Task:</strong> Find the inbound firewall rule on the domain controller left over from before Zero Trust, and report the port it allows.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Find What It Actually Trusts" placeholder="port number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{445}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A rule built for the old perimeter model trusts a connection because of where it comes from, not because of who it is. So read the Remote Address on each inbound rule, not just its name.</p>
<ol>
<li>Open Windows Defender Firewall with Advanced Security with Win+R and <code>wf.msc</code>.</li>
<li>Select Inbound Rules and sort by Group to find the PurveX Lab rules.</li>
<li>Read each rule's Protocols and Ports and its Scope. The one with Any as its remote address, on a department file-sharing port, is the one still running on the old assumption.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-NetFirewallRule -Group "PurveX Lab" -Direction Inbound | Get-NetFirewallPortFilter | Select-Object InstanceID, LocalPort</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="3389">That rule was opened for a specific vendor visit, and it belongs to a separate ticket that's already closed. Keep looking for the rule that has no reason to be open at all.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{445}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Port 445 is SMB, the protocol that file shares run on. MITRE calls this technique T1021.002 (SMB/Windows Admin Shares), meaning the use of file-sharing protocols to move onto or around a network once inside it. Allowing it from Any source lets every machine on that network reach the domain controller's shares with no further check.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="od-02" data-attempts="0">
<span class="ad-mission__num">Stage 1 · Exploitation · T1021.002 SMB/Windows Admin Shares · INC-1067 · High</span>
<h4>Prove It Is Being Used</h4>
<p><strong>IT Lead · Zero Trust rollout review · 11:02 AM</strong><br>A rule that could be abused and a rule that's actually carrying traffic are two different findings. Before you close this one, check which it is.</p>
<p><strong>Task:</strong> In the Security log, find a successful network logon (event 4624, Logon Type 3) on port 445 from a source other than the domain controller itself, and report the logon type number.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Prove It Is Being Used" placeholder="a number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{3}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>On a hosted lab, the other machine in your pod connects to this share on its own schedule, and that's the traffic this rule lets through.</p>
<ol>
<li>Open Event Viewer, Windows Logs → Security, and filter for Event ID 4624.</li>
<li>Read the Logon Type field in the General tab. Type 3 is Network: a connection from somewhere else, not an interactive sign-in at the keyboard.</li>
<li>Read the Source Network Address, which should not be the domain controller's own IP.</li>
</ol>
<p>On a self-hosted lab with only one machine, nothing will generate this traffic. In that case, read the rule's Scope instead and answer from what Type 3 means by definition.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="2|10">Type 2 is an interactive sign-in at the keyboard, and Type 10 is Remote Desktop. A file-share connection over the network produces neither of them.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{3}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Until you test it, a weak control is only a guess, not a finding. Confirming real Logon Type 3 traffic on port 445 turns "this rule could be abused" into "this rule is being used," and that difference decides how urgently it gets closed.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="zt-02" data-attempts="0">
<span class="ad-mission__num">Stage 1 · Exploitation · T1021.002 SMB/Windows Admin Shares · INC-1067 · High</span>
<h4>Close It</h4>
<p><strong>IT Lead · Zero Trust rollout review · 11:05 AM</strong><br>It's confirmed that nothing needs port 445 open to the whole network. The domain controller is the only machine that needs to serve its own shares.</p>
<p><strong>Task:</strong> Disable the rule, then type the port you closed.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Close It" placeholder="port number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{445}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Disabling the rule is enough. You don't need to delete it or touch any other inbound rule.</p>
<ol>
<li>Open Windows Defender Firewall with Advanced Security with Win+R and <code>wf.msc</code>.</li>
<li>Right-click the rule you found and choose Disable Rule.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-NetFirewallRule -Group "PurveX Lab" -Direction Inbound | Where-Object DisplayName -like "*Internal*" | Disable-NetFirewallRule</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{445}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Being inside the network was never supposed to mean being trusted. And closing the door now doesn't undo the time it stood open, because whoever came through it had a chance to leave something behind.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="od-04" data-attempts="0">
<span class="ad-mission__num">Stage 2 · Installation · T1053.005 Scheduled Task · INC-1077 · High</span>
<h4>What They Left Behind</h4>
<p><strong>IT Lead · Follow-up · 11:15 AM</strong><br>Now that the door is shut, check whether anyone came through it. Start by finding the scheduled task on the domain controller that nobody on the team created.</p>
<p><strong>Task:</strong> Report its exact name.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for What They Left Behind" placeholder="task name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{directoryreplicationhelper}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A task built to blend in will have a name that sounds like real AD infrastructure work, so read what it runs, not just what it's called.</p>
<ol>
<li>Open Task Scheduler with Win+R and <code>taskschd.msc</code>.</li>
<li>Open Task Scheduler Library and sort by Name.</li>
<li>Find the task nobody recognizes, then open its Actions tab.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-ScheduledTask | Where-Object TaskPath -eq "\" | Select-Object TaskName, State</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="windowsdiagnosticssync|systemindexmaintenance|officetelemetryagent">That task belongs to a different campaign that's already closed. Find the one tied to this door instead.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{directoryreplicationhelper}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A name that sounds like real AD infrastructure work is chosen to survive a quick glance at the task list. The only way to catch it is to read what it runs.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="od-05" data-attempts="0">
<span class="ad-mission__num">Stage 3 · Command and Control · T1571 Non-Standard Port · INC-1077 · High</span>
<h4>Close Its Channel</h4>
<p><strong>IT Lead · Follow-up · 11:20 AM</strong><br>The task isn't working alone. It's reaching out through an outbound firewall rule.</p>
<p><strong>Task:</strong> Find and disable that rule, then type the port it allowed.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Close Its Channel" placeholder="port number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{7777}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The task's Actions tab named the address it was reaching, so find the outbound rule that allows traffic to that same address.</p>
<ol>
<li>Open Windows Defender Firewall with Advanced Security with Win+R and <code>wf.msc</code>.</li>
<li>Select Outbound Rules and sort by Group to find the PurveX Lab rules.</li>
<li>Read each rule's Remote Address against what the task's Actions tab named, then disable the one that matches.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-NetFirewallRule -Group "PurveX Lab" -Direction Outbound | Where-Object DisplayName -like "*Replication*" | Disable-NetFirewallRule</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{7777}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>That makes three campaigns this phase and three beacons, each on a different non-standard port (T1571). None of them used 443 or 80, because it's hard to blend into ordinary web traffic on a domain controller that has no business browsing the web in the first place.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="od-06" data-attempts="0">
<span class="ad-mission__num">Stage 4 · Actions on Objectives · T1074.001 Local Data Staging · INC-1078 · High</span>
<h4>Find What They Were After</h4>
<p><strong>IT Lead · Post-incident review · 11:30 AM</strong><br>A file is sitting on the Compliance share with no reason to be there. Compliance doesn't hold Operations settlement data, and nobody on the team put it there.</p>
<p><strong>Task:</strong> Find the file in <code>C:\PurveX\Shares\Compliance</code> that has no business being there, and report its name.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Find What They Were After" placeholder="a file name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{ops-batch-export.csv}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Every other file on this share belongs to Compliance's own review work, so look for the one that doesn't fit.</p>
<ol>
<li>Open <code>C:\PurveX\Shares\Compliance</code> in File Explorer.</li>
<li>Read every file name. Compliance's own files are about KYC reviews.</li>
<li>Find the one named like an Operations export, not a compliance review.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-ChildItem C:\PurveX\Shares\Compliance | Select-Object Name, LastWriteTime</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{ops-batch-export.csv}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Staging data on a share where it doesn't belong is a deliberate choice. Nobody reviews a department's files looking for data that isn't theirs, so it sits unnoticed until someone checks every file against what the share is for.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="od-07" data-attempts="0">
<span class="ad-mission__num">Stage 4 · Actions on Objectives · T1074.001 Local Data Staging · INC-1078 · High</span>
<h4>Take It Off the Share</h4>
<p><strong>IT Lead · Post-incident review · 11:35 AM</strong><br>Move the file somewhere it can still be reviewed without sitting exposed.</p>
<p><strong>Task:</strong> Move the staged file from <code>C:\PurveX\Shares\Compliance</code> to <code>C:\PurveX\Quarantine</code>, then report the folder it is in now.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Take It Off the Share" placeholder="a folder name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{quarantine}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Moving the file keeps it as evidence, whereas deleting it would destroy something the review still needs.</p>
<ol>
<li>On the domain controller, open PowerShell and change to <code>C:\PurveX\Shares\Compliance</code>.</li>
<li>Move the file with <code>Move-Item ops-batch-export.csv C:\PurveX\Quarantine</code>.</li>
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

<div class="ad-mission" data-id="od-08" data-attempts="0" data-hands-on="false">
<span class="ad-mission__num">Stage 5 · Write-Up · Medium</span>
<h4>No Delivery and No Problem</h4>
<p><strong>SOC Lead · Final write-up · 11:45 AM</strong><br>This campaign never had a Delivery stage. No file or email arrived, and there was nothing to hash.<br><strong>A</strong> That means the Kill Chain model does not apply here.<br><strong>B</strong> An attacker who is already inside the network does not need to deliver anything, because the open rule itself was the way in.<br><strong>C</strong> This must be a false positive, since every real intrusion involves Delivery.</p>
<p><strong>Task:</strong> Choose the explanation that fits, and type its letter.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for No Delivery and No Problem" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Each stage of the model describes something that happens in a typical intrusion, not something that has to happen in every one.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">The model still applies. This campaign compresses some of its stages, in the same way a credential-only attack folds Delivery into Exploitation.</div>
<div class="ad-miss" data-guess="c">An intrusion with real planted persistence and a real exfiltration attempt isn't a false positive just because one stage looks different.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{b}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The Cyber Kill Chain is a way of thinking about a sequence, not a checklist every attacker has to complete. With a misconfigured trust boundary, an attacker can skip straight past Reconnaissance, Weaponization and Delivery, because being inside the network has already done their job. Part of reading an attack correctly is knowing which stages it skipped.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="od-09" data-attempts="0" data-hands-on="false">
<span class="ad-mission__num">Stage 6 · Write-Up · Medium</span>
<h4>Three Campaigns and One Rule That Would Have Stopped Them All</h4>
<p><strong>SOC Lead · Quarterly summary · 2:00 PM</strong><br>This phase's three campaigns used three different ways in: a wide password spray, a phishing attachment and a forgotten firewall rule. Yet all three ended up planting a scheduled task that needed to phone home.</p>
<p><strong>Task:</strong> Name the single control that would have stopped all three beacons from reaching out, had it been in place from the start, however each attacker got in.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Three Campaigns and One Rule That Would Have Stopped Them All" placeholder="a few words" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{outbound firewall restriction}" data-accept="restrict outbound traffic|egress filtering|outbound allowlist|default deny outbound">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Each campaign got in through a different front door, but afterward they all needed the same kind of exit.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{outbound firewall restriction}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A domain controller rarely has a real reason to make new outbound connections on its own. If outbound traffic had been limited to a known allowlist, all three campaigns would have broken at Command and Control, whichever door each one used to get in. The Exploitation was different every time, but the chokepoint was the same. That's no coincidence, because it's where a domain controller's normal behavior makes an attacker's traffic stand out the most.</p>
</div>
</div>
</div>
</div>
