<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Who Can Open the Compliance Case Files?</h3>
<p class="ad-brief__ask">A folder's permissions can be set exactly right, and yet someone can still see data their job never needed. How does that happen?</p>
<p>You'll work this one in your own lab. First, you'll find the tool that shows an account's real access. Then you'll use it to find who has access they shouldn't, and finally you'll take that access back.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 3 solved</span>
</div>

<div class="ad-mission" data-id="ea-01" data-attempts="0">
<span class="ad-mission__num">Ticket 01 · INC-1071 · Medium</span>
<h4>Find the Right Tool</h4>
<p><strong>IT Lead · Access review · 9:10 AM</strong><br>Before you can say who can open the Compliance share, you need to know every group an account belongs to, not just the one it was hired into. That's harder than it sounds, because a single Member Of tab can miss a group that was added later.</p>
<p><strong>Task:</strong> Name the PowerShell cmdlet that lists every group an account belongs to, including through nested membership.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Find the Right Tool" placeholder="a cmdlet" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{get-adprincipalgroupmembership}" data-accept="adprincipalgroupmembership">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>There are two cmdlets that sound alike. One reads a group's members, while the other reads an account's memberships, and this audit needs the second kind.</p>
<ol>
<li>Open PowerShell on the domain controller and import the Active Directory module.</li>
<li>Get-ADGroupMember takes a group and lists its members, which is the wrong direction for this question.</li>
<li>The cmdlet you want takes an account (<code>-Identity</code>) and lists every group it belongs to.</li>
<li>Its name follows the pattern Get-AD + the thing it returns, Principal Group Membership.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="get-adgroupmember">That one lists who's in a group you've already named. You need the cmdlet that starts from the account instead.</div>
<div class="ad-miss" data-guess="get-aduser">That reads an account's own attributes, not the groups it belongs to.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{Get-ADPrincipalGroupMembership}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>An account's Member Of tab can run long, and a group it belongs to through a nested group never shows up there at all. This cmdlet reads every membership the account actually has, and that complete picture is what an access audit needs before it can say what someone can really open.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="ea-02" data-attempts="0">
<span class="ad-mission__num">Ticket 02 · INC-1071 · Medium</span>
<h4>Find Who Does Not Belong</h4>
<p><strong>IT Lead · Access review · 9:15 AM</strong><br>The Compliance share holds the firm's client review files, and by design it's open to Compliance Users and nobody else. Even so, one account outside Compliance can still open it.</p>
<p><strong>Task:</strong> Run the cmdlet from the last ticket against the Help Desk technicians and name the one who is a member of Compliance Users.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Find Who Does Not Belong" placeholder="an account name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{noor.ahmadi}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>You're checking IT's own staff for a group that none of their jobs call for.</p>
<ol>
<li>Open Active Directory Users and Computers and browse to Departments → IT → Users.</li>
<li>For each Help Desk Technician, open the account and check its Member Of tab for Compliance Users.</li>
<li>In PowerShell: <code>Get-ADPrincipalGroupMembership -Identity noor.ahmadi | Select-Object Name</code>.</li>
<li>Read the account's Description for when the group was added and why.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="devon.brooks|morgan.lee|nina.castillo|owen.brandt|lena.farooq|theo.walsh">That account is Compliance staff. Compliance Users is their own department group, not the finding. Check the Help Desk technicians instead.</div>
<div class="ad-miss" data-guess="priya.nair">priya.nair is a Help Desk Technician too, but her Member Of tab shows no Compliance Users membership. Check the other technician instead.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{noor.ahmadi}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Noor's own Description explains why. She was added to Compliance Users months ago to export data for an audit, and nobody removed her once the audit ended. A temporary grant that outlives its reason is one of the most common findings in a real access review, and it never comes to light unless someone actually checks.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="ea-03" data-attempts="0">
<span class="ad-mission__num">Ticket 03 · INC-1071 · Medium</span>
<h4>Remove the Access</h4>
<p><strong>IT Lead · Access review · 9:20 AM</strong><br>It's confirmed: Noor's role never needed Compliance Users, and the audit the access was granted for closed long ago.</p>
<p><strong>Task:</strong> Remove the account from the group that grants it, and report the group.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Remove the Access" placeholder="a group name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{compliance users}" data-accept="complianceusers">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>You only need to remove the group membership. The account stays enabled and keeps every group that Noor's own role actually needs.</p>
<ol>
<li>Open Active Directory Users and Computers and find <code>noor.ahmadi</code> in Departments → IT → Users.</li>
<li>Open the Member Of tab, select Compliance Users, and click Remove.</li>
<li>Confirm IT Users is still listed, so her own access is untouched.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Remove-ADGroupMember -Identity "Compliance Users" -Members noor.ahmadi</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="it users">That is the group her own role actually needs. Remove the one the audit flagged instead.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{Compliance Users}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Taking away that one grant closes this finding. To prevent the next one, get in the habit of giving every temporary grant an end date, so access from a long-closed audit can't stay open on its own.</p>
</div>
</div>
</div>
</div>
