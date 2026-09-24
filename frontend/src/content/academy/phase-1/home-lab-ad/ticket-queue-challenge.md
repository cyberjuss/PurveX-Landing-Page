<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Ticket Queue</h3>
<p class="ad-brief__ask">When a request lands in your queue, can you check what is actually true in Active Directory, then make the change the ticket needs?</p>
<p>This is the help desk queue at GovTech Financial. Tickets arrive as staff requests, HR notices, and auditor questions. Treat the ticket as a claim. Open Active Directory Users and Computers, check the account or the group or the folder, then do the work:</p>
<ul>
<li>Add a member</li>
<li>Restore an account</li>
<li>Create a hire</li>
<li>Remove what does not belong</li>
<li>Write a setting</li>
<li>Move a transfer</li>
</ul>
<p>If the ticket and the directory disagree, fix the directory. The answer is what the directory shows after you act, not the first look.</p>
<p>Run <code>Build-Environment.ps1 -IncludeCTF</code> first so the ticket objects are planted. If you built the lab earlier, run <code>Remove-Environment.ps1</code> and build again with <code>-IncludeCTF</code>.</p>
<p>Each ticket asks for a short finding after you finish:</p>
<ul>
<li>A count</li>
<li>A state</li>
<li>A ticket number</li>
<li>A window</li>
<li>A title</li>
</ul>
<p>Case, spaces, dots, and dashes do not matter. The hint tells you what to open. The finding shows the answer, the problem, and the solution. You get three tries. The hint unlocks after two wrong tries. The explanation unlocks after the third.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 5 solved</span>
</div>

<div class="ad-mission" data-id="tq-01" data-attempts="0">
<span class="ad-mission__num">Ticket 01 · INC-1041 · Low</span>
<h4>Missing Announcements</h4>
<p><strong>Jamie Torres · Wealth Management · 9:12 AM</strong><br>I started last week and I still have not gotten a single company-wide email. Everyone else on my team has. Can you check my access?</p>
<p><strong>Question:</strong> Find the group that receives firm-wide announcements. Add Jamie if she is missing. After you fix it, how many members does that group have?</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="a number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{9}">Submit</button>
<button type="button" class="ad-hint__btn">Get a hint</button>
</div>
<p class="ad-hint__text">Company-wide mail is not a department group. Look under AccessLevels for a firm-wide group, read its Description, then open Members. Add Jamie if she is missing. Count the names after you add her.<br><br>Open Active Directory Users and Computers (Win+R then <code>dsa.msc</code>). Expand AccessLevels. Open the group that says it is for company-wide announcements → Members. Add <code>jamie.torres</code> if she is not there. Count again.<br><br>PowerShell is optional last.</p>
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
<p><strong>Question:</strong> Do not take the action Riley named until you open the account. Restore sign-in if something is actually blocking her. What was wrong? Type <code>locked</code> or <code>disabled</code>.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="locked or disabled" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{disabled}" data-accept="account-is-disabled|account-disabled">Submit</button>
<button type="button" class="ad-hint__btn">Get a hint</button>
</div>
<p class="ad-hint__text">A caller names a symptom. The Account tab names the cause. Locked and disabled are different boxes. Unlock does nothing if the other box is the one that is checked. Fix what you see, then type the problem you found.<br><br>Open Active Directory Users and Computers (Win+R then <code>dsa.msc</code>). Right-click the domain → Find, type <code>riley.kwan</code>, open the account → Account. Read both boxes. Act on the one that is actually checked. Submit the problem, not the word she used.<br><br>PowerShell is optional last.</p>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
        <p class="ad-flag__code"><code>GTF{disabled}</code></p>
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
<p><strong>Question:</strong> One leftover account in <code>IT Users</code> is not a current person. Open it and read Description before you delete it. What ticket number is written there?</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="ticket number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{ctf-ticket-1043}" data-accept="1043|ctf-1043">Submit</button>
<button type="button" class="ad-hint__btn">Get a hint</button>
</div>
<p class="ad-hint__text">Create Casey in the IT Users folder and mirror a current IT person. Then open Members. A leftover intern and a service account do not belong. Read the intern account before you delete it. The Description names a ticket.<br><br>Open Active Directory Users and Computers (Win+R then <code>dsa.msc</code>). Expand <code>Departments</code> → <code>IT</code> → <code>Users</code>. Create Casey. Open <code>IT Users</code> → Members. Open each name that is not a current IT person. Copy the ticket number from Description, then delete the intern and remove the service account.<br><br>PowerShell is optional last.</p>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
        <p class="ad-flag__code"><code>GTF{ctf-ticket-1043}</code></p>
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
<p><strong>Compliance Audit · Auditor request · 1:05 PM</strong><br><code>svc-backup-job</code> has no usable run window on Description. Auditors want the approved hours written on the account. Those hours are not on this ticket. They are already recorded on the folder that holds the account.</p>
<p><strong>Question:</strong> Find the approved window, write it on Description, then type the window you wrote. Use the format 00:00-00:00.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="00:00-00:00" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{01:00-03:00}" data-accept="1:00-3:00">Submit</button>
<button type="button" class="ad-hint__btn">Get a hint</button>
</div>
<p class="ad-hint__text">The account Description currently says the window is not set. Open the account, then open the folder above it. That folder Description has the approved hours. Copy them onto the account, Apply, then type the same window here.<br><br>Open Active Directory Users and Computers (Win+R then <code>dsa.msc</code>). Right-click the domain → Find, type <code>svc-backup-job</code>. Note the folder path above the account. Open that OU → Properties and read Description. Open the account → General, write that window, Apply.<br><br>PowerShell is optional last.</p>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
        <p class="ad-flag__code"><code>GTF{01:00-03:00}</code></p>
</div>
<div>
<span>Problem</span>
<p>The account had no usable window on it. An auditor cannot use hours that only live on a folder.</p>
</div>
<div>
<span>Solution</span>
<p>Read the approved window on the ServiceAccounts folder. Write it on the account Description and confirm it is there. Later, a sign-in at noon is a problem because you have this range to compare against.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="tq-05" data-attempts="0">
<span class="ad-mission__num">Ticket 05 · INC-1045 · High</span>
<h4>The Transfer That Did Not Happen</h4>
<p><strong>Human Resources · Transfer notice · 11:20 AM</strong><br>Taylor Osei has transferred from Operations to Compliance, effective today. Move the account so Compliance policies apply, and put Taylor in the Compliance group instead of Operations.</p>
<p><strong>Question:</strong> Move the account and switch the groups. An HR notice does not rewrite every field. After you finish, what title is still on <code>taylor.osei</code>?</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="title on the account" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{operations-analyst}">Submit</button>
<button type="button" class="ad-hint__btn">Get a hint</button>
</div>
<p class="ad-hint__text">Policy follows the folder. Groups follow the folder. Title is a different box on General. Move first, then read the account again. Type the title you see, not the department HR named.<br><br>Open Active Directory Users and Computers (Win+R then <code>dsa.msc</code>). Find <code>taylor.osei</code>. Right-click → Move into the Users folder under the department the ticket named. Open Member Of. Add that department group and remove the old one. Open General and read Title.<br><br>PowerShell is optional last.</p>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
        <p class="ad-flag__code"><code>GTF{operations-analyst}</code></p>
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
