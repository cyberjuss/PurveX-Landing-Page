<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Lock Every Gate</h3>
<p class="ad-brief__ask">Can you find a rule that trusts a connection just for being inside the network, and close it?</p>
<p>Zero Trust means nothing stays open just because a connection comes from inside the firm instead of outside it. One inbound rule on the domain controller still runs on the old assumption. The work is finding it, reading what it actually trusts, and closing it on your own lab.</p>
<p>Both steps check your Phase 1 lab, so keep it running. Each step takes a short answer, you get three tries per step, and the hint unlocks after two misses.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 2 solved</span>
</div>

<div class="ad-mission" data-id="zt-01" data-attempts="0">
<span class="ad-mission__num">Ticket 01 · INC-1067 · High</span>
<h4>Find What It Actually Trusts</h4>
<p><strong>IT Lead · Zero Trust rollout review · 11:00 AM</strong><br>We moved the firm to Zero Trust months ago, but nobody has re-checked every rule that predates it. One inbound rule on the domain controller still looks like it trusts the whole network.</p>
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
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{445}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Port 445 is SMB, the protocol file shares run on. Allowing it from Any source inside the network means any compromised machine on that network can reach the domain controller's shares without any further check, exactly the free lateral movement Zero Trust exists to remove.</p>
</div>
<div>
<span>What to do</span>
<p>Close it now rather than filing it for later, which is the next step.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="zt-02" data-attempts="0">
<span class="ad-mission__num">Ticket 02 · INC-1067 · High</span>
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
<p>Being inside the network was never supposed to mean trusted. A rule that only checks where a connection comes from, never who it is, is the exact gap a perimeter model leaves and Zero Trust is built to close.</p>
</div>
<div>
<span>What to do</span>
<p>File it as closed. The rollout review for this rule is done.</p>
</div>
</div>
</div>
</div>
