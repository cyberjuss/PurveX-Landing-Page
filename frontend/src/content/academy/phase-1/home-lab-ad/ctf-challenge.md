<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Can you actually use everything on this page, or did you just read it?</p>
</div>

### Operation Day One

You've read the org chart, the access levels, the data categories, and the Active Directory concepts. Reading isn't the same as knowing. This is a short, self-graded challenge built entirely on GovTechFinancial's real environment, the one you built in **Build This Lab**. Do each mission there, in the actual domain, then type your answer below.

Every answer is one word or a short phrase, lowercase, with spaces or dashes both working. Each mission gives you one free hint on request, plus three tries at the flag itself, which unlocks either way once your tries are up, so you're never stuck. No login, no submission, no leaderboard — this is entirely for you.

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 10 solved</span>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Mission 01</span>
<h4>Recon</h4>
<p>Find Jordan Ellis's account. What security group is he a member of?</p>
<div class="ad-hint"><button type="button" class="ad-hint__btn" onclick="window.pvrxShowHint(this)">Get a hint</button><p class="ad-hint__text">Use the Find dialog to locate the account, then check its Member Of tab.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="your answer" autocomplete="off" autocapitalize="off" spellcheck="false" onkeydown="if(event.key==='Enter'){event.preventDefault();this.nextElementSibling.click();}">
<button type="button" class="ad-guess__submit" onclick="window.pvrxCheckFlag(this, 'gtf{finance-accounting-users}')">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<p><code>GTF{finance-accounting-users}</code></p>
<p>Jordan sits in <code>OU=Users,OU=FinanceAccounting,OU=Departments</code> and belongs to <code>Finance Accounting Users</code>, GovTechFinancial's standard-access group for that department.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Mission 02</span>
<h4>The Odd One Out</h4>
<p>Every one of the nine users belongs to exactly one standard-access group, except one person, who belongs to two. What's that second, more privileged group?</p>
<div class="ad-hint"><button type="button" class="ad-hint__btn" onclick="window.pvrxShowHint(this)">Get a hint</button><p class="ad-hint__text">Every department has one standard group. Only one person here has two, and he's in IT.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="your answer" autocomplete="off" autocapitalize="off" spellcheck="false" onkeydown="if(event.key==='Enter'){event.preventDefault();this.nextElementSibling.click();}">
<button type="button" class="ad-guess__submit" onclick="window.pvrxCheckFlag(this, 'gtf{it-admins}')">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<p><code>GTF{it-admins}</code></p>
<p>Alex Rivera is a member of both <code>IT Users</code> and <code>IT Admins</code>. Same OU as Priya Nair, different access.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Mission 03</span>
<h4>Access, Not Department</h4>
<p><code>Server Admins</code> and <code>Helpdesk</code> (Level 2 and Level 3) live in their own OU, not nested inside <code>Departments</code> alongside IT, Compliance, and the rest. Which OU?</p>
<div class="ad-hint"><button type="button" class="ad-hint__btn" onclick="window.pvrxShowHint(this)">Get a hint</button><p class="ad-hint__text">Ask what Server Admins and Helpdesk actually control. Is it tied to one department, or the whole domain?</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="your answer" autocomplete="off" autocapitalize="off" spellcheck="false" onkeydown="if(event.key==='Enter'){event.preventDefault();this.nextElementSibling.click();}">
<button type="button" class="ad-guess__submit" onclick="window.pvrxCheckFlag(this, 'gtf{accesslevels}')">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<p><code>GTF{accesslevels}</code></p>
<p><code>OU=AccessLevels</code>. Those groups describe what an account can do across the whole domain, not which department it belongs to, so nesting them under any one department wouldn't make sense.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Mission 04</span>
<h4>The Container Trap</h4>
<p>Every fresh domain ships with a default container that new accounts land in if nobody moves them. In AD Building Blocks' comparison table, what's that container called?</p>
<div class="ad-hint"><button type="button" class="ad-hint__btn" onclick="window.pvrxShowHint(this)">Get a hint</button><p class="ad-hint__text">It's in the "Examples in this domain" row of the OU vs. Container table, written the way Active Directory itself writes it.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="your answer" autocomplete="off" autocapitalize="off" spellcheck="false" onkeydown="if(event.key==='Enter'){event.preventDefault();this.nextElementSibling.click();}">
<button type="button" class="ad-guess__submit" onclick="window.pvrxCheckFlag(this, 'gtf{cn=users}')">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<p><code>GTF{cn=users}</code></p>
<p><code>CN=Users</code>. An account left sitting there can never have a GPO linked to reach it (GPOs only link to Sites, Domains, and OUs) and nobody can delegate scoped permissions over it either, since Containers support neither.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Mission 05</span>
<h4>Stand Up a Service Account</h4>
<p>Using the Admin Tasks tab, plan a service account for a nightly backup job. Best practice says it gets its own dedicated OU, separate from every department. What would you name that OU?</p>
<div class="ad-hint"><button type="button" class="ad-hint__btn" onclick="window.pvrxShowHint(this)">Get a hint</button><p class="ad-hint__text">Match the naming style GovTechFinancial already uses for its other top-level OUs, Departments and AccessLevels.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="your answer" autocomplete="off" autocapitalize="off" spellcheck="false" onkeydown="if(event.key==='Enter'){event.preventDefault();this.nextElementSibling.click();}">
<button type="button" class="ad-guess__submit" onclick="window.pvrxCheckFlag(this, 'gtf{serviceaccounts}')">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<p><code>GTF{serviceaccounts}</code></p>
<p>It's <code>OU=ServiceAccounts</code>, sitting alongside <code>Departments</code> and <code>AccessLevels</code> at the top of the domain. The account itself should also be clearly prefixed, for example <code>svc-backup-job</code>. And unlike a person's account, it needs <code>PasswordNeverExpires</code> set to <code>$true</code>, since nothing is sitting at a keyboard to change it before it locks out.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Mission 06</span>
<h4>Trust, But Verify</h4>
<p>Priya Nair's job title is "Help Desk Technician." Check the Full User Directory tab for her actual group membership. Is she really a member of the <code>Helpdesk</code> access-level group, yes or no?</p>
<div class="ad-hint"><button type="button" class="ad-hint__btn" onclick="window.pvrxShowHint(this)">Get a hint</button><p class="ad-hint__text">A job title and a security group are two different things. Look at what group she's actually listed under, not what her title implies.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="your answer" autocomplete="off" autocapitalize="off" spellcheck="false" onkeydown="if(event.key==='Enter'){event.preventDefault();this.nextElementSibling.click();}">
<button type="button" class="ad-guess__submit" onclick="window.pvrxCheckFlag(this, 'gtf{no}')">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<p><code>GTF{no}</code></p>
<p>No. Priya is only a member of <code>IT Users</code>. The <code>Helpdesk</code> access-level group (Level 3) is created empty by the build script, and nobody has actually been added to it, despite her title suggesting otherwise. A title describes a job; a group describes access. An investigation checks the group every time and never assumes from the title.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Mission 07</span>
<h4>The Critical Three</h4>
<p>How many of GovTechFinancial's five departments are flagged critical on the Org Chart?</p>
<div class="ad-hint"><button type="button" class="ad-hint__btn" onclick="window.pvrxShowHint(this)">Get a hint</button><p class="ad-hint__text">Check the "Critical" column of the Org Chart table and count the "Yes" rows.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="your answer" autocomplete="off" autocapitalize="off" spellcheck="false" onkeydown="if(event.key==='Enter'){event.preventDefault();this.nextElementSibling.click();}">
<button type="button" class="ad-guess__submit" onclick="window.pvrxCheckFlag(this, 'gtf{3}')">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<p><code>GTF{3}</code></p>
<p>Three departments are flagged critical: Compliance, Wealth Management, and Finance and Accounting. IT and Operations aren't, not because they don't matter, but because they don't directly hold regulated data or client financial records.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Mission 08</span>
<h4>The Client List</h4>
<p>Which department serves private investors, high-net-worth individuals, and trust and estate accounts?</p>
<div class="ad-hint"><button type="button" class="ad-hint__btn" onclick="window.pvrxShowHint(this)">Get a hint</button><p class="ad-hint__text">Check the Who Wealth Management Serves tab.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="your answer" autocomplete="off" autocapitalize="off" spellcheck="false" onkeydown="if(event.key==='Enter'){event.preventDefault();this.nextElementSibling.click();}">
<button type="button" class="ad-guess__submit" onclick="window.pvrxCheckFlag(this, 'gtf{wealth-management}')">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<p><code>GTF{wealth-management}</code></p>
<p>Wealth Management. It serves private investors, high-net-worth individuals, trust and estate accounts, and retirement-focused clients, exactly the kind of personal, financial data an attacker would target.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Mission 09</span>
<h4>Data at Risk</h4>
<p>Which department handles GovTechFinancial's own internal financial records, separate from client funds?</p>
<div class="ad-hint"><button type="button" class="ad-hint__btn" onclick="window.pvrxShowHint(this)">Get a hint</button><p class="ad-hint__text">Check the Data Categories tab's "Internal financial records" row.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="your answer" autocomplete="off" autocapitalize="off" spellcheck="false" onkeydown="if(event.key==='Enter'){event.preventDefault();this.nextElementSibling.click();}">
<button type="button" class="ad-guess__submit" onclick="window.pvrxCheckFlag(this, 'gtf{finance-and-accounting}')">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<p><code>GTF{finance-and-accounting}</code></p>
<p>Finance and Accounting handles GovTechFinancial's own ledgers, payroll, and internal budgets, separate from the client funds Wealth Management and Operations touch.</p>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-attempts="0">
<span class="ad-mission__num">Mission 10 — Capstone</span>
<h4>The 2 AM Login</h4>
<p>You see a successful login from <code>alex.rivera</code> at 2:00 AM, originating from a Wealth Management workstation. Before you've looked at a single log entry, what's wrong with this, based only on where his account actually lives?</p>
<div class="ad-hint"><button type="button" class="ad-hint__btn" onclick="window.pvrxShowHint(this)">Get a hint</button><p class="ad-hint__text">Compare Alex Rivera's real OU (Mission 02) to the department that workstation belongs to.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="your answer" autocomplete="off" autocapitalize="off" spellcheck="false" onkeydown="if(event.key==='Enter'){event.preventDefault();this.nextElementSibling.click();}">
<button type="button" class="ad-guess__submit" onclick="window.pvrxCheckFlag(this, 'gtf{wrong-department}')">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<p><code>GTF{wrong-department}</code></p>
<p>Alex Rivera's account lives in <code>OU=IT</code>, not Wealth Management, so there's no organizational reason for his account to be authenticating from a workstation in a completely different department. Two more facts make it worse: Wealth Management is one of GovTechFinancial's three critical departments, handling the kind of client data an attacker would target, and 2 AM falls outside any reasonable business-hours pattern. That's three independent reasons to flag one login, and none of them required a single log entry. That's the instinct this whole course is built to teach.</p>
</div>
</div>

<style>
.ad-progress { display: flex; align-items: center; gap: 0.85rem; margin: 1.25rem 0 1.75rem; }
.ad-progress__track { flex: 1; height: 8px; border-radius: 999px; background: var(--pvrx-border-light); overflow: hidden; }
.ad-progress__bar { height: 100%; width: 0%; border-radius: 999px; background: linear-gradient(90deg, #6a5cff, #5546e0); transition: width 0.4s ease; }
.ad-progress__label { flex-shrink: 0; font-family: var(--font-mono, ui-monospace, monospace); font-size: 0.78rem; font-weight: 700; color: #5546e0; }

.ad-mission {
  position: relative;
  margin: 1.5rem 0; padding: 1.25rem 1.5rem 1.4rem;
  border: 1px solid var(--pvrx-border-light); border-left: 3px solid #5546e0; border-radius: 0 10px 10px 0;
  background: var(--pvrx-surface-alt-light);
  transition: border-color 0.3s ease, background 0.3s ease;
}
.ad-mission--capstone { border-left-color: #e5484d; }
.ad-mission--solved { border-left-color: #16a34a; background: rgba(22,163,74,0.05); }
.ad-mission__num { font-family: var(--font-mono, ui-monospace, monospace); font-size: 0.7rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #5546e0; }
.ad-mission--capstone .ad-mission__num { color: #e5484d; }
.ad-mission--solved .ad-mission__num { color: #16a34a; }
.ad-mission--solved .ad-mission__num::after { content: " \2713 Solved"; }
.ad-mission h4 { margin: 0.35rem 0 0.5rem; font-family: var(--font-display); font-size: 1.02rem; font-weight: 700; }
.ad-mission > p { margin: 0; }

.ad-hint { margin-top: 0.75rem; }
.ad-hint__btn {
  font-size: 0.78rem; font-weight: 650; color: #5546e0; background: none;
  border: 1px dashed rgba(85,70,224,0.4); border-radius: 999px; padding: 0.3rem 0.75rem; cursor: pointer;
}
.ad-hint__btn:hover { background: rgba(85,70,224,0.08); }
.ad-hint__btn:disabled { color: var(--pvrx-text-secondary-light); border-color: var(--pvrx-border-light); cursor: default; }
.ad-hint__text { display: none; margin: 0.5rem 0 0; font-size: 0.85rem; color: var(--pvrx-text-secondary-light); font-style: italic; }
.ad-hint__text--shown { display: block; }

.ad-guess { display: flex; gap: 0.5rem; margin-top: 0.9rem; flex-wrap: wrap; }
.ad-guess__input {
  flex: 1; min-width: 180px; padding: 0.5rem 0.7rem; border-radius: 8px;
  border: 1px solid var(--pvrx-border-light); font-family: var(--font-mono, ui-monospace, monospace); font-size: 0.85rem;
  background: #fff; color: var(--pvrx-text-primary-light);
}
.ad-guess__input:focus { outline: none; border-color: #5546e0; box-shadow: 0 0 0 3px rgba(85,70,224,0.12); }
.ad-guess__input:disabled { background: var(--pvrx-surface-alt-light); color: var(--pvrx-text-secondary-light); }
.ad-guess__submit {
  font-size: 0.85rem; font-weight: 650; color: #fff; background: #5546e0; border: none; border-radius: 8px;
  padding: 0.5rem 1.1rem; cursor: pointer;
}
.ad-guess__submit:hover { background: #4636c4; }
.ad-guess__submit:disabled { background: var(--pvrx-border-light); cursor: default; }
.ad-guess__feedback { margin: 0.55rem 0 0; font-size: 0.85rem; font-weight: 600; min-height: 1.2em; }
.ad-guess__feedback--ok { color: #16a34a; }
.ad-guess__feedback--err { color: #e5484d; }

.ad-flag { display: none; margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed var(--pvrx-border-light); }
.ad-flag--shown { display: block; }
.ad-flag p, .ad-flag ul { font-size: 0.9rem; }
.ad-flag code { font-weight: 650; }
</style>
