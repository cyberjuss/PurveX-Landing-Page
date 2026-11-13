<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Set a Defensible Lockout Threshold</h3>
<p class="ad-brief__ask">Can you set a real threshold that balances catching an attacker against locking out your own users, on your own lab?</p>
<p>This step checks your Phase 1 lab, so keep it running.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 1 solved</span>
</div>

<div class="ad-mission ad-mission--capstone" data-id="th-01" data-attempts="0">
<span class="ad-mission__num">Ticket 01 · INC-1068 · Routine</span>
<h4>Wealth Management Needs Its Own Threshold</h4>
<p><strong>Devon Brooks · Compliance · 2:15 PM</strong><br>The firm's default password policy treats every department the same. Because Wealth Management handles client funds directly, the audit wants their accounts held to a stronger standard. At the same time, an ordinary typo should not lock someone out of their workday.</p>
<p><strong>Task:</strong> Apply a Fine-Grained Password Policy to Wealth Management Users requiring at least 12 characters and locking out after no more than 12 failed attempts. Then enter the lockout threshold you set.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Wealth Management Needs Its Own Threshold" placeholder="a number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{10}" data-accept="8|9|10|11|12">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>What you need is a Password Settings Object, a second, stricter policy layered on top of the domain's default. It applies only to the group you target and nowhere else.</p>
<ul>
<li>Open Active Directory Administrative Center with Win+R and <code>dsac.exe</code>.</li>
<li>Go to System, then Password Settings Container, then New, then Password Settings.</li>
<li>Give it a name and a precedence, set the minimum length to 12, and set the lockout threshold somewhere between 8 and 12.</li>
<li>Under Directly Applies To, add Wealth Management Users.</li>
<li>Confirm with <code>Get-ADFineGrainedPasswordPolicy -Filter *</code>.</li>
</ul>
<p>In PowerShell:</p>
<ul>
<li><code>New-ADFineGrainedPasswordPolicy -Name "WM-Stronger-Policy" -Precedence 10 -MinPasswordLength 12 -LockoutThreshold 10 -LockoutDuration "00:30:00" -LockoutObservationWindow "00:30:00" -ComplexityEnabled $true -ReversibleEncryptionEnabled $false</code></li>
<li><code>Add-ADFineGrainedPasswordPolicySubject -Identity "WM-Stronger-Policy" -Subjects "Wealth Management Users"</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="3|5|6|7">That's so tight that one clumsy afternoon of typing would lock real users out over ordinary mistakes. Loosen it toward the middle of the defensible band.</div>
<div class="ad-miss" data-guess="20|30|40|50">That would give a guessing script dozens of free attempts before anything stops it. Tighten it toward the middle of the defensible band.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{10}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The exact number matters less than landing in the band that balances the two costs. Set it too low and the help desk drowns in lockout tickets from real users. Set it too high and a password-guessing script gets dozens of tries before the account locks. It is the same trade-off you met in this module's threshold lesson, only measured in lockouts instead of alerts.</p>
</div>
<div>
<span>What to do</span>
<p>Before you close the ticket, confirm the policy applies, because a policy that targets the wrong group protects nobody.</p>
</div>
</div>
</div>
</div>
