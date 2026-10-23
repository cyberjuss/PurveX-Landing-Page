<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Also This Week</h3>
<p class="ad-brief__ask">Not every ticket this week is part of the intrusion. Can you tell which ones are, and still do the other work well?</p>
<p>Three routine pieces of work land the same week as the real intrusion, and none of them are part of it. An alert that looks like an attack but is not. A quarterly access review that catches ordinary privilege creep nobody planted. An audit asking for a stronger password policy. Real SOC and sysadmin work is full of tickets like these, running alongside whatever the real chain is doing, and working them well matters just as much.</p>
<p>All six steps check your Phase 1 lab, so keep it running. Each step takes a short answer, you get three tries per step, and the hint unlocks after two misses.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 6 solved</span>
</div>

<div class="ad-mission" data-id="sm-01" data-attempts="0">
<span class="ad-mission__num">Part 1 · Investigation Mindset · INC-1065 · Routine</span>
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

<div class="ad-mission" data-id="sm-02" data-attempts="0">
<span class="ad-mission__num">Part 1 · Investigation Mindset · INC-1065 · Routine</span>
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

<div class="ad-mission" data-id="bt-01" data-attempts="0">
<span class="ad-mission__num">Part 2 · Access Review · INC-1066 · Routine</span>
<h4>Build the Baseline</h4>
<p><strong>Compliance Lead · Quarterly access review · 9:00 AM</strong><br>Four Compliance Analysts share the role: nina.castillo, owen.brandt, lena.farooq and theo.walsh. Nobody has compared their access side by side in over a year. Nobody planted this one; it is ordinary privilege creep, the kind that outlasts a role change because nobody checks.</p>
<p><strong>Task:</strong> Open each account's Member Of tab and compare them. Report the one whose group membership does not match the baseline the other three share.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Build the Baseline" placeholder="first.last" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{theo.walsh}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A baseline is not a guess about what a role should have. It is what the peers actually share, read off every one of them.</p>
<ol>
<li>Open Active Directory Users and Computers with Win+R and <code>dsa.msc</code>.</li>
<li>Find each of the four accounts and open its Member Of tab.</li>
<li>List what each one has, then compare the four lists side by side.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>"nina.castillo","owen.brandt","lena.farooq","theo.walsh" | ForEach-Object { Get-ADPrincipalGroupMembership $_ | Select-Object @{N="User";E={$_}}, Name }</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="nina.castillo|owen.brandt|lena.farooq">That account's membership matches the other two baseline peers. Keep comparing until one account has a group the rest do not.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{theo.walsh}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Three accounts holding the exact same membership is what makes it a baseline rather than a hunch. The fourth account breaking that pattern is the outlier a baseline is built to surface, the same way a sign-in pattern or a file-access pattern would.</p>
</div>
<div>
<span>What to do</span>
<p>Now find exactly what the extra access is, which is the next step.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="bt-02" data-attempts="0">
<span class="ad-mission__num">Part 2 · Access Review · INC-1066 · Routine</span>
<h4>Name the Extra Access</h4>
<p><strong>Compliance Lead · Quarterly access review · 9:04 AM</strong><br>You found the account that breaks the baseline. Now find exactly what it has that the other three do not.</p>
<p><strong>Task:</strong> Report the name of the group on that account that the other three Compliance Analysts are not members of.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Name the Extra Access" placeholder="group name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{server admins}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Compliance Users is the one group all four share. Find the one group that only the outlier account has.</p>
<ol>
<li>Open theo.walsh's Member Of tab again.</li>
<li>Compare it one more time against any of the other three accounts.</li>
<li>Name the group present on theo.walsh and absent everywhere else.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="compliance users">All four accounts share that group. It is the baseline itself, not the exception to it.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{server admins}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Server Admins is a Level 2 access-level group, not a department group, and nothing about reviewing client files and regulatory filings needs it. Access like this usually survives a role change because nobody ever asks whether it still belongs, not because anyone meant to grant it.</p>
</div>
<div>
<span>What to do</span>
<p>Remove the membership rather than just reporting it, which is the last step.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="bt-03" data-attempts="0">
<span class="ad-mission__num">Part 2 · Access Review · INC-1066 · Routine</span>
<h4>Fix the Baseline</h4>
<p><strong>Compliance Lead · Quarterly access review · 9:10 AM</strong><br>Confirmed: theo.walsh does not need Server Admins for this role.</p>
<p><strong>Task:</strong> Remove theo.walsh from Server Admins, then type the name of the group you removed them from.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Fix the Baseline" placeholder="group name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{server admins}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Removing from a group and deleting an account are not the same action. theo.walsh still needs Compliance Users.</p>
<ol>
<li>Open theo.walsh's Properties and go to the Member Of tab.</li>
<li>Select Server Admins and click Remove.</li>
<li>Confirm theo.walsh still shows Compliance Users afterward.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Remove-ADGroupMember -Identity "Server Admins" -Members "theo.walsh" -Confirm:$false</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="compliance users">That is the group to keep, not the one to remove. Remove the access-level group instead.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{server admins}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A baseline is only worth building if it actually changes something. Finding the outlier and leaving it in place is an audit finding nobody acted on, the exact gap that lets privilege creep sit for a year unnoticed.</p>
</div>
<div>
<span>What to do</span>
<p>File it as closed. The quarterly review for this group is done.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="th-01" data-attempts="0">
<span class="ad-mission__num">Part 3 · Password Policy · INC-1068 · Routine</span>
<h4>Wealth Management Needs Its Own Threshold</h4>
<p><strong>Devon Brooks · Compliance · 2:15 PM</strong><br>The firm's default password policy treats every department the same. Wealth Management handles client funds directly, and the audit wants their accounts held to a stronger standard, without making a normal typo lock someone out of their own workday. This is a proactive fix, driven by an audit rather than by anything found this week, but it is exactly the control that makes the next password spray cost an attacker more tries for the same result.</p>
<p><strong>Task:</strong> Apply a Fine-Grained Password Policy to Wealth Management Users requiring at least 12 characters and locking out after no more than 12 failed attempts. Then type the lockout threshold you set.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Wealth Management Needs Its Own Threshold" placeholder="a number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{10}" data-accept="8|9|10|11|12">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A second, stricter policy for one group is a Password Settings Object, the same tool that holds IT administrators to a tighter standard elsewhere in this domain.</p>
<ol>
<li>Open Active Directory Administrative Center with Win+R and <code>dsac.exe</code>.</li>
<li>Go to System, then Password Settings Container, then New, then Password Settings.</li>
<li>Give it a name and a precedence, set the minimum length to 12, and set the lockout threshold somewhere between 8 and 12.</li>
<li>Under Directly Applies To, add Wealth Management Users.</li>
<li>Confirm with <code>Get-ADFineGrainedPasswordPolicy -Filter *</code>.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>New-ADFineGrainedPasswordPolicy -Name "WM-Stronger-Policy" -Precedence 10 -MinPasswordLength 12 -LockoutThreshold 10 -LockoutDuration "00:30:00" -LockoutObservationWindow "00:30:00" -ComplexityEnabled $true -ReversibleEncryptionEnabled $false</code></li>
<li><code>Add-ADFineGrainedPasswordPolicySubject -Identity "WM-Stronger-Policy" -Subjects "Wealth Management Users"</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="3|5|6|7">That is tight enough to catch a typo-prone afternoon and lock out real users on ordinary mistakes. Loosen it toward the middle of the defensible band.</div>
<div class="ad-miss" data-guess="20|30|40|50">That gives a guessing script dozens of free attempts before anything stops it. Tighten it toward the middle of the defensible band.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{10}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The exact number matters less than landing in the band that actually balances the two costs. Too low drowns the help desk in lockout tickets from real users. Too high hands a password-guessing script dozens of tries before the account ever locks, the same trade-off this week's detection threshold lesson makes with alert volume instead of lockouts.</p>
</div>
<div>
<span>What to do</span>
<p>Confirm the policy applies before closing the ticket. A policy that exists but targets the wrong group protects nothing.</p>
</div>
</div>
</div>
</div>
