<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>When a request lands in your queue, can you check what is actually true in Active Directory, then make the change the ticket needs?</p>
</div>

### Ticket Queue

This is the help desk queue at GovTech Financial:

- Staff requests
- HR notices
- Auditor questions

Every ticket is a sysadmin or help desk job.

The ticket is a claim not proof. Open Active Directory Users and Computers, check the account or the group or the folder, then do the work:

- Add a member
- Restore an account
- Create a hire
- Remove what does not belong
- Write a setting
- Move a transfer

If the ticket and the directory disagree fix the directory. The answer is what the directory shows after you act.

<details class="ad-answer-guide">
<summary class="ad-answer-guide__label">Hands-on required</summary>
<p>Run <code>Build-Environment.ps1 -IncludeCTF</code> first so the ticket objects are planted. If you built the lab earlier run <code>Remove-Environment.ps1</code> and build again with <code>-IncludeCTF</code> so the new ticket state is there. Then make the change in Active Directory Users and Computers. The answer is the state after you finish not the first look. The hint tells you what to open. The finding shows the answer, the problem, and the solution. You get three tries. The hint unlocks after two wrong tries. The explanation unlocks after the third.</p>
</details>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 5 solved</span>
</div>

<div class="ad-mission" data-id="tq-01" data-attempts="0">
<span class="ad-mission__num">Ticket 01 · INC-1041 · Low</span>
<h4>Missing Announcements</h4>
<p><strong>Jamie Torres · Wealth Management · 9:12 AM</strong><br>I started last week and I still have not gotten a single company-wide email. Everyone else on my team has. Can you check my access?</p>
<p><strong>Question:</strong> Add Jamie to <code>All Employees</code> if she is missing. After you fix it, how many members does that group have?</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="a number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{9}">Submit</button>
<button type="button" class="ad-hint__btn">Get a hint</button>
</div>
<p class="ad-hint__text">Company-wide emails go to whoever is in <code>All Employees</code>. Count first, then add the missing person.<br><br>Open Active Directory Users and Computers (Win+R then <code>dsa.msc</code>). Right-click the domain → Find, type <code>All Employees</code>, open it → Members. If Jamie is not there, click Add, type <code>jamie.torres</code>, and confirm. Count the names again after you add her.<br><br>PowerShell is optional: <code>Add-ADGroupMember "All Employees" -Members jamie.torres</code> then <code>(Get-ADGroupMember "All Employees").Count</code></p>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{9}</code></p>
</div>
<div>
<span>Problem</span>
<p>Company-wide emails only go to people in <code>All Employees</code>. Jamie was missing, so she never got the emails.</p>
</div>
<div>
<span>Solution</span>
<p>Add Jamie to <code>All Employees</code>. The next company-wide email will reach her.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="tq-02" data-attempts="0">
<span class="ad-mission__num">Ticket 02 · INC-1042 · Low</span>
<h4>Locked Out</h4>
<p><strong>Riley Kwan · Operations · 8:47 AM</strong><br>It will not let me sign in. I have typed my password wrong a few times, so I think I locked myself out. Can you unlock me?</p>
<p><strong>Question:</strong> Check the Account tab before you take the action Riley named. Restore sign-in if the account is blocked. After you finish, is <code>riley.kwan</code> enabled? Type <code>true</code> or <code>false</code>.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="true or false" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{true}">Submit</button>
<button type="button" class="ad-hint__btn">Get a hint</button>
</div>
<p class="ad-hint__text">Locked and disabled are different. Unlock does nothing if the account is disabled.<br><br>Open Active Directory Users and Computers (Win+R then <code>dsa.msc</code>). Right-click the domain → Find, type <code>riley.kwan</code>, open the account → Account. Read Unlock account and Account is disabled. Act on what is actually checked. Then open the tab again and read Enabled before you submit.<br><br>PowerShell is optional: <code>Get-ADUser riley.kwan -Properties LockedOut, Enabled | Select Name, LockedOut, Enabled</code></p>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{true}</code></p>
</div>
<div>
<span>Problem</span>
<p>Riley said locked out. The account was disabled, so an unlock would not restore sign-in.</p>
</div>
<div>
<span>Solution</span>
<p>Enable the account after you read the Account tab. Close the ticket on what you verified, not on the word she used.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="tq-03" data-attempts="0">
<span class="ad-mission__num">Ticket 03 · INC-1043 · Medium</span>
<h4>New Hire Access</h4>
<p><strong>IT Manager · Information Technology · 10:30 AM</strong><br>Casey Reed starts on the help desk today. Create the account, give Casey the same access as the rest of IT Users, and nothing more. Clean up anything in that group that is not a current IT person.</p>
<p><strong>Question:</strong> After you create <code>casey.reed</code> and remove what does not belong, how many members does <code>IT Users</code> have?</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="a number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{3}">Submit</button>
<button type="button" class="ad-hint__btn">Get a hint</button>
</div>
<p class="ad-hint__text">Create Casey in the IT Users folder, then look at who is already in <code>IT Users</code> before you add her. Mirror Priya Nair. A leftover intern and a service account do not belong in a staff group.<br><br>Open Active Directory Users and Computers (Win+R then <code>dsa.msc</code>). Expand <code>Departments</code> → <code>IT</code> → <code>Users</code>. Right-click Users → New → User. First name Casey, last name Reed, user logon <code>casey.reed</code>. Open Priya Nair → Member Of, then open Casey → Member Of and add only <code>IT Users</code>. Find <code>IT Users</code> → Members. Remove <code>svc-backup-job</code>. Delete <code>old.intern</code> (right-click → Delete). Count the remaining names.<br><br>PowerShell is optional last.</p>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{3}</code></p>
</div>
<div>
<span>Problem</span>
<p>The group had a leftover intern and a backup service account in a staff group. Adding Casey without cleaning that up would have left extra access in place.</p>
</div>
<div>
<span>Solution</span>
<p>Create Casey with IT Users only. Remove the service account from the staff group. Delete the leftover intern. Confirm the member count matches current IT people plus Casey.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="tq-04" data-attempts="0">
<span class="ad-mission__num">Ticket 04 · INC-1044 · Medium</span>
<h4>The Backup Account</h4>
<p><strong>Compliance Audit · Auditor request · 1:05 PM</strong><br>The approved run window for <code>svc-backup-job</code> is 01:00-03:00. Write that window on the account Description so we have it on the record.</p>
<p><strong>Question:</strong> After you write it, what window is on <code>svc-backup-job</code>? Use the format <code>00:00-00:00</code>.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="hh:mm-hh:mm" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{01:00-03:00}">Submit</button>
<button type="button" class="ad-hint__btn">Get a hint</button>
</div>
<p class="ad-hint__text">The auditor wants the hours on the account, not hours you remember from the ticket and never write down.<br><br>Open Active Directory Users and Computers (Win+R then <code>dsa.msc</code>). Right-click the domain → Find, type <code>svc-backup-job</code>, open the account → General. Write the window from the ticket on Description, click Apply, then read it back before you submit.<br><br>PowerShell is optional: <code>Set-ADUser svc-backup-job -Description</code> with the same window the ticket named, then read Description again.</p>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{01:00-03:00}</code></p>
</div>
<div>
<span>Problem</span>
<p>The account had no usable window on it. An auditor cannot use a ticket you never wrote into the directory.</p>
</div>
<div>
<span>Solution</span>
<p>Write <code>01:00-03:00</code> on the Description and confirm it is there. Later, a sign-in at noon is a problem because you have this range to compare against.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="tq-05" data-attempts="0">
<span class="ad-mission__num">Ticket 05 · INC-1045 · High</span>
<h4>The Transfer That Did Not Happen</h4>
<p><strong>Human Resources · Transfer notice · 11:20 AM</strong><br>Taylor Osei has transferred from Operations to Compliance, effective today. Move the account so Compliance policies apply, and put Taylor in the Compliance group instead of Operations.</p>
<p><strong>Question:</strong> After you complete the transfer, which department OU does <code>taylor.osei</code> live in?</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="department OU" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{compliance}">Submit</button>
<button type="button" class="ad-hint__btn">Get a hint</button>
</div>
<p class="ad-hint__text">Policy follows the folder the account lives in. An HR email does not move the object.<br><br>Open Active Directory Users and Computers (Win+R then <code>dsa.msc</code>). Right-click the domain → Find, type <code>taylor.osei</code>. Right-click the account → Move, and pick the Users folder under the department the ticket named. Open Member Of. Add that department group and remove the old one. Confirm the folders above the account match the ticket before you submit.<br><br>PowerShell is optional: <code>Move-ADObject</code> then <code>Add-ADGroupMember</code> / <code>Remove-ADGroupMember</code></p>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{compliance}</code></p>
</div>
<div>
<span>Problem</span>
<p>Taylor still lived in Operations, so Compliance rules did not apply. A title change on an HR notice is not a move.</p>
</div>
<div>
<span>Solution</span>
<p>Move the account into Compliance Users, switch the groups, then confirm the folder before you close the ticket.</p>
</div>
</div>
</div>
</div>
