<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>The Phishing Chain</h3>
<p class="ad-brief__ask">A different attacker, a different way in. Can you work this one start to finish, Reconnaissance to the moment it got stopped?</p>
<p>This is a second intrusion, separate from the spray and the beacon worked earlier this phase. No guessed passwords this time: it starts with a disguised attachment and runs the chain a credential-only attack never fully shows. Six tickets, four real stages: Reconnaissance, Delivery, Installation and Command and Control, and Actions on Objectives.</p>
<p>Most steps check your Phase 1 lab, so keep it running. Each step takes a short answer, you get three tries per step, and the hint unlocks after two misses.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 6 solved</span>
</div>

<div class="ad-mission" data-id="rc-01" data-attempts="0">
<span class="ad-mission__num">Stage 1 · Reconnaissance · INC-1073 · Low</span>
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
<p>Nobody can guess a password for an account that does not exist. Testing names first is how an attacker finds out which accounts are even worth attacking, before spending any real effort guessing passwords against them. It leaves no victim account to flag, which is exactly why it is easy to miss.</p>
</div>
<div>
<span>What to do</span>
<p>Keep this in mind rather than acting on it. The next real signal is what arrives next, not another name.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="dl-01" data-attempts="0">
<span class="ad-mission__num">Stage 2 · Delivery · INC-1074 · Medium</span>
<h4>Find the Disguise</h4>
<p><strong>IT Lead · Mail gateway flag · 8:45 AM</strong><br>The mail gateway flagged an attachment and pulled a copy onto the Wealth Management share for review before anyone opens it. One file on the share does not belong, and Windows Explorer hides file extensions by default, which is exactly what it is counting on.</p>
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
<li>Report the one with two extensions, exactly as it is written.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-ChildItem C:\PurveX\Shares\WealthManagement | Select-Object Name</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="q3_rebalance_summary.pdf">That is only the first extension, the one meant to be seen. Report the file's full name, exactly as Windows stores it.</div>
<div class="ad-miss" data-guess="portfolio-summary-sample.csv">That is the real department data already on this share. Find the file that does not belong.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{Q3_Rebalance_Summary.pdf.exe}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A double extension is one of the oldest tricks in the book, and it still works because Explorer hides extensions by default. Anyone who opened this expecting a PDF would have run a program instead.</p>
</div>
<div>
<span>What to do</span>
<p>Whoever opened it is where Exploitation actually happened. What it planted is the next thing to find.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="pi-01" data-attempts="0">
<span class="ad-mission__num">Stage 3 · Installation · INC-1075 · High</span>
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
<div class="ad-miss" data-guess="windowsdiagnosticssync|systemindexmaintenance">That task belongs to a different, already-closed intrusion from earlier this phase. Find the one still open now.</div>
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
<div>
<span>What to do</span>
<p>Find what it is reaching, which is the next step.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="pi-02" data-attempts="0">
<span class="ad-mission__num">Stage 4 · Command and Control · INC-1075 · High</span>
<h4>Close Its Channel</h4>
<p><strong>IT Lead · Follow-up · 9:40 AM</strong><br>The task is trying to reach something outside the firm. Whatever it is doing needs a way out, and that way out is a firewall rule.</p>
<p><strong>Task:</strong> Find the outbound firewall rule that lets this traffic leave the domain controller and disable it. Leave every other rule alone, then report the port it allowed.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Close Its Channel" placeholder="port number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{9443}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The task's Actions tab named the address it was reaching. Find the outbound rule that allows traffic to that same address.</p>
<ol>
<li>Open Windows Defender Firewall with Advanced Security with Win+R and <code>wf.msc</code>.</li>
<li>Select Outbound Rules and sort by Group to find the PurveX Lab rules.</li>
<li>Read each rule's Remote Address against what the task's Actions tab named, then disable the one that matches.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-NetFirewallRule -Group "PurveX Lab" -Direction Outbound | Where-Object DisplayName -like "*Telemetry*" | Disable-NetFirewallRule</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="4444|8080">That rule belongs to a different, already-closed beacon from earlier this phase. Find the one matching this task instead.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{9443}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Command and Control is the channel, not the task itself. Disabling the rule stops the beacon even while the task is still sitting there, the same move that closed the first intrusion's channel earlier this phase.</p>
</div>
<div>
<span>What to do</span>
<p>Check whether anything already moved through that channel before it closed.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="ao-01" data-attempts="0">
<span class="ad-mission__num">Stage 5 · Actions on Objectives · INC-1076 · High</span>
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
<div class="ad-miss" data-guess="checksums.txt|exported-hashes.txt|common-passwords.txt">That file belongs to IT's own earlier work on this share. Find the one that does not fit the pattern at all.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{staged-export.zip}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Collected data has to sit somewhere before it leaves the network, and that somewhere is rarely where it actually belongs. A file shaped like an archive on a share that has no reason to hold client data is exactly what staging looks like from the defender's side.</p>
</div>
<div>
<span>What to do</span>
<p>Get it off the share, which is the last step.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="ao-02" data-attempts="0">
<span class="ad-mission__num">Stage 5 · Actions on Objectives · INC-1076 · High</span>
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
<li>Confirm it is gone from the IT share and present in Quarantine.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="it">That is the share it should not have been on. Report where it is now, not where it was.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{Quarantine}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The channel was closed before this chain reached any further, which is why this file was found staged rather than confirmed gone. Two intrusions this phase, two chains broken before Actions on Objectives ever finished. That is not a coincidence; it is what the earlier stages are for.</p>
</div>
</div>
</div>
</div>
