<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Audit a Real Over-Broad Rule, Then Take It Further</h3>
<p class="ad-brief__ask">Can you spot a sudoers rule that hands away more than it should, then say whether naming one exact script actually closes the gap?</p>
<p>Hosted lab required. Builds on the Grant Exactly One Power challenge above.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 2 solved</span>
</div>

### Audit a Real Over-Broad Rule

<div class="ad-mission ad-mission--capstone" data-id="w4m-c5" data-attempts="0">
<span class="ad-mission__num">Ticket 05 · INC-1127 · High</span>
<p><strong>IT Audit · Privilege Review · 2:15 PM</strong><br>A PurveX Financial access review turns up a sudo rule for a backup account: it may run sudo for any command in <code>/usr/bin</code> with no password.</p>
<p><strong>Task:</strong> Does that follow least privilege, and what could the account do beyond backups? Type its letter.<br><strong>A</strong> Yes, it follows least privilege, since it is scoped to a specific folder.<br><strong>B</strong> No. Almost every common tool on Linux lives in <code>/usr/bin</code>, so this account can run essentially anything as root, far beyond whatever backup command it actually needs.<br><strong>C</strong> It cannot be judged without knowing who uses the account.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for whether the backup account's rule follows least privilege" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Think about the gap between the two systemctl rules in the challenge above. A folder of hundreds of commands is the same kind of gap, written differently.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">A folder is not a command. <code>/usr/bin</code> holds hundreds of real, unrelated tools, exactly the same mistake as granting bare <code>systemctl</code> with no service named.</div>
<div class="ad-miss" data-guess="c">The rule itself already grants far more than a backup job needs, regardless of who ends up using the account.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. No, essentially anything as root</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A folder path is not a command list. "Any command in a folder" is the same mistake as the unscoped systemctl rule from the challenge above, just spelled differently — and the fix is the same: name the exact command and nothing else.</p>
</div>
</div>
</div>
</div>

### Take It Further

The backup account's rule gets rewritten to name one exact script, `/usr/local/bin/run-backup.sh`, instead of the whole `/usr/bin` folder.

<div class="ad-mission ad-mission--capstone" data-id="w4m-c6" data-attempts="0">
<span class="ad-mission__num">Ticket 06 · INC-1160 · Medium</span>
<p><strong>IT Audit · Follow-up · 2:30 PM</strong><br>The auditor asks whether naming the one script closes the finding completely.</p>
<p><strong>Task:</strong> Say whether that alone is enough. Type its letter.<br><strong>A</strong> Yes, naming one exact script is the complete fix. Nothing else needs checking.<br><strong>B</strong> No. Naming one script closes the folder-wide hole, but if the backup account can edit that script, or the script itself does more than back up, the sudo rule now just hands root to whatever the script actually does.<br><strong>C</strong> No, naming one script makes no real difference versus naming the whole folder.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for whether naming one script alone is enough" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A sudo rule that names a script grants root to whatever runs when that script runs. That is only as narrow as the script's own contents and who can change them.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">Naming the exact path is real progress over the whole folder, but it only narrows the rule to one file. What that file actually does, and who can edit it, still matters.</div>
<div class="ad-miss" data-guess="c">Naming one script is a real improvement over a whole folder of hundreds of tools. It is just not automatically the entire fix.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. No, the script's own contents and editability still matter</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Naming one script is a real fix for the folder-wide gap. But a sudo rule that runs a script as root is only as safe as that script — if the account can edit <code>run-backup.sh</code>, or it takes an argument it was never meant to, root is still reachable. The audit doesn't end at the sudoers line.</p>
</div>
</div>
</div>
</div>

### Why It Matters

Most privilege problems are not clever attacks. They are an account that was given more than it needed, found by someone who should not have had it. An administrator who writes the narrowest rule that still does the job, and who can audit what an account may do, closes the hole before anyone goes looking for it.
