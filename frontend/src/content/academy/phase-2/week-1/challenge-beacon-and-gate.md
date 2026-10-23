<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>The Beacon and the Open Gate</h3>
<p class="ad-brief__ask">Can you find a persistence mechanism nothing reported on its own, shut down what it was reaching, and close a second door before anyone used it?</p>
<p>Whoever got in through the sign-ins this week did not stop at logging in once. Nothing alerted on what came next: every so often, something on the domain controller reaches out to an address that has no reason to be there. That is Installation, a way to keep acting without needing to sign in again, and Command and Control, the channel it uses to keep reaching out. The same review that caught it also turned up a second way onto the domain controller, a leftover inbound rule nobody had re-checked since the firm moved to Zero Trust.</p>
<p>All four steps check your Phase 1 lab, so keep it running. Each step takes a short answer, you get three tries per step, and the hint unlocks after two misses.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 4 solved</span>
</div>

<div class="ad-mission" data-id="mw-01" data-attempts="0">
<span class="ad-mission__num">Stage 1 · Installation · INC-1064 · High</span>
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

<div class="ad-mission" data-id="mw-02" data-attempts="0">
<span class="ad-mission__num">Stage 2 · Command and Control · INC-1064 · High</span>
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
<p>Disable the rule now rather than waiting to remove the task. Preserve the task itself for whoever investigates how it got there. Closing this channel does not mean the review is over. Anyone who got this far into the domain controller had the chance to look for other ways back in.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="zt-01" data-attempts="0">
<span class="ad-mission__num">Stage 3 · A Second Door · INC-1067 · High</span>
<h4>Find What It Actually Trusts</h4>
<p><strong>IT Lead · Zero Trust rollout review · 11:00 AM</strong><br>The same review turned up a second finding: one inbound rule on the domain controller still trusts a connection just for being inside the network, left over from before the firm moved to Zero Trust.</p>
<p><strong>Task:</strong> Find the inbound firewall rule on the domain controller left over from before Zero Trust, and report the port it allows.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Find What It Actually Trusts" placeholder="port number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{445}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A rule built for the old perimeter model trusts a connection for where it comes from, not for who it is. Read the Remote Address on each inbound rule, not just its name.</p>
<ol>
<li>Open Windows Defender Firewall with Advanced Security with Win+R and <code>wf.msc</code>.</li>
<li>Select Inbound Rules and sort by Group to find the PurveX Lab rules.</li>
<li>Read each rule's Protocols and Ports and its Scope. The one with Any as its remote address, on a department file-sharing port, is the one still running on the old assumption.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-NetFirewallRule -Group "PurveX Lab" -Direction Inbound | Get-NetFirewallPortFilter | Select-Object InstanceID, LocalPort</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="3389">That rule exists for a specific vendor visit and is already a separate, already-closed ticket. Keep looking for the one with no reason to be open at all.</div>
<div class="ad-miss" data-guess="4444">That rule belongs to the beacon you already closed. Find the inbound rule instead.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{445}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Port 445 is SMB, the protocol file shares run on. Allowing it from Any source inside the network means any compromised machine on that network can reach the domain controller's shares without any further check, exactly the free lateral movement Zero Trust exists to remove. This is not where the beacon went next; it is where it could have, a path found and closed before anyone used it.</p>
</div>
<div>
<span>What to do</span>
<p>Close it now rather than filing it for later, which is the next step.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="zt-02" data-attempts="0">
<span class="ad-mission__num">Stage 4 · A Second Door · INC-1067 · High</span>
<h4>Close It</h4>
<p><strong>IT Lead · Zero Trust rollout review · 11:05 AM</strong><br>Confirmed: nothing needs port 445 open to the whole network. Only the domain controller itself needs to serve its own shares.</p>
<p><strong>Task:</strong> Disable the rule, then type the port you closed.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Close It" placeholder="port number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{445}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Disabling is enough. There is no need to delete the rule or touch any other inbound rule.</p>
<ol>
<li>Open Windows Defender Firewall with Advanced Security with Win+R and <code>wf.msc</code>.</li>
<li>Right-click the rule you found and choose Disable Rule.</li>
<li>Confirm it shows as disabled in the rule list.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-NetFirewallRule -Group "PurveX Lab" -Direction Inbound | Where-Object DisplayName -like "*Internal*" | Disable-NetFirewallRule</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="3389">That is the vendor RDP rule from a different, already-closed ticket. Disable the one you found this time instead.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{445}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Being inside the network was never supposed to mean trusted. A rule that only checks where a connection comes from, never who it is, is the exact gap a perimeter model leaves and Zero Trust is built to close. Two findings this week, both closed before either one went any further.</p>
</div>
<div>
<span>What to do</span>
<p>File it as closed. The rollout review for this rule is done.</p>
</div>
</div>
</div>
</div>
