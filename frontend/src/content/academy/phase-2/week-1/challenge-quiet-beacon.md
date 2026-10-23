<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>The Quiet Beacon</h3>
<p class="ad-brief__ask">Can you find a persistence mechanism nothing reported on its own, then actually shut down what it was reaching?</p>
<p>Nothing alerted on this one. Every so often, something on the domain controller reaches out to an address that has no reason to be there. The work is finding what is doing it and closing the door it is using, on your own lab. Whoever got in through the sign-ins this week did not stop at logging in once. This is what they left behind: Installation, a way to keep acting without needing to sign in again, and Command and Control, the channel it uses to keep reaching out.</p>
<p>Both steps check your Phase 1 lab, so keep it running. Each step takes a short answer. You get three tries per step, a common wrong answer gets a short note on where to look, and the hint unlocks after two misses.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 2 solved</span>
</div>

<div class="ad-mission" data-id="mw-01" data-attempts="0">
<span class="ad-mission__num">Ticket 01 · INC-1064 · High</span>
<h4>Something Is Phoning Home</h4>
<p><strong>IT Lead · Routine check · 10:15 AM</strong><br>Nobody on the team scheduled anything new on the domain controller recently. Take a look at what is actually set to run there before you touch anything.</p>
<p><strong>Task:</strong> Find the scheduled task on the domain controller that nobody on the team created, and report its exact name.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Something Is Phoning Home" placeholder="task name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{windowsdiagnosticssync}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A task built to blend in usually takes a name that sounds like routine maintenance. Read what it actually runs, not just its name.</p>
<ol>
<li>Open Task Scheduler with Win+R and <code>taskschd.msc</code>.</li>
<li>Open Task Scheduler Library and sort by Name.</li>
<li>Look for a task nobody on the team recognizes, then open its Actions tab to see what it runs.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-ScheduledTask | Where-Object TaskPath -eq "\" | Select-Object TaskName, State</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="windows update|microsoft edge update">Built-in Windows and Edge update tasks already exist on this machine and are not the planted one. Look for a task whose name sounds routine but does not belong to any product actually installed here.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{windowsdiagnosticssync}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A scheduled task is one of the most common ways malware survives a reboot. This one runs on a timer with nobody at the keyboard, which is exactly the self-sustaining behavior that makes persistence dangerous: it does not need the attacker present to keep working.</p>
</div>
<div>
<span>What to do</span>
<p>Read what the task actually runs before you decide it is safe. Its Actions tab is what tells you where it is reaching, which is the next step.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="mw-02" data-attempts="0">
<span class="ad-mission__num">Ticket 02 · INC-1064 · High</span>
<h4>Close the Door It Is Using</h4>
<p><strong>IT Lead · Follow-up · 10:40 AM</strong><br>The task you found is trying to reach something outside the firm. Whatever it is doing, it still needs a way out, and that way out is a firewall rule.</p>
<p><strong>Task:</strong> Find the outbound firewall rule that lets this traffic leave the domain controller and disable it. Leave every other rule alone, then report the port it allowed.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Close the Door It Is Using" placeholder="port number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{4444}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The task's Actions tab named the address it was reaching. Find the outbound rule that allows traffic to that same address.</p>
<ol>
<li>Open Windows Defender Firewall with Advanced Security with Win+R and <code>wf.msc</code>.</li>
<li>Select Outbound Rules and sort by Name or Group to find the rule.</li>
<li>Read its Protocols and Ports and its Remote Address, then right-click the rule and choose Disable Rule.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-NetFirewallRule -Direction Outbound -Enabled True | Where-Object DisplayName -like "*Update*"</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="tcp|udp">That is the protocol. Report the remote port number from the rule's Protocols and Ports tab.</div>
<div class="ad-miss" data-guess="#">Read Remote port on the rule that matches the address the task was reaching, not the built-in rules.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{4444}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A task cannot reach outside the firm unless something lets it. Disabling the rule stops the beacon even if the task itself keeps trying to run, the same way isolating a host contains a worm before anyone has had time to fully investigate it.</p>
</div>
<div>
<span>What to do</span>
<p>Disable the rule now rather than waiting to remove the task. Preserve the task itself for whoever investigates how it got there. Closing this channel does not mean the week's work is over. Anyone who got this far into the domain controller had the chance to look for other ways back in before you found this one.</p>
</div>
</div>
</div>
</div>
