<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Score It the Way PurveX Actually Runs</h3>
<p class="ad-brief__ask">Two machines share the same vulnerability. Why is it an emergency on one of them and almost nothing on the other?</p>
<p>A scanner reports a vulnerability as Critical and every team in the building wants it fixed first. The score it printed was calculated by someone who has never seen PurveX Financial's network. Score three findings with the official CVSS calculator, first the way a vendor publishes them and then the way they apply to your own lab machine.</p>
<p>Your hosted lab needs to be running, with Firefox open on the Ubuntu desktop. Each step takes a short answer, and the hint unlocks after two misses.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 5 solved</span>
</div>

### Before You Start

Commit to an answer before you open anything. Nothing is marked yet. The calculator settles each one.

<div class="ad-check ad-check--predict" data-check="w1m-p1">
<p class="ad-check__q">A finding scores 9.8 out of 10. Does that mean it is dangerous on every machine that has it?</p>
<button type="button" class="ad-check__opt" data-i="0">Yes, a high score means high danger everywhere</button>
<button type="button" class="ad-check__opt" data-i="1">No, it depends on what the machine holds and who can reach it</button>
<p class="ad-check__note">Locked in. You score the same flaw on two different machines and compare.</p>
</div>

<div class="ad-check ad-check--predict" data-check="w1m-p2">
<p class="ad-check__q">Which matters more for how urgent a fix is?</p>
<button type="button" class="ad-check__opt" data-i="0">How bad the flaw is on its own</button>
<button type="button" class="ad-check__opt" data-i="1">What the machine holds and who can reach it</button>
<button type="button" class="ad-check__opt" data-i="2">They always matter equally</button>
<p class="ad-check__note">Locked in. The Environmental score is where this gets decided.</p>
</div>

<div class="ad-check ad-check--predict" data-check="w1m-p3">
<p class="ad-check__q">Can the same finding honestly carry two different scores at the same time?</p>
<button type="button" class="ad-check__opt" data-i="0">No, a finding has one true score</button>
<button type="button" class="ad-check__opt" data-i="1">Yes, the base and the environment give different numbers</button>
<p class="ad-check__note">Locked in. You will produce three scores for one flaw without inventing anything.</p>
</div>

### Open the Calculator

In Firefox on the Ubuntu desktop, open the calculator published by FIRST, the organization that maintains the standard.

```
https://www.first.org/cvss/calculator/3.1
```

The page has two groups that matter today. Base Score describes the flaw itself and is the same on every machine. Environmental Score describes the flaw on one specific machine, and it is the half almost nobody uses.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-1/PLACEHOLDER-cvss-calculator.png" alt="The FIRST CVSS version 3.1 calculator open in Firefox with the Base Score group visible" />
<figcaption>Screenshot 1. [ADD IMAGE] The official calculator, with Base and Environmental groups.</figcaption>
</figure>
</div>

### Score the Base

Enter each vector string below into the calculator and record the Base Score it returns. A vector string is shorthand for every answer the calculator asks for.

| Finding | Vector |
| ----- | ----- |
| A. Remote code execution, no login needed | `AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H` |
| B. A logged-in user can become root | `AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H` |
| C. Any local user can read a config file | `AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N` |

Write down the three Base Scores. Rank the findings by those numbers alone.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-1/PLACEHOLDER-cvss-base.png" alt="The calculator showing a Base Score for the first vector string" />
<figcaption>Screenshot 2. [ADD IMAGE] Finding A scored on the flaw alone.</figcaption>
</figure>
</div>

### Describe Your Actual Machine

Now answer two questions about the Ubuntu server in your pod, using what you already know about it.

First, what does it hold? It has a default web page and a practice account. It stores no client records and no money moves through it. In CVSS terms the Confidentiality Requirement, Integrity Requirement and Availability Requirement are all Low.

Those three requirements are the CIA triad, written as calculator inputs. The standard is asking how much each property is worth on this machine.

Second, who can reach it? Nothing on the internet can open a connection to your pod. Only the browser gateway and the other machine beside it can. That makes the Modified Attack Vector Adjacent rather than Network.

### Score the Environment

Scroll to the Environmental Score group. For finding A, set these and watch the number move.

1. Confidentiality Requirement: Low
2. Integrity Requirement: Low
3. Availability Requirement: Low
4. Modified Attack Vector: Adjacent

Record the Environmental Score beside the Base Score you wrote earlier. Repeat for findings B and C.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-1/PLACEHOLDER-cvss-environmental.png" alt="The calculator showing the Environmental Score group with the three security requirements set to Low" />
<figcaption>Screenshot 3. [ADD IMAGE] The same finding, scored for a machine that holds nothing.</figcaption>
</figure>
</div>

### Score It Again as Something That Matters

Keep finding A loaded. Now score it as though the machine were the domain controller beside it, which holds every account in the business.

1. Confidentiality Requirement: High
2. Integrity Requirement: High
3. Availability Requirement: High
4. Modified Attack Vector: Adjacent

Record this third number. You now have one flaw with three honest scores, and none of the numbers were invented.

### Check Yourself

<div class="ad-mission" data-id="w1m-c1" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1087 · Low</span>
<p><strong>Task:</strong> Did the Base Score change at any point during this lab? Type its letter.<br><strong>A</strong> Yes.<br><strong>B</strong> No.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for whether the base score changed" placeholder="A or B" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>You entered the same vector string for Finding A every time. Only the Environmental group's inputs changed between runs.</p>
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
<p>The Base Score describes the flaw itself, which never changed. Only the Environmental Score moved, because only the machine changed.</p>
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
<p>Compare the Security Requirements you set for each run: Low, Low, Low versus High, High, High.</p>
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
<p>Same flaw, same base, but the machine that holds the accounts scores higher because the data at risk is worth more.</p>
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
<p>Confidentiality Requirement, Integrity Requirement, Availability Requirement. The first word of each name is the giveaway.</p>
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
<p>Confidentiality, Integrity and Availability Requirement. The triad is an input to the score, not a separate topic.</p>
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
<p>The Base Score was identical across every machine you tested. Whatever made the practice server and the domain controller score differently lives somewhere else.</p>
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
<p>The three requirements are where you tell the score how much this machine's data is worth, which is the whole reason two machines differ.</p>
</div>
</div>
</div>
</div>

### Justify a Real Patching Decision

<div class="ad-mission ad-mission--capstone" data-id="w1m-c5" data-attempts="0">
<span class="ad-mission__num">Ticket 05 · INC-1091 · High</span>
<p><strong>IT Manager · Patch Prioritization · 4:00 PM</strong><br>A scanner reports the same Critical finding on two PurveX Financial machines. One is a test box rebuilt every night. The other is the server that issues client statements. The team can fix one today.</p>
<p><strong>Task:</strong> Which CVSS input justifies fixing the client-statement server first, to a manager who only saw the word Critical? Type its letter.<br><strong>A</strong> The Base Score, since it is higher on the more important machine.<br><strong>B</strong> The Security Requirements, since they are what actually differ between the two machines and what raises the client-statement server's Environmental Score above the test box's.<br><strong>C</strong> Attack Complexity, since the client-statement server is harder to reach.</p>
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
<p>The Base Score is identical on both machines, so it cannot justify treating them differently. The Security Requirements are the one input built specifically to say what each machine actually holds, which is exactly the argument a manager needs when the scanner's report says the same word on both tickets.</p>
</div>
</div>
</div>
</div>

### Take It Further

A third machine in the same building runs the identical flaw, but nobody has ever documented what it actually stores.

Say what you would have to find out before you could honestly score its Environmental Score at all, and why guessing it from the hostname alone would not be a real CVSS score.

### Why It Matters

Teams that patch in score order spend their week on whatever the vendor rated highest, while the quiet medium-severity flaw on the machine holding client data waits. Regulators do not ask what the scanner said. They ask what the firm knew about the data at risk, and the environmental score is where that reasoning gets written down.
