<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Name It, Then Fix What You Broke</h3>
<p class="ad-brief__ask">You've broken all three properties on purpose. Now can you read two new tickets and name which property failed in each, fix the one you can still undo, and explain what a backup can't bring back?</p>
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
<p>Ask yourself two questions. Is the number on screen correct? Yes. Is the portal up? Also yes. So nothing is wrong with the data itself. What's wrong is who got to see it.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="b">Look again at the balance. It's accurate for the client it really belongs to, so nothing was altered. It simply reached the wrong client.</div>
<div class="ad-miss" data-guess="c">The portal is up and serving data just fine. The failure is about who can see what, not whether the service responds.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>A. Confidentiality</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The data is correct, and the portal is available. The only thing that went wrong is that the data reached the wrong person, and that's a confidentiality failure.</p>
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
<p>Two separate things happened here. First, a copy of the files left the building. Then the files got locked. Take each one on its own and ask which property it breaks.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">Encryption is not the only thing that happened. A copy also left the building before the files were locked.</div>
<div class="ad-miss" data-guess="c">The share being encrypted is a real failure too, the same one you caused with <code>systemctl stop nginx</code> in the Availability challenge above, just harder to undo this time.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. Both availability and confidentiality failed</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The encryption is an availability failure, and you can usually recover from it with a clean backup. The stolen copy is different. It's a confidentiality failure, and no backup can undo it once the data is in an attacker's hands. That's exactly why modern ransomware gangs steal data before they encrypt anything: it gives them leverage even if you restore from backup.</p>
</div>
</div>
</div>
</div>

### Fix What You Broke

Naming a failure and fixing it are two different jobs, and now it's time for the second one. You still have a confidentiality failure sitting open on your own machine: <code>ledger.txt</code> is set to <code>chmod 600</code>, so jamie.torres can't read it.

If you jumped straight to this challenge without doing the Confidentiality one first, recreate that state with the commands below. Otherwise, skip ahead.

```bash
sudo mkdir -p /srv/cia
sudo chown student:student /srv/cia
printf 'Q3 advisory fees: 412500\n' > /srv/cia/ledger.txt
chmod 600 /srv/cia/ledger.txt
sudo useradd -m jamie.torres 2>/dev/null
```

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
<p>Think back to when you first created this file. You set it to <code>644</code> before you broke confidentiality on purpose. What would put it back?</p>
<ol>
<li><code>chmod 644 /srv/cia/ledger.txt</code> restores group and other read access.</li>
<li><code>sudo -u jamie.torres cat /srv/cia/ledger.txt</code> confirms the read works again, the same command that failed before.</li>
<li><code>ls -l /srv/cia/ledger.txt</code> prints the permission string to report.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="-rw-------">Close, but that's the broken state from <code>chmod 600</code>, the one you're fixing. List the file again after your fix and report what it shows then.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>-rw-r--r--</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Of everything you broke in this lab, confidentiality is the one you could put back exactly the way it was. A hash can prove that integrity broke, but it can't undo the change, and the minutes nginx was down are gone for good. A wrong permission, though, is just a wrong permission, and you fix it with the same tool that broke it. That's the whole reason access reviews exist: the fix is this cheap every time, as long as someone actually checks.</p>
</div>
</div>
</div>
</div>

### Take It Further

Let's go back to the ransomware incident. The company restores the encrypted share from a clean backup taken the night before the attack.

<div class="ad-mission ad-mission--capstone" data-id="w1e-c7" data-attempts="0">
<span class="ad-mission__num">Ticket 06 · INC-1162 · Medium</span>
<p><strong>SOC Lead · Post-Incident Review · 3:30 PM</strong><br>The restore finishes. Leadership asks whether this incident is now closed.</p>
<p><strong>Task:</strong> Which properties does that restore actually fix, and which one is it powerless against no matter how recent the backup is? Type its letter.<br><strong>A</strong> It fixes integrity only. Availability and confidentiality stay broken either way.<br><strong>B</strong> It fixes integrity and availability, since the files come back correct and reachable, but it cannot touch confidentiality: a copy already in the attacker's hands stays there.<br><strong>C</strong> It fixes all three, since the backup contains the original, unaltered data.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for which properties a clean backup restore fixes" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A backup is a copy of what the data should look like, so it can replace a file that's been locked or corrupted. What it can't do is reach into an attacker's machine and delete the copy they already took.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">The restore does more than fix integrity. The files are reachable again too, which is an availability fix, not just a correctness one.</div>
<div class="ad-miss" data-guess="c">A backup taken the night before the attack knows nothing about the copy that left the building. It can bring your data back, but it can't change who already has a copy.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. Integrity and availability, never confidentiality</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A clean backup completely fixes a locked or corrupted share, because the data comes back correct and reachable. But it does nothing at all about a copy that's already left the building, which is why INC-1086 isn't closed just because the restore finished. The backup answers the question "is our data back?" It can never answer "who else has it now?"</p>
</div>
</div>
</div>
</div>

### Why It Matters

Real tickets almost never tell you which property failed. They say a report looks wrong, a share won't open, or a client saw someone else's statement. Naming the property yourself is what turns a vague complaint into the right fix, and naming the wrong one sends the work to the wrong team.
