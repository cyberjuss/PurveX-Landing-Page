<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Who's Knocking Before They Ever Get In?</h3>
<p class="ad-brief__ask">Before an attacker ever has a real password, what does them testing for one actually look like in your log?</p>
<p>This is a second intrusion, separate from the spray and the beacon from earlier this phase. A different attacker, a different way in, starting further back in the chain. Before anything else happened, something tried four names that do not belong to anyone at PurveX.</p>
<p>Read it in your own lab, the same way you read the sign-in log earlier this phase. The Security log tells the difference between a guess at a real account and a guess at one that was never real to begin with.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 1 solved</span>
</div>

<div class="ad-mission ad-mission--capstone" data-id="rc-01" data-attempts="0">
<span class="ad-mission__num">Ticket 01 · INC-1073 · Low</span>
<h4>Four Names That Were Never Real</h4>
<p><strong>IT Lead · Routine log review · 9:00 AM</strong><br>A handful of failed sign-ins showed up in the Security log recently. None of the account names match anyone who actually works here.</p>
<p><strong>Task:</strong> Find the failed sign-ins (event 4625) whose status code says the account itself does not exist, not that the password was wrong, and count the distinct fake usernames tried.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Four Names That Were Never Real" placeholder="a number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{4}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A wrong password and a nonexistent account fail for different reasons, and Windows records which one happened.</p>
<ol>
<li>Open Event Viewer, Windows Logs → Security, and filter for Event ID 4625.</li>
<li>Open a few and read the Status code in the Failure Information section.</li>
<li><code>0xC000006A</code> means the account exists and the password was wrong. <code>0xC0000064</code> means the account does not exist at all.</li>
<li>Count the distinct account names behind the <code>0xC0000064</code> rows.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-WinEvent -LogName Security -FilterHashtable @{Id=4625} -MaxEvents 50 | Format-List TimeCreated, Message</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="1|2|3">Keep reading. More than one made-up name was tried; this is a short list being worked through, not a single guess.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{4}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Nobody can guess a password for an account that does not exist. Testing names first is how an attacker finds out which accounts are even worth attacking, before spending any real effort guessing passwords against them. It leaves no victim account to flag, which is exactly why it is easy to miss.</p>
</div>
</div>
</div>
</div>
