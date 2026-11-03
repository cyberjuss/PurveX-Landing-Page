<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Decide Whether It's Worth Reporting, Then Take It Further</h3>
<p class="ad-brief__ask">Sixty failures, zero successes. Does that make an event less urgent, or more? Can you spot the attack a single-account threshold would miss entirely?</p>
<p>Hosted lab required. Builds on the Produce the Record, Then Read It challenge above.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 2 solved</span>
</div>

### Decide Whether a Quiet Attack Is Worth Reporting

<div class="ad-mission ad-mission--capstone" data-id="w4e-c5" data-attempts="0">
<span class="ad-mission__num">Ticket 05 · INC-1122 · High</span>
<p><strong>SOC Queue · Overnight Review · 3:05 AM</strong><br>You are handed a day of logs from one PurveX Financial server. For jordan.ellis's account in Finance and Accounting, you count sixty failed logins between 2am and 3am, all from the same address, and no success at all.</p>
<p><strong>Task:</strong> Does the absence of any success make this event more or less worth reporting? Type its letter.<br><strong>A</strong> Less. No success means nobody actually got in, so there is nothing to escalate.<br><strong>B</strong> Just as much, or more. Sixty attempts in one hour with zero successes is still an active attempt against a real account, and the only reason nothing is "wrong" yet is that the attacker has not won.<br><strong>C</strong> It cannot be judged without knowing the account's password.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for whether an all-failure burst is worth reporting" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Waiting for the success before escalating means you only ever catch an attack after it already worked. This is the same forty-failure shape from earlier, just bigger and still running.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">Waiting for a success before you escalate means the attack is only ever reported after it has already worked.</div>
<div class="ad-miss" data-guess="c">The password itself is not needed to judge this. The volume, the single address and the single account already tell the story.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. Just as much, or more</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Waiting for a successful login before you escalate means you only ever catch an attack after it has already worked. Sixty attempts in an hour against one account, from one address, with no success is the exact shape of a guessing attack still in progress, and it is far more useful to a team that can still stop it than the same pattern reported after the sixty-first attempt finally succeeds.</p>
</div>
</div>
</div>
</div>

### Take It Further

The same address that sent sixty failed logons against one account spends the next hour sending five failed logons each against twenty different accounts.

<div class="ad-mission ad-mission--capstone" data-id="w4e-c6" data-attempts="0">
<span class="ad-mission__num">Ticket 06 · INC-1161 · Medium</span>
<p><strong>SOC Queue · Pattern Review · 4:10 AM</strong><br>Your team's alert only fires on "many failures against one account." Nothing has fired yet this hour.</p>
<p><strong>Task:</strong> Say what changed about the attack's shape, and which pattern a single-account threshold would miss. Type its letter.<br><strong>A</strong> Nothing changed. A per-account failure threshold would still catch both patterns equally.<br><strong>B</strong> The attack shifted from guessing one account hard to spraying a few guesses across many accounts. A threshold tuned only to flag "many failures on one account" would miss the spray entirely, since no single account ever crosses it.<br><strong>C</strong> The attack shifted to guessing one account even harder, so the original threshold would catch it even faster than before.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what changed about the attack's shape and what a single-account threshold would miss" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Count the failures per account in the new pattern. Five is well under any threshold built to catch forty or sixty against one account.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">Five failures against any one account is far below a threshold tuned for forty or sixty. That account-by-account count never trips it.</div>
<div class="ad-miss" data-guess="c">The new pattern spreads out across twenty different accounts instead of hammering one. No single account comes anywhere near the original threshold.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. Spraying many accounts slips past a per-account threshold</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The first pattern, hammering one account, is exactly what a per-account threshold is built to catch. The second pattern, a few guesses against many accounts, is built to stay under that same threshold on purpose: five failures per account never crosses a limit tuned for forty or sixty. The total volume across the hour did not drop. The attacker just stopped giving any single account enough failures to trip the one rule watching for it.</p>
</div>
</div>
</div>
</div>

### Why It Matters

Authentication logs are the first evidence in most investigations, because they record who tried to get in and whether they made it. An analyst who can produce these events, find them and read the story in their order is doing the opening move of real incident work, before any tool more advanced than the system log.
