<div class="ad-brief">
<p class="rd-kicker">Campaign 1 of 4</p>
<h3>The Credential Campaign</h3>
<p class="ad-brief__ask">No malware, just guessed and stolen passwords. Can you work it start to finish, one operation instead of twelve alerts?</p>
<p>Most steps check your Phase 1 lab, so keep it running.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 12 solved</span>
</div>

<div class="ad-mission" data-id="sl-01" data-attempts="0">
<span class="ad-mission__num">Stage 1 · Exploitation · T1110.003 Password Spraying · INC-1072 · Medium</span>
<h4>Count the Spray</h4>
<p><strong>IT Lead · Log review · 10:00 AM</strong><br>A run of failed sign-ins has turned up close together in the Security log, each against a different account. Before anyone calls it an attack, we need the actual count.</p>
<p><strong>Task:</strong> In the Security log, find the failed sign-ins (event 4625) that land within the same short burst and count the distinct accounts that failed.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Count the Spray" placeholder="a number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{6}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A spray and a brute force look alike until you check one thing: is it one account failing many times, or many accounts failing once each?</p>
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
<div class="ad-miss" data-guess="1">That would mean many attempts against one account, which is a brute force. Count the distinct accounts in the burst instead.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{6}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>One password tried once against each of six different accounts is a spray, not a brute force. MITRE catalogs this exact pattern as T1110.003, Password Spraying, under the Credential Access tactic. In Cyber Kill Chain terms, it's Exploitation, because it's an attempt to turn a guess into a way in.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="sl-02" data-attempts="0">
<span class="ad-mission__num">Stage 1 · Exploitation · T1110.003 Password Spraying · INC-1072 · Medium</span>
<h4>The One That Got Through</h4>
<p><strong>IT Lead · Log review · 10:05 AM</strong><br>Most of what's worth flagging in a log is a failure. This time, though, read past the failures.</p>
<p><strong>Task:</strong> Find the account in the Security log that signed in successfully (event 4624) with no failed attempt in front of it at all, and name it.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for The One That Got Through" placeholder="an account name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{svc-night-index}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Every other account in this log either failed outright or failed before it succeeded. Look for the one that did neither.</p>
<ol>
<li>Filter the Security log for event 4624 (successful logon).</li>
<li>For each success, check whether a 4625 for the same account appears right before it.</li>
<li>One success has no failure anywhere near it. Read its Account Name.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="petra.lindqvist">Any success on that account comes after a string of failures and a lockout. Find the account whose success has nothing in front of it.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{svc-night-index}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A clean, unexplained success is easy to skip past, because nothing about it looks like an attack. It still deserves a look. A service account signing in outside its normal job, with no failures around it at all, is the real foothold the spray was testing for.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="sl-03" data-attempts="0">
<span class="ad-mission__num">Stage 1 · Exploitation · T1110.003 Password Spraying · INC-1072 · Medium</span>
<h4>Unlock the Real Lockout</h4>
<p><strong>IT Lead · Log review · 10:10 AM</strong><br>One account's run of failures ends differently from the others. Instead of just a string of failed attempts, it ends in an actual lockout.</p>
<p><strong>Task:</strong> Find the account event 4740 (account lockout) names, confirm it is still locked, unlock it, then report its name.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Unlock the Real Lockout" placeholder="an account name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{petra.lindqvist}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Remember that unlocking the account is part of the task, not just something to read about.</p>
<ol>
<li>Filter the Security log for event 4740 and read the Account That Was Locked Out.</li>
<li>Open Active Directory Users and Computers and confirm the account shows as locked on its Account tab.</li>
<li>Tick "Unlock account" and apply, or run <code>Unlock-ADAccount -Identity &lt;account&gt;</code>.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="svc-night-index">That account signed in cleanly. Read event 4740 to find the one that was actually locked out.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{petra.lindqvist}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A string of failures that ends in a real lockout is the clearest signal in the whole log, and unlocking the account is the fix for right now. The next question is which account got in quietly.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="tq-06" data-attempts="0">
<span class="ad-mission__num">Stage 2 · Exploitation · T1110.001 Password Guessing · INC-1046 · Critical</span>
<h4>A Second Target</h4>
<p><strong>SIEM Alert · Part 1 of 5 · Automated detection · 2:04 AM</strong><br>ALERT: successful login for alex.rivera at 2:00 AM from workstation WM-WKS07, preceded by multiple failed logons. Severity: high. Where the spray tested the whole firm, this one goes after a single admin account by name.</p>
<p><strong>Task:</strong> Start with the machine. Find <code>WM-WKS07</code> in Active Directory and name the department OU that holds it, as Active Directory writes it.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for A Second Target" placeholder="department OU" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{wealthmanagement}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Start with the machine before you read any logs. Its OU is the department folder the computer lives in.</p>
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
<div class="ad-miss" data-guess="workstations">Workstations is the folder inside the department. Report the department OU one level above it.</div>
<div class="ad-miss" data-guess="it">Alex works in IT, but this step is about the computer. Find WM-WKS07 and read the folder that holds it.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{wealthmanagement}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>WM-WKS07 belongs to Wealth Management, with its client financial data, but Alex works in IT. Before you've read a single log, an IT admin signing in to a Wealth Management PC at 2 AM already needs explaining.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="tq-07" data-attempts="0">
<span class="ad-mission__num">Stage 2 · Exploitation · T1110.001 Password Guessing · INC-1046 · Critical</span>
<h4>Read the Log</h4>
<p><strong>SIEM Alert · Part 2 of 5 · Automated detection · 2:06 AM</strong><br>The SIEM has exported the sign-in events from around the time of the alert, and you'll find the export below.</p>
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
<p>Event 4625 is a failed sign-in and 4624 is a successful one. You'll only find these events in the export on this page, not in your lab's Security log.</p>
<ol>
<li>Read the export from top to bottom.</li>
<li>Count the 4625 rows that appear before the first 4624.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="4625">That's the Event ID itself. Count how many rows carry it before the first success.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{4}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Four failures land exactly two seconds apart, and a success follows about two and a half minutes later. That steady spacing points to a script guessing passwords rather than a person retyping one. And because these are four attempts against one named account, rather than the spray's one attempt against many, this is Password Guessing, T1110.001. It belongs to the same Brute Force family, just aimed at one target instead of spread wide.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="tq-08" data-attempts="0">
<span class="ad-mission__num">Stage 2 · Exploitation · T1110.001 Password Guessing · INC-1046 · Critical</span>
<h4>Why the Privileges?</h4>
<p><strong>SIEM Alert · Part 3 of 5 · Automated detection · 2:08 AM</strong><br>Event 4672 in the log shows special privileges being assigned to Alex's new session. Windows logs this event whenever a sign-in receives sensitive privileges, the kind that admin accounts hold.</p>
<p><strong>Task:</strong> Name the group on Alex's account that explains why the session received special privileges.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Why the Privileges?" placeholder="group name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{it-admins}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A department group such as IT Users only grants standard access, so look for the group on Alex's account that grants more.</p>
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
<div class="ad-miss" data-guess="it-users|domain-users">That group only grants standard access. Find the group on Alex's Member Of tab that grants more.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{it-admins}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>So the session that followed the guessing ran with admin-level rights. With a stolen admin login, an attacker can reset passwords and change group memberships, and then cover their tracks.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="tq-09" data-attempts="0" data-hands-on="false">
<span class="ad-mission__num">Stage 2 · Exploitation · T1110.001 Password Guessing · INC-1046 · Critical</span>
<h4>Mistake or Attack?</h4>
<p><strong>SIEM Alert · Part 4 of 5 · Automated detection · 2:10 AM</strong><br>Here's what you have so far: four failed logons two seconds apart, then a success, at 2 AM, with an admin account, on a workstation outside IT. Which explanation fits?<br><strong>A</strong> Alex mistyped the password four times.<br><strong>B</strong> Automated password guessing against a real account, which finally worked.<br><strong>C</strong> A scheduled maintenance task using an old credential.<br><strong>D</strong> A clock problem on the domain controller.</p>
<p><strong>Task:</strong> Choose the explanation that fits all of the evidence and type its letter.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Mistake or Attack?" placeholder="A, B, C, or D" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Line up the facts. You have steady two-second failures at 2 AM, from an admin account, on a PC in another department.</p>
<p>A person doesn't retry on a steady beat, and a maintenance job doesn't try four wrong passwords before one works.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">People who mistype a password don't retry exactly every two seconds. Compare the times on the 4625 rows.</div>
<div class="ad-miss" data-guess="c">A task with an old password fails on every run, so it wouldn't fail four times and then succeed.</div>
<div class="ad-miss" data-guess="d">A clock problem would show up as Kerberos time errors, but every failure here is 0xC000006A, which means a bad password.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{b}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Any one of these facts might have an innocent explanation. Taken together, though, they match automated guessing that eventually succeeded.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="tq-10" data-attempts="0" data-hands-on="false">
<span class="ad-mission__num">Stage 2 · Exploitation · T1110.001 Password Guessing · INC-1046 · Critical</span>
<h4>The First Move</h4>
<p><strong>SIEM Alert · Part 5 of 5 · Automated detection · 2:12 AM</strong><br>It's 2:12 AM, and you believe an admin account has been compromised and is in use on a Wealth Management machine. What do you do first?<br><strong>A</strong> Wipe and reimage WM-WKS07 right now.<br><strong>B</strong> Disable alex.rivera and isolate WM-WKS07 from the network while keeping the logs.<br><strong>C</strong> Email Alex and wait for an answer.<br><strong>D</strong> Clear the failed logon events so the alert stops repeating.</p>
<p><strong>Task:</strong> Choose the best first move and type its letter.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Your First Move" placeholder="A, B, C, or D" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Whatever you do first has to stop the session and keep the evidence.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">Wiping the machine now would destroy the evidence before anyone reads it. Contain the account and the machine first.</div>
<div class="ad-miss" data-guess="c">Waiting on an email reply gives the attacker time, and the attacker may even be reading Alex's mail. Contain first.</div>
<div class="ad-miss" data-guess="d">Clearing the log destroys evidence, and Windows records the clearing itself as Event 1102. Contain first.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{b}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Disable the account and isolate the machine, and keep the logs while you do it. Bear in mind that containing the session now doesn't undo whatever twelve minutes of admin access may already have been used for. So the next thing to check is whether anything was planted on the domain controller while that session was live.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="cp-03" data-attempts="0">
<span class="ad-mission__num">Stage 3 · Installation · T1053.005 Scheduled Task · INC-1069 · High</span>
<h4>What They Left Running</h4>
<p><strong>SOC Queue · Follow-up · 2:40 AM</strong><br>With two accounts compromised, the next question is what the attacker did with that access. Start by finding the scheduled task on the domain controller that nobody on the team created.</p>
<p><strong>Task:</strong> Report its exact name.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for What They Left Running" placeholder="task name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{systemindexmaintenance}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A task built to blend in will have a name that sounds like routine maintenance, so read what it runs, not just what it's called.</p>
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
<p>A task that runs on a timer keeps acting without anyone signed in, and it doesn't need the stolen credential again to keep working. That's what makes this kind of Installation (T1053.005, Scheduled Task) dangerous. It survives the very containment step that just locked the account out.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="cp-04" data-attempts="0">
<span class="ad-mission__num">Stage 4 · Command and Control · T1571 Non-Standard Port · INC-1069 · High</span>
<h4>Close Its Channel</h4>
<p><strong>SOC Queue · Follow-up · 2:45 AM</strong><br>The task isn't working alone. It's reaching out through an outbound firewall rule.</p>
<p><strong>Task:</strong> Find and disable that rule, then type the port it allowed.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Close Its Channel" placeholder="port number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{8080}">Submit</button>
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
<p>Nothing on the domain controller is supposed to use port 8080 outbound. A beacon reaching out on a non-standard port, instead of blending into web traffic on 443, is what T1571 (Non-Standard Port) describes. It sits under the Command and Control tactic. Disabling the rule stops the beacon, even while the task itself is still sitting there.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="cc-11" data-attempts="0" data-hands-on="false">
<span class="ad-mission__num">Stage 5 · Detection Engineering · INC-1072 · Medium</span>
<h4>Write the Detection</h4>
<p><strong>Detection Engineering Lead · Post-incident · 11:00 AM</strong><br>The spray worked once, quietly, because nothing was watching for the pattern itself. The only thing being watched was a single account failing over and over. Using the TRACE method from this phase's detection-writing week, write the query that would have caught it.</p>
<p><strong>Task:</strong> Using Security event 4625, write the KQL that counts distinct target accounts per source within a 5-minute window and flags sources touching 5 or more accounts. Type the aggregation line only: the <code>summarize</code> clause.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Write the Detection" placeholder="summarize ..." autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{summarize accountcount = dcount(targetusername) by ipaddress, bin(timegenerated, 5m)}" data-accept="summarize accountcount=dcount(targetusername) by ipaddress,bin(timegenerated,5m)">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Walk through TRACE: Technique (password spraying touches many accounts from one source), Reference (4625), Aggregate (count distinct accounts per source per window), Condition (threshold) and Escalation. This step is the Aggregate line.</p>
<ol>
<li><code>summarize</code> starts the aggregation.</li>
<li><code>dcount(TargetUserName)</code> counts distinct accounts touched, not total events.</li>
<li><code>by IpAddress, bin(TimeGenerated, 5m)</code> groups by source and a 5-minute window, so a slow trickle across hours does not falsely match.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="count\(\)">Counting every event misses the point, because a single account failing 20 times shouldn't trigger this. Count distinct accounts, not total failures.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>summarize AccountCount = dcount(TargetUserName) by IpAddress, bin(TimeGenerated, 5m)</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A spray and a brute force both fill a log with 4625 events, and only counting distinct accounts, rather than total failures, tells them apart. To finish the query, the Condition step adds a threshold, <code>| where AccountCount >= 5</code>, and the Escalation step names who gets paged. If a detection can't explain its own aggregate logic, nobody will be able to tune it later.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="cc-12" data-attempts="0" data-hands-on="false">
<span class="ad-mission__num">Stage 6 · Write-Up · Medium</span>
<h4>Name the Stage That Never Happened</h4>
<p><strong>SOC Lead · Final write-up · 11:30 AM</strong><br>Exploitation twice, then Installation, then Command and Control. That's four confirmed findings, and all of them are closed.</p>
<p><strong>Task:</strong> Name the Cyber Kill Chain stage that comes right after Command and Control, the one this campaign never reached because the channel was closed first.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Name the Stage That Never Happened" placeholder="a stage name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{actions on objectives}" data-accept="actionsonobjectives">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Here are the seven stages in order: Reconnaissance, Weaponization, Delivery, Exploitation, Installation, Command and Control, and Actions on Objectives.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="reconnaissance|weaponization|delivery">That stage comes before Exploitation, not after Command and Control. Name the one at the end of the chain.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{Actions on Objectives}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Actions on Objectives is where an attacker finally does what they came for, whether that's stealing data, destroying it or using the access for fraud. This campaign was stopped at Command and Control, one stage short, and that wasn't luck. Containing a session, closing a rule and unlocking an account within the same hour is what kept the last and most damaging stage of the chain from ever being reached.</p>
</div>
</div>
</div>
</div>
