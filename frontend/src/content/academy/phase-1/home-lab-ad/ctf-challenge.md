<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Can you find your way around Active Directory well enough to do a help desk technician's first-day work?</p>
</div>

### Operation Day One

It is your first day on the GovTech Financial IT help desk. Nobody expects you to investigate anything yet. The job today is simple: find people, find groups, find where things live, and read what the directory says. Every task below is done in your own lab, and every answer comes from there.

The **Ticket Queue** is the real thing, with live tickets and a security incident. Finish Day One first so you can move around the directory without thinking about it.

<div class="ad-answer-guide">
<span class="ad-answer-guide__label">How answers work</span>
<p>Use Active Directory Users and Computers in your lab. Each task asks for a short answer, such as a group name, a person, or a number. Case, spaces, dots, and dashes do not matter. You get three tries per task. The hint unlocks after two wrong tries, and the explanation unlocks after the third. Nothing is submitted or stored.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 10 solved</span>
</div>

<div id="ad-scorecard" class="ad-scorecard"></div>

<div class="ad-mission" data-id="d1-01" data-attempts="0">
<span class="ad-mission__num">Task 01 · Find an Account</span>
<h4>Which Group Is Jordan In?</h4>
<p>Which department group is <code>jordan.ellis</code> in?</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="group name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{finance-accounting-users}">Submit</button>
<button type="button" class="ad-hint__btn">Get a hint</button>
</div>
<p class="ad-hint__text">Use the Find dialog to locate <code>jordan.ellis</code>, then open the Member Of tab. Ignore Domain Users, which everyone has.</p>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{finance-accounting-users}</code></p>
<p>Jordan is in <code>Finance Accounting Users</code>, the standard group for his department. Finding an account and reading its groups is the most common help desk task.</p>
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
<p class="ad-hint__text">Open the group and read its Members tab. The group lives in the IT department OU and has only one member.</p>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{alex-rivera}</code></p>
<p><code>alex.rivera</code>. Knowing who holds admin rights is the first thing to check whenever something unusual happens.</p>
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
<p class="ad-hint__text">Expand the domain root and look at what sits next to Departments.</p>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{accesslevels}</code></p>
<p><code>OU=AccessLevels</code>. Access is kept separate from department on purpose, so moving someone between departments does not change what they can administer.</p>
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
<p class="ad-hint__text">Expand the domain root. Its name starts with CN=, not OU=. New accounts land here if nobody chooses an OU.</p>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{cn=users}</code></p>
<p><code>CN=Users</code>. Group Policy links only to sites, domains, and OUs. An account left here gets none of the company's policies.</p>
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
<p class="ad-hint__text">Open the group's Properties and read the Description on the General tab. It names a job title in the plural.</p>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{it-systems-administrators}</code></p>
<p>The description reads "Elevated access for IT Systems Administrators, beyond standard IT Users access." A group with a written purpose is much easier to keep clean.</p>
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
<p class="ad-hint__text">Open the <code>Helpdesk</code> group and read its Members tab. Do not go by her title.</p>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{no}</code></p>
<p>No. <code>Helpdesk</code> is empty, and Priya is only in <code>IT Users</code>. A job title describes a role. A group grants access, and you always check the group.</p>
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
<p class="ad-hint__text">Search your lab with Find, using the Advanced tab and the Title field. You can also open the Operations users one by one.</p>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{riley-kwan}</code></p>
<p><code>riley.kwan</code>, in Operations. The title, department, and description fields are what let you find the right person when a ticket only gives a job.</p>
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
<p class="ad-hint__text">Look under Departments, then IT, then Workstations. AD computer names never contain spaces.</p>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{it-wks01}</code></p>
<p><code>IT-WKS01</code>. Computers are directory objects just like users, and you find them the same way.</p>
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
<p class="ad-hint__text">Open the group and read its Members tab, or run <code>(Get-ADGroupMember "Compliance Users").Count</code>.</p>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{2}</code></p>
<p>Two members, Devon Brooks and Morgan Lee. Knowing a group's normal size is how you notice when it changes.</p>
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
<p class="ad-hint__text">Expand Departments and count only the OUs one level down. Do not count the Users or Workstations OUs inside them.</p>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{5}</code></p>
<p>Five: IT, Compliance, Wealth Management, Operations, and Finance and Accounting. You can now find any user, group, computer, and OU in the environment. Next up is the Ticket Queue.</p>
</div>
</div>
