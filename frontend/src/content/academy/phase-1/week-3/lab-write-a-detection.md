<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>You already learned to recognize a scan by eye, reading packets after the fact. Can you write the rule that catches the same scan the moment it happens, with nobody watching?</p>
</div>

**Situation:** The last lab taught you what a scan looks like in a capture: one source touching many ports in a short burst. That is a pattern a human can spot after the fact. An IDS (Intrusion Detection System) is built to spot the same pattern live, the instant it happens, and raise an alert without anyone sitting in Wireshark watching for it.

**Task:** Write one Suricata rule that detects a burst of connection attempts from a single source, load it, then re-run the same Nmap scan from the last lab and read the alert it triggers.

**What you need:** Your hosted lab running, with the Ubuntu server reachable. Suricata is already installed.

### Write the Rule

Open the rules file on the Ubuntu server and add one line.

```bash
nano /etc/suricata/rules/local.rules
```

```
alert tcp any any -> any any (msg:"PurveX custom: possible port scan detected"; flags:S; threshold: type threshold, track by_src, count 5, seconds 10; sid:1000001; rev:1;)
```

Each part of that line is doing real work. `alert` is the action, and `tcp any any -> any any` means any TCP traffic in either direction. `flags:S` narrows it to SYN packets only, the opening move of a handshake, not an established conversation. `threshold: type threshold, track by_src, count 5, seconds 10` is the actual detection logic: fire once a single source sends 5 or more matching packets within any 10-second window. `sid:1000001` is the rule's own ID, required on every Suricata rule and unique within your ruleset.

### Run It and Trigger It

Start Suricata against just this rule.

```bash
sudo suricata -c /etc/suricata/suricata.yaml -S /etc/suricata/rules/local.rules -i ens5 -l /var/log/suricata/ -D
```

Now reproduce the scan from the last lab, either the bash loop or the Nmap command. Either one sends enough SYNs fast enough to cross your threshold.

```bash
nmap -sT -p 53,88,389,445,3389,23,8080,9999 dc01
```

Read the alert.

```bash
sudo cat /var/log/suricata/fast.log
```

<div class="ad-mission" data-id="wd1-01" data-attempts="0">
<p><strong>Task:</strong> Read the alert line in fast.log. What SID does Suricata report for the rule that fired?</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the SID the alert reports" placeholder="SID number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{1000001}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>1000001</code></p>
</div>
<div>
<span>Why it matters</span>
<p>That SID is how a real SOC traces an alert back to the exact rule that wrote it, out of possibly thousands running at once. The scan you read by hand last lab, this rule just caught on its own, live, with nobody watching the capture.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="wd1-02" data-attempts="0">
<p><strong>Task:</strong> Your rule reads <code>count 5, seconds 10</code>. Suppose an attacker sent exactly one SYN every 3 seconds instead, spacing 5 attempts across 20 seconds total. Would this exact rule still fire? Type its letter.<br><strong>A</strong> Yes, count 5 is all that matters, however long it takes to reach it.<br><strong>B</strong> No. All 5 have to land inside the same rolling 10-second window, and spacing them 3 seconds apart means at most 3 or 4 ever fall inside any single 10-second slice.<br><strong>C</strong> Yes, because threshold only counts total packets ever sent, with no time limit.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for whether the spaced-out scan would still trigger the rule" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. No, a rolling 10-second window never holds all 5</code></p>
</div>
<div>
<span>Why it matters</span>
<p>This is a real, well-known evasion: a slow scan paced just under a threshold's rate never trips it, even though it eventually touches every port the fast scan did. The rule is not wrong, it is just tuned for one speed, and nothing stops the same recon from happening slower.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="wd1-03" data-attempts="0">
<p><strong>Task:</strong> A tighter threshold catches a slower scan but risks firing on bursty normal traffic. A looser one stays quiet but lets a slow scan straight through. What does that actually tell you about tuning a detection? Type its letter.<br><strong>A</strong> A threshold is always a trade-off between catching more and firing on things that are not attacks.<br><strong>B</strong> A threshold should always be set as low as it will technically allow.<br><strong>C</strong> Thresholds are foolproof once written correctly, so tuning does not matter.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what tuning a threshold actually trades off" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{a}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>A. A threshold is always a trade-off between catching more and firing on things that are not attacks</code></p>
</div>
<div>
<span>Why it matters</span>
<p>There is no setting that catches every scan and never fires on anything ordinary. A real detection engineer picks a number knowing exactly what it lets through, and writes down why, instead of trusting the default to be right.</p>
</div>
</div>
</div>
</div>

### Why It Matters

Reading a capture by hand proves you understand the pattern. Writing the rule proves the environment catches it even when you are not watching, which is the entire difference between an analyst and a detection that works while everyone is asleep.
