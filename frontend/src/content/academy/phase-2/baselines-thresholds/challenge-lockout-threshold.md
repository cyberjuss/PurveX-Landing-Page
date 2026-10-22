<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Set a Defensible Lockout Threshold</h3>
<p class="ad-brief__ask">Can you set a real threshold that balances catching an attacker against locking out your own users, on your own lab?</p>
<p>This week's detection-threshold lesson is not only about a SIEM query. Active Directory has its own version of the same trade-off: the lockout threshold on a password policy. Set it too low and ordinary typos lock people out all day. Set it too high and a password-guessing script gets dozens of free tries before anything stops it.</p>
<p>This step checks your Phase 1 lab, so keep it running. You get three tries, and the hint unlocks after two misses.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 1 solved</span>
</div>

<div class="ad-mission ad-mission--capstone" data-id="th-01" data-attempts="0">
<span class="ad-mission__num">Ticket 01 · INC-1068 · Routine</span>
<h4>Wealth Management Needs Its Own Threshold</h4>
<p><strong>Devon Brooks · Compliance · 2:15 PM</strong><br>The firm's default password policy treats every department the same. Wealth Management handles client funds directly, and the audit wants their accounts held to a stronger standard, without making a normal typo lock someone out of their own workday.</p>
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
