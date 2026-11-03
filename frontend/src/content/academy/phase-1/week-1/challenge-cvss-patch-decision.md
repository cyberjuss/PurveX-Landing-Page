<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Justify the Fix, Then Take It Further</h3>
<p class="ad-brief__ask">A manager sees the word Critical on two tickets. Can you say which one actually needs fixing first, and why a hostname alone can't score a third machine?</p>
<p>Hosted lab required. Builds on the two CVSS challenges above.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 2 solved</span>
</div>

### Justify a Real Patching Decision

<div class="ad-mission ad-mission--capstone" data-id="w1m-c5" data-attempts="0">
<span class="ad-mission__num">Ticket 05 · INC-1091 · High</span>
<p><strong>Alex Rivera, IT Systems Administrator · Patch Prioritization · 4:00 PM</strong><br>A scanner reports the same Critical finding on two PurveX Financial machines. One is a test box rebuilt every night. The other, WM-STMT01, is the server that issues client statements for sam.whitfield's and jamie.torres's book of Wealth Management clients. The team can fix one today.</p>
<p><strong>Task:</strong> Which CVSS input justifies fixing WM-STMT01 first, to a manager who only saw the word Critical? Type its letter.<br><strong>A</strong> The Base Score, since it is higher on the more important machine.<br><strong>B</strong> The Security Requirements, since they are what actually differ between the two machines and what raises WM-STMT01's Environmental Score above the test box's.<br><strong>C</strong> Attack Complexity, since WM-STMT01 is harder to reach.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for which CVSS input justifies the patching decision" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The same finding carries the same Base Score on both machines. Name the input built specifically to say what each machine is actually worth.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">The Base Score is identical on both machines by definition, since it describes the flaw itself, not either server.</div>
<div class="ad-miss" data-guess="c">Attack Complexity is also part of the Base Score and does not vary by machine. It cannot be what separates these two tickets.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. The Security Requirements</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The Base Score is identical on both machines, so it cannot justify treating them differently. The Security Requirements are built specifically to say what each machine actually holds — exactly the argument a manager needs when the scanner says the same word on both tickets.</p>
</div>
</div>
</div>
</div>

### Take It Further

A third machine in the same building runs the identical flaw, but nobody has ever documented what it actually stores.

<div class="ad-mission ad-mission--capstone" data-id="w1m-c6" data-attempts="0">
<span class="ad-mission__num">Ticket 06 · INC-1155 · Medium</span>
<p><strong>Alex Rivera, IT Systems Administrator · Scoring Review · 4:20 PM</strong><br>Alex asks you to score the third machine's Environmental Score before the end of day.</p>
<p><strong>Task:</strong> What would you have to find out first, and why wouldn't guessing it from the hostname alone count as a real score? Type its letter.<br><strong>A</strong> Nothing. Any analyst can assign Security Requirements from the hostname alone.<br><strong>B</strong> What the machine actually stores and who can reach it, confirmed the same way you checked <code>/var/www/html</code> yourself. A hostname is a guess, not evidence.<br><strong>C</strong> The Base Score, since it already accounts for every machine's value.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what must be confirmed before scoring the third machine" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Earlier in this set, you ran <code>ls -la /var/www/html</code> instead of assuming what the practice server held. The same rule applies here.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">A hostname is not evidence of what a machine stores. You confirmed the practice server's contents with a command instead of assuming them, and this machine deserves the same check.</div>
<div class="ad-miss" data-guess="c">The Base Score is identical for this flaw on every machine. It has never been the input that tells two machines apart.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. Confirm what it actually stores and who can reach it</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A hostname like "WM-STMT01" is a strong hint, not evidence. The Security Requirements only mean something when they describe what a machine actually holds, confirmed the way you confirmed <code>/var/www/html</code> — not guessed from a name that could be wrong or out of date.</p>
</div>
</div>
</div>
</div>

### Why It Matters

Teams that patch in score order spend their week on whatever the vendor rated highest, while the quiet medium-severity flaw on the machine holding client data waits. Regulators do not ask what the scanner said. They ask what the firm knew about the data at risk, and the environmental score is where that reasoning gets written down.
