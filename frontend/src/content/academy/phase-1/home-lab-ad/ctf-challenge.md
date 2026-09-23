<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>An alert fires on a privileged account. Can you say what normal looks like for it, judge what isn't, and choose your first move?</p>
</div>

### Case File: The 2 AM Login

At 2:04 AM, your SIEM raises a high-severity alert on GovTechFinancial: **successful logon after repeated failures, off-hours, privileged account**. You are the analyst on shift. Nobody else is awake.

This case follows the same path a real triage does. Missions 1 to 6 build the baseline in the lab you built in **Build This Lab**, so you know who and what the alert is about. Missions 7 to 10 work the alert itself, using log evidence and the decisions Security+ and CySA+ expect you to make on the job.

<div class="ad-answer-guide">
<span class="ad-answer-guide__label">How answers work</span>
<p>Lab missions take a short finding, such as <code>it-admins</code>. Judgment missions list options; answer with the letter. Case, spaces, dots, and the <code>GTF{ }</code> wrapper don't matter. You get one hint and three tries per mission, then the explanation unlocks. Nothing is submitted or stored.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 10 solved</span>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Mission 01 · Sec+ Identity and Access</span>
<h4>Who Is This Account?</h4>
<p>Triage starts with identity. A ticket mentions <code>jordan.ellis</code>. In Active Directory Users and Computers, open his account. Which security group grants his access?</p>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">Use Find to locate the account, then open its Member Of tab.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="your answer" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{finance-accounting-users}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{finance-accounting-users}</code></p>
<p>Jordan is in <code>Finance Accounting Users</code>, the standard group for his department. Knowing a user's normal group is the first step in spotting access they shouldn't have.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Mission 02 · Sec+ Least Privilege</span>
<h4>Find the Privileged User</h4>
<p>An auditor asks which single user can administer other accounts. Check group membership across the nine users in your lab. Who holds the <code>IT Admins</code> group?</p>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">Open the IT Admins group and read its Members tab. Only one person is in it.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="your answer" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{alex-rivera}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{alex-rivera}</code></p>
<p><code>alex.rivera</code> is in both <code>IT Users</code> and <code>IT Admins</code>. One privileged account is a small target list, and every alert on it deserves extra attention.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Mission 03 · Sec+ Identity and Access</span>
<h4>Where Do Admin Groups Live?</h4>
<p>In your lab, <code>Server Admins</code> and <code>Helpdesk</code> are not inside the <code>Departments</code> OU. Which top-level OU holds them?</p>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">Expand the domain root and look at what sits next to Departments.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="your answer" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{accesslevels}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{accesslevels}</code></p>
<p><code>OU=AccessLevels</code>. Access is separated from department on purpose, so moving someone between departments never silently changes what they can administer.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Mission 04 · Sec+ Secure Configuration</span>
<h4>The Container That Ignores Policy</h4>
<p>Expand the domain root in your lab. One default object sits beside your OUs, and Group Policy can't be linked to it. What is it called, exactly as AD writes it?</p>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">Its name starts with CN=, not OU=. New accounts land here if nobody picks an OU.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="your answer" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{cn=users}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{cn=users}</code></p>
<p><code>CN=Users</code>. GPOs link only to sites, domains, and OUs. An account left here gets no security policy from GovTechFinancial, which makes it a quiet weak spot.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Mission 05 · Sec+ Account Management</span>
<h4>Plan a Service Account</h4>
<p>A nightly backup job needs its own account. Best practice keeps service accounts out of every department. Following the naming style of <code>Departments</code> and <code>AccessLevels</code>, what would you name the top-level OU that holds them?</p>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">One word pair with no spaces, capitalized like the existing OUs. Review the Admin Tasks tab.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="your answer" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{serviceaccounts}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{serviceaccounts}</code></p>
<p><code>OU=ServiceAccounts</code>. Prefix the account (<code>svc-backup-job</code>) so it's obvious in logs. Because nobody types its password, its logons should look identical every night, which makes any deviation easy to catch.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Mission 06 · CySA+ Asset and Access Baselines</span>
<h4>Titles Don't Grant Access</h4>
<p>Priya Nair's title is "Help Desk Technician." Open her account in your lab. Is she actually a member of the <code>Helpdesk</code> group, yes or no?</p>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">Check her Member Of tab, then check the Helpdesk group's Members tab.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="your answer" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{no}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{no}</code></p>
<p>No. Priya is only in <code>IT Users</code>, and <code>Helpdesk</code> is empty. Analysts verify access from the directory, never from a job title or an assumption.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Mission 07 · CySA+ Log Analysis</span>
<h4>Read the Evidence</h4>
<p>The alert links these Windows Security events. Count the failed logons (Event ID 4625) that happen before the first successful logon (4624).</p>
<pre class="ad-evidence"><code>TIME      EVENT  ACCOUNT       HOST     TYPE  STATUS / DETAIL
01:58:03  4625   alex.rivera   WM-WS02  3     0xC000006A  bad password
01:58:05  4625   alex.rivera   WM-WS02  3     0xC000006A  bad password
01:58:07  4625   alex.rivera   WM-WS02  3     0xC000006A  bad password
01:58:09  4625   alex.rivera   WM-WS02  3     0xC000006A  bad password
02:00:41  4624   alex.rivera   WM-WS02  3     success
02:00:41  4672   alex.rivera   WM-WS02  -     special privileges assigned
02:03:18  4624   alex.rivera   WM-WS02  3     success</code></pre>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">Count only the 4625 rows above the first 4624. Ignore the later success.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="your answer" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{4}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{4}</code></p>
<p>Four failures, then a success. Note the details you'll need next: the failures are two seconds apart, <code>0xC000006A</code> means the username was real but the password was wrong, and Type 3 means a network logon, not someone at a keyboard.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Mission 08 · Sec+ Malicious Activity Indicators</span>
<h4>Mistake or Attack?</h4>
<p>Using the evidence in Mission 07, what best explains the pattern? Remember what you know about Alex and the workstation from Missions 2 and 7.</p>
<ul class="ad-options">
<li><strong>A</strong> Alex mistyped his password four times, then got it right.</li>
<li><strong>B</strong> Automated password guessing against a valid account, which finally succeeded.</li>
<li><strong>C</strong> A scheduled maintenance task using a stale credential.</li>
<li><strong>D</strong> A Kerberos clock-skew error on the domain controller.</li>
</ul>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">Weigh the timing between attempts, the hour, and whether IT staff normally log in from a Wealth Management machine.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="A, B, C, or D" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{b}</code></p>
<p>Password guessing. A person can't type four attempts two seconds apart. The username was valid, the logon was remote, it came at 2 AM, and it originated from a workstation outside Alex's department. Any one could be innocent; together they are a true positive.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Mission 09 · CySA+ Impact Analysis</span>
<h4>Why Event 4672 Matters</h4>
<p>Event 4672 records special privileges being assigned to the new session. From what you found in your lab, which group explains why this session received them?</p>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">It's the second group Alex holds, the one nobody else in the directory has.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="your answer" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{it-admins}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{it-admins}</code></p>
<p><code>IT Admins</code>. The attacker didn't just get a user account. They got a session that can administer accounts and systems, which raises the severity from a single compromised login to potential domain-wide impact.</p>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-attempts="0">
<span class="ad-mission__num">Mission 10 · Sec+ Incident Response — Capstone</span>
<h4>Your First Move</h4>
<p>You have confirmed a likely compromise of the only privileged account, working from a Wealth Management workstation, which is a critical department. It is 2:10 AM. What do you do first?</p>
<ul class="ad-options">
<li><strong>A</strong> Wipe and reimage WM-WS02 immediately.</li>
<li><strong>B</strong> Disable <code>alex.rivera</code>, isolate WM-WS02 from the network, and preserve the logs.</li>
<li><strong>C</strong> Email Alex and wait for a reply before acting.</li>
<li><strong>D</strong> Clear the failed-logon events to stop the alert repeating.</li>
</ul>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">Think of the response order: contain the spread first, and keep the evidence you'll need to investigate.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="A, B, C, or D" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{b}</code></p>
<p>Contain, and keep the evidence. Every other option loses something:</p>
<ul class="ad-baseline-list">
<li><strong>Wiping (A):</strong> destroys the memory and disk evidence you need to learn what the attacker did.</li>
<li><strong>Waiting (C):</strong> gives an active attacker time. Reach Alex through a separate channel after containing.</li>
<li><strong>Clearing logs (D):</strong> tampering with evidence. It is never an analyst's move.</li>
</ul>
<p>Then escalate to the incident lead, document each action with a timestamp, and move on to eradication and recovery.</p>
</div>
</div>
