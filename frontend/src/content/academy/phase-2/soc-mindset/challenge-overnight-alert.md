<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Approved Overnight, or Not?</h3>
<p class="ad-brief__ask">Can you tell a real attack from an alert that only looks like one, using your own lab?</p>
<p>An automated alert fired for a sign-in well outside business hours. That is exactly the kind of alert this week trained you not to pattern-match on sight. Before you escalate anything, work it the way the 5 W's and the classification lesson both taught: check the record first, every field of it. Later in this phase, a real intrusion runs through several tickets in a row. This one is not part of it, and telling the two apart is the point.</p>
<p>Both steps check your Phase 1 lab, so keep it running. Each step takes a short answer, you get three tries per step, and the hint unlocks after two misses.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 2 solved</span>
</div>

<div class="ad-mission" data-id="sm-01" data-attempts="0">
<span class="ad-mission__num">Ticket 01 · INC-1065 · High</span>
<h4>Check the Record Before You React</h4>
<p><strong>SIEM Alert · Automated detection · 3:40 AM</strong><br>ALERT: successful interactive sign-in for morgan.reyes at 3:40 AM from workstation REMOTE-SUPPORT4. Outside normal business hours.</p>
<p><strong>Task:</strong> Find morgan.reyes in Active Directory and read the account's own Description in full. It names an approved time window and the one workstation that overnight work is authorized from. Report that workstation's name.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Check the Record Before You React" placeholder="workstation name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{IT-WKS01}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The investigation mindset starts with the account itself, before the log and before the clock. One field on this account answers the time question and the location question. Read all of it.</p>
<ol>
<li>Open Active Directory Users and Computers with Win+R and <code>dsa.msc</code>.</li>
<li>Right-click the domain and use Find to search for <code>morgan.reyes</code>.</li>
<li>Open the account's Properties and read the General tab's Description field in full.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-ADUser morgan.reyes -Properties Description, Title | Select-Object Description, Title</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="3:40|0340">That is when the alert fired, not the workstation the account's record authorizes.</div>
<div class="ad-miss" data-guess="remote-support4|remotesupport4">That is the workstation the alert claims, not the one morgan.reyes's record names. Keep reading the Description.</div>
<div class="ad-miss" data-guess="01:00-05:00|0100-0500">That is the approved window, not the workstation. The same field names a machine too.</div>
<div class="ad-miss" data-guess="systems engineer, overnight operations">That is the account's title. The authorized workstation is in its Description.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{IT-WKS01}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The account's Description names IT-WKS01 as the only workstation this overnight work is authorized from. The alert's sign-in came from REMOTE-SUPPORT4 instead. The time alone made this sound exactly like INC-1046, but the record tells a fuller story once you read every field of it.</p>
</div>
<div>
<span>What to do</span>
<p>Carry both facts into the next step: the time that matched and the workstation that didn't.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="sm-02" data-attempts="0">
<span class="ad-mission__num">Ticket 02 · INC-1065 · High</span>
<h4>Classify What You Actually Found</h4>
<p><strong>SOC Queue · Follow-up · 3:45 AM</strong><br>You now know morgan.reyes's 3:40 AM sign-in falls inside the account's approved overnight window, but it came from REMOTE-SUPPORT4, not IT-WKS01, the one workstation that record authorizes.<br><strong>A</strong> P1, Critical: an off-hours sign-in is always worked first.<br><strong>B</strong> P2, High: the time checks out, but the workstation does not, and that gap needs a fast look before the ticket closes.<br><strong>C</strong> P3, Routine: the sign-in matches the account's own approved window, so it is worked when the queue allows.<br><strong>D</strong> Not an incident at all, and the alert should be deleted.</p>
<p><strong>Task:</strong> Choose the classification that fits what the record actually showed, and type its letter.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Classify What You Actually Found" placeholder="A, B, C, or D" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Classify by what the evidence showed, not by how alarming "3:40 AM sign-in" sounds on its own, and not by only the half of the record that happens to check out.</p>
<p>The time matching the approved window explains the hour. It does not explain the workstation, and an approved window names one machine, not any machine at that hour.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">Treating every off-hours alert as Critical is what buries the real ones. Part of this record does check out.</div>
<div class="ad-miss" data-guess="c">The time matches, but the workstation does not. An approved window covers one named machine, not a sign-in from anywhere at that hour.</div>
<div class="ad-miss" data-guess="d">An unexplained workstation mismatch is still worth a record. Deleting it loses the evidence that it was ever checked.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{b}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>An approved overnight window authorizes work from one named workstation, not a sign-in from anywhere at that hour. Stolen credentials get used at convenient times on purpose, often inside a window staff already expect activity in. Checking the time and stopping there would have closed this out clean.</p>
</div>
<div>
<span>What to do</span>
<p>Log it as P2 and route it to IT on-call to confirm whether REMOTE-SUPPORT4 belongs to morgan.reyes at all before closing it.</p>
</div>
</div>
</div>
</div>
