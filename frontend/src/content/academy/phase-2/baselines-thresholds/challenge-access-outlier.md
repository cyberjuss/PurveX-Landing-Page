<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Baseline a Team, Then Find Who Breaks It</h3>
<p class="ad-brief__ask">Can you build a real baseline from peer accounts and find the one access grant that does not belong, on your own lab?</p>
<p>All three steps check your Phase 1 lab, so keep it running.</p>
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
<p>Don't guess at what the role should have. A baseline is what the peers actually share, so read it off every one of them.</p>
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
<div class="ad-miss" data-guess="nina.castillo|owen.brandt|lena.farooq">That account's membership matches two of its peers, so it's part of the baseline. Keep comparing until you find the account with a group the others don't have.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{theo.walsh}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Because three accounts hold exactly the same membership, you're working from a baseline rather than a hunch. The fourth account breaks that pattern, and surfacing an outlier like that is what a baseline is for, just as it would be with a sign-in or file-access pattern.</p>
</div>
<div>
<span>What to do</span>
<p>Next, you'll pin down exactly what that extra access is.</p>
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
<p>All four accounts share Compliance Users, so look past it for the one group that only the outlier has.</p>
<ol>
<li>Open theo.walsh's Member Of tab again.</li>
<li>Compare it one more time against any of the other three accounts.</li>
<li>Name the group present on theo.walsh and absent everywhere else.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="compliance users">All four accounts share that group, which makes it part of the baseline rather than the exception.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{server admins}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Server Admins is a Level 2 access-level group rather than a department group, and nothing about reviewing client files and regulatory filings calls for it. Access like this rarely comes from someone deliberately granting it. More often, it survives a role change because nobody ever asked whether it still belonged.</p>
</div>
<div>
<span>What to do</span>
<p>For the last step, you'll remove the membership instead of just reporting it.</p>
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
<p>Be careful to remove the membership, not the account. theo.walsh still needs Compliance Users.</p>
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
<div class="ad-miss" data-guess="compliance users">That's the group to keep. Remove the access-level group instead.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{server admins}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A baseline is only worth building if it changes something. If you find the outlier and leave it in place, you've produced an audit finding nobody acted on, and that's exactly how privilege creep sits unnoticed for a year.</p>
</div>
<div>
<span>What to do</span>
<p>You can file this one as closed, because the quarterly review for this group is done.</p>
</div>
</div>
</div>
</div>
