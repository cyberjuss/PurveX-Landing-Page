<div class="ad-brief">
<p class="rd-kicker">Campaign 1 of 4</p>
<h3>The Credential Campaign</h3>
<p class="ad-brief__ask">One attacker, no malware delivered, just guessed and stolen passwords. Can you work it start to finish?</p>
<p>Nobody clicked anything. Nobody opened a file. This attacker got in purely on sign-ins: a wide spray against throwaway accounts, a narrower guess against one real admin, then two real ways to keep the access once they had it. Twelve tickets, each tagged with its Cyber Kill Chain stage and its MITRE ATT&CK technique, so you read this as one operation instead of twelve unrelated alerts.</p>
<p>Most steps check your Phase 1 lab, so keep it running. Each step takes a short answer, you get three tries per step, and the hint unlocks after two misses.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 12 solved</span>
</div>

<div class="ad-mission" data-id="sl-01" data-attempts="0">
<span class="ad-mission__num">Stage 1 · Exploitation · T1110.003 Password Spraying · INC-1072 · Medium</span>
<h4>Count the Spray</h4>
<p><strong>IT Lead · Log review · 10:00 AM</strong><br>A run of failed sign-ins shows up close together in the Security log, each one a different account. Before anyone calls it an attack, we need the actual count.</p>
<p><strong>Task:</strong> In the Security log, find the failed sign-ins (event 4625) that land within the same short burst and count the distinct accounts that failed.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Count the Spray" placeholder="a number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{6}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A spray and a brute force look similar until you check whether it is one account failing many times or many accounts failing once each.</p>
<ol>
<li>Open Event Viewer, Windows Logs → Security.</li>
<li>Right-click Security and choose Filter Current Log, then filter by Event ID 4625.</li>
<li>Sort by time and find the burst, every one landing within a few seconds of the last.</li>
<li>Open a few and read Account For Which Logon Failed on the General tab. Count the distinct names in the burst.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-WinEvent -LogName Security -FilterHashtable @{Id=4625} -MaxEvents 50 | Format-List TimeCreated, Message</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="1">That describes many attempts against one account, a brute force. Count the distinct accounts in the burst instead.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{6}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>One password tried once each against six different accounts is a spray, not a brute force. MITRE catalogs this exact pattern as T1110.003, Password Spraying, under the Credential Access tactic. In Cyber Kill Chain terms it is Exploitation: the attempt to actually turn a guess into a way in.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="sl-02" data-attempts="0">
<span class="ad-mission__num">Stage 1 · Exploitation · T1110.003 Password Spraying · INC-1072 · Medium</span>
<h4>The One That Got Through</h4>
<p><strong>IT Lead · Log review · 10:05 AM</strong><br>Most of what is worth flagging in a log is a failure. This time, read past the failures.</p>
<p><strong>Task:</strong> Find the account in the Security log that signed in successfully (event 4624) with no failed attempt in front of it at all, and name it.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for The One That Got Through" placeholder="an account name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{svc-night-index}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Every other account in this log either failed outright or failed before it succeeded. One did neither.</p>
<ol>
<li>Filter the Security log for event 4624 (successful logon).</li>
<li>For each success, check whether a 4625 for the same account appears right before it.</li>
<li>One success has no failure anywhere near it. Read its Account Name.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="petra.lindqvist">That account's successes, if any, sit behind a string of failures and a lockout. Find the one with nothing in front of it.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{svc-night-index}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A clean, unexplained success is easy to skip past, because nothing about it looks like an attack. It still deserves a look: a service account signing in outside its normal job, with no failures around it at all, is the real foothold the spray was testing for.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="sl-03" data-attempts="0">
<span class="ad-mission__num">Stage 1 · Exploitation · T1110.003 Password Spraying · INC-1072 · Medium</span>
<h4>Unlock the Real Lockout</h4>
<p><strong>IT Lead · Log review · 10:10 AM</strong><br>One account's run of failures in the log ends differently from the others: an actual lockout, not just a string of failed attempts.</p>
<p><strong>Task:</strong> Find the account event 4740 (account lockout) names, confirm it is still locked, unlock it, then report its name.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Unlock the Real Lockout" placeholder="an account name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{petra.lindqvist}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Unlocking the account is part of the task, not optional reading.</p>
<ol>
<li>Filter the Security log for event 4740 and read the Account That Was Locked Out.</li>
<li>Open Active Directory Users and Computers and confirm the account shows as locked on its Account tab.</li>
<li>Tick "Unlock account" and apply, or run <code>Unlock-ADAccount -Identity &lt;account&gt;</code>.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="svc-night-index">That account signed in cleanly. Read event 4740 for the one it actually locked out.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{petra.lindqvist}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A string of failures ending in a real lockout is the clearest signal in the whole log. Unlocking it is the fix for right now. Which account actually got in quietly is the next question.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="tq-06" data-attempts="0">
<span class="ad-mission__num">Stage 2 · Exploitation · T1110.001 Password Guessing · INC-1046 · Critical</span>
<h4>A Second Target</h4>
<p><strong>SIEM Alert · Part 1 of 5 · Automated detection · 2:04 AM</strong><br>ALERT: successful login for alex.rivera at 2:00 AM from workstation WM-WKS07, preceded by multiple failed logons. Severity: high. The spray tested the whole firm; this one aims at a single admin account by name.</p>
<p><strong>Task:</strong> Start with the machine. Find <code>WM-WKS07</code> in Active Directory and name the department OU that holds it, as Active Directory writes it.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for A Second Target" placeholder="department OU" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{wealthmanagement}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Look at the machine before you read any logs. The OU is the department folder the computer lives in.</p>
<ol>
<li>Open Active Directory Users and Computers with Win+R and <code>dsa.msc</code>.</li>
<li>Expand <code>Departments</code> and open the <code>Workstations</code> folder under each department until you find <code>WM-WKS07</code>.</li>
<li>The department folder above that Workstations folder is your answer.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>(Get-ADComputer WM-WKS07).DistinguishedName</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="workstations">Workstations is the folder inside the department. Report the department OU above it.</div>
<div class="ad-miss" data-guess="it">Alex works in IT but this step is about the computer. Find WM-WKS07 and read the folder that holds it.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{wealthmanagement}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>WM-WKS07 belongs to Wealth Management and its client financial data, but Alex works in IT. An IT admin signing in to a Wealth Management PC at 2 AM is already a pairing that needs an explanation.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="tq-07" data-attempts="0">
<span class="ad-mission__num">Stage 2 · Exploitation · T1110.001 Password Guessing · INC-1046 · Critical</span>
<h4>Read the Log</h4>
<p><strong>SIEM Alert · Part 2 of 5 · Automated detection · 2:06 AM</strong><br>The SIEM exported the sign-in events around the alert. The export is below.</p>
<pre class="ad-evidence"><code>TIME      EVENT  ACCOUNT       HOST      TYPE  DETAIL
01:58:03  4625   alex.rivera   WM-WKS07  3     0xC000006A  bad password
01:58:05  4625   alex.rivera   WM-WKS07  3     0xC000006A  bad password
01:58:07  4625   alex.rivera   WM-WKS07  3     0xC000006A  bad password
01:58:09  4625   alex.rivera   WM-WKS07  3     0xC000006A  bad password
02:00:41  4624   alex.rivera   WM-WKS07  3     success
02:00:41  4672   alex.rivera   WM-WKS07  -     special privileges assigned
02:03:18  4624   alex.rivera   WM-WKS07  3     success</code></pre>
<p><strong>Task:</strong> Count the failed sign-ins (Event ID 4625) that happen before the first successful sign-in (4624).</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Read the Log" placeholder="a number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{4}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Event 4625 is a failed sign-in and 4624 is a successful one. These events exist only in the export on this page, not in your lab's Security log.</p>
<ol>
<li>Read the export from top to bottom.</li>
<li>Count the 4625 rows that appear before the first 4624.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="4625">That is the Event ID. Type how many rows carry it before the first success.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{4}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Four failures land exactly two seconds apart, then a success follows about two and a half minutes later. That steady spacing points to a script guessing passwords, not a person retyping one. Four attempts against one named account, rather than the spray's one attempt against many, is Password Guessing, T1110.001: the same Brute Force family aimed instead of wide.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="tq-08" data-attempts="0">
<span class="ad-mission__num">Stage 2 · Exploitation · T1110.001 Password Guessing · INC-1046 · Critical</span>
<h4>Why the Privileges?</h4>
<p><strong>SIEM Alert · Part 3 of 5 · Automated detection · 2:08 AM</strong><br>Event 4672 in the log shows special privileges assigned to Alex's new session. Windows logs it when a sign-in receives sensitive privileges, the kind admin accounts hold.</p>
<p><strong>Task:</strong> Name the group on Alex's account that explains why the session received special privileges.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Why the Privileges?" placeholder="group name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{it-admins}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A department group such as IT Users grants standard access, so look for the group on Alex's account that grants more.</p>
<ol>
<li>Open Active Directory Users and Computers with Win+R and <code>dsa.msc</code>.</li>
<li>Right-click the domain and use Find to search for <code>alex.rivera</code>.</li>
<li>Open the account and find the group on Member Of that goes beyond department access.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-ADPrincipalGroupMembership alex.rivera | Select-Object Name</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="it-users|domain-users">That group grants standard access. Find the group on Alex's Member Of tab that grants more.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{it-admins}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The session that followed the guessing ran with admin-level rights. With a stolen admin login an attacker can reset passwords and change groups, then cover the tracks.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="tq-09" data-attempts="0">
<span class="ad-mission__num">Stage 2 · Exploitation · T1110.001 Password Guessing · INC-1046 · Critical</span>
<h4>Mistake or Attack?</h4>
<p><strong>SIEM Alert · Part 4 of 5 · Automated detection · 2:10 AM</strong><br>You now have four failed logons two seconds apart and then a success. It happened at 2 AM on a workstation outside IT with an admin account. Which explanation fits?<br><strong>A</strong> Alex mistyped his password four times.<br><strong>B</strong> Automated password guessing against a real account, which finally worked.<br><strong>C</strong> A scheduled maintenance task using an old credential.<br><strong>D</strong> A clock problem on the domain controller.</p>
<p><strong>Task:</strong> Choose the explanation that fits all of the evidence and type its letter.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Mistake or Attack?" placeholder="A, B, C, or D" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Line up the facts: steady two-second failures at 2 AM from an admin account on a PC in another department.</p>
<p>A person does not retry on a steady beat, and a maintenance job does not try four wrong passwords before it works.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">People who mistype do not retry exactly every two seconds. Compare the times on the 4625 rows.</div>
<div class="ad-miss" data-guess="c">A task with an old password fails on every run. It would not fail four times and then succeed.</div>
<div class="ad-miss" data-guess="d">A clock problem shows up as Kerberos time errors. Every failure here is 0xC000006A, which means a bad password.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{b}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Each fact alone might have an innocent explanation, but together they match automated guessing that succeeded.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="tq-10" data-attempts="0">
<span class="ad-mission__num">Stage 2 · Exploitation · T1110.001 Password Guessing · INC-1046 · Critical</span>
<h4>The First Move</h4>
<p><strong>SIEM Alert · Part 5 of 5 · Automated detection · 2:12 AM</strong><br>You believe an admin account is compromised and in use on a Wealth Management machine. It is 2:12 AM. What do you do first?<br><strong>A</strong> Wipe and reimage WM-WKS07 right now.<br><strong>B</strong> Disable alex.rivera and isolate WM-WKS07 from the network while keeping the logs.<br><strong>C</strong> Email Alex and wait for an answer.<br><strong>D</strong> Clear the failed logon events so the alert stops repeating.</p>
<p><strong>Task:</strong> Choose the best first move and type its letter.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Your First Move" placeholder="A, B, C, or D" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The first move has to stop the session and keep the evidence.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">Wiping the machine now destroys the evidence before anyone reads it. Contain the account and the machine first.</div>
<div class="ad-miss" data-guess="c">Waiting on email gives the attacker time, and the attacker may be reading Alex's mail. Contain first.</div>
<div class="ad-miss" data-guess="d">Clearing the log destroys evidence, and Windows records the clear itself as Event 1102. Contain first.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{b}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Disable the account and isolate the machine while you keep the logs. Containing the session now does not undo what twelve minutes of admin access could already have been used for. What, if anything, got planted on the domain controller while that session was live is the next thing to check.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="cp-03" data-attempts="0">
<span class="ad-mission__num">Stage 3 · Installation · T1053.005 Scheduled Task · INC-1069 · High</span>
<h4>What They Left Running</h4>
<p><strong>SOC Queue · Follow-up · 2:40 AM</strong><br>With two accounts compromised, the next question is what the attacker did with that access. Find the scheduled task on the domain controller that nobody on the team created.</p>
<p><strong>Task:</strong> Report its exact name.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for What They Left Running" placeholder="task name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{systemindexmaintenance}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A task built to blend in takes a name that sounds like routine maintenance. Read what it actually runs, not just its name.</p>
<ol>
<li>Open Task Scheduler with Win+R and <code>taskschd.msc</code>.</li>
<li>Open Task Scheduler Library and sort by Name.</li>
<li>Find the task nobody on the team recognizes, then open its Actions tab.</li>
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
<p class="ad-flag__code"><code>GTF{systemindexmaintenance}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A task that runs on a timer keeps acting without anyone signed in. It does not need the stolen credential used again to keep working, which is exactly what makes Installation (T1053.005, Scheduled Task) dangerous: it survives the very containment step that just locked the account out.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="cp-04" data-attempts="0">
<span class="ad-mission__num">Stage 4 · Command and Control · T1571 Non-Standard Port · INC-1069 · High</span>
<h4>Close Its Channel</h4>
<p><strong>SOC Queue · Follow-up · 2:45 AM</strong><br>The task is reaching out through an outbound firewall rule.</p>
<p><strong>Task:</strong> Find and disable that rule, then type the port it allowed.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Close Its Channel" placeholder="port number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{8080}">Submit</button>
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
<li><code>Get-NetFirewallRule -Group "PurveX Lab" -Direction Outbound | Where-Object DisplayName -like "*Helper*" | Disable-NetFirewallRule</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{8080}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Port 8080 is not a port anything on the domain controller is supposed to use outbound. A beacon reaching out on a non-standard port, rather than blending into ordinary web traffic on 443, is exactly what T1571 (Non-Standard Port) under the Command and Control tactic describes. Disabling the rule stops the beacon even if the task itself is still sitting there.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="cc-11" data-attempts="0">
<span class="ad-mission__num">Stage 5 · Detection Engineering · INC-1072 · Medium</span>
<h4>Write the Detection</h4>
<p><strong>Detection Engineering Lead · Post-incident · 11:00 AM</strong><br>The spray worked once, quietly, because nothing was watching for the pattern itself, only for a single account failing repeatedly. Using the TRACE method from this phase's detection-writing week, write the query that would have caught it.</p>
<p><strong>Task:</strong> Using Security event 4625, write the KQL that counts distinct target accounts per source within a 5-minute window and flags sources touching 5 or more accounts. Type the aggregation line only: the <code>summarize</code> clause.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Write the Detection" placeholder="summarize ..." autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{summarize accountcount = dcount(targetusername) by ipaddress, bin(timegenerated, 5m)}" data-accept="summarize accountcount=dcount(targetusername) by ipaddress,bin(timegenerated,5m)">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>TRACE: Technique (password spraying touches many accounts from one source), Reference (4625), Aggregate (count distinct accounts per source per window), Condition (threshold), Escalation. This step is the Aggregate line.</p>
<ol>
<li><code>summarize</code> starts the aggregation.</li>
<li><code>dcount(TargetUserName)</code> counts distinct accounts touched, not total events.</li>
<li><code>by IPAddress, bin(TimeGenerated, 5m)</code> groups by source and a 5-minute window, so a slow trickle across hours does not falsely match.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="count\(\)">Counting every event misses the point. A single account failing 20 times should not trigger this; count distinct accounts, not total failures.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>summarize AccountCount = dcount(TargetUserName) by IPAddress, bin(TimeGenerated, 5m)</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A spray and a brute force both fill a log with 4625 events. Only counting distinct accounts, not total failures, tells them apart. The Condition step this query still needs is a threshold, <code>| where AccountCount >= 5</code>, and the Escalation step names who gets paged. A detection that cannot explain its own aggregate logic is a detection nobody can tune later.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="cc-12" data-attempts="0">
<span class="ad-mission__num">Stage 6 · Write-Up · Medium</span>
<h4>Name the Stage That Never Happened</h4>
<p><strong>SOC Lead · Final write-up · 11:30 AM</strong><br>Exploitation twice, Installation, Command and Control. Four stages, four confirmed findings, all closed.</p>
<p><strong>Task:</strong> Name the Cyber Kill Chain stage that comes right after Command and Control, the one this campaign never reached because the channel was closed first.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Name the Stage That Never Happened" placeholder="a stage name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{actions on objectives}" data-accept="actionsonobjectives">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The seven stages in order: Reconnaissance, Weaponization, Delivery, Exploitation, Installation, Command and Control, Actions on Objectives.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="reconnaissance|weaponization|delivery">Those come before Exploitation, not after Command and Control. Name the one at the end of the chain.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{Actions on Objectives}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Actions on Objectives is where an attacker finally does what they came for: steal data, destroy it, or use the access for fraud. This campaign got stopped at Command and Control, one stage short. That is not luck. It is what containing a session, closing a rule and unlocking an account inside the same hour actually buys: the last and most damaging stage of the chain, never reached.</p>
</div>
</div>
</div>
</div>
