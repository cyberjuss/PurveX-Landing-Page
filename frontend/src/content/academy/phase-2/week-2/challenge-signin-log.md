<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>The Spray, the Lockout, and the One That Got Through</h3>
<p class="ad-brief__ask">A real security log just recorded three different things happening to three different accounts. Can you tell which is which?</p>
<p>IT wants to know what actually happened on the domain controller recently. There is no summary and no canned report, only the Security log itself. Three patterns are in there: a password tried against a run of accounts, an account that locked for real, and a sign-in that succeeded with nothing suspicious in front of it.</p>
<p>Read it in your own lab, in Event Viewer or PowerShell, the same way an analyst opens a real log with no one telling them what they will find.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 3 solved</span>
</div>

<div class="ad-mission" data-id="sl-01" data-attempts="0">
<span class="ad-mission__num">Ticket 01 · INC-1072 · Medium</span>
<h4>Count the Spray</h4>
<p><strong>IT Lead · Log review · 10:00 AM</strong><br>A run of failed sign-ins shows up close together in the Security log, each one a different account. Before anyone calls it an attack, we need the actual count.</p>
<p><strong>Task:</strong> In the Security log, find the failed sign-ins (event 4625) that land within the same short burst and count the distinct accounts that failed.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Count the Spray" placeholder="a number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{6}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A spray and a brute force look similar until you check whether it is one account failing many times or many accounts failing once each.</p>
<ol>
<li>Open Event Viewer, Windows Logs → Security.</li>
<li>Right-click Security and choose Filter Current Log, then filter by Event ID 4625.</li>
<li>Sort by time and find the burst, every one landing within a few seconds of the last.</li>
<li>Open a few and read Account For Which Logon Failed on the General tab. Count the distinct names in the burst.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-WinEvent -LogName Security -FilterHashtable @{Id=4625} -MaxEvents 50 | Format-List TimeCreated, Message</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="1">That describes many attempts against one account, a brute force. Count the distinct accounts in the burst instead.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{6}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>One password tried once each against six different accounts is a spray, not a brute force. A brute force burns through many passwords on one account; a spray burns through one password on many accounts, betting that someone, somewhere, is using it.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="sl-02" data-attempts="0">
<span class="ad-mission__num">Ticket 02 · INC-1072 · Medium</span>
<h4>The One That Got Through</h4>
<p><strong>IT Lead · Log review · 10:05 AM</strong><br>Most of what is worth flagging in a log is a failure. This time, read past the failures.</p>
<p><strong>Task:</strong> Find the account in the Security log that signed in successfully (event 4624) with no failed attempt in front of it at all, and name it.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for The One That Got Through" placeholder="an account name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{svc-night-index}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Every other account in this log either failed outright or failed before it succeeded. One did neither.</p>
<ol>
<li>Filter the Security log for event 4624 (successful logon).</li>
<li>For each success, check whether a 4625 for the same account appears right before it. The accounts from the spray and the lockout both do.</li>
<li>One success has no failure anywhere near it. Read its Account Name.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="petra.lindqvist">That account's successes, if any, sit behind a string of failures and a lockout. Find the one with nothing in front of it.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{svc-night-index}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A clean, unexplained success is easy to skip past, because nothing about it looks like an attack. It still deserves a look: a service account signing in outside its normal job is worth confirming, even when the log itself shows nothing wrong.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="sl-03" data-attempts="0">
<span class="ad-mission__num">Ticket 03 · INC-1072 · Medium</span>
<h4>Unlock the Real Lockout</h4>
<p><strong>IT Lead · Log review · 10:10 AM</strong><br>One account's run of failures in the log ends differently from the others: an actual lockout, not just a string of failed attempts.</p>
<p><strong>Task:</strong> Find the account event 4740 (account lockout) names, confirm it is still locked, unlock it, then report its name.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Unlock the Real Lockout" placeholder="an account name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{petra.lindqvist}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Unlocking the account is part of the task, not optional reading.</p>
<ol>
<li>Filter the Security log for event 4740 and read the Account That Was Locked Out.</li>
<li>Open Active Directory Users and Computers and confirm the account shows as locked on its Account tab.</li>
<li>Tick "Unlock account" and apply, or run <code>Unlock-ADAccount -Identity &lt;account&gt;</code>.</li>
<li>Confirm the account no longer shows as locked.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="svc-night-index">That account signed in cleanly. Read event 4740 for the one it actually locked out.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{petra.lindqvist}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A string of failures ending in a real lockout is the clearest signal in the whole log: something kept trying this one account's password and did not stop. Unlocking it is the fix for right now; a reset and a look at where the attempts came from is the fix for not seeing it again.</p>
</div>
</div>
</div>
</div>
