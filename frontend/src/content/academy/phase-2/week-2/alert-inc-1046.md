<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>The 2 AM Login</h3>
<p class="ad-brief__ask">Can you work one SIEM alert from the host, through the log, to the first response move?</p>
<p>This is a SOC queue item, not a help desk ticket. A detection fired on <code>alex.rivera</code> at 2:00 AM from <code>WM-WKS07</code>.</p>
<p>You already know how to look that host up in Active Directory. Here you read the exported events and decide whether a 2 AM login from that workstation fits this account and this firm. Do not treat the alert text as the finding.</p>
<p>Build the Phase 1 lab with <code>-IncludeCTF</code> if you have not already. The host and group steps need your lab. The log steps use the export on this page.</p>
<p>Each step asks for a short finding from the host, the log, or the first response. The hint tells you what to open. The finding shows the answer, the problem, and the solution.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 5 solved</span>
</div>

<div class="ad-mission" data-id="tq-06" data-attempts="0">
<span class="ad-mission__num">Alert 01 · INC-1046 · Critical</span>
<h4>The 2 AM Login</h4>
<p><strong>SIEM Alert · Part 1 of 5 · Automated detection · 2:04 AM</strong><br>ALERT: successful login for alex.rivera at 2:00 AM from workstation WM-WKS07, preceded by multiple failed logons. Severity: high.</p>
<p><strong>Question:</strong> Which department OU holds <code>WM-WKS07</code>?</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="department OU" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{wealthmanagement}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Remember:</p>
<ul>
<li>Look at the machine before you read any logs</li>
<li>An OU is the folder the computer lives in</li>
<li>Use the name as AD writes it, no spaces</li>
</ul>
<p>Do this:</p>
<ol>
<li>Open Active Directory Users and Computers (Win+R then <code>dsa.msc</code>)</li>
<li>Right-click the domain, then Find</li>
<li>Change the type to Computers and type <code>WM-WKS07</code></li>
<li>In the left tree, read the department folder above the computer</li>
</ol>
<p>PowerShell is optional last.</p>
<p><code>(Get-ADComputer WM-WKS07).DistinguishedName</code></p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{wealthmanagement}</code></p>
</div>
<div>
<span>Problem</span>
<p>This PC lives in Wealth Management. Alex is IT. An IT admin on that machine at 2 AM is already the wrong pairing.</p>
</div>
<div>
<span>Solution</span>
<p>Check the computer's folder before you read the log. Then keep working this same alert.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="tq-07" data-attempts="0">
<span class="ad-mission__num">Alert 02 · INC-1046 · Critical</span>
<h4>Read the Log</h4>
<p><strong>SIEM Alert · Part 2 of 5 · Automated detection · 2:06 AM</strong><br>The SIEM exported the events around the alert. The log is attached below.</p>
<pre class="ad-evidence"><code>TIME      EVENT  ACCOUNT       HOST      TYPE  DETAIL
01:58:03  4625   alex.rivera   WM-WKS07  3     0xC000006A  bad password
01:58:05  4625   alex.rivera   WM-WKS07  3     0xC000006A  bad password
01:58:07  4625   alex.rivera   WM-WKS07  3     0xC000006A  bad password
01:58:09  4625   alex.rivera   WM-WKS07  3     0xC000006A  bad password
02:00:41  4624   alex.rivera   WM-WKS07  3     success
02:00:41  4672   alex.rivera   WM-WKS07  -     special privileges assigned
02:03:18  4624   alex.rivera   WM-WKS07  3     success</code></pre>
<p><strong>Question:</strong> How many failed logons (Event ID 4625) happen before the first successful logon (4624)?</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="a number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{4}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Remember:</p>
<ul>
<li>Event 4625 is a failed sign-in</li>
<li>Event 4624 is a success</li>
<li>You do not need PowerShell for this one</li>
</ul>
<p>Do this:</p>
<ol>
<li>Use the export on this page</li>
<li>Or open Event Viewer (Win+R then <code>eventvwr.msc</code>) if you are reading the live Security log</li>
<li>Count the 4625 rows that happen before the first 4624</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{4}</code></p>
</div>
<div>
<span>Problem</span>
<p>Four failed sign-ins (4625), then a success (4624), two seconds apart. A person at a keyboard does not type that fast.</p>
</div>
<div>
<span>Solution</span>
<p>Write the count in the ticket. Treat the speed as a sign of guessing, not a typo.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="tq-08" data-attempts="0">
<span class="ad-mission__num">Alert 03 · INC-1046 · Critical</span>
<h4>Why the Privileges?</h4>
<p><strong>SIEM Alert · Part 3 of 5 · Automated detection · 2:08 AM</strong><br>Event 4672 in the log records special privileges being assigned to Alex's new session.</p>
<p><strong>Question:</strong> Which of Alex's groups explains why his session received special privileges?</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="group name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{it-admins}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Remember:</p>
<ul>
<li>Event 4672 is unusual for a normal user</li>
<li>It means Windows gave this session admin-level rights</li>
<li>A staff group does not do that</li>
</ul>
<p>Do this:</p>
<ol>
<li>Open Active Directory Users and Computers (Win+R then <code>dsa.msc</code>)</li>
<li>Right-click the domain, then Find, and type <code>alex.rivera</code></li>
<li>Open the account, then Member Of</li>
<li>Find the group that is not just department access</li>
</ol>
<p>PowerShell is optional last.</p>
<p><code>Get-ADPrincipalGroupMembership alex.rivera | Select Name</code></p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{it-admins}</code></p>
</div>
<div>
<span>Problem</span>
<p>Event 4672 means this session got admin-level rights. A stolen admin can reset passwords and add people to groups.</p>
</div>
<div>
<span>Solution</span>
<p>Treat every action this account takes as hostile until you stop the session.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="tq-09" data-attempts="0">
<span class="ad-mission__num">Alert 04 · INC-1046 · Critical</span>
<h4>Mistake or Attack?</h4>
<p><strong>SIEM Alert · Part 4 of 5 · Automated detection · 2:10 AM</strong><br>Four failed logons two seconds apart, then a success, at 2 AM, on a workstation outside IT, using the only admin account. What best explains it?<br><strong>A</strong> Alex mistyped his password four times.<br><strong>B</strong> Automated password guessing against a real account, which finally worked.<br><strong>C</strong> A scheduled maintenance task using an old credential.<br><strong>D</strong> A clock problem on the domain controller.</p>
<p><strong>Question:</strong> Type the letter of the best explanation.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="A, B, C, or D" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Stack the facts:</p>
<ul>
<li>Four failures in two seconds</li>
<li>2 AM</li>
<li>Wrong department PC</li>
<li>Admin account</li>
</ul>
<p>Remember:</p>
<ul>
<li>A person does not type that fast</li>
<li>A maintenance job does not try four bad passwords</li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{b}</code></p>
</div>
<div>
<span>Problem</span>
<p>Four failures in two seconds, at 2 AM, on the wrong PC, using the admin account. A typo or a scheduled task does not look like that.</p>
</div>
<div>
<span>Solution</span>
<p>Treat it as an attack until you prove it is not.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="tq-10" data-attempts="0">
<span class="ad-mission__num">Alert 05 · INC-1046 · Critical</span>
<h4>Your First Move</h4>
<p><strong>SIEM Alert · Part 5 of 5 · Automated detection · 2:12 AM</strong><br>You believe the only admin account is compromised and in use on a Wealth Management machine. It is 2:12 AM. What do you do first?<br><strong>A</strong> Wipe and reimage WM-WKS07 right now.<br><strong>B</strong> Disable alex.rivera, isolate WM-WKS07 from the network, and keep the logs.<br><strong>C</strong> Email Alex and wait for an answer.<br><strong>D</strong> Clear the failed logon events so the alert stops repeating.</p>
<p><strong>Question:</strong> Type the letter of the best first move.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="A, B, C, or D" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The first move must:</p>
<ul>
<li>Stop the session</li>
<li>Keep the evidence</li>
</ul>
<p>Ask what each other option costs you:</p>
<ul>
<li>One deletes the log</li>
<li>One gives the attacker time</li>
<li>One hides the alert</li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{b}</code></p>
</div>
<div>
<span>Problem</span>
<p>Wiping the PC deletes proof. Waiting on email gives the attacker time. Deleting events hides the alert.</p>
</div>
<div>
<span>Solution</span>
<p>Stop the session first. Keep the logs. Wipe later if you still need to.</p>
</div>
</div>
</div>
</div>
