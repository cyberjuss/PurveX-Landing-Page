<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Name It, Then Fix What You Broke</h3>
<p class="ad-brief__ask">You broke all three properties on purpose. Can you name which one failed in two new tickets, fix the one you can still undo, and say what a backup can't touch?</p>
<p>Hosted lab required. Builds on the Confidentiality, Integrity, and Availability challenges above.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 4 solved</span>
</div>

### Name the Property That Failed

<div class="ad-mission" data-id="w1e-c4" data-attempts="0">
<span class="ad-mission__num">Ticket 03 · INC-1085 · Medium</span>
<p><strong>Client Support · Escalation · 9:15 AM</strong><br>Advisor sam.whitfield's client Avery calls in: the statement on their portal dashboard shows client Blake's account balance instead of their own. The numbers on it are correct for someone, just not for Avery.</p>
<p><strong>Task:</strong> Which property failed? Type its letter.<br><strong>A</strong> Confidentiality.<br><strong>B</strong> Integrity.<br><strong>C</strong> Availability.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for which property failed" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{a}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The number on screen is correct and the portal is up. Nothing about the data itself is wrong; it only reached a person it should not have.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="b">The balance itself is accurate for whoever it actually belongs to. Nothing was altered; it just reached the wrong client.</div>
<div class="ad-miss" data-guess="c">The portal is up and serving data just fine. The failure is about who can see what, not whether the service responds.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>A. Confidentiality</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The data is correct and available. It just reached the wrong person, which is a confidentiality failure.</p>
</div>
</div>
</div>
</div>

### Combine Two Failures at Once

<div class="ad-mission ad-mission--capstone" data-id="w1e-c5" data-attempts="0">
<span class="ad-mission__num">Ticket 04 · INC-1086 · Critical</span>
<p><strong>SOC Lead · Incident Review · 2:00 PM</strong><br>A ransomware attack encrypts PurveX Financial's file share overnight, and the forensic review finds the attacker also copied everything out before encrypting it.</p>
<p><strong>Task:</strong> Which properties failed, and which one costs the most if the attacker publishes what they took? Type its letter.<br><strong>A</strong> Only availability failed. The published copy does not change that.<br><strong>B</strong> Both availability and confidentiality failed. Encryption blocks access right now, but a published copy of client data is the harder loss to undo.<br><strong>C</strong> Only confidentiality failed, since the files still exist somewhere.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for which properties failed in a ransomware attack with data theft" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Two separate things happened here: the files got locked, and a copy left the building before that. Name what each one breaks on its own.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">Encryption is not the only thing that happened. A copy also left the building before the files were locked.</div>
<div class="ad-miss" data-guess="c">The share being encrypted is a real failure too, the same one you caused with <code>systemctl stop nginx</code> earlier, just harder to undo this time.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. Both availability and confidentiality failed</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Encryption is an availability failure you can usually recover from with a clean backup. A stolen copy already in an attacker's hands is a confidentiality failure a backup cannot undo, which is why modern ransomware steals data before it encrypts anything at all.</p>
</div>
</div>
</div>
</div>

### Fix What You Broke

Naming a failure and closing it are two different jobs. You still have one confidentiality failure sitting open on your own machine: <code>ledger.txt</code> at <code>chmod 600</code>, unreadable by jamie.torres.

<div class="ad-mission ad-mission--capstone" data-id="w1e-c6" data-attempts="0">
<span class="ad-mission__num">Ticket 05 · INC-1151 · Low</span>
<p><strong>IT · Follow-up · 9:20 AM</strong><br>jamie.torres is back from Wealth Management asking why the ledger they could read this morning is now denying them.</p>
<p><strong>Task:</strong> Restore jamie.torres's read access on <code>/srv/cia/ledger.txt</code>, confirm it with the same command you used to break it, then report the permission string <code>ls -l</code> now shows for the file.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the restored permission string" placeholder="a permission string" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{-rw-r--r--}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>You set this file to <code>644</code> yourself right after creating it, before breaking confidentiality on purpose.</p>
<ol>
<li><code>chmod 644 /srv/cia/ledger.txt</code> restores group and other read access.</li>
<li><code>sudo -u jamie.torres cat /srv/cia/ledger.txt</code> confirms the read works again, the same command that failed before.</li>
<li><code>ls -l /srv/cia/ledger.txt</code> prints the permission string to report.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="-rw-------">That is the broken state from <code>chmod 600</code>, the one you are fixing, not the one you are restoring to.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>-rw-r--r--</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Confidentiality is the one property in this whole lab you can actually put back the way it was. A hash can prove integrity broke but never un-happen the change itself, and the minutes nginx was down are gone either way. A wrong permission is just a wrong permission, fixed with the same tool that broke it, which is why access reviews exist: the fix is this cheap, every time, if anyone ever checks.</p>
</div>
</div>
</div>
</div>

### Take It Further

The company restores the ransomware-hit share from a clean backup made the night before the attack.

<div class="ad-mission ad-mission--capstone" data-id="w1e-c7" data-attempts="0">
<span class="ad-mission__num">Ticket 06 · INC-1152 · Medium</span>
<p><strong>SOC Lead · Post-Incident Review · 3:30 PM</strong><br>The restore finishes. Leadership asks whether this incident is now closed.</p>
<p><strong>Task:</strong> Which properties does that restore actually fix, and which one is it powerless against no matter how recent the backup is? Type its letter.<br><strong>A</strong> It fixes integrity only. Availability and confidentiality stay broken either way.<br><strong>B</strong> It fixes integrity and availability, since the files come back correct and reachable, but it cannot touch confidentiality: a copy already in the attacker's hands stays there.<br><strong>C</strong> It fixes all three, since the backup contains the original, unaltered data.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for which properties a clean backup restore fixes" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A backup is a copy of what the data should look like. It can replace a locked or corrupted file. It cannot reach into an attacker's machine and delete the copy they already took.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">The restore does more than fix integrity. The files are reachable again too, which is an availability fix, not just a correctness one.</div>
<div class="ad-miss" data-guess="c">A backup made the night before the attack has no idea a copy left the building. It can restore the data; it cannot undo who already has a copy of it.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. Integrity and availability, never confidentiality</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A clean backup is a complete fix for a locked or corrupted share: the data comes back correct and reachable. It is no fix at all for a copy that already left the building, which is exactly why INC-1086 is not closed the moment the restore finishes. The backup answers "is the data back." It never answers "who else has it now."</p>
</div>
</div>
</div>
</div>

### Why It Matters

Tickets rarely say which property failed. They say a report is wrong, a share will not open or a client saw another client's statement. Naming the property is what turns a vague complaint into the right fix, and the wrong name sends the work to the wrong team.
