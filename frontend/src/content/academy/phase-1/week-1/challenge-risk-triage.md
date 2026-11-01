<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Monday Morning Risk Triage</h3>
<p class="ad-brief__ask">Four reports came in over the weekend and the team can start only one fix. Can you rank them right, then go fix the one that actually wins, yourself?</p>
<ul>
<li><strong>A.</strong> The lobby printer in the Operations wing has been offline since Friday.</li>
<li><strong>B.</strong> The nightly backup job for the Finance and Accounting ledger has failed silently for three weeks. No backup exists if today's server fails.</li>
<li><strong>C.</strong> A share permission leaves the Wealth Management client balances folder open to every account in the domain, instead of Wealth Management Users only.</li>
<li><strong>D.</strong> Someone in Operations was accidentally added to the group that can edit the fee schedule template Wealth Management sends to clients.</li>
</ul>
<p>Your hosted lab needs to be running, with the domain controller reachable. Each step takes a short answer, and the hint unlocks after two misses.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 5 solved</span>
</div>

<div class="ad-mission" data-id="rt-01" data-attempts="0">
<span class="ad-mission__num">Ticket 01 · INC-1081 · Low</span>
<h4>Which Property Failed</h4>
<p><strong>IT · Monday triage · 8:10 AM</strong><br>Before you can rank these four, you have to name what actually broke in each one. Start with ticket C, the Wealth Management share permission.</p>
<p><strong>Task:</strong> Name the CIA property that fails in ticket C.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Which Property Failed" placeholder="a CIA property" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{confidentiality}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Nothing in the folder was changed, and nothing is unreachable. The only thing that happened is that people who shouldn't be able to see it, can.</p>
<ol>
<li>Ask whether the data itself is wrong (integrity), missing (availability), or exposed to the wrong people (confidentiality).</li>
<li>A share permission problem is almost always about who can see something, not whether it's correct or reachable by the people who should have it.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="integrity">Nothing in the client balances data was changed. The problem is who can see it, not whether it's correct.</div>
<div class="ad-miss" data-guess="availability">The data is still fully reachable by the people who are supposed to have it. The problem is that too many other people can reach it too.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{confidentiality}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A share open to the whole domain instead of one department is a textbook confidentiality failure: the data is intact and available, it's just visible to people who have no business reason to see it.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="rt-02" data-attempts="0">
<span class="ad-mission__num">Ticket 02 · INC-1081 · Medium</span>
<h4>The Quiet Backup Failure</h4>
<p><strong>IT · Monday triage · 8:12 AM</strong><br>Ticket B hasn't broken anything yet. The backup job has just been failing silently, three weeks running, and nobody noticed until this weekend.</p>
<p><strong>Task:</strong> Name the CIA property actually at risk here, even though nothing has failed in front of a user yet.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for The Quiet Backup Failure" placeholder="a CIA property" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{availability}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Ask what happens the day the live server actually fails, with no backup behind it.</p>
<ol>
<li>The ledger itself is not wrong right now, and nobody unauthorized has seen it.</li>
<li>The risk is that if the live copy is ever lost, there is nothing to bring it back with.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="integrity">The ledger's current data hasn't been altered. The risk is about what happens if it's ever lost, not whether it's currently correct.</div>
<div class="ad-miss" data-guess="confidentiality">No unauthorized person has seen anything here. This is purely about whether the data could still be recovered if the server failed today.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{availability}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A failed backup is the quiet kind of availability risk: it costs nothing today and everything the day the live copy is gone. Calling it "low risk because nothing is broken yet" is exactly the mistake triage exists to catch.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="rt-03" data-attempts="0">
<span class="ad-mission__num">Ticket 03 · INC-1081 · Medium</span>
<h4>Rank Them by Department</h4>
<p><strong>IT · Monday triage · 8:15 AM</strong><br>You now know what failed in each ticket. The org chart marks Compliance, Wealth Management, and Finance and Accounting as critical departments; IT and Operations are not.</p>
<p><strong>Task:</strong> Using department criticality, name the one ticket that should be worked first this morning.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Rank Them by Department" placeholder="a letter" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{c}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Two tickets touch a critical department: B (Finance and Accounting) and C (Wealth Management). One of them is a live, active exposure happening right now. The other is a risk that hasn't materialized yet.</p>
<ol>
<li>B is a backup that's been failing for three weeks with no damage yet.</li>
<li>C is a confidentiality breach that is open and exploitable right now, on the firm's most client-sensitive department.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">Ticket A sits in Operations, which the org chart marks as not critical. It's the loudest complaint, not the biggest risk.</div>
<div class="ad-miss" data-guess="b">B is a real risk in a critical department, but it's a risk that hasn't happened yet. C is an active exposure happening right now in an equally critical department.</div>
<div class="ad-miss" data-guess="d">D is a real integrity concern, but it's a narrower exposure (one wrong edit, catchable before it ships) next to C's active, open confidentiality breach.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{c}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>C is the only ticket that's both in a critical department and actively exploitable right now, not a risk waiting to happen. That combination is what moves a ticket to the front of the queue.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="rt-04" data-attempts="0">
<span class="ad-mission__num">Ticket 04 · INC-1081 · Low</span>
<h4>Why the Printer Waits</h4>
<p><strong>IT · Monday triage · 8:18 AM</strong><br>Ticket A is the one everyone keeps asking about. It's been down since Friday and people notice a dead printer immediately. It's also going to be worked last.</p>
<p><strong>Task:</strong> Name the org-chart fact that justifies ranking the loudest complaint in the whole queue dead last.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Why the Printer Waits" placeholder="a short phrase" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{operations is not critical}" data-accept="operations not critical|not a critical department|operations isn't critical">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Volume of complaints is not the same input as business risk. Go back to the org chart's own critical/not-critical column.</p>
<ol>
<li>A sits in the Operations wing.</li>
<li>Operations is marked "Critical: No" on the org chart, the same as IT.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="printers don't matter">A dead printer is a real inconvenience. The reason it still waits is about which department it sits in, not whether the complaint is valid.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{operations is not critical}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Operations is marked not critical on the org chart, the same as IT. A printer outage there costs convenience, not regulated data or client trust. Ranking by complaint volume instead of department risk is how a team spends its week on the wrong fire.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="rt-05" data-attempts="0">
<span class="ad-mission__num">Ticket 05 · INC-1081 · Medium</span>
<p><strong>IT · Monday triage · 8:20 AM</strong><br>Ranking ticket C first was the easy part. Nobody's balance is any safer until the permission itself is fixed.</p>
<p><strong>Task:</strong> On the domain controller, lock <code>C:\PurveX\Shares\WealthManagement</code> down to Wealth Management Users only, then report the group name that now shows Modify access on it.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the group now granted access on the Wealth Management share" placeholder="a group name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{wealth management users}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The folder inherits the whole <code>Shares</code> drive's broad permission right now. Breaking that inheritance and granting the one group that should actually have it is the fix, not just naming the problem.</p>
<ol>
<li>Open PowerShell on the domain controller.</li>
<li><code>icacls "C:\PurveX\Shares\WealthManagement"</code> shows what the folder currently inherits.</li>
<li><code>icacls "C:\PurveX\Shares\WealthManagement" /inheritance:r</code> stops it inheriting the wider <code>Shares</code> permission.</li>
<li><code>icacls "C:\PurveX\Shares\WealthManagement" /grant "PURVEXFINANCIAL\Wealth Management Users:(OI)(CI)M"</code> grants the one department that should see it.</li>
<li><code>icacls "C:\PurveX\Shares\WealthManagement" /grant "PURVEXFINANCIAL\Domain Admins:(OI)(CI)F"</code> keeps IT able to manage the folder.</li>
<li>Confirm with <code>icacls "C:\PurveX\Shares\WealthManagement"</code> again and read the group names it now lists.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="domain users|domain admins|everyone">That is either the broad access you just removed or a group you granted for IT management, not the department this folder actually belongs to.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{Wealth Management Users}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Naming a ticket's priority and closing it are two different jobs. <code>/inheritance:r</code> is what actually breaks the folder away from the wider share's permission, which is the one step a report alone never does. An audit finding that only gets written down, never fixed, protects nobody's balance by Tuesday.</p>
</div>
</div>
</div>
</div>
