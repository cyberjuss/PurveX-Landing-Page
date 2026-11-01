<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Baseline a Team, Then Find Who Breaks It</h3>
<p class="ad-brief__ask">Can you build a real baseline from peer accounts and find the one access grant that does not belong, on your own lab?</p>
<p>Four Compliance Analysts should look the same on paper. Three of them do. The work is proving that with their actual group membership, not an assumption, then finding and fixing the one that does not match. Nobody planted this one. It is ordinary privilege creep, the kind that outlasts a role change because nobody checks, and the same comparison you build here is what catches it when someone does plant it.</p>
<p>All three steps check your Phase 1 lab, so keep it running. Each step takes a short answer, you get three tries per step, and the hint unlocks after two misses.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 3 solved</span>
</div>

<div class="ad-mission" data-id="bt-01" data-attempts="0">
<span class="ad-mission__num">Ticket 01 · INC-1066 · Routine</span>
<h4>Build the Baseline</h4>
<p><strong>Compliance Lead · Quarterly access review · 9:00 AM</strong><br>Four Compliance Analysts share the role: nina.castillo, owen.brandt, lena.farooq and theo.walsh. Nobody has compared their access side by side in over a year.</p>
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
<span class="ad-mission__num">Ticket 02 · INC-1066 · Routine</span>
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

<div class="ad-mission ad-mission--capstone" data-id="bt-03" data-attempts="0">
<span class="ad-mission__num">Ticket 03 · INC-1066 · Routine</span>
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
