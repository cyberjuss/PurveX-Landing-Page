<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Catch the Scan With Nobody Watching</h3>
<p class="ad-brief__ask">You can already recognize a scan by eye. Can you write the rule that catches one live, with nobody watching?</p>
<p>Hosted lab required, with the Ubuntu server reachable. Suricata is installed.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 3 solved</span>
</div>

### Write the Rule

The last few challenges taught you what a scan looks like in a capture. An IDS (intrusion detection system) is built to spot that same pattern live, so nobody has to sit in Wireshark watching for it. To give it that job, open the rules file on the Ubuntu server and add one line.

```bash
nano /etc/suricata/rules/local.rules
```

```
alert tcp any any -> any any (msg:"PurveX custom: possible port scan detected"; flags:S; threshold: type threshold, track by_src, count 5, seconds 10; sid:1000001; rev:1;)
```

Every part of that line is doing real work, so let's read it from left to right. `alert` is the action, and `tcp any any -> any any` means any TCP traffic going in either direction. Next, `flags:S` narrows that down to SYN packets only, the opening move of a handshake rather than an established conversation. After that comes the actual detection logic, `threshold: type threshold, track by_src, count 5, seconds 10`, which says to fire once a single source sends 5 or more matching packets within any 10-second window. Finally, `sid:1000001` is the rule's own ID, which every Suricata rule needs and which has to be unique within your ruleset.

### Run It and Trigger It

With the rule written, start Suricata running against just this one rule.

```bash
sudo suricata -c /etc/suricata/suricata.yaml -S /etc/suricata/rules/local.rules -i ens5 -l /var/log/suricata/ -D
```

Now reproduce the scan from the earlier challenges, using either the bash loop or the Nmap command. Both send enough SYNs, quickly enough, to cross your threshold.

```bash
nmap -sT -p 53,88,389,445,3389,23,8080,9999 dc01
```

Then read the alert Suricata wrote.

```bash
sudo cat /var/log/suricata/fast.log
```

<div class="ad-mission" data-id="wd1-01" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1113 · Low</span>
<p><strong>Task:</strong> Read the alert line in fast.log. What SID does Suricata report for the rule that fired?</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the SID the alert reports" placeholder="SID number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{1000001}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The SID is the number you wrote into the rule file yourself, right after <code>sid:</code>.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="5|10">That number is the count or the time window from the rule's threshold clause, not its SID. Look for the number right after <code>sid:</code> instead.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>1000001</code></p>
</div>
<div>
<span>Why it matters</span>
<p>In a real SOC, that SID is how you trace an alert back to the exact rule that wrote it, out of what could be thousands running at once. And notice what just happened: the same scan you read by hand earlier, this rule caught on its own, live, with nobody watching the capture.</p>
</div>
</div>
</div>
</div>

### Test the Window

<div class="ad-mission" data-id="wd1-02" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1114 · Medium</span>
<p><strong>Task:</strong> Your rule reads <code>count 5, seconds 10</code>. Suppose an attacker sent exactly one SYN every 3 seconds instead, spacing 5 attempts across 20 seconds total. Would this exact rule still fire? Type its letter.<br><strong>A</strong> Yes, count 5 is all that matters, however long it takes to reach it.<br><strong>B</strong> No. All 5 have to land within the same 10-second span, and spacing them 3 seconds apart means the first and fifth are 12 seconds apart, too far to ever share one window.<br><strong>C</strong> Yes, because threshold only counts total packets ever sent, with no time limit.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for whether the spaced-out scan would still trigger the rule" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The "seconds 10" part limits count 5 to a 10-second span, rather than a running total since the scan began. Now work it out: five SYNs sent 3 seconds apart span 12 seconds from first to last, which is longer than the window the rule allows.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a|c">The <code>seconds 10</code> part of the rule is not decoration. It bounds count 5 to a 10-second span, and this pacing never puts all 5 inside one.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. No, a 10-second span never holds all 5</code></p>
</div>
<div>
<span>Why it matters</span>
<p>This is a real and well-known way to slip past detection. A slow scan, paced just under the threshold's rate, never trips the rule, even though it eventually touches every port the fast scan did. The rule isn't wrong. It's simply tuned for one speed, and nothing stops an attacker from doing the same scouting more slowly.</p>
</div>
</div>
</div>
</div>

### Name the Trade-Off

<div class="ad-mission ad-mission--capstone" data-id="wd1-03" data-attempts="0">
<span class="ad-mission__num">Ticket 03 · INC-1115 · High</span>
<p><strong>Detection Engineering Lead · Tuning Review · 4:00 PM</strong><br>PurveX Financial's detection lead is deciding how to tune the scan rule you just wrote. A more sensitive threshold catches a slower scan, but it risks firing on bursts of normal traffic. A less sensitive one stays quiet, but it lets a slow scan straight through.</p>
<p><strong>Task:</strong> What does that actually tell you about tuning a detection? Type its letter.<br><strong>A</strong> A threshold is always a trade-off between catching more and firing on things that are not attacks.<br><strong>B</strong> A threshold should always be set as low as it will technically allow.<br><strong>C</strong> Thresholds are foolproof once written correctly, so tuning does not matter.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what tuning a threshold actually trades off" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{a}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>You just proved that a slow scan can slip under this exact rule's threshold. A more sensitive setting would catch that scan, but what would it cost you?</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="b">Setting it as low as technically possible is exactly what risks firing on ordinary bursty traffic, the cost side of the same trade-off.</div>
<div class="ad-miss" data-guess="c">You just proved the opposite in the last step, when the slow scan slipped straight under this rule's threshold. That's why tuning matters.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>A. A threshold is always a trade-off between catching more and firing on things that are not attacks</code></p>
</div>
<div>
<span>Why it matters</span>
<p>No setting catches every scan while never firing on anything ordinary. So a real detection engineer picks a number knowing exactly what it lets through, and writes down why, rather than trusting the default to be right.</p>
</div>
</div>
</div>
</div>

### Why It Matters

Reading a capture by hand proves that you understand the pattern. Writing the rule goes a step further, because it proves the environment catches that pattern even when you're not watching. That's the whole difference between an analyst who spots something and a detection that keeps working while everyone is asleep.
