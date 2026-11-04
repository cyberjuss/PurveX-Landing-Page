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

Make a prediction for each of these before you open anything. Nothing gets marked here, and the calculator will show you whether you were right.

<div class="ad-check ad-check--predict" data-check="w1m-p1">
<p class="ad-check__q">A finding scores 9.8 out of 10. Does that mean it is dangerous on every machine that has it?</p>
<button type="button" class="ad-check__opt" data-i="0">Yes, a high score means high danger everywhere</button>
<button type="button" class="ad-check__opt" data-i="1">No, it depends on what the machine holds and who can reach it</button>
<p class="ad-check__note">Got it. You'll score the same flaw on two different machines and compare the results.</p>
</div>

<div class="ad-check ad-check--predict" data-check="w1m-p2">
<p class="ad-check__q">Which matters more for how urgent a fix is?</p>
<button type="button" class="ad-check__opt" data-i="0">How bad the flaw is on its own</button>
<button type="button" class="ad-check__opt" data-i="1">What the machine holds and who can reach it</button>
<button type="button" class="ad-check__opt" data-i="2">They always matter equally</button>
<p class="ad-check__note">Got it. Keep an eye on the Environmental score, because that's where this gets decided.</p>
</div>

<div class="ad-check ad-check--predict" data-check="w1m-p3">
<p class="ad-check__q">Can the same finding honestly carry two different scores at the same time?</p>
<button type="button" class="ad-check__opt" data-i="0">No, a finding has one true score</button>
<button type="button" class="ad-check__opt" data-i="1">Yes, the base and the environment give different numbers</button>
<p class="ad-check__note">Got it. By the end, you'll have three honest scores for one flaw, and you won't have made any of them up.</p>
</div>

### Open the Calculator

Open Firefox on the Ubuntu desktop and go to the calculator published by FIRST, the organization that maintains the CVSS standard.

```
https://www.first.org/cvss/calculator/3.1
```

Two groups on this page matter today. The Base Score describes the flaw itself, so it's the same on every machine that has it. The Environmental Score describes the flaw on one particular machine. That second half is the one almost nobody fills in, and by the end of this challenge you'll see why that's a mistake.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-1/PLACEHOLDER-cvss-calculator.png" alt="The FIRST CVSS version 3.1 calculator open in Firefox with the Base Score group visible" />
<figcaption>Screenshot 1. [ADD IMAGE] The official calculator, with Base and Environmental groups.</figcaption>
</figure>
</div>

### Score the Base

Enter each vector string below into the calculator and write down the Base Score it gives you. A vector string is just a compact way of writing every answer the calculator asks for, so pasting one in fills in the whole form at once.

| Finding | Vector |
| ----- | ----- |
| A. Remote code execution, no login needed | `AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H` |
| B. A logged-in user can become root | `AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H` |
| C. Any local user can read a config file | `AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N` |

Once you have all three Base Scores, rank the findings using only those numbers. Hold on to that ranking, because it's about to change.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-1/PLACEHOLDER-cvss-base.png" alt="The calculator showing a Base Score for the first vector string" />
<figcaption>Screenshot 2. [ADD IMAGE] Finding A scored on the flaw alone.</figcaption>
</figure>
</div>

### Describe Your Actual Machine

To score the environment, you need to know what the machine actually holds rather than guessing. So before you touch the Environmental settings, check for yourself.

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
<p>Nginx comes with exactly one default page. It's the same file you saw in the Availability challenge, when you stopped and restarted nginx.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="checksums.txt|ledger.txt">Those files live in other folders, from earlier labs. Run the command again and read what's actually in <code>/var/www/html</code> on this machine.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>index.html</code></p>
</div>
<div>
<span>Why it matters</span>
<p>When you score this machine as "holds nothing sensitive", that's not a guess, because you just checked. That's exactly what an analyst does before writing "Low" into a report a manager is going to act on. There's no client file, no database and no credentials file here, just one default page.</p>
</div>
</div>
</div>
</div>

Now use what you just confirmed to answer two questions about the Ubuntu server in your lab.

First, what does it hold? As you just saw, it holds a default web page and a practice account. It doesn't store any client records, and no money moves through it. In CVSS terms, that means the Confidentiality Requirement, Integrity Requirement and Availability Requirement are all Low.

Notice that those three requirements are simply the CIA triad turned into calculator settings. The standard is asking you how much each property is worth on this particular machine.

Second, who can reach it? Nothing on the internet can open a connection to your lab. Only the browser gateway and the other machine next to it can, so the Modified Attack Vector is Adjacent rather than Network.

### Score the Environment

Scroll down to the Environmental Score group. For finding A, change these settings one at a time and watch the number move as you go.

1. Confidentiality Requirement: Low
2. Integrity Requirement: Low
3. Availability Requirement: Low
4. Modified Attack Vector: Adjacent

Write the Environmental Score next to the Base Score you recorded earlier, then do the same for findings B and C.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-1/PLACEHOLDER-cvss-environmental.png" alt="The calculator showing the Environmental Score group with the three security requirements set to Low" />
<figcaption>Screenshot 3. [ADD IMAGE] The same finding, scored for a machine that holds nothing.</figcaption>
</figure>
</div>

### Score It Again as Something That Matters

Keep finding A loaded. This time, score it as if the machine were the domain controller next to it, which holds every account in the business.

1. Confidentiality Requirement: High
2. Integrity Requirement: High
3. Availability Requirement: High
4. Modified Attack Vector: Adjacent

Write down this third number. You now have one flaw with three honest scores, and every one of them came from facts you checked rather than numbers you made up.

### Why It Matters

You started with one Base Score and ended up with three different Environmental Scores, and the only thing that changed was what each machine holds. That's the lesson to take away: severity on its own doesn't tell you urgency. The next challenge checks what you actually learned from those numbers.
