<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>The Second Beacon</h3>
<p class="ad-brief__ask">A different attacker, a different task, the same two moves. Can you find and close this one too?</p>
<p>Whoever opened the disguised attachment gave something a foothold on the domain controller. It did what a foothold like this always does next: plant a way to keep running, and open a channel back out. Different name, different address from the beacon you already closed earlier this phase, same two stages: Installation, then Command and Control.</p>
<p>Both steps check your Phase 1 lab, so keep it running. Each step takes a short answer, you get three tries per step, and the hint unlocks after two misses.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 2 solved</span>
</div>

<div class="ad-mission" data-id="pi-01" data-attempts="0">
<span class="ad-mission__num">Ticket 01 · INC-1075 · High</span>
<h4>Find What Got Planted</h4>
<p><strong>IT Lead · Follow-up · 9:30 AM</strong><br>Something is now set to run on the domain controller on its own, with nobody at the keyboard. Nobody on the team scheduled it.</p>
<p><strong>Task:</strong> Find the scheduled task nobody on the team created, and report its exact name.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Find What Got Planted" placeholder="task name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{officetelemetryagent}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A task built to blend in takes a name that sounds like routine Office activity. Read what it actually runs, not just its name.</p>
<ol>
<li>Open Task Scheduler with Win+R and <code>taskschd.msc</code>.</li>
<li>Open Task Scheduler Library and sort by Name.</li>
<li>Find the task nobody recognizes, then open its Actions tab to see what it runs.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-ScheduledTask | Where-Object TaskPath -eq "\" | Select-Object TaskName, State</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="windowsdiagnosticssync|systemindexmaintenance">That task belongs to a different, already-closed intrusion from earlier this phase. Find the one still open now.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{officetelemetryagent}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Installation is what turns a single opened attachment into standing access. A task that runs on a timer does not need the attachment reopened, and does not need the attacker present, to keep working.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="pi-02" data-attempts="0">
<span class="ad-mission__num">Ticket 02 · INC-1075 · High</span>
<h4>Close Its Channel</h4>
<p><strong>IT Lead · Follow-up · 9:40 AM</strong><br>The task is trying to reach something outside the firm. Whatever it is doing needs a way out, and that way out is a firewall rule.</p>
<p><strong>Task:</strong> Find the outbound firewall rule that lets this traffic leave the domain controller and disable it. Leave every other rule alone, then report the port it allowed.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Close Its Channel" placeholder="port number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{9443}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The task's Actions tab named the address it was reaching. Find the outbound rule that allows traffic to that same address.</p>
<ol>
<li>Open Windows Defender Firewall with Advanced Security with Win+R and <code>wf.msc</code>.</li>
<li>Select Outbound Rules and sort by Group to find the PurveX Lab rules.</li>
<li>Read each rule's Remote Address against what the task's Actions tab named, then disable the one that matches.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-NetFirewallRule -Group "PurveX Lab" -Direction Outbound | Where-Object DisplayName -like "*Telemetry*" | Disable-NetFirewallRule</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="4444|8080">That rule belongs to a different, already-closed beacon from earlier this phase. Find the one matching this task instead.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{9443}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Command and Control is the channel, not the task itself. Disabling the rule stops the beacon even while the task is still sitting there, the same move that closed the first intrusion's channel earlier this phase.</p>
</div>
</div>
</div>
</div>
