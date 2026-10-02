<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>The 2 AM Login</h3>
<p class="ad-brief__ask">Can you work one SIEM alert from the host through the log to the first response?</p>
<p>This is a SOC queue item rather than a help desk ticket. At 2:04 AM the SIEM flagged a successful sign-in for <code>alex.rivera</code> on <code>WM-WKS07</code>, preceded by several failed attempts. Your job is to decide whether that sign-in fits this account and this firm.</p>
<p>The host and group steps use your Phase 1 lab, and the log steps use the export shown on this page. Keep your lab running, because every step checks that it is live before it grades.</p>
<p>Each step takes a short answer like a folder name or a number. You get three tries per step. The hint unlocks after two misses and the explanation unlocks once you solve the step or use all three tries.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 5 solved</span>
</div>

<div class="ad-mission" data-id="tq-06" data-attempts="0">
<span class="ad-mission__num">Alert 01 · INC-1046 · Critical</span>
<h4>The 2 AM Login</h4>
<p><strong>SIEM Alert · Part 1 of 5 · Automated detection · 2:04 AM</strong><br>ALERT: successful login for alex.rivera at 2:00 AM from workstation WM-WKS07, preceded by multiple failed logons. Severity: high.</p>
<p><strong>Your task:</strong> Start with the machine. Find <code>WM-WKS07</code> in Active Directory and name the department OU that holds it, as Active Directory writes it.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="department OU" autocomplete="off" autocapitalize="off" spellcheck="false">
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
<div>
<span>What to do</span>
<p>Check where the computer lives before you read the log, then keep working the same alert.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="tq-07" data-attempts="0">
<span class="ad-mission__num">Alert 02 · INC-1046 · Critical</span>
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
<p><strong>Your task:</strong> Count the failed sign-ins (Event ID 4625) that happen before the first successful sign-in (4624).</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="a number" autocomplete="off" autocapitalize="off" spellcheck="false">
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
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{4}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Four failures land exactly two seconds apart, then a success follows about two and a half minutes later. That steady spacing points to a script guessing passwords, not a person retyping one.</p>
</div>
<div>
<span>What to do</span>
<p>Record the count and the timing in the ticket, and treat the pattern as password guessing rather than a typo.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="tq-08" data-attempts="0">
<span class="ad-mission__num">Alert 03 · INC-1046 · Critical</span>
<h4>Why the Privileges?</h4>
<p><strong>SIEM Alert · Part 3 of 5 · Automated detection · 2:08 AM</strong><br>Event 4672 in the log shows special privileges assigned to Alex's new session. Windows logs it when a sign-in receives sensitive privileges, the kind admin accounts hold.</p>
<p><strong>Your task:</strong> Name the group on Alex's account that explains why the session received special privileges.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="group name" autocomplete="off" autocapitalize="off" spellcheck="false">
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
<div>
<span>What to do</span>
<p>Treat every action this account takes as hostile until the session is stopped and the account is secured.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="tq-09" data-attempts="0">
<span class="ad-mission__num">Alert 04 · INC-1046 · Critical</span>
<h4>Mistake or Attack?</h4>
<p><strong>SIEM Alert · Part 4 of 5 · Automated detection · 2:10 AM</strong><br>You now have four failed logons two seconds apart and then a success. It happened at 2 AM on a workstation outside IT with an admin account. Which explanation fits?<br><strong>A</strong> Alex mistyped his password four times.<br><strong>B</strong> Automated password guessing against a real account, which finally worked.<br><strong>C</strong> A scheduled maintenance task using an old credential.<br><strong>D</strong> A clock problem on the domain controller.</p>
<p><strong>Your task:</strong> Choose the explanation that fits all of the evidence and type its letter.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="A, B, C, or D" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Line up the facts: steady two-second failures at 2 AM from an admin account on a PC in another department.</p>
<p>A person does not retry on a steady beat, and a maintenance job does not try four wrong passwords before it works.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{b}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Each fact alone might have an innocent explanation, but together they match automated guessing that succeeded. A typo or a scheduled task does not look like this.</p>
</div>
<div>
<span>What to do</span>
<p>Treat it as an attack until the evidence proves otherwise.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="tq-10" data-attempts="0">
<span class="ad-mission__num">Alert 05 · INC-1046 · Critical</span>
<h4>Your First Move</h4>
<p><strong>SIEM Alert · Part 5 of 5 · Automated detection · 2:12 AM</strong><br>You believe an admin account is compromised and in use on a Wealth Management machine. It is 2:12 AM. What do you do first?<br><strong>A</strong> Wipe and reimage WM-WKS07 right now.<br><strong>B</strong> Disable alex.rivera and isolate WM-WKS07 from the network while keeping the logs.<br><strong>C</strong> Email Alex and wait for an answer.<br><strong>D</strong> Clear the failed logon events so the alert stops repeating.</p>
<p><strong>Your task:</strong> Choose the best first move and type its letter.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="A, B, C, or D" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The first move has to stop the session and keep the evidence.</p>
<p>For each other option, ask what it costs you. One destroys the log and one gives the attacker time. The last one hides the alert.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{b}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Wiping the PC destroys the evidence and waiting on email gives the attacker time. Clearing the events hides what happened.</p>
</div>
<div>
<span>What to do</span>
<p>Disable the account and isolate the machine while you keep the logs. Wipe it later once the investigation has what it needs.</p>
</div>
</div>
</div>
</div>
