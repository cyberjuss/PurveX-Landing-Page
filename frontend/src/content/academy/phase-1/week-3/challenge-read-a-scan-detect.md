<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Name What Detection Rests On, Then Take It Further</h3>
<p class="ad-brief__ask">If you can't ban the tool, what do you actually detect? And can you read someone else's capture the same way you just read your own?</p>
<p>Hosted lab required. Builds on the two scanning challenges above.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 2 solved</span>
</div>

### Name What Detection Rests On

<div class="ad-mission ad-mission--capstone" data-id="w3m-c4" data-attempts="0">
<span class="ad-mission__num">Ticket 07 · INC-1112 · Medium</span>
<p><strong>Detection Engineering · Design Question · 2:30 PM</strong><br>PurveX Financial's detection team wants to write a rule for scans like the one you ran in the challenges above, but the scan used a plain bash loop, not a hacking tool.</p>
<p><strong>Task:</strong> What does that mean for detection? Type its letter.<br><strong>A</strong> Scans cannot be detected.<br><strong>B</strong> You detect the pattern in the traffic, not a banned tool.<br><strong>C</strong> Only special attacker tools leave a trace.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what detection actually relies on" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Remember that the bash loop and Nmap produced exactly the same shape on the wire: one source hitting many ports in a burst. That shape is what a detection would have to look for.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">You've already seen the scan's shape clearly in Statistics → Conversations, with one source hitting many ports. That shape is detectable.</div>
<div class="ad-miss" data-guess="c">The plain bash loop you ran was not a special attacker tool at all, and it produced the same detectable pattern as Nmap did.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. You detect the pattern in the traffic, not a banned tool</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The very same loop can inventory a server or map it for an attack. Since you can't ban the tool, detection has to rest on the behavior instead: the burst of SYNs to many ports. Later this week, you'll turn that exact behavior into a rule that an intrusion detection system checks for automatically, so it no longer depends on a human happening to read the capture.</p>
</div>
</div>
</div>
</div>

### Take It Further

Now try reading someone else's capture. A week later, the security team pulls a capture from the file server. In it, one workstation sent SYN packets to forty ports in under ten seconds. Two of those ports completed a handshake, a handful answered with RST, and the rest got no reply at all.

<div class="ad-mission ad-mission--capstone" data-id="w3m-c7" data-attempts="0">
<span class="ad-mission__num">Ticket 08 · INC-1159 · Medium</span>
<p><strong>Detection Engineering · Capture Review · 2:45 PM</strong><br>The team asks what that workstation was doing, and what the two answered ports versus the silent majority actually tell them.</p>
<p><strong>Task:</strong> Say what that workstation was doing, and what the mix of answers reveals. Type its letter.<br><strong>A</strong> It was running a normal file transfer. The pattern is unremarkable.<br><strong>B</strong> It was scanning the file server. The two completed handshakes are services actually open there; the RSTs are ports actively refusing; the silent majority are behind a firewall the scan never got past.<br><strong>C</strong> The pattern is a hardware fault and says nothing about what the workstation was doing.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what the workstation was doing and what the mix of port answers reveals" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Forty ports from one source in under ten seconds is exactly the shape you saw in Statistics → Conversations. Once you've recognized that, read each of the three kinds of answer the same way you read your own capture.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">A normal file transfer is a few steady conversations, not one source touching forty different ports in ten seconds. That shape is a scan.</div>
<div class="ad-miss" data-guess="c">A hardware fault does not produce three distinct, consistent reply types across forty ports. Every one of those readings is a real answer from a real port.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. A scan, with each reply type meaning something different</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The shape alone, one source and forty ports in ten seconds, is already the scan signature you learned. But the shape only tells you that a scan happened. To learn what the scan found, you have to read each port's answer: two real open services, a few ports actively refusing, and a firewall standing silently in front of everything else. A detection rule can flag the shape automatically, but reading those answers is still an analyst's job.</p>
</div>
</div>
</div>
</div>

### Why It Matters

Reconnaissance, the scouting stage of an attack, is the quietest stage and also the best chance to stop one, because nothing has been broken yet. A team that can read a scan, and tell a closed port from one a firewall is guarding, hears the knock before the break-in. It also learns how well its own doors are holding.
