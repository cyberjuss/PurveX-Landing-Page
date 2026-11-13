<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Build Out the Directory</h3>
<p class="ad-brief__ask">You've read how the directory fits together. Can you build each piece of it yourself, in your own lab, and explain why it goes where it does?</p>
<p>PurveX Financial is growing, and your job this afternoon is to get the directory ready for it. Where a question asks you to build something, your lab has to show it before your answer counts.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 12 solved</span>
</div>

<div class="ad-mission" data-id="dr-01" data-attempts="0">
<span class="ad-mission__num">Task 01 · Warm-up · Join a Computer</span>
<h4>Pre-Stage the Workstation</h4>
<p><strong>Priya Nair · IT · 1:05 PM</strong><br>A new workstation for the IT team, IT-WKS09, arrives tomorrow. I'd like its computer object waiting in the right folder before anyone joins it to the domain, so it picks up IT's settings from the first boot.</p>
<p><strong>Task:</strong> Create a computer object named <code>IT-WKS09</code> in Departments → IT → Workstations. Then report the default folder a joined computer would have landed in if nobody had pre-staged it.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Pre-Stage the Workstation" placeholder="a folder name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{computers}" data-accept="cn=computers|computers-container">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Pre-staging means creating the computer object before the machine joins, so the join finds it waiting in the folder you chose. The Join a Computer tab named the folder Windows uses when nothing was staged.</p>
<ul>
<li>Open Active Directory Users and Computers with Win+R and <code>dsa.msc</code>.</li>
<li>Expand Departments, IT, and then Workstations.</li>
<li>Right-click Workstations, choose New, then Computer, and enter <code>IT-WKS09</code>.</li>
<li>Look at the folders directly under the domain for the default one a new computer lands in.</li>
</ul>
<p>In PowerShell:</p>
<ul>
<li><code>New-ADComputer -Name "IT-WKS09" -Path "OU=Workstations,OU=IT,OU=Departments,$((Get-ADDomain).DistinguishedName)"</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="workstations|it-workstations|it">That's where you pre-staged IT-WKS09. Name the default folder Windows uses when nobody has staged the computer first.</div>
<div class="ad-miss" data-guess="users|cn=users">The default Users folder holds accounts for people. Computers have a default folder of their own.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{Computers}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A computer that joins without being staged lands in the default Computers folder. That's a Container, so no Group Policy linked to an IT OU can reach it, and the new machine starts life without any of IT's settings.</p>
</div>
<div>
<span>What to do</span>
<p>Pre-stage the computer object in its department's Workstations OU before the join. Then, after the machine restarts, check that it's still in that folder rather than in Computers.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="dr-02" data-attempts="0">
<span class="ad-mission__num">Task 02 · Warm-up · Join a Computer</span>
<h4>Point It at the Domain</h4>
<p><strong>Priya Nair · IT · 1:12 PM</strong><br>Last time we joined a machine, it failed with "domain not found" even though the domain controller was up. I'd like the DNS setting right on IT-WKS09 before we try again.</p>
<p><strong>Task:</strong> Report the IP address you'd enter as the Preferred DNS server on a workstation joining your domain.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Point It at the Domain" placeholder="an IP address" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-lab-answer="dcip">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A workstation finds <code>purvexfinancial.local</code> by asking DNS, and the only DNS server that knows your domain is the domain controller itself. So the answer is your domain controller's own address, which is different in every lab.</p>
<ul>
<li>Sign in to the domain controller.</li>
<li>Open PowerShell or a command prompt and run <code>ipconfig</code>.</li>
<li>Read the IPv4 Address of the adapter the lab uses and type it here.</li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="8.8.8.8|8.8.4.4|1.1.1.1|1.0.0.1|9.9.9.9">That's a public DNS server, and it has never heard of purvexfinancial.local. Use the server that hosts your domain.</div>
<div class="ad-miss" data-guess="127.0.0.1|localhost">That's the loopback address, which points the workstation back at itself. Use the domain controller's address instead.</div>
<div class="ad-miss" data-guess="purvexfinancial.local|dc01">The field takes an address, not a name. A workstation that can't find the domain yet can't look up a name either.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>Your domain controller's IPv4 address</code></p>
</div>
<div>
<span>Why it matters</span>
<p>When a join fails with "domain not found", the cause is almost always DNS. The workstation asked a server that doesn't host the domain, so it never reached the point of checking a password.</p>
</div>
<div>
<span>What to do</span>
<p>Point the workstation's Preferred DNS server at the domain controller and try the join again. If it still fails, check that you can ping the domain controller by name from the workstation.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="dr-06" data-attempts="0" data-hands-on="false">
<span class="ad-mission__num">Task 03 · Warm-up · Accounts</span>
<h4>Person, Machine or Job?</h4>
<p><strong>Alex Rivera · IT · 1:48 PM</strong><br>Before Quinn starts, I'd like to be sure Quinn can tell the three kinds of account apart. Which of these is a user object that doesn't represent a person?<br><strong>A</strong> IT-WKS01<br><strong>B</strong> svc-backup-job<br><strong>C</strong> jordan.ellis</p>
<p><strong>Task:</strong> Select the user object that stands for a job rather than a person and enter its letter.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Person, Machine or Job?" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}" data-accept="svc-backup-job">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Open each one in your directory if you're unsure. Check what kind of object it is first, and then read its name and Description.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a|it-wks01">IT-WKS01 isn't a user object at all. It's a computer object, which stands for a machine.</div>
<div class="ad-miss" data-guess="c|jordan.ellis">jordan.ellis is a person, the Staff Accountant in Finance and Accounting.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{b}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Check the object type, the name and Description before you change anything: a service account is built like a person's but nobody sits behind it, so treating it like one risks putting it in the wrong group or disabling it and breaking the job it runs.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="dr-08" data-attempts="0" data-hands-on="false">
<span class="ad-mission__num">Task 04 · Warm-up · Groups</span>
<h4>OU or Container?</h4>
<p><strong>Priya Nair · IT · 2:02 PM</strong><br>Someone created a test account in the default Users folder last month. IT links its screen-lock GPO to <code>OU=IT</code>. Does that GPO reach the test account?</p>
<p><strong>Task:</strong> Type <code>yes</code> or <code>no</code>.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for OU or Container?" placeholder="yes or no" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{no}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The default Users folder is <code>CN=Users</code>. Think about what kind of folder that is and whether it sits anywhere under <code>OU=IT</code>.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="yes">A GPO linked to OU=IT only reaches objects inside OU=IT. CN=Users is a Container directly under the domain, outside OU=IT altogether.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{no}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>An account left in a default Container misses every policy linked to a department OU, so move it into the right department's Users OU, or remove it if it's a forgotten test account.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="dr-05" data-attempts="0">
<span class="ad-mission__num">Task 05 · Apply it · Accounts</span>
<h4>Create the New Hire</h4>
<p><strong>Alex Rivera · IT · 1:40 PM</strong><br>Quinn Harper starts Monday as our second Help Desk Technician. Please create the account in IT, with the title filled in so the next person can tell what Quinn does.</p>
<p><strong>Task:</strong> Create the user <code>quinn.harper</code> in Departments → IT → Users, with the title <code>Help Desk Technician</code>. Then report the account's full user logon name, the one with the @ in it.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Create the New Hire" placeholder="name@domain" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{quinn.harper@purvexfinancial.local}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The full logon name is the username followed by @ and the domain's name. You'll see it on the account's Account tab as User logon name, with the domain picked from a list beside it.</p>
<ul>
<li>In Active Directory Users and Computers, expand Departments, IT, and then Users.</li>
<li>Right-click Users, choose New, then User. Enter Quinn Harper as the name and <code>quinn.harper</code> as the logon name.</li>
<li>Set a password, finish the wizard, then open the account's Properties.</li>
<li>On the Organization tab, set Title to <code>Help Desk Technician</code> and click Apply.</li>
<li>On the Account tab, read the User logon name together with the domain beside it.</li>
</ul>
<p>In PowerShell:</p>
<ul>
<li><code>$d = Get-ADDomain</code></li>
<li><code>New-ADUser -Name "Quinn Harper" -GivenName Quinn -Surname Harper -SamAccountName quinn.harper -UserPrincipalName "quinn.harper@$($d.DNSRoot)" -Title "Help Desk Technician" -Department "IT" -Path "OU=Users,OU=IT,OU=Departments,$($d.DistinguishedName)" -AccountPassword (Read-Host -AsSecureString "Password") -Enabled $true</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="quinn.harper">That's the username on its own. Add @ and the domain's name to make the full logon name.</div>
<div class="ad-miss" data-guess="purvexfinancial\quinn.harper|purvexfinancial/quinn.harper">That's the older pre-Windows 2000 form. Give the form with the @ in it.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{quinn.harper@purvexfinancial.local}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The full logon name is the form most sign-in screens and most logs use, so it's the one you'll search for when you trace what an account did. Filling in the title at creation time also means the next technician can tell what Quinn does without guessing from the name.</p>
</div>
<div>
<span>What to do</span>
<p>Create each new account in its department's Users folder, never in the default Users container, and fill in the title and department before you hand it over. Access comes next, in the following task.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="dr-03" data-attempts="0">
<span class="ad-mission__num">Task 06 · Apply it · Organizational Units</span>
<h4>Give Compliance a Workstations Folder</h4>
<p><strong>Devon Brooks · Compliance · 1:20 PM</strong><br>Our first two laptops are being ordered this week. IT, Operations and Wealth Management each have a Workstations folder, and we'd like ours set up the same way.</p>
<p><strong>Task:</strong> Create an OU named <code>Workstations</code> under Departments → Compliance, and give it a Description. Then report its path, starting from the new OU and ending at Departments.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Give Compliance a Workstations Folder" placeholder="OU=...,OU=...,OU=..." autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{OU=Workstations,OU=Compliance,OU=Departments}" data-accept="OU=Workstations,OU=Compliance,OU=Departments,DC=purvexfinancial,DC=local">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A directory path reads from the object outward, the way an address reads from the house to the country. So the new OU comes first and Departments comes last, with <code>OU=</code> in front of each name.</p>
<ul>
<li>In Active Directory Users and Computers, expand Departments.</li>
<li>Right-click Compliance, choose New, then Organizational Unit, and name it <code>Workstations</code>.</li>
<li>Open the new OU's Properties and fill in the Description, for example "Compliance department workstation computer objects."</li>
<li>Write the path from Workstations up to Departments, separated by commas.</li>
</ul>
<p>In PowerShell:</p>
<ul>
<li><code>New-ADOrganizationalUnit -Name "Workstations" -Path "OU=Compliance,OU=Departments,$((Get-ADDomain).DistinguishedName)" -Description "Compliance department workstation computer objects."</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="OU=Departments,OU=Compliance,OU=Workstations">That's the right three folders in reverse. A path starts at the object itself and works outward.</div>
<div class="ad-miss" data-guess="workstations|compliance|compliance-workstations">Give the whole path, with OU= in front of each folder, from Workstations up to Departments.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{OU=Workstations,OU=Compliance,OU=Departments}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Giving every department the same layout means a GPO, a delegation or a script written for one department's Workstations folder works on all of them. Reading a path from the object outward is also how every PowerShell command and every log entry will show it to you.</p>
</div>
<div>
<span>What to do</span>
<p>Create the folder before the laptops arrive, describe what belongs in it, and pre-stage each laptop there. That's the same thing you did with IT-WKS09.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="dr-07" data-attempts="0">
<span class="ad-mission__num">Task 07 · Apply it · Groups</span>
<h4>Mirror the Right Peer</h4>
<p><strong>Alex Rivera · IT · 1:55 PM</strong><br>Quinn does the same job as Priya, so give Quinn the same access Priya has. Please don't copy mine, since I hold more than a help desk role needs.</p>
<p><strong>Task:</strong> Add quinn.harper to the same department group as priya.nair. Then report the group alex.rivera has that Quinn must not get.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Mirror the Right Peer" placeholder="a group name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{it-admins}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Open Priya's and Alex's Member Of tabs side by side, as the Service Accounts tab suggested. The group Alex has and Priya doesn't is your answer.</p>
<ul>
<li>Open priya.nair's Properties and read the Member Of tab.</li>
<li>Open quinn.harper's Member Of tab, click Add, and add the same department group.</li>
<li>Open alex.rivera's Member Of tab and compare it with Priya's.</li>
</ul>
<p>In PowerShell:</p>
<ul>
<li><code>Add-ADGroupMember -Identity "IT Users" -Members quinn.harper</code></li>
<li><code>Compare-Object (Get-ADUser priya.nair -Properties MemberOf).MemberOf (Get-ADUser alex.rivera -Properties MemberOf).MemberOf</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="it-users">That's the group Quinn should get, because Priya and Alex both have it. Name the one only Alex has.</div>
<div class="ad-miss" data-guess="helpdesk|server-admins">Alex isn't in that group. Compare Alex's Member Of tab with Priya's and name the extra one.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{IT Admins}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Mirroring copies everything, including access the peer has for reasons that don't apply to the new hire. Copying Alex instead of Priya would have handed a brand-new technician administrator rights on day one.</p>
</div>
<div>
<span>What to do</span>
<p>Mirror the peer whose job matches, and check that peer's groups against what the role needs before you copy them. Then reread the new account's Member Of tab to confirm only the intended groups are there.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="dr-09" data-attempts="0">
<span class="ad-mission__num">Task 08 · Apply it · Service Accounts</span>
<h4>Create the Service Account</h4>
<p><strong>Alex Rivera · IT · 2:15 PM</strong><br>We're scheduling a nightly job on IT-WKS01 that clears stuck print jobs between 02:00 and 02:30. It needs its own identity, built the way the Service Accounts tab describes.</p>
<p><strong>Task:</strong> Create <code>svc-print-queue</code> in the ServiceAccounts OU, with a password that never expires and a Description that names the print job it runs. Then report the account setting that limits what times it's allowed to sign in.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Create the Service Account" placeholder="a setting name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{logon-hours}" data-accept="logonhours|log-on-hours">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The Service Accounts tab listed five practices, and four of them cover the name, the folder, the password and the Description. The fifth is about time.</p>
<ul>
<li>In Active Directory Users and Computers, right-click ServiceAccounts, choose New, then User, and use <code>svc-print-queue</code> as both the name and the logon name.</li>
<li>Set a long password and tick Password never expires.</li>
<li>Open the account's Properties and write a Description such as "Runs the nightly print queue cleanup on IT-WKS01, 02:00-02:30."</li>
<li>On the Account tab, find the button that sets when the account may sign in.</li>
</ul>
<p>In PowerShell:</p>
<ul>
<li><code>New-ADUser -Name "svc-print-queue" -SamAccountName svc-print-queue -Path "OU=ServiceAccounts,$((Get-ADDomain).DistinguishedName)" -Description "Runs the nightly print queue cleanup on IT-WKS01, 02:00-02:30." -PasswordNeverExpires $true -AccountPassword (Read-Host -AsSecureString "Password") -Enabled $true</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="password-never-expires|passwordneverexpires">That setting keeps the job running when a password would otherwise expire. The question asks which setting controls when it may sign in.</div>
<div class="ad-miss" data-guess="description">The Description records the window for people to read, but it doesn't enforce anything. Name the setting that does.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{Logon Hours}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A service account usually has a password nobody changes, which makes it a valuable target. Logon Hours means that even a stolen password only works during the job's own window, and any attempt outside it stands out in the logs.</p>
</div>
<div>
<span>What to do</span>
<p>Set Logon Hours to cover the job's window with a little margin. Write the same window in the Description so the next person can compare the two at a glance.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="dr-10" data-attempts="0" data-hands-on="false">
<span class="ad-mission__num">Task 09 · Stretch · Service Accounts</span>
<h4>A Job Running Outside Its Window</h4>
<p><strong>SOC Queue · Alert Review · 2:22 PM</strong><br>The Security log shows an interactive sign-in by <code>svc-print-queue</code> at 2:15 PM. Its Description says it runs from 02:00 to 02:30. How should you interpret that?<br><strong>A</strong> This is normal. Service accounts sign in whenever their job requires it.<br><strong>B</strong> This is a red flag. Determine who or what signed in, and from where, before taking any other action.<br><strong>C</strong> Widen the account's Logon Hours so the alert stops.</p>
<p><strong>Task:</strong> Select the correct reading and enter its letter.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for A Job Running Outside Its Window" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Compare the time of the sign-in with the window in the Description. Then think about whether a scheduled job ever needs an interactive sign-in at all.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">A service account runs a written job in a written window. A sign-in in the middle of the afternoon, at a keyboard, is neither of those.</div>
<div class="ad-miss" data-guess="c">That would hide the alert without explaining it. Find out what happened before you change the account.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{b}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>An interactive sign-in hours away from the job's window often means the password has been compromised, so determine who signed in and why, and reset the password if no one can account for it.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="dr-04" data-attempts="0" data-hands-on="false">
<span class="ad-mission__num">Task 10 · Stretch · Organizational Units</span>
<h4>Delegate Only What Helpdesk Needs</h4>
<p><strong>Devon Brooks · Compliance · 1:28 PM</strong><br>We'd like the Helpdesk group to be able to reset passwords for Compliance staff, and for nobody else's accounts. Where should that permission be granted?<br><strong>A</strong> On the Compliance Users group.<br><strong>B</strong> On the OU <code>OU=Users,OU=Compliance,OU=Departments</code>.<br><strong>C</strong> On the domain itself, so it covers every account.</p>
<p><strong>Task:</strong> Select where to delegate the permission and enter its letter.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Delegate Only What Helpdesk Needs" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The Organizational Units tab explained that you can delegate control over a single OU. Ask yourself which option covers Compliance's staff accounts and nothing more.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">A group decides what its members can reach. It isn't where you grant someone control over other accounts, since delegation attaches to the folder those accounts live in.</div>
<div class="ad-miss" data-guess="c">That would let Helpdesk reset every password in the firm, administrators included. Delegate at the smallest folder that covers the job.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{b}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Delegate on the Compliance Users OU with the Delegation of Control Wizard, since granting it at the domain would let Helpdesk reset an administrator's password too, one of an attacker's quickest routes to taking over a domain.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="dr-11" data-attempts="0">
<span class="ad-mission__num">Task 11 · Stretch · Group Policy</span>
<h4>Link the Policy</h4>
<p><strong>Devon Brooks · Compliance · 2:35 PM</strong><br>Our laptops will need settings of their own, separate from everyone else's. Please create a GPO for them and attach it to the folder you made earlier, so it's ready when the laptops arrive.</p>
<p><strong>Task:</strong> Create a GPO named <code>PurveX - Compliance Workstations</code> and link it to Departments → Compliance → Workstations. A GPO can link to an OU, to the domain and to one other kind of object. Report that third kind.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Link the Policy" placeholder="a kind of object" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{site}" data-accept="sites|ad-site|active-directory-site">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The Group Policy tab listed the three places a GPO can link to. You've used the OU, and you know the domain is another, so name the one that's left.</p>
<ul>
<li>Open Group Policy Management with Win+R and <code>gpmc.msc</code>.</li>
<li>Expand the domain, Departments, and then Compliance.</li>
<li>Right-click Workstations and choose Create a GPO in this domain, and Link it here.</li>
<li>Name it <code>PurveX - Compliance Workstations</code>.</li>
</ul>
<p>In PowerShell:</p>
<ul>
<li><code>New-GPO -Name "PurveX - Compliance Workstations" | New-GPLink -Target "OU=Workstations,OU=Compliance,OU=Departments,$((Get-ADDomain).DistinguishedName)"</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="group|security-group">A group can narrow who a GPO applies to through security filtering, but a GPO can't link to a group.</div>
<div class="ad-miss" data-guess="container|cn=computers|cn=users">A GPO can't link to a Container. That's why the build keeps every account in an OU.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{Site}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Knowing exactly where a GPO can attach tells you where to look when a setting isn't applying. It also tells you why it might not apply, such as an object sitting in a Container that no link can reach.</p>
</div>
<div>
<span>What to do</span>
<p>Link a GPO at the narrowest OU that covers the machines or people it's meant for. Then check the link in Group Policy Management before you add settings to it.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="dr-12" data-attempts="0" data-hands-on="false">
<span class="ad-mission__num">Task 12 · Stretch · Group Policy</span>
<h4>The Password Rule That Will Not Apply</h4>
<p><strong>Devon Brooks · Compliance · 2:50 PM</strong><br>The auditors want Compliance staff on 16-character passwords, while everyone else stays on the firm's standard. Someone suggested putting a password setting in a GPO linked to <code>OU=Compliance</code>. Will that work?<br><strong>A</strong> Yes. A GPO linked to the OU applies to every account in it.<br><strong>B</strong> No. Domain password policy only applies from the domain level, so use a fine-grained password policy that targets Compliance instead.<br><strong>C</strong> Only if security filtering limits the GPO to Compliance Users.</p>
<p><strong>Task:</strong> Select the approach that will work and enter its letter.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for The Password Rule That Will Not Apply" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The Group Policy tab called password policy the one exception to how GPO links usually work. Reread what it said about where password settings take effect for domain accounts.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">For most settings, yes. Password policy for domain accounts is the exception, because it's only read from a GPO linked at the domain.</div>
<div class="ad-miss" data-guess="c">Security filtering only narrows who a GPO applies to. It can't make a password setting work from an OU link.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{b}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A password setting in an OU-linked GPO never actually changes a domain account's password rules, so create a fine-grained password policy for Compliance Users instead and confirm it with <code>Get-ADUserResultantPasswordPolicy</code>.</p>
</div>
</div>
</div>
</div>
