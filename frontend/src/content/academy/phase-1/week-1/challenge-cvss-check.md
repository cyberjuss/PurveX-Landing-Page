<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Check Yourself: What Actually Changed the Score</h3>
<p class="ad-brief__ask">You just produced three honest scores for one flaw. Can you say exactly which inputs moved the number, and which part never moves at all?</p>
<p>Hosted lab required. Builds on the Score the Same Flaw on Two Machines challenge above.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 4 solved</span>
</div>

### Check Yourself

Answer based on what the calculator actually showed you, rather than on what you remember reading.

<div class="ad-mission" data-id="w1m-c1" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1087 · Low</span>
<p><strong>Task:</strong> Did the Base Score change at any point during this lab? Type its letter.<br><strong>A</strong> Yes.<br><strong>B</strong> No.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for whether the base score changed" placeholder="A or B" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Think about what you typed each time. You used the same vector string for Finding A on every run, and the only settings you changed were in the Environmental group.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">The vector string for each finding never changed between runs. Only the Environmental Score group's inputs did.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. No</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The Base Score describes the flaw itself, and the flaw never changed. The Environmental Score is the one that moved, because the machine is the only thing that changed.</p>
</div>
</div>
</div>
</div>

### Compare the Two Machines

<div class="ad-mission" data-id="w1m-c2" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1088 · Low</span>
<p><strong>Task:</strong> For finding A, which Environmental Score was higher? Type its letter.<br><strong>A</strong> The practice server that holds nothing.<br><strong>B</strong> The domain controller that holds every account.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for which machine scored higher" placeholder="A or B" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Compare the Security Requirements you set on each run. One machine got Low, Low, Low, and the other got High, High, High.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">That machine's Security Requirements were set to Low across the board, which pulls the Environmental Score down, not up.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. The domain controller</code></p>
</div>
<div>
<span>Why it matters</span>
<p>It's the same flaw with the same Base Score, but the machine that holds every account scores higher, because the data at risk on it is worth far more.</p>
</div>
</div>
</div>
</div>

### Name the Model Behind the Inputs

<div class="ad-mission" data-id="w1m-c3" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1089 · Low</span>
<p><strong>Task:</strong> The three Security Requirements are named after which model from this week? Type its letter.<br><strong>A</strong> The CIA triad.<br><strong>B</strong> The AAA model.<br><strong>C</strong> The TCP handshake.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for which model the security requirements are named after" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{a}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Say the three names out loud: Confidentiality Requirement, Integrity Requirement, Availability Requirement. The first word of each one gives it away.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="b">AAA is Authentication, Authorization and Accounting, a different model from a later week. These three requirements spell out something else.</div>
<div class="ad-miss" data-guess="c">The TCP handshake has nothing to do with scoring a vulnerability's impact. Read the three requirement names again.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>A. The CIA triad</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Confidentiality, Integrity and Availability Requirement. So the CIA triad isn't a separate topic from scoring. It's one of the inputs that goes into the score.</p>
</div>
</div>
</div>
</div>

### Name What Captures the Machine's Value

<div class="ad-mission" data-id="w1m-c4" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1090 · Low</span>
<p><strong>Task:</strong> Which CVSS input captures that a machine holds nothing sensitive? Type its letter.<br><strong>A</strong> The Security Requirements (CR, IR, AR).<br><strong>B</strong> The Base Score.<br><strong>C</strong> The Attack Complexity.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for which input captures the machine's value" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{a}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The Base Score was identical on every machine you tested, so it can't be what made the practice server and the domain controller score differently. Look at what you changed instead.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="b">The Base Score never changed between the two machines you scored. It cannot be the input that told them apart.</div>
<div class="ad-miss" data-guess="c">Attack Complexity is part of the Base Score and stayed fixed too. It describes the flaw, not what the machine holds.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>A. The Security Requirements (CR, IR, AR)</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The three requirements are where you tell the calculator how much this machine's data is worth, and that's the whole reason two machines with the same flaw end up with different scores.</p>
</div>
</div>
</div>
</div>

### Why It Matters

Those were four quick checks, but they all had the same idea underneath: the flaw itself never changes, only what it would cost you does. In the next challenge, you'll make that argument to a manager who has only seen the word "Critical".
