<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>What They Were Packing to Take</h3>
<p class="ad-brief__ask">The beacon is closed. Can you find out whether it already moved anything before you shut it down?</p>
<p>Closing the channel stops what happens next. It does not undo what already happened. With the task and its channel found, the question is what the attacker actually did with the access while it still worked: Actions on Objectives, the stage a kill chain exists to prevent anyone from reaching.</p>
<p>Both steps check your Phase 1 lab, so keep it running. Each step takes a short answer, you get three tries per step, and the hint unlocks after two misses.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 2 solved</span>
</div>

<div class="ad-mission" data-id="ao-01" data-attempts="0">
<span class="ad-mission__num">Ticket 01 · INC-1076 · High</span>
<h4>Find What Got Collected</h4>
<p><strong>IT Lead · Post-incident review · 10:00 AM</strong><br>A file is sitting on the IT share with no reason to be there. IT does not hold Wealth Management client data, and nobody on the team put it there.</p>
<p><strong>Task:</strong> Find the file in <code>C:\PurveX\Shares\IT</code> that has no business being there, and report its name.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Find What Got Collected" placeholder="a file name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{staged-export.zip}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Every other file on this share belongs to IT's own work. One does not fit the pattern at all.</p>
<ol>
<li>Open <code>C:\PurveX\Shares\IT</code> in File Explorer.</li>
<li>Read every file name. IT's own files are about mirrors, checksums and hashes from earlier work.</li>
<li>Find the one named like an archive, not like anything IT actually produces.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-ChildItem C:\PurveX\Shares\IT | Select-Object Name, LastWriteTime</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="checksums.txt|exported-hashes.txt|common-passwords.txt">That file belongs to IT's own earlier work on this share. Find the one that does not fit the pattern at all.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{staged-export.zip}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Collected data has to sit somewhere before it leaves the network, and that somewhere is rarely where it actually belongs. A file shaped like an archive on a share that has no reason to hold client data is exactly what staging looks like from the defender's side.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="ao-02" data-attempts="0">
<span class="ad-mission__num">Ticket 02 · INC-1076 · High</span>
<h4>Take It Off the Share</h4>
<p><strong>IT Lead · Post-incident review · 10:05 AM</strong><br>The channel is already closed, so nothing can pull this file out from here. It still needs to come off the share it was never supposed to be on.</p>
<p><strong>Task:</strong> Move the staged file from <code>C:\PurveX\Shares\IT</code> to <code>C:\PurveX\Quarantine</code>, then report the name of the folder it is in now.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Take It Off the Share" placeholder="a folder name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{quarantine}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Moving keeps the file as evidence. Deleting it would destroy what a review still needs.</p>
<ol>
<li>On the domain controller, open PowerShell and change to <code>C:\PurveX\Shares\IT</code>.</li>
<li>Move the file with <code>Move-Item staged-export.zip C:\PurveX\Quarantine</code>.</li>
<li>Confirm it is gone from the IT share and present in Quarantine.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="it">That is the share it should not have been on. Report where it is now, not where it was.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{Quarantine}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The channel was closed before this chain reached any further, which is why this file was found staged rather than confirmed gone. Two intrusions this phase, two chains broken before Actions on Objectives ever finished. That is not a coincidence; it is what the earlier stages are for.</p>
</div>
</div>
</div>
</div>
