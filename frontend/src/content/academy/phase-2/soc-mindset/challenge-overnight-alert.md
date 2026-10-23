<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Approved Overnight, or Not?</h3>
<p class="ad-brief__ask">Can you tell a real attack from an alert that only looks like one, using your own lab?</p>
<p>An automated alert fired for a sign-in well outside business hours. That is exactly the kind of alert this week trained you not to pattern-match on sight. Before you escalate anything, work it the way the 5 W's and the classification lesson both taught: check the record first. Later in this phase, a real intrusion runs through several tickets in a row. This one is not part of it, and telling the two apart is the point.</p>
<p>Both steps check your Phase 1 lab, so keep it running. Each step takes a short answer, you get three tries per step, and the hint unlocks after two misses.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 2 solved</span>
</div>

<div class="ad-mission" data-id="sm-01" data-attempts="0">
<span class="ad-mission__num">Ticket 01 · INC-1065 · Routine</span>
<h4>Check the Record Before You React</h4>
<p><strong>SIEM Alert · Automated detection · 3:40 AM</strong><br>ALERT: successful sign-in for morgan.reyes at 3:40 AM. Outside normal business hours.</p>
<p><strong>Task:</strong> Find morgan.reyes in Active Directory and read the account's own Description. Report the approved window it names, in the format 00:00-00:00.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Check the Record Before You React" placeholder="00:00-00:00" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{01:00-05:00}" data-accept="1:00-5:00|0100-0500|1am-5am|1:00am-5:00am">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The investigation mindset starts with the account itself, before the log and before the clock. One field on this account already answers most of the question.</p>
<ol>
<li>Open Active Directory Users and Computers with Win+R and <code>dsa.msc</code>.</li>
<li>Right-click the domain and use Find to search for <code>morgan.reyes</code>.</li>
<li>Open the account's Properties and read the General tab's Description field.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-ADUser morgan.reyes -Properties Description, Title | Select-Object Description, Title</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="3:40|0340">That is when the alert fired, not the approved window. Read the account's Description for the window it names.</div>
<div class="ad-miss" data-guess="systems engineer, overnight operations">That is the account's title. The approved window is in its Description.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{01:00-05:00}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>3:40 AM falls inside the account's own approved window. The alert's wording made it sound exactly like INC-1046, but the record tells a different story. Reading the account before reacting to the clock is the whole point of this week's investigation mindset.</p>
</div>
<div>
<span>What to do</span>
<p>Carry this finding into the next step, where it decides how the alert actually gets classified.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="sm-02" data-attempts="0">
<span class="ad-mission__num">Ticket 02 · INC-1065 · Routine</span>
<h4>Classify What You Actually Found</h4>
<p><strong>SOC Queue · Follow-up · 3:45 AM</strong><br>You now know morgan.reyes's 3:40 AM sign-in falls inside the account's own approved overnight window.<br><strong>A</strong> P1, Critical: an off-hours sign-in is always worked first.<br><strong>B</strong> P2, High: unusual timing still needs a fast look even if the record checks out.<br><strong>C</strong> P3, Routine: the sign-in matches the account's own approved window, so it is worked when the queue allows.<br><strong>D</strong> Not an incident at all, and the alert should be deleted.</p>
<p><strong>Task:</strong> Choose the classification that fits what the record actually showed, and type its letter.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Classify What You Actually Found" placeholder="A, B, C, or D" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{c}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Classify by what the evidence showed, not by how alarming "3:40 AM sign-in" sounds on its own.</p>
<p>It is still a real event worth a record, which rules out doing nothing. It is also not competing with an active, unexplained incident for your attention right now.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">Treating every off-hours alert as Critical is what buries the real ones. The record already explains this one.</div>
<div class="ad-miss" data-guess="b">The record fully explains the timing. There is nothing left that still needs a fast look.</div>
<div class="ad-miss" data-guess="d">An explained alert is still worth a record. Deleting it loses the evidence that it was ever checked.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{c}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Severity gets judged by impact, not by how the alert's wording reads. An explained, approved sign-in carries none of the urgency its timestamp implies, and a queue that treats it like INC-1046 trains everyone to stop trusting the word "Critical."</p>
</div>
<div>
<span>What to do</span>
<p>Log it as P3 and move on to what the queue actually needs worked next.</p>
</div>
</div>
</div>
</div>
