<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Confirm It With Nmap, Then Weigh a Stealthier Scan</h3>
<p class="ad-brief__ask">Can you confirm your own hand-read capture with the tool the job actually uses, and say why an attacker might choose a quieter version of the same scan?</p>
<p>Hosted lab required, with both machines reachable. Builds on the Scan It by Hand challenge above.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 2 solved</span>
</div>

### Confirm It With the Tool the Job Actually Uses

You've just read a scan by hand, one packet at a time. On the job, though, almost every posting for this role names one tool for this exact task: Nmap. The good news is that Nmap isn't doing anything your bash loop didn't already do. It reports the same three answers, just faster and laid out in its own column.

First, install it on the Ubuntu server.

```bash
sudo apt install -y nmap
```

Then scan the same ports with a connect scan, which uses the same handshake you read packet by packet in the last challenge.

```bash
nmap -sT -p 53,88,389,445,3389,23,8080,9999 dc01
```

For each port, Nmap prints one word: `open`, `closed`, or `filtered`. Those are exactly the three answers you already read from the raw packets, only this time they're labeled for you instead of worked out by hand.

<div class="ad-mission" data-id="w3m-c5" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1107 · Low</span>
<p><strong>Task:</strong> Run the Nmap scan above. What does it report for port 445?</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what Nmap reports on port 445" placeholder="open, closed, or filtered" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{open}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>You read this port's handshake by hand in your Wireshark capture a few steps ago, so Nmap should land on the same answer.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="closed|filtered">Check your capture again: port 445 completed the full three-way handshake, SYN, SYN-ACK, ACK.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>open</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The real scanner lands on the same answer as the raw packets did, because it's reading the very same handshake. Knowing the tool matters on the job, but being able to read the traffic underneath it is what tells you whether the tool is right.</p>
</div>
</div>
</div>
</div>

### Weigh a Stealthier Scan

<div class="ad-mission" data-id="w3m-c6" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1108 · Low</span>
<p><strong>Task:</strong> The scan you just ran (<code>-sT</code>) completes the full three-way handshake on every open port, same as your bash loop. A SYN scan (<code>-sS</code>) instead sends SYN, reads SYN-ACK, then sends RST instead of finishing with ACK. Why might an attacker prefer that? Type its letter.<br><strong>A</strong> It is faster, and it never fully opens a connection the target's own application might log.<br><strong>B</strong> It is slower but gives a more accurate result.<br><strong>C</strong> There is no real difference between the two on the wire.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for why an attacker might prefer a SYN scan" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{a}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Think about two layers that might be watching. Some logging only ever sees a connection once it fully completes, whereas the packet capture sees every packet regardless. Which one could a SYN scan avoid?</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="b">A SYN scan sends fewer packets per port, not more, so it is the faster option, not the slower one.</div>
<div class="ad-miss" data-guess="c">Finishing with ACK versus RST is a real, visible difference in the capture: one completes the connection, the other tears it down early.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>A. Faster, and it never fully opens a connection the target's own application might log</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Some application logging only records a connection once it's fully established, so a SYN scan can slip past that layer entirely. It can't slip past the packet capture, though, and that's exactly why a defender who reads the wire catches what an application log alone would miss.</p>
</div>
</div>
</div>
</div>

### Why It Matters

Nmap confirmed exactly what the raw packets had already shown you, and you've seen that a stealthier scan changes what gets logged, not what a capture sees. Next, you'll think about writing a rule that catches either kind of scan automatically.
