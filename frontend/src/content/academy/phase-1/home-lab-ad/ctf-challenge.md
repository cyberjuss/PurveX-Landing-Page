<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Can you find your way around Active Directory well enough to do a help desk technician's first-day work?</p>
</div>

<div class="ad-brief">
<h3>Operation Day One</h3>
<p>First day on the GovTech Financial IT help desk. Nobody expects you to close an incident yet but they do expect you to:</p>
<ul>
<li>Find people</li>
<li>Find groups</li>
<li>Find where things live</li>
<li>Read what the directory says</li>
</ul>
<p>Every answer comes from your lab. Open Active Directory Users and Computers and do not answer from memory or from a tab you read earlier.</p>
<p>If a title and a group disagree, trust the group. If a ticket and the folder disagree, trust the folder. Day One is the job of looking it up.</p>
<p>Each task asks for a short answer:</p>
<ul>
<li>A group name</li>
<li>A person</li>
<li>A number</li>
</ul>
<p>Case, spaces, dots, and dashes do not matter. The hint tells you what to open. The finding shows the answer, the problem, and the solution. You get three tries per task. The hint unlocks after two wrong tries. The explanation unlocks after the third.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 10 solved</span>
</div>

<div class="ad-mission" data-id="d1-01" data-attempts="0">
<span class="ad-mission__num">Task 01 · Find an Account</span>
<h4>Which Group Is Jordan In?</h4>
<p>Which department group is <code>jordan.ellis</code> in?</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="group name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{finance-accounting-users}">Submit</button>
<button type="button" class="ad-hint__btn">Get a hint</button>
</div>
<p class="ad-hint__text">Open Active Directory Users and Computers (Win+R then <code>dsa.msc</code>). Right-click the domain → Find, type <code>jordan.ellis</code>, open the account → Member Of. Ignore Domain Users. Everyone has that. The department group is the one that actually gives mail and file access.<br><br>PowerShell is optional: <code>Get-ADPrincipalGroupMembership jordan.ellis | Select Name</code></p>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{finance-accounting-users}</code></p>
</div>
<div>
<span>Problem</span>
<p>A ticket gives a name, not a group. Guessing from the job title adds the wrong access.</p>
</div>
<div>
<span>Solution</span>
<p>Find the account, then read Member Of. That group is what Jordan already has.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="d1-02" data-attempts="0">
<span class="ad-mission__num">Task 02 · Find Who Has Admin Rights</span>
<h4>Who Is an Admin?</h4>
<p>Who is in the <code>IT Admins</code> group?</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="first and last name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{alex-rivera}">Submit</button>
<button type="button" class="ad-hint__btn">Get a hint</button>
</div>
<p class="ad-hint__text">Open Active Directory Users and Computers (Win+R then <code>dsa.msc</code>). Right-click the domain → Find, type <code>IT Admins</code>, open it → Members. That list is who can change the directory. It should be short.<br><br>PowerShell is optional: <code>Get-ADGroupMember "IT Admins"</code></p>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{alex-rivera}</code></p>
</div>
<div>
<span>Problem</span>
<p>If you do not know who is in <code>IT Admins</code>, you do not know who can reset passwords and add people to groups.</p>
</div>
<div>
<span>Solution</span>
<p>Open the group and read Members. Keep that list short and current.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="d1-03" data-attempts="0">
<span class="ad-mission__num">Task 03 · Find Where Things Live</span>
<h4>Where Are the Access Groups?</h4>
<p><code>Server Admins</code> and <code>Helpdesk</code> are not inside <code>Departments</code>. Which top-level OU holds them?</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="OU name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{accesslevels}">Submit</button>
<button type="button" class="ad-hint__btn">Get a hint</button>
</div>
<p class="ad-hint__text">An OU is a folder. Department folders hold people.<br><br>Open Active Directory Users and Computers (Win+R then <code>dsa.msc</code>). Expand <code>govtechfinancial.local</code>. Look at the folders sitting next to <code>Departments</code>. One of those is where <code>Server Admins</code> and <code>Helpdesk</code> live.</p>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{accesslevels}</code></p>
</div>
<div>
<span>Problem</span>
<p>If admin groups live under a department, moving a person can drag those rights with them.</p>
</div>
<div>
<span>Solution</span>
<p>Keep people in Departments. Keep groups like Server Admins and Helpdesk in AccessLevels.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="d1-04" data-attempts="0">
<span class="ad-mission__num">Task 04 · Spot the Default Folder</span>
<h4>The Folder That Is Not an OU</h4>
<p>One default folder sits beside your OUs, and Group Policy cannot be linked to it. What is it called, exactly as AD writes it?</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="exact name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{cn=users}">Submit</button>
<button type="button" class="ad-hint__btn">Get a hint</button>
</div>
<p class="ad-hint__text">New accounts land in a default folder if nobody picks a department folder.<br><br>Open Active Directory Users and Computers (Win+R then <code>dsa.msc</code>). Expand <code>govtechfinancial.local</code>. View → Advanced Features if you need the full name. The built-in folder that is not an OU (it does not say Organizational Unit) is that default folder. Group Policy cannot attach to it.</p>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{cn=users}</code></p>
</div>
<div>
<span>Problem</span>
<p>That is a default folder, not an OU. Settings like drive maps and screen lock cannot attach to it.</p>
</div>
<div>
<span>Solution</span>
<p>Create the user in the right department folder, or move them out of this folder the same day.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="d1-05" data-attempts="0">
<span class="ad-mission__num">Task 05 · Read a Description</span>
<h4>What Is the Admin Group For?</h4>
<p>The <code>IT Admins</code> group has a written description. Which role is it meant for? Use dashes between words.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="role" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{it-systems-administrators}">Submit</button>
<button type="button" class="ad-hint__btn">Get a hint</button>
</div>
<p class="ad-hint__text">Open Active Directory Users and Computers (Win+R then <code>dsa.msc</code>). Right-click the domain → Find, type <code>IT Admins</code>, open it → General and read Description. It should say who the group is for, not just repeat the group name.</p>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{it-systems-administrators}</code></p>
</div>
<div>
<span>Problem</span>
<p>A group with no description becomes a junk drawer. People get added just in case.</p>
</div>
<div>
<span>Solution</span>
<p>Read the Description on <code>IT Admins</code> before you add anyone. It says who belongs there.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="d1-06" data-attempts="0">
<span class="ad-mission__num">Task 06 · Titles Are Not Access</span>
<h4>Is Priya on the Help Desk Group?</h4>
<p>Priya Nair's title is "Help Desk Technician." Is she a member of the <code>Helpdesk</code> group? Type <code>yes</code> or <code>no</code>.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="yes or no" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{no}">Submit</button>
<button type="button" class="ad-hint__btn">Get a hint</button>
</div>
<p class="ad-hint__text">A title is a label on the account. Access is a group.<br><br>Open Active Directory Users and Computers (Win+R then <code>dsa.msc</code>). Right-click the domain → Find, type <code>Helpdesk</code>, open it → Members. Do not decide from the word Technician on her account.</p>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{no}</code></p>
</div>
<div>
<span>Problem</span>
<p>Priya's title says Help Desk Technician, but a title does not grant access. She is not in the <code>Helpdesk</code> group.</p>
</div>
<div>
<span>Solution</span>
<p>Read Member Of. She is only in <code>IT Users</code>.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="d1-07" data-attempts="0">
<span class="ad-mission__num">Task 07 · Find by Title</span>
<h4>Who Is the Settlements Coordinator?</h4>
<p>Who has the title <strong>Settlements Coordinator</strong>?</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="first and last name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{riley-kwan}">Submit</button>
<button type="button" class="ad-hint__btn">Get a hint</button>
</div>
<p class="ad-hint__text">Tickets often say a job, not a username.<br><br>Open Active Directory Users and Computers (Win+R then <code>dsa.msc</code>). Right-click the domain → Find → Advanced → Field: Title, value <code>Settlements Coordinator</code>. Or expand <code>Departments</code> → <code>Operations</code> → <code>Users</code> and read Title on each account. Confirm the name before you change anything.<br><br>PowerShell is optional: <code>Get-ADUser -Filter "Title -eq 'Settlements Coordinator'"</code></p>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{riley-kwan}</code></p>
</div>
<div>
<span>Problem</span>
<p>A manager will often say "the settlements person" and never give a username. The wrong account is the wrong person.</p>
</div>
<div>
<span>Solution</span>
<p>Search by the title Settlements Coordinator, then confirm the name before you change anything.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="d1-08" data-attempts="0">
<span class="ad-mission__num">Task 08 · Find a Computer</span>
<h4>What Is the Workstation Called?</h4>
<p>What is the exact name of the computer object in the IT department's <code>Workstations</code> OU?</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="computer name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{it-wks01}">Submit</button>
<button type="button" class="ad-hint__btn">Get a hint</button>
</div>
<p class="ad-hint__text">Open Active Directory Users and Computers (Win+R then <code>dsa.msc</code>). Expand <code>govtechfinancial.local</code> → <code>Departments</code> → <code>IT</code> → <code>Workstations</code>. Find the computer object the same way you find a user. Computer names have no spaces.</p>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{it-wks01}</code></p>
</div>
<div>
<span>Problem</span>
<p>An alert names a host. If you cannot find that computer, you cannot tell whose machine it is.</p>
</div>
<div>
<span>Solution</span>
<p>Look under IT → Workstations. Find the object, read the name. Same as looking up a person.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="d1-09" data-attempts="0">
<span class="ad-mission__num">Task 09 · Count a Group</span>
<h4>How Many People Are in Compliance?</h4>
<p>How many members does the <code>Compliance Users</code> group have?</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="a number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{2}">Submit</button>
<button type="button" class="ad-hint__btn">Get a hint</button>
</div>
<p class="ad-hint__text">Open Active Directory Users and Computers (Win+R then <code>dsa.msc</code>). Right-click the domain → Find, type <code>Compliance Users</code>, open it → Members and count the people. If that number changes later, you know someone was added.<br><br>PowerShell is optional: <code>(Get-ADGroupMember "Compliance Users").Count</code></p>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{2}</code></p>
</div>
<div>
<span>Problem</span>
<p>Without a starting count, you cannot tell if someone was added later.</p>
</div>
<div>
<span>Solution</span>
<p>Open <code>Compliance Users</code> and count. If that number goes up later, someone new was added.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="d1-10" data-attempts="0">
<span class="ad-mission__num">Task 10 · Day One Complete</span>
<h4>How Many Departments Are There?</h4>
<p>How many department OUs sit directly under <code>Departments</code>?</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="a number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{5}">Submit</button>
<button type="button" class="ad-hint__btn">Get a hint</button>
</div>
<p class="ad-hint__text">Open Active Directory Users and Computers (Win+R then <code>dsa.msc</code>). Expand <code>govtechfinancial.local</code> → <code>Departments</code>. Count only the first-level folders. Skip Users and Workstations. Those sit inside a department. They are not departments.</p>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{5}</code></p>
</div>
<div>
<span>Problem</span>
<p>Users and Workstations sit inside a department. Counting those folders makes the number too high.</p>
</div>
<div>
<span>Solution</span>
<p>Count only the folders directly under Departments: IT, Compliance, Wealth Management, Operations, and Finance and Accounting.</p>
</div>
</div>
</div>
</div>
