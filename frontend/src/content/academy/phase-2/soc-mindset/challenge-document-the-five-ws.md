<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Turn a Vague Alert Into a Documented Account</h3>
<p class="ad-brief__ask">A vague alert says a sign-in failed. Can you document it in a way Tier 2 can act on?</p>
<p>Hosted lab required, with the domain controller reachable.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 3 solved</span>
</div>

### Make a Real Event

Theo Walsh on Tier 2 only ever acts on what a handoff records, never on a vague "a sign-in failed." Create a real event to document it. Open PowerShell on the domain controller and run this, with your own account name in place of `your-account`.

```powershell
Add-Type -AssemblyName System.DirectoryServices.AccountManagement
$ctx = New-Object System.DirectoryServices.AccountManagement.PrincipalContext([System.DirectoryServices.AccountManagement.ContextType]::Domain)
$ctx.ValidateCredentials("your-account", "DefinitelyWrongPassword1")
```

This is a real sign-in attempt against the domain controller, using the same call Windows itself makes when you type a password. That means a wrong password here writes a real 4625 to the Security log, not a simulated one.

### Read What the Event Actually Answers

Now open Event Viewer and find the 4625 you just generated. You'll find that its fields answer the 5 W's for you: the Account Name answers who, and the time stamp answers when. Most usefully, the Status and Sub Status fields answer why, by naming the exact reason the sign-in failed.

<div class="ad-mission" data-id="sm2-01" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1128 · Low</span>
<p><strong>Task:</strong> Open the 4625 you just generated. What Sub Status code does it record for a wrong password on a real account?</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the sub status code" placeholder="Sub status code" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{0xc000006a}" data-accept="c000006a">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Open the 4625 event's General tab in Event Viewer and read the Sub Status field directly. It's printed in hex, so it starts with 0x.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="0xc0000064|c0000064">That's the code for a name that doesn't exist at all. Your account is real, and only the password was wrong.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>0xC000006A</code></p>
</div>
<div>
<span>Why it matters</span>
<p>That code means the account is real and the password was wrong. A sign-in attempt against an account that doesn't exist logs a different code, 0xC0000064. That difference is why the Sub Status tells you far more than the word "failed" alone.</p>
</div>
</div>
</div>
</div>

### Read Several Together

<div class="ad-mission" data-id="sm2-05" data-attempts="0">
<span class="ad-mission__num">Ticket 02 · INC-1129 · Medium</span>
<p><strong>SOC Queue · Overnight Review · 1:10 AM</strong><br>PurveX Financial's SOC sees five 4625 events in one minute, all logging 0xC0000064, aimed at five different account names.</p>
<p><strong>Task:</strong> You just learned a wrong password on a real account logs 0xC000006A, a different code. What does this combination most likely mean? Enter its letter.<br><strong>A</strong> One person repeatedly mistyping their own password.<br><strong>B</strong> Someone guessing at account names that do not exist, consistent with reconnaissance before a real attack begins.<br><strong>C</strong> A printer or scanner misconfigured with the wrong credentials.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what five failed sign-ins against five different account names most likely means" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Notice that the code here is 0xC0000064, not the 0xC000006A you just generated. That difference tells you the account names themselves are being tested, not just the passwords.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">One person mistyping their own password would log 0xC000006A against one account name, not 0xC0000064 against five different ones.</div>
<div class="ad-miss" data-guess="c">A misconfigured device typically hammers one account repeatedly, not five different account names in the same minute.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. Account-name guessing, consistent with reconnaissance</code></p>
</div>
<div>
<span>Why it matters</span>
<p>One wrong password on one real account is a typo. Five attempts against five different account names, all with the "account doesn't exist" code, is a different shape entirely: someone probing for names that work. The Sub Status told you why one event failed. Reading several together tells you whether you're looking at a mistake or the opening move of something bigger.</p>
</div>
</div>
</div>
</div>

### Name the Field

<div class="ad-mission ad-mission--capstone" data-id="sm2-02" data-attempts="0">
<span class="ad-mission__num">Ticket 03 · INC-1130 · Low</span>
<p><strong>Tier 2 Handoff · Documentation Review · 9:00 AM</strong><br>Theo Walsh, reviewing your write-up on Tier 2, asks you to name exactly which part of the 5 W's framework the Sub Status field covers.</p>
<p><strong>Task:</strong> The Sub Status field names the exact reason the sign-in failed. Which of the 5 W's does that field answer? Enter its letter.<br><strong>A</strong> Who<br><strong>B</strong> When<br><strong>C</strong> Why</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for which W the sub status field answers" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{c}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Account Name and the time stamp already cover two of the 5 W's. The Sub Status is the field that explains the failure itself.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">Account Name is the field that answers who. Sub Status answers a different question.</div>
<div class="ad-miss" data-guess="b">The time stamp answers when. Sub Status names the reason, not the time.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>C. Why</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Account Name is who, the time stamp is when, and Sub Status is why. If a write-up is missing even one of the 5 W's, the next analyst has to go and find it. That's the kind of handoff this framework exists to prevent.</p>
</div>
</div>
</div>
</div>

### Why It Matters

A vague alert and a documented account can describe the same failed sign-in. The difference is whether the next person to read it has to go and find the who, when, and why themselves, or whether you've already done it for them.
