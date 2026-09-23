<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>When a request or an alert lands in your queue, can you check what is actually true before you act on it?</p>
</div>

### Ticket Queue

This is the real thing. A working queue at GovTech Financial has staff requests, HR notices, auditor questions, and a security alert, all mixed together. Some tickets are routine. One of them is not, and it takes five steps to handle properly.

Each ticket contains a claim, such as "I locked myself out," "the transfer is done," or "this login is normal." Your job is to check the claim against your own lab and the evidence, then decide what to do.

<div class="ad-answer-guide">
<span class="ad-answer-guide__label">Hands-on required</span>
<p>Most answers come from your own lab and cannot be found on this page. First run <code>Build-Environment.ps1 -IncludeCTF</code> to plant the ticket data. Then use Active Directory Users and Computers to find each answer. Each hint also gives a PowerShell option. You get three tries. The hint unlocks after two wrong tries, and the explanation unlocks after the third.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 10 solved</span>
</div>


<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Ticket 01 · INC-1041 · Low</span>
<h4>Missing Announcements</h4>
<p><strong>Jamie Torres · Wealth Management · 9:12 AM</strong><br>I started last week and I still have not gotten a single company-wide email. Everyone else on my team has. Can you check my access?</p>
<p><strong>Question:</strong> How many members does the <code>All Employees</code> group have?</p>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">Open the group in your lab and read its Members tab. There are 9 people in the directory, so work out who is missing by comparing the list with the User Directory.<br><br>PowerShell option: <code>(Get-ADGroupMember "All Employees").Count</code></p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="a number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{8}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{8}</code></p>
<p>The group has 8 members, not 9. Jamie is the one missing, and she is the person who wrote in. This is a normal access request, not a security problem. Fix it by adding her. The new hire Casey Reed is not in the group either.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Ticket 02 · INC-1042 · Low</span>
<h4>Locked Out</h4>
<p><strong>Riley Kwan · Operations · 8:47 AM</strong><br>It will not let me sign in. I have typed my password wrong a few times, so I think I locked myself out. Can you unlock me?</p>
<p>Do not take the caller's word for it.</p>
<p><strong>Question:</strong> Is <code>riley.kwan</code>'s account locked out? Type <code>true</code> or <code>false</code>.</p>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">Open her account in your lab and check the Account tab. An unlock option only appears when an account is actually locked. Also look at the option about changing the password at next logon.<br><br>PowerShell option: <code>Get-ADUser riley.kwan -Properties LockedOut, PasswordExpired | Select Name, LockedOut, PasswordExpired</code></p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="true or false" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{false}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{false}</code></p>
<p><code>LockedOut</code> is <code>False</code>, so unlocking would fix nothing. <code>PasswordExpired</code> is <code>True</code> because every lab account was created with a forced change at first logon. Riley needs help setting a new password. Check the facts before you take the action the caller asks for.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Ticket 03 · INC-1043 · Medium</span>
<h4>New Hire Access</h4>
<p><strong>IT Manager · Information Technology · 10:30 AM</strong><br>Casey Reed starts on the help desk today. Give Casey the same access as the rest of IT Users, and nothing more.</p>
<p><strong>Question:</strong> How many members does the <code>IT Users</code> group have?</p>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">Open the group in your lab and read its Members tab. Alex, Priya, and Casey are IT staff. If the number is higher than you expect, find who does not belong.<br><br>PowerShell option: <code>(Get-ADGroupMember "IT Users").Count</code></p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="a number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{4}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{4}</code></p>
<p>There are 4 members, not 3. The extra one is <code>svc-backup-job</code>, a service account that sits in a staff group. It is not a person, so it should not inherit staff access. Report it and remove it from the group.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Ticket 04 · INC-1044 · Medium</span>
<h4>The Backup Account</h4>
<p><strong>Compliance Audit · Auditor request · 1:05 PM</strong><br>The auditors need proof that our nightly backup job only runs during its approved window. Please send them the window in writing.</p>
<p><strong>Question:</strong> What run window does the description of <code>svc-backup-job</code> give? Use the format <code>00:00-00:00</code>.</p>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">Open the account's Properties in your lab and read its Description. It ends with the expected hours in 24-hour time.<br><br>PowerShell option: <code>(Get-ADUser svc-backup-job -Properties Description).Description</code></p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="hh:mm-hh:mm" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{01:00-03:00}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{01:00-03:00}</code></p>
<p>The account is approved to run from <code>01:00</code> to <code>03:00</code>. That window is the baseline. A login by this account at noon, or from any workstation other than <code>IT-WKS01</code>, would be an alert on its own.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Ticket 05 · INC-1045 · High</span>
<h4>The Transfer That Did Not Happen</h4>
<p><strong>Human Resources · Transfer notice · 11:20 AM</strong><br>Taylor Osei has transferred from Operations to Compliance, effective today. Please make sure Compliance policies now apply to Taylor.</p>
<p>Policy follows the OU an account lives in, not the notice from HR.</p>
<p><strong>Question:</strong> How many <code>OU=</code> entries are in the path of <code>taylor.osei</code>?</p>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">Find the account in your lab and read the OU path above it. Count only the parts that start with OU=. Ignore CN= and the DC= parts at the end.<br><br>PowerShell option: <code>(Get-ADUser taylor.osei).DistinguishedName</code></p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="a number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{3}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{3}</code></p>
<p>The path is <code>OU=Users,OU=Operations,OU=Departments</code>, three levels. It runs through Operations, so the account never moved and Compliance policies do not apply. Changing a description or job title never moves the object.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Ticket 06 · INC-1046 · Critical</span>
<h4>The 2 AM Login</h4>
<p><strong>SIEM Alert · Part 1 of 5 · Automated detection · 2:04 AM</strong><br>ALERT: successful login for alex.rivera at 2:00 AM from workstation WM-WKS07, preceded by multiple failed logons. Severity: high.</p>
<p>Before you read any logs, look at the machine.</p>
<p><strong>Question:</strong> What ticket ID does the description of <code>WM-WKS07</code> reference? Use the format <code>CTF-TICKET-000</code>.</p>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">Find the computer in your lab, open its Properties, and read the Description. The ID is at the start, before the colon.<br><br>PowerShell option: <code>(Get-ADComputer WM-WKS07 -Properties Description).Description</code></p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="CTF-TICKET-000" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{ctf-ticket-301}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{CTF-TICKET-301}</code></p>
<p><code>WM-WKS07</code> is a Wealth Management workstation, and Alex works in IT. A description that names an IT administrator's 2 AM login on this machine is enough to open a full investigation. The next four tickets work this same alert.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Ticket 07 · INC-1046 · Critical</span>
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
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">Count only the 4625 rows above the first 4624. Ignore the later success.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="a number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{4}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{4}</code></p>
<p>Four failures, then a success. Note what else the log shows. The failures are two seconds apart, <code>0xC000006A</code> means the username was real but the password was wrong, and logon Type 3 is a network logon, not someone at a keyboard.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Ticket 08 · INC-1046 · Critical</span>
<h4>Why the Privileges?</h4>
<p><strong>SIEM Alert · Part 3 of 5 · Automated detection · 2:08 AM</strong><br>Event 4672 in the log records special privileges being assigned to Alex's new session. That is unusual for a normal user.</p>
<p><strong>Question:</strong> Which of Alex's groups explains why his session received special privileges?</p>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">Open Alex's account in your lab and read the Member Of tab. It is the second group he holds, the one nobody else has.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="group name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{it-admins}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{it-admins}</code></p>
<p><code>IT Admins</code>. Whoever holds this session did not just get a user account. They can administer accounts and systems, which raises the severity from one compromised login to possible company-wide impact.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Ticket 09 · INC-1046 · Critical</span>
<h4>Mistake or Attack?</h4>
<p><strong>SIEM Alert · Part 4 of 5 · Automated detection · 2:10 AM</strong><br>Four failed logons two seconds apart, then a success, at 2 AM, on a workstation outside IT, using the only admin account. What best explains it?<br><strong>A</strong> Alex mistyped his password four times.<br><strong>B</strong> Automated password guessing against a real account, which finally worked.<br><strong>C</strong> A scheduled maintenance task using an old credential.<br><strong>D</strong> A clock problem on the domain controller.</p>
<p><strong>Question:</strong> Type the letter of the best explanation.</p>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">Look at the gap between attempts, the hour, and whether an IT admin normally works from a Wealth Management machine.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="A, B, C, or D" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{b}</code></p>
<p>B, automated guessing. A person cannot type four attempts two seconds apart. Any one detail could be innocent. Together they are a real attack, and you treat it that way.</p>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-attempts="0">
<span class="ad-mission__num">Ticket 10 · INC-1046 · Critical</span>
<h4>Your First Move</h4>
<p><strong>SIEM Alert · Part 5 of 5 · Automated detection · 2:12 AM</strong><br>You believe the only admin account is compromised and in use on a Wealth Management machine. It is 2:12 AM. What do you do first?<br><strong>A</strong> Wipe and reimage WM-WKS07 right now.<br><strong>B</strong> Disable alex.rivera, isolate WM-WKS07 from the network, and keep the logs.<br><strong>C</strong> Email Alex and wait for an answer.<br><strong>D</strong> Clear the failed logon events so the alert stops repeating.</p>
<p><strong>Question:</strong> Type the letter of the best first move.</p>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">Stop the spread first, and keep the evidence you will need afterward.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="A, B, C, or D" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{b}</code></p>
<p>B. Contain and keep evidence. Wiping destroys what you need to learn what the attacker did. Waiting gives them time. Clearing logs is tampering with evidence, which is never an analyst's move. Then reach Alex by another channel, escalate, and write down every action with a time.</p>
</div>
</div>
