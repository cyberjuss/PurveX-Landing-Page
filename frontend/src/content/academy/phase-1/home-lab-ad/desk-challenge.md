<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>A New Hire's First Week</h3>
<p class="ad-brief__ask">Maya Okafor joined Wealth Management on Monday, and nothing about the account has gone right since. Can you work every call from the first week and leave the account the way it should have started?</p>
<p>Maya's account is already in your directory, just as HR's import left it, in the wrong department. Where a call asks you to change something, your lab has to show the change before your answer counts.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 10 solved</span>
</div>

<div class="ad-mission" data-id="dk-01" data-attempts="0">
<span class="ad-mission__num">Call 01 · Find an Account · Monday · INC-1094</span>
<h4>Find the Caller</h4>
<p><strong>Front Desk · Monday · 8:40 AM</strong><br>Before Maya's calls start coming in, warm up on a quick one. A caller says, "This is Jordan from Finance," and asks what title the directory shows for them, because a new expense system reads it from there.</p>
<p><strong>Task:</strong> Use Find to open <code>jordan.ellis</code> without browsing the folders, and report the title on the account.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Find the Caller" placeholder="a job title" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{staff-accountant}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Find works from any folder you start in, so there's no need to know which department OU holds the account. The title lives on the Organization tab.</p>
<ol>
<li>In Active Directory Users and Computers, right-click the domain and choose Find.</li>
<li>Keep Users, Contacts, and Groups selected, type <code>jordan.ellis</code>, and click Find Now.</li>
<li>Open the result and read Title on the Organization tab.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-ADUser jordan.ellis -Properties Title | Select-Object Name, Title</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="finance-accounting-users|financeaccounting|finance-and-accounting">That's the department, not the title. Read the Title field on the Organization tab.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{Staff Accountant}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Most calls start with a name, and Find gets you to the right account in seconds, whichever folder it lives in. Other systems often read fields like Title straight from the directory, so a wrong value there spreads further than you might expect.</p>
</div>
<div>
<span>What to do</span>
<p>Open the account with Find, confirm it's the right person by checking the folder and the title, and only then answer the caller or make a change.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="dk-02" data-attempts="0">
<span class="ad-mission__num">Call 02 · Unlock or Reset · Monday · INC-1094</span>
<h4>Reset and Force a Change</h4>
<p><strong>Maya Okafor · Wealth Management · Monday · 9:05 AM</strong><br>Hi, it's my first day. HR read me a temporary password over the phone, but I wrote it down wrong and I really don't know what it is.</p>
<p><strong>Task:</strong> Give Maya a new temporary password and make sure it has to be changed at the next sign-in. Then type <code>unlock</code> or <code>reset</code> for the fix this call needed.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Reset and Force a Change" placeholder="unlock or reset" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{reset}" data-accept="reset-password|password-reset">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The deciding question from the Unlock or Reset tab is whether the caller still knows the password. Maya doesn't.</p>
<ol>
<li>Use Find to open <code>maya.okafor</code>.</li>
<li>Right-click the account and choose Reset Password.</li>
<li>Enter a new temporary password and tick User must change password at next logon.</li>
<li>Click OK.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Set-ADAccountPassword maya.okafor -Reset -NewPassword (Read-Host -AsSecureString "New temporary password")</code></li>
<li><code>Set-ADUser maya.okafor -ChangePasswordAtLogon $true</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="unlock|unlocked">Unlocking only helps someone who still knows the password. Maya doesn't know it, so an unlocked account still won't let Maya in.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{reset}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A temporary password has been seen by at least two people, you and the caller. Forcing a change at the next sign-in makes sure it stops working the moment the real owner is in.</p>
</div>
<div>
<span>What to do</span>
<p>Reset the password, tick the box that forces a change, and give the new temporary password to the caller only after confirming who they are.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="dk-03" data-attempts="0">
<span class="ad-mission__num">Call 03 · Unlock or Reset · Tuesday · INC-1094</span>
<h4>Locked, Not Forgotten</h4>
<p><strong>Maya Okafor · Wealth Management · Tuesday · 8:52 AM</strong><br>I know my new password, I promise. Caps Lock was on and I typed it wrong a few times, and now it says my account is locked.<br><strong>A</strong> Reset the password and force another change.<br><strong>B</strong> Unlock the account and leave the password alone.<br><strong>C</strong> Enable the account.</p>
<p><strong>Task:</strong> Choose the fix that matches this call and type its letter.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Locked, Not Forgotten" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Ask the same question as yesterday. Does Maya still know the password this time?</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">Maya still knows the password, so a reset throws away a perfectly good one and adds another temporary password to the world.</div>
<div class="ad-miss" data-guess="c">Locked and disabled are different settings. Nothing here says the account was disabled, only that too many wrong passwords locked it.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{b}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Resetting when an unlock would do creates a new temporary password for no reason, and every one of those is a credential that someone other than the owner has seen.</p>
</div>
<div>
<span>What to do</span>
<p>Open the Account tab, tick Unlock account and click Apply. Then check that Account is disabled isn't ticked, because a disabled account stays shut whatever else you fix.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="dk-04" data-attempts="0">
<span class="ad-mission__num">Call 04 · Move an Account · Wednesday · INC-1094</span>
<h4>Put Maya in the Right Folder</h4>
<p><strong>Sam Whitfield · Wealth Management · Wednesday · 10:15 AM</strong><br>Maya can't see any of our team's settings, and the screen lock is behaving like it does for Operations. HR says Maya was hired into Wealth Management. Can you check where the account lives?</p>
<p><strong>Task:</strong> Move <code>maya.okafor</code> into Departments, WealthManagement, Users. Then report the department OU the account was in before you moved it.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Put Maya in the Right Folder" placeholder="a department OU" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{operations}" data-accept="ou=operations|operations-users">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Read the folders above the account before you move it, because once it's moved, the old location is gone from view.</p>
<ol>
<li>Use Find to locate <code>maya.okafor</code> and note the folder shown in the In Folder column.</li>
<li>Right-click the account, choose Move, and select Departments, WealthManagement, Users.</li>
<li>Open that folder and confirm Maya is listed there.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-ADUser maya.okafor | Select-Object DistinguishedName</code></li>
<li><code>Get-ADUser maya.okafor | Move-ADObject -TargetPath "OU=Users,OU=WealthManagement,OU=Departments,$((Get-ADDomain).DistinguishedName)"</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="wealthmanagement|wealth-management|users">That's where the account belongs now. Report the department it was sitting in before the move.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{Operations}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The OU decides which department's policies reach an account, which is why Maya was getting Operations' screen lock. Changing the title or department fields wouldn't have fixed that, because policy follows the folder.</p>
</div>
<div>
<span>What to do</span>
<p>Move the account and confirm it in the new folder. Remember that this is only half of a transfer, because access comes from groups, and that's the next call.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="dk-05" data-attempts="0">
<span class="ad-mission__num">Call 05 · Move an Account · Wednesday · INC-1094</span>
<h4>Finish the Access Half</h4>
<p><strong>Sam Whitfield · Wealth Management · Wednesday · 10:40 AM</strong><br>Thanks for moving Maya. The screen lock is right now, but Maya still can't open our team's shared files, and somehow can still open Operations' files.</p>
<p><strong>Task:</strong> Add maya.okafor to the Wealth Management department group and take Maya out of the Operations one. Then report the group you added.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Finish the Access Half" placeholder="a group name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{wealth-management-users}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Moving an account changes where it lives, not what it can reach. Each department has a standard access group, listed on the Groups tab.</p>
<ol>
<li>Open maya.okafor's Properties and go to Member Of.</li>
<li>Click Add and add <code>Wealth Management Users</code>.</li>
<li>Select <code>Operations Users</code> and click Remove.</li>
<li>Click OK, then reopen Member Of to confirm both changes stuck.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Add-ADGroupMember -Identity "Wealth Management Users" -Members maya.okafor</code></li>
<li><code>Remove-ADGroupMember -Identity "Operations Users" -Members maya.okafor -Confirm:$false</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="operations-users">That's the group you removed. Report the one you added.</div>
<div class="ad-miss" data-guess="all-employees|domain-users">That group doesn't decide department access. Report the Wealth Management department group you added.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{Wealth Management Users}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Leaving the old group in place is how access piles up over a career. One transfer later, Maya would hold two departments' files, and nobody would remember why.</p>
</div>
<div>
<span>What to do</span>
<p>Make every transfer one change with three parts: move the account, add the new department group and remove the old one. Then read Member Of again to confirm.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="dk-06" data-attempts="0">
<span class="ad-mission__num">Call 06 · Move an Account · Wednesday · INC-1094</span>
<h4>Record the Ticket</h4>
<p><strong>Alex Rivera · IT · Wednesday · 11:00 AM</strong><br>Please note on Maya's account what was fixed and under which ticket, DESK-2001, so nobody has to rediscover all this later. While you're in there, check that the title is right.</p>
<p><strong>Task:</strong> Write a Description on maya.okafor that includes <code>DESK-2001</code>. Then report the name of the Properties tab that holds the Title field.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Record the Ticket" placeholder="a tab name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{organization}" data-accept="organisation|organization-tab">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The Description is on the General tab. Title, Department and Company sit together on a different tab.</p>
<ol>
<li>Open maya.okafor's Properties.</li>
<li>On the General tab, set Description to something like "Client Advisor, Wealth Management. OU and groups corrected under DESK-2001."</li>
<li>Click through the tabs until you find Title, and note the tab's name.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Set-ADUser maya.okafor -Description "Client Advisor, Wealth Management. OU and groups corrected under DESK-2001."</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="general">The General tab holds the Description you just wrote. Title lives on another tab.</div>
<div class="ad-miss" data-guess="account">The Account tab holds sign-in settings. Look for the tab that holds Title and Department.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{Organization}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A Description that names the ticket turns the account into its own record. The next technician who opens it can see what changed and where to read more, instead of guessing.</p>
</div>
<div>
<span>What to do</span>
<p>Write the ticket number into the Description whenever you make a change that someone might later question, and keep the Organization fields accurate, since other systems read them.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="dk-07" data-attempts="0">
<span class="ad-mission__num">Call 07 · Read the Account · Thursday · INC-1094</span>
<h4>Read the Raw Attribute</h4>
<p><strong>Alex Rivera · IT · Thursday · 9:30 AM</strong><br>I'd like proof that Monday's forced password change is still waiting, not just a memory of ticking the box. The friendly tabs won't show it, but the raw attribute will.</p>
<p><strong>Task:</strong> Turn on Advanced Features, open maya.okafor from the tree, and report what the Attribute Editor shows for <code>pwdLastSet</code>.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Read the Raw Attribute" placeholder="a value" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{never}" data-accept="0|(never)|zero">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Ticking User must change password at next logon sets <code>pwdLastSet</code> to a special value meaning the password has to be replaced before it can be used. The Attribute Editor shows that value in words.</p>
<ol>
<li>In Active Directory Users and Computers, open View and turn on Advanced Features.</li>
<li>Browse to Departments, WealthManagement, Users and open maya.okafor from there, not from Find.</li>
<li>Open the Attribute Editor tab and find <code>pwdLastSet</code>.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-ADUser maya.okafor -Properties pwdLastSet, PasswordExpired | Select-Object pwdLastSet, PasswordExpired</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="#">A real date or a large number means a password was set and kept. If you see one, redo Monday's reset with User must change password at next logon ticked, then read it again.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{(never)}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The raw attribute is proof, while a remembered checkbox is only a claim. When an auditor or an investigator asks whether a password was really forced to change, <code>pwdLastSet</code> is the answer you can show them.</p>
</div>
<div>
<span>What to do</span>
<p>Read the Attribute Editor whenever a friendly tab leaves you guessing, and filter it to show only attributes with values so you aren't scrolling past blanks.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="dk-08" data-attempts="0">
<span class="ad-mission__num">Call 08 · Read the Account · Thursday · INC-1094</span>
<h4>The Missing Tab</h4>
<p><strong>Quinn Harper · IT · Thursday · 10:10 AM</strong><br>I'm trying to read IT-WKS01's last logon. I found it with Find and opened it, but the tab everyone keeps mentioning isn't there.</p>
<p><strong>Task:</strong> Open IT-WKS01 once from Find and once from the tree. Report the name of the tab that only appears when you open it from the tree.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for The Missing Tab" placeholder="a tab name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{attribute-editor}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The Read the Account tab warned about this quirk. Make sure Advanced Features is still on, then compare the two windows tab by tab.</p>
<ol>
<li>Open Find, switch to Computers, find <code>IT-WKS01</code> and open it. Note the tabs.</li>
<li>Close it, browse to Departments, IT, Workstations, and open IT-WKS01 from there.</li>
<li>Name the tab that appears only the second time.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="member-of|general|operating-system">That tab appears both ways. Look for the one that shows raw attributes such as lastLogon.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{Attribute Editor}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Plenty of new technicians conclude that a value isn't recorded when the tab that holds it simply didn't load. Knowing the quirk saves you from reporting "no data" on an object that has it.</p>
</div>
<div>
<span>What to do</span>
<p>Use Find to locate an object, then open it from the tree when you need raw attributes. PowerShell with <code>-Properties</code> works too, and shows the same values.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="dk-09" data-attempts="0">
<span class="ad-mission__num">Call 09 · Read the Account · Friday · INC-1094</span>
<h4>Which Last Logon to Trust</h4>
<p><strong>Alex Rivera · IT · Friday · 9:00 AM</strong><br>Next year we're adding a second domain controller. After that, which attribute should Quinn read to see when an account last signed in anywhere in the domain, accepting that it can lag a little?<br><strong>A</strong> <code>lastLogon</code><br><strong>B</strong> <code>lastLogonTimestamp</code><br><strong>C</strong> <code>whenCreated</code></p>
<p><strong>Task:</strong> Choose the attribute that's shared between domain controllers and type its letter.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Which Last Logon to Trust" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}" data-accept="lastlogontimestamp">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The Read the Account tab described one of these as kept separately on each domain controller, and another as shared but able to lag by up to 14 days.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a|lastlogon">lastLogon is kept separately on each domain controller, so with two of them you'd have to read both and take the later time.</div>
<div class="ad-miss" data-guess="c|whencreated">whenCreated tells you when the account was made, not when anyone last used it.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{b}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Reading <code>lastLogon</code> from just one domain controller can make an active account look dormant, or a dormant one look active. Either mistake leads to a wrong decision about disabling it.</p>
</div>
<div>
<span>What to do</span>
<p>Use <code>lastLogonTimestamp</code> for "has this been used in the last few weeks?" When you need the exact time, read <code>lastLogon</code> from every domain controller and take the latest.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="dk-10" data-attempts="0">
<span class="ad-mission__num">Call 10 · Close the Week · Friday · INC-1094</span>
<h4>Close the Transfer</h4>
<p><strong>Sam Whitfield · Wealth Management · Friday · 4:30 PM</strong><br>Maya says everything works now. Before you close the ticket, can you say what had to be true for the account to count as fixed?<br><strong>A</strong> The Title and the Description match the new role.<br><strong>B</strong> The folder above the account and its Member Of both match the new department.<br><strong>C</strong> The password was reset and the account is unlocked.</p>
<p><strong>Task:</strong> Confirm Maya's account is in Wealth Management's Users folder, in Wealth Management Users, out of Operations Users and enabled. Then choose what a finished transfer needs and type its letter.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Close the Transfer" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The Move an Account tab ended with this exact question. Think about which two things decide what policy reaches an account and what it can open.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">Title and Description help people read the account, but neither one changes its policy or access.</div>
<div class="ad-miss" data-guess="c">Those fixed this week's sign-in calls. A transfer is about where the account lives and what it can reach.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{b}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The folder decides which policies reach the account, and Member Of decides what it can open. A transfer that fixes only one of the two leaves Maya with either the wrong settings or the wrong access, and either way the old department's rules come along.</p>
</div>
<div>
<span>What to do</span>
<p>Close a transfer only after reading both: the folders above the account and every group on Member Of. Record what you changed in the Description under the ticket number, as you did this week.</p>
</div>
</div>
</div>
</div>
