<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Can you resolve real-looking Active Directory tickets by checking the baseline instead of guessing from the request?</p>
</div>

### Ticket Queue: Active Directory Triage

Run `Build-Environment.ps1 -IncludeCTF` if you want these tickets planted directly into your lab. The script adds optional challenge objects and descriptions without changing the clean baseline missions.

Treat each mission like a small help desk or SOC ticket. Your job is to find the account, computer, group, or OU that proves the answer, then enter the short resolution code.

<div class="ad-answer-guide">
<span class="ad-answer-guide__label">Answer format</span>
<p>Type the finding, not a full sentence. Spaces and dashes both work, and the full flag wrapper works too. Example: <code>all-employees</code> or <code>GTF{all-employees}</code>.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 7 solved</span>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Ticket 01 - Easy</span>
<h4>New Hire Announcements</h4>
<p>Jamie Torres in Wealth Management says she is not receiving firm-wide announcements. Her department membership looks right. Which non-department group is she missing?</p>
<div class="ad-ticket-meta"><span>User</span><code>jamie.torres</code><span>Expected action</span><code>Group membership check</code></div>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">Compare Jamie to the other normal users after running the CTF data switch. Look for a group that spans the company, not Wealth Management.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="resolution code" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{all-employees}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{all-employees}</code></p>
<p>Jamie already has <code>Wealth Management Users</code>. She's missing the firm-wide <code>All Employees</code> group. A clean access request, not an incident.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Ticket 02 - Easy</span>
<h4>Locked Out, Not Forgotten</h4>
<p>Riley Kwan calls after repeated failed attempts. Find her account in your lab and confirm it's actually locked. She says she remembers her password now. What should the help desk do?</p>
<div class="ad-ticket-meta"><span>User</span><code>riley.kwan</code><span>Expected action</span><code>Account recovery decision</code></div>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">If the user remembers the password, do not replace it. Clear the lockout condition.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="resolution code" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{unlock-account}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{unlock-account}</code></p>
<p>Unlock the account. A reset is for a forgotten password, not the reflexive answer to every login problem.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Ticket 03 - Medium</span>
<h4>Mirror the Peer, Not the Job Title</h4>
<p>Casey Reed is a new Help Desk Technician. The onboarding ticket says to mirror Priya Nair's actual access. Which group should Casey receive?</p>
<div class="ad-ticket-meta"><span>User</span><code>casey.reed</code><span>Peer</span><code>priya.nair</code></div>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">Priya's title says Help Desk, but her Member Of tab is the source of truth.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="resolution code" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{it-users}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{it-users}</code></p>
<p>Priya is only in <code>IT Users</code>. <code>Helpdesk</code> exists, but her title alone isn't authorization for it.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Ticket 04 - Medium</span>
<h4>Nightly Backup Identity</h4>
<p>Find the account used for the nightly backup job. Which OU proves it was built as a service account instead of a normal person?</p>
<div class="ad-ticket-meta"><span>Account</span><code>svc-backup-job</code><span>Expected check</span><code>Object location</code></div>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">Service accounts should not sit inside a department's Users OU.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="resolution code" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{serviceaccounts}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{serviceaccounts}</code></p>
<p><code>OU=ServiceAccounts</code>. Its description confirms the expected use too: nightly backup on <code>IT-WKS01</code>, 01:00-03:00.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Ticket 05 - Hard</span>
<h4>The Transfer That Did Not Move</h4>
<p>HR says Taylor Osei transferred to Compliance. The account description mentions the transfer, but policy follows OU placement. Where does the account still live?</p>
<div class="ad-ticket-meta"><span>User</span><code>taylor.osei</code><span>Expected check</span><code>Distinguished Name</code></div>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">Find Taylor, open the object properties, and check the full Distinguished Name or the left-side OU tree.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="resolution code" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{operations-ou}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{operations-ou}</code></p>
<p>Taylor still lives under <code>OU=Users,OU=Operations,OU=Departments</code>. A description update doesn't move the object, so old policy still applies.</p>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-attempts="0">
<span class="ad-mission__num">Ticket 06 - Hard</span>
<h4>2 AM From the Wrong Workstation</h4>
<p>An alert says <code>alex.rivera</code> successfully authenticated at 2:00 AM from <code>WM-WKS07</code>. What is the first baseline mismatch?</p>
<div class="ad-ticket-meta"><span>User</span><code>alex.rivera</code><span>Computer</span><code>WM-WKS07</code></div>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">Do not start with the timestamp. Compare Alex's OU to the workstation's department.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="resolution code" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{wrong-department}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{wrong-department}</code></p>
<p>Alex is in IT; <code>WM-WKS07</code> is a Wealth Management workstation. That mismatch alone is enough to escalate, before the hour even enters the conversation.</p>
</div>
</div>

<div class="ad-mission ad-mission--bonus" data-attempts="0">
<span class="ad-mission__num">Bonus - Hard</span>
<h4>Dormant Asset Sweep</h4>
<p>The optional CTF data includes an Operations workstation marked for a dormant-asset review. Which computer object should you investigate?</p>
<div class="ad-ticket-meta"><span>Scope</span><code>Operations Workstations</code><span>Expected check</span><code>Description</code></div>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">Search computer objects for descriptions containing <code>CTF-TICKET-201</code>.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="resolution code" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{ops-wks03}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<span class="ad-flag__label">Finding</span>
<p class="ad-flag__code"><code>GTF{ops-wks03}</code></p>
<p><code>OPS-WKS03</code>, marked for dormant-asset review. Stale machines are risk precisely because nobody's watching them.</p>
</div>
</div>

