<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Score the Same Flaw on Two Machines</h3>
<p class="ad-brief__ask">Two machines share the same vulnerability. Why is it an emergency on one of them and almost nothing on the other?</p>
<p>Hosted lab required, with Firefox open on the Ubuntu desktop.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 1 solved</span>
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

Scoring the environment means knowing what the machine actually holds, not assuming it. Check, instead of taking it on faith.

```bash
ls -la /var/www/html
```

<div class="ad-mission" data-id="w1m-c0" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1154 · Low</span>
<p><strong>Task:</strong> Run the command above. What is the only file it lists in <code>/var/www/html</code>?</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the one file in var www html" placeholder="a file name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{index.html}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Nginx ships with exactly one default page. This is the same file you stopped and restarted nginx around in an earlier lab.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="checksums.txt|ledger.txt">Those sit in other folders from other labs. Read what is actually in <code>/var/www/html</code> on this machine.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>index.html</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Scoring "holds nothing sensitive" as Low is not a guess, and it is not supposed to be: you just confirmed it, the same way an analyst would before writing Low into a report a manager will act on. No client file, no database, no credentials file. One default page.</p>
</div>
</div>
</div>
</div>

Now answer two questions about the Ubuntu server in your pod, using what you just confirmed.

First, what does it hold? A default web page and a practice account, which you just checked yourself. It stores no client records and no money moves through it. In CVSS terms the Confidentiality Requirement, Integrity Requirement and Availability Requirement are all Low.

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

### Why It Matters

Same Base Score, three different Environmental Scores, depending entirely on what each machine holds. The next challenge in this set checks what you actually learned from the numbers.
