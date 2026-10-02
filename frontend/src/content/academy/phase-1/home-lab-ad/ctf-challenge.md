<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Operation Day One</h3>
<p class="ad-brief__ask">Can you find your way around Active Directory well enough to handle a help desk technician's first day?</p>
<p>It is your first day on the PurveX Financial help desk. Nobody expects you to close incidents yet. Your lead wants proof that you can find any person, group or computer and read what the directory says about it.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 10 solved</span>
</div>

<div class="ad-mission" data-id="d1-01" data-attempts="0">
<span class="ad-mission__num">Task 01 · Find an Account</span>
<h4>Which Group Is Jordan In?</h4>
<p><strong>Situation:</strong> A ticket from Finance and Accounting says Jordan Ellis cannot open a shared folder. Nobody on the desk has looked at Jordan's account yet.</p>
<p><strong>Task:</strong> Find the account <code>jordan.ellis</code> and name the department group it belongs to.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Which Group Is Jordan In?" placeholder="group name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{finance-accounting-users}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The department group is the standard access group for that department, so skip Domain Users and any firm-wide group.</p>
<ol>
<li>Open Active Directory Users and Computers with Win+R and <code>dsa.msc</code>.</li>
<li>Right-click the domain and use Find to search for <code>jordan.ellis</code>.</li>
<li>Open the account and read the Member Of tab.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-ADPrincipalGroupMembership jordan.ellis | Select-Object Name</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="domain-users">Every account in the domain is in Domain Users. Find the group that belongs to Jordan's department.</div>
<div class="ad-miss" data-guess="all-employees">All Employees is the firm-wide announcement group. Find the group that belongs to Jordan's department.</div>
<div class="ad-miss" data-guess="finance-reports">Finance Reports exists for one share. Find the standard access group for Jordan's whole department.</div>
<div class="ad-miss" data-guess="financeaccounting|finance-and-accounting|finance">That is the department or its OU. Type the group name exactly as the Member Of tab shows it.</div>
<div class="ad-miss" data-guess="finance-and-accounting-users|finance-accounting-user">Check the spelling on the Member Of tab. The group name is not written the same way as the department.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{finance-accounting-users}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A ticket names a person, not a group. Guessing the group from a title or a department name adds the wrong access and can expose files the person should never see.</p>
</div>
<div>
<span>What to do</span>
<p>Find the account and read Member Of before you change anything. That list is the access Jordan already has.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="d1-02" data-attempts="0">
<span class="ad-mission__num">Task 02 · Find Who Has Admin Rights</span>
<h4>Who Is an Admin?</h4>
<p><strong>Situation:</strong> Your lead is preparing a list of accounts with elevated IT access, since those are the accounts attackers want most. At PurveX that access comes from the <code>IT Admins</code> group.</p>
<p><strong>Task:</strong> Name the person who is a member of <code>IT Admins</code>, using their first and last name.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Who Is an Admin?" placeholder="first and last name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{alex-rivera}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>An admin group should have a short member list that you can read in one glance.</p>
<ol>
<li>Open Active Directory Users and Computers with Win+R and <code>dsa.msc</code>.</li>
<li>Right-click the domain and use Find to search for <code>IT Admins</code>.</li>
<li>Open the group and read the Members tab.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-ADGroupMember "IT Admins" | Select-Object Name</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="alex|rivera">Type the person's first and last name.</div>
<div class="ad-miss" data-guess="administrator">The built-in Administrator account is not a member of IT Admins. Read the group's Members tab.</div>
<div class="ad-miss" data-guess="priya-nair">Priya works in IT but is not in IT Admins. Read the group's Members tab.</div>
<div class="ad-miss" data-guess="it-admins|it-users">That is a group. Type the name of the person who is a member of IT Admins.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{alex-rivera}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>If you do not know who holds elevated access, you cannot spot an account that should not be there. A stolen admin login does far more damage than a standard one.</p>
</div>
<div>
<span>What to do</span>
<p>Read the group's Members tab and keep that list short and reviewed. Anyone you cannot explain is worth a question to your lead.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="d1-03" data-attempts="0">
<span class="ad-mission__num">Task 03 · Find Where Things Live</span>
<h4>Where Are the Access Groups?</h4>
<p><strong>Situation:</strong> An external auditor is reviewing who can administer servers and workstations. They want to know where the firm keeps its access-level groups, <code>Server Admins</code> and <code>Helpdesk</code>, since those groups sit outside the department folders.</p>
<p><strong>Task:</strong> Name the top-level OU that holds <code>Server Admins</code> and <code>Helpdesk</code>.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Where Are the Access Groups?" placeholder="OU name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{accesslevels}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>An OU is a folder. The department folders hold people, so the access groups sit in a folder of their own at the same level.</p>
<ol>
<li>Open Active Directory Users and Computers with Win+R and <code>dsa.msc</code>.</li>
<li>Expand <code>purvexfinancial.local</code> and look at the folders beside <code>Departments</code>.</li>
<li>Open each one until you find <code>Server Admins</code> and <code>Helpdesk</code>.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="departments">Departments holds the people. The access groups sit in a separate top-level OU beside it.</div>
<div class="ad-miss" data-guess="it">The IT OU holds IT's own groups such as IT Admins. Server Admins and Helpdesk sit in a top-level OU of their own.</div>
<div class="ad-miss" data-guess="users|cn=users|builtin">That is a built-in container rather than an OU the firm created. Look at the OUs directly under purvexfinancial.local.</div>
<div class="ad-miss" data-guess="serviceaccounts">ServiceAccounts holds the backup service account. Open the other top-level OUs and look for Server Admins.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{accesslevels}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>If admin groups lived inside a department folder, a reorganization or a folder-level permission could hand those privileges to the wrong people.</p>
</div>
<div>
<span>What to do</span>
<p>Keep people in Departments and keep domain-wide access groups such as Server Admins and Helpdesk in AccessLevels.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="d1-04" data-attempts="0">
<span class="ad-mission__num">Task 04 · Spot the Default Folder</span>
<h4>The Folder That Is Not an OU</h4>
<p><strong>Situation:</strong> Someone created an account without choosing a department, so Windows put it in the default folder for new users. That folder is a container rather than an OU, and the difference matters for Group Policy.</p>
<p><strong>Task:</strong> Give the name of that default folder exactly as Active Directory writes it in the object's distinguished name.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for The Folder That Is Not an OU" placeholder="exact name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{cn=users}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A container uses a plain folder icon, while an OU's folder carries a small extra badge.</p>
<ol>
<li>Open Active Directory Users and Computers with Win+R and <code>dsa.msc</code>.</li>
<li>Expand <code>purvexfinancial.local</code> and find the built-in folder that holds user accounts.</li>
<li>Turn on View → Advanced Features. Open the folder's Properties from the tree and read the first part of distinguishedName on the Attribute Editor tab.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="users">That is the display name. The task asks for the name as distinguishedName writes it with its prefix.</div>
<div class="ad-miss" data-guess="ou=users">Containers and OUs use different prefixes in a distinguishedName. This folder is a container.</div>
<div class="ad-miss" data-guess="computers|cn=computers">That container holds new computers. This ticket is about a new user account.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{cn=users}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>No Group Policy can be linked to a container, so department settings such as drive maps and screen-lock rules never reach an account left there. Only domain-wide policy does.</p>
</div>
<div>
<span>What to do</span>
<p>Create each account in its department's Users OU, or move it there the same day it is created.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="d1-05" data-attempts="0">
<span class="ad-mission__num">Task 05 · Read a Description</span>
<h4>What Is the Admin Group For?</h4>
<p><strong>Situation:</strong> A request has come in to add someone to <code>IT Admins</code>. The group's Description is supposed to say who the group is meant for.</p>
<p><strong>Task:</strong> Read the Description on <code>IT Admins</code> and name the role it is meant for.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for What Is the Admin Group For?" placeholder="role" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{it-systems-administrators}" data-accept="it-systems-administrator">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A good Description names who belongs in the group instead of repeating the group's name.</p>
<ol>
<li>Open Active Directory Users and Computers with Win+R and <code>dsa.msc</code>.</li>
<li>Right-click the domain and use Find to search for <code>IT Admins</code>.</li>
<li>Open the group and read Description on the General tab.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="it-admins">That repeats the group's name. Read the Description field on the General tab.</div>
<div class="ad-miss" data-guess="elevated-access">That is what the group grants. The Description also names who the group is for.</div>
<div class="ad-miss" data-guess="alex-rivera">That is the current member. The task asks for the role the Description names.</div>
<div class="ad-miss" data-guess="it-users">IT Users is the standard group. Name the role the IT Admins Description says the group is for.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{it-systems-administrators}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A group without a clear purpose collects members over time. Each extra member is one more account that can be misused if its password is stolen.</p>
</div>
<div>
<span>What to do</span>
<p>Read the Description before you add anyone. If the request does not match it, ask your lead before you act.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="d1-06" data-attempts="0">
<span class="ad-mission__num">Task 06 · Titles Are Not Access</span>
<h4>Is Priya on the Help Desk Group?</h4>
<p><strong>Situation:</strong> A ticket says Priya Nair has help desk privileges she should not have. Her title is Help Desk Technician, but a title is only a label on the account. Privileges come from groups.</p>
<p><strong>Task:</strong> Check whether Priya is a member of the <code>Helpdesk</code> group, and answer <code>yes</code> or <code>no</code>.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Is Priya on the Help Desk Group?" placeholder="yes or no" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{no}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Decide from the group's member list, not from the word Technician on her account.</p>
<ol>
<li>Open Active Directory Users and Computers with Win+R and <code>dsa.msc</code>.</li>
<li>Right-click the domain and use Find to search for <code>Helpdesk</code>.</li>
<li>Open the group and read the Members tab.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="yes|y">Priya's title mentions the help desk, but a title grants nothing. Check for her name on the Helpdesk group's Members tab.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{no}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Deciding access from a job title leads to wrong changes. You either remove access someone needs or leave access that should be gone.</p>
</div>
<div>
<span>What to do</span>
<p>Read the group's Members or the person's Member Of tab. Priya has IT Users but not Helpdesk, so there is nothing to remove.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="d1-07" data-attempts="0">
<span class="ad-mission__num">Task 07 · Find by Title</span>
<h4>Who Is the Settlements Coordinator?</h4>
<p><strong>Situation:</strong> A manager calls about "the settlements coordinator" and does not know the person's username. The request names only the job title.</p>
<p><strong>Task:</strong> Find the person whose title is <strong>Settlements Coordinator</strong>, and answer with their first and last name.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Who Is the Settlements Coordinator?" placeholder="first and last name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{riley-kwan}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Tickets often describe a job instead of a username, so search by the title.</p>
<ol>
<li>Open Active Directory Users and Computers with Win+R and <code>dsa.msc</code>.</li>
<li>Open Find from the domain's right-click menu and go to the Advanced tab.</li>
<li>Set Field to User → Job Title and search for <code>Settlements Coordinator</code>. You can also browse Departments → Operations → Users and read each Title.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-ADUser -Filter "Title -eq 'Settlements Coordinator'"</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="kai-mendes">Kai supports the settlements team as a contractor with a different title. Search the Job Title field for the exact title.</div>
<div class="ad-miss" data-guess="taylor-osei">Taylor works in Operations under a different title. Search the Job Title field for the exact title.</div>
<div class="ad-miss" data-guess="riley|kwan">Type the person's first and last name.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{riley-kwan}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Acting on the wrong account changes someone else's access, and that mistake is easy to miss until it causes harm.</p>
</div>
<div>
<span>What to do</span>
<p>Search by the title, then confirm the name with the caller before you make any change.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="d1-08" data-attempts="0">
<span class="ad-mission__num">Task 08 · Find a Computer</span>
<h4>What Is the Workstation Called?</h4>
<p><strong>Situation:</strong> IT is planning a hardware refresh, and the asset list for the IT department has one workstation on it. The vendor needs the computer's exact name as it appears in the domain before they can quote a replacement.</p>
<p><strong>Task:</strong> Give the exact name of the computer object in the IT department's <code>Workstations</code> OU.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for What Is the Workstation Called?" placeholder="computer name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{it-wks01}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>You find a computer the same way you find a person. Computer names have no spaces.</p>
<ol>
<li>Open Active Directory Users and Computers with Win+R and <code>dsa.msc</code>.</li>
<li>Expand <code>purvexfinancial.local</code> → <code>Departments</code> → <code>IT</code> → <code>Workstations</code>.</li>
<li>Read the name of the computer object inside.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="wm-wks07|ops-wks03|fin-lt14">That computer belongs to another department. Open Departments → IT → Workstations.</div>
<div class="ad-miss" data-guess="it-wks1|wks01|it-wks">Type the computer's name exactly as it appears, with every letter and digit.</div>
<div class="ad-miss" data-guess="workstations">That is the OU. Report the name of the computer object inside it.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{it-wks01}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>If you cannot find the computer an alert names, you cannot tell who it belongs to and the investigation stalls.</p>
</div>
<div>
<span>What to do</span>
<p>Look under Departments → IT → Workstations and read the object's name the same way you would look up a person.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="d1-09" data-attempts="0">
<span class="ad-mission__num">Task 09 · Count a Group</span>
<h4>How Many People Are in Compliance?</h4>
<p><strong>Situation:</strong> An auditor wants a starting count of who can reach Compliance data, so any later change stands out.</p>
<p><strong>Task:</strong> Count the members of the <code>Compliance Users</code> group.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for How Many People Are in Compliance?" placeholder="a number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{2}" data-lab-answer="members:Compliance Users">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Count the people listed on the group's Members tab.</p>
<ol>
<li>Open Active Directory Users and Computers with Win+R and <code>dsa.msc</code>.</li>
<li>Right-click the domain and use Find to search for <code>Compliance Users</code>.</li>
<li>Open the group and count the entries on the Members tab.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>(Get-ADGroupMember "Compliance Users").Count</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="#">Count only the entries on the Members tab of Compliance Users. People in other groups or OUs do not count.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{2}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Without a starting count, nobody notices when someone is quietly added to a group that reaches regulated client data.</p>
</div>
<div>
<span>What to do</span>
<p>Record the count. If it grows later, find the ticket that explains the new member.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="d1-10" data-attempts="0">
<span class="ad-mission__num">Task 10 · Day One Complete</span>
<h4>How Many Departments Are There?</h4>
<p><strong>Situation:</strong> HR is updating the new-hire guide and asked IT how many departments the firm has in its directory. Your lead passed the question to you before you head home on your first day.</p>
<p><strong>Task:</strong> Count the department OUs that sit directly under <code>Departments</code>.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for How Many Departments Are There?" placeholder="a number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{5}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Count only the first level of folders. Users and Workstations sit inside a department, so they are not departments themselves.</p>
<ol>
<li>Open Active Directory Users and Computers with Win+R and <code>dsa.msc</code>.</li>
<li>Expand <code>purvexfinancial.local</code>, then <code>Departments</code>.</li>
<li>Count the folders directly under Departments.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="#">Count only the folders one level under Departments. Users and Workstations sit inside a department, so they do not count.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{5}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Counting nested folders inflates the number, and a wrong picture of the directory leads to changes in the wrong place.</p>
</div>
<div>
<span>What to do</span>
<p>Count only the folders directly under Departments: IT, Compliance, WealthManagement, Operations, and FinanceAccounting.</p>
</div>
</div>
</div>
</div>
