<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Can you actually use everything on this page, or did you just read it?</p>
</div>

### Operation Day One

You've read the org chart, the access levels, the data categories, and the Active Directory concepts. This is a short, self-graded challenge, built entirely on GovTechFinancial's real environment, the one you built in **Build This Lab**. Do each mission there, in the actual domain, then type your answer below.

Every answer is one word or a short phrase, lowercase, with spaces or dashes both working. Each mission gives you one free hint on request, plus three tries at the flag, which unlocks either way once your tries are up, so you're never stuck. No login, no submission, no leaderboard: this is entirely for you.

<div class="ad-answer-guide">
<span class="ad-answer-guide__label">Answer format</span>
<p>Type the finding, not a sentence. For example, Mission 10 accepts <code>wrong-department</code>, <code>wrong department</code>, or the full flag wrapper <code>GTF{wrong-department}</code>.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 10 solved</span>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Mission 01</span>
<h4>Recon</h4>
<p>Find Jordan Ellis's account. What security group is he a member of?</p>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">Use the Find dialog to locate the account, then check its Member Of tab.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="your answer" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{finance-accounting-users}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{finance-accounting-users}</code></p>
<p>Jordan belongs to <code>Finance Accounting Users</code>, the standard-access group for his department.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Mission 02</span>
<h4>The Odd One Out</h4>
<p>Every one of the nine users belongs to exactly one standard-access group, except one person, who belongs to two. What's that second, more privileged group?</p>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">Every department has one standard group. Only one person here has two, and he's in IT.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="your answer" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{it-admins}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{it-admins}</code></p>
<p>Alex Rivera is in both <code>IT Users</code> and <code>IT Admins</code>. Same OU as Priya Nair, different access.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Mission 03</span>
<h4>Access, Not Department</h4>
<p>Open Active Directory Users and Computers in your lab. <code>Server Admins</code> and <code>Helpdesk</code> are not nested inside <code>Departments</code>. Which top-level OU actually holds them?</p>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">Look at the OU tree one level below the domain root. What sits next to Departments?</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="your answer" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{accesslevels}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{accesslevels}</code></p>
<p><code>OU=AccessLevels</code>. Those groups control domain-wide access, not department membership, so they don't nest under one department.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Mission 04</span>
<h4>The Container Trap</h4>
<p>In your lab, expand the domain root in Active Directory Users and Computers. There's a default container sitting there that every fresh domain ships with. It should be empty of GovTechFinancial's own accounts. What's it called, exactly as AD writes it?</p>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">It sits alongside OU=Departments and OU=AccessLevels, but its icon and name give away that it isn't an OU. Its name starts with CN=.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="your answer" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{cn=users}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{cn=users}</code></p>
<p><code>CN=Users</code>. GPOs only link to Sites, Domains, and OUs, so an account left here is invisible to Group Policy, and nobody can delegate permissions over it either.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Mission 05</span>
<h4>Stand Up a Service Account</h4>
<p>Using the Admin Tasks tab, plan a service account for a nightly backup job. Best practice says it gets its own dedicated OU, separate from every department. What would you name that OU?</p>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">Match the naming style GovTechFinancial already uses for its other top-level OUs, Departments and AccessLevels.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="your answer" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{serviceaccounts}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{serviceaccounts}</code></p>
<p><code>OU=ServiceAccounts</code>, alongside <code>Departments</code> and <code>AccessLevels</code>. Prefix the account too, e.g. <code>svc-backup-job</code>, and set <code>PasswordNeverExpires = $true</code> since nobody's at a keyboard to renew it.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Mission 06</span>
<h4>Trust, But Verify</h4>
<p>Priya Nair's job title is "Help Desk Technician." Check the Full User Directory tab for her actual group membership. Is she really a member of the <code>Helpdesk</code> access-level group, yes or no?</p>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">A job title and a security group are two different things. Look at what group she's actually listed under, not what her title implies.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="your answer" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{no}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{no}</code></p>
<p>No. Priya is only in <code>IT Users</code>; <code>Helpdesk</code> is created empty, and nobody's been added despite her title. A title describes a job. A group describes access.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Mission 07</span>
<h4>The Critical Three</h4>
<p>How many of GovTechFinancial's five departments are flagged critical on the Org Chart?</p>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">Check the "Critical" column of the Org Chart table and count the "Yes" rows.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="your answer" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{3}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{3}</code></p>
<p>Compliance, Wealth Management, and Finance and Accounting. IT and Operations aren't, since neither directly holds regulated data or client financial records.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Mission 08</span>
<h4>The Client List</h4>
<p>Which department serves private investors, high-net-worth individuals, and trust and estate accounts?</p>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">Check the Who Wealth Management Serves tab.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="your answer" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{wealth-management}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{wealth-management}</code></p>
<p>Wealth Management. Private investors, high-net-worth individuals, trust and estate accounts, exactly the data an attacker would target.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Mission 09</span>
<h4>Data at Risk</h4>
<p>Which department handles GovTechFinancial's own internal financial records, separate from client funds?</p>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">Check the Data Categories tab's "Internal financial records" row.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="your answer" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{finance-and-accounting}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{finance-and-accounting}</code></p>
<p>Finance and Accounting. Their own ledgers, payroll, and internal budgets, separate from the client funds Wealth Management and Operations touch.</p>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-attempts="0">
<span class="ad-mission__num">Mission 10 — Capstone</span>
<h4>The 2 AM Login</h4>
<p>You see a successful login from <code>alex.rivera</code> at 2:00 AM, originating from a Wealth Management workstation. Before you've looked at a single log entry, what's wrong with this, based only on where his account actually lives?</p>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">Compare Alex Rivera's real OU (Mission 02) to the department that workstation belongs to.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="your answer" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{wrong-department}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{wrong-department}</code></p>
<p>Alex's account lives in <code>OU=IT</code>. This login came from Wealth Management, three mismatches deep:</p>
<ul class="ad-baseline-list">
<li><strong>Identity:</strong> account is in IT.</li>
<li><strong>Asset:</strong> workstation belongs to Wealth Management.</li>
<li><strong>Timing:</strong> 2:00 AM, on a critical department.</li>
</ul>
<p>Three reasons to flag it, before opening a single log entry.</p>
</div>
</div>

