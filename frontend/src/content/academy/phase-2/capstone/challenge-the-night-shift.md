<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>The Night the Queue Didn't Stop</h3>
<p class="ad-brief__ask">Can you work one overnight shift from the first alert to the full chain, using everything this phase taught?</p>
<p>Three things hit the queue overnight. On their own, each one is a routine call. Read together, with your own lab as the evidence, they are not three incidents. They are one, and the account that got in earlier this phase was never fully locked out. A new task and a new backdoor account, not the ones you already closed, say whoever was behind this came back and tried again.</p>
<p>Several steps check your Phase 1 lab, so keep it running. Each step takes a short answer, you get three tries per step, and the hint unlocks after two misses.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 8 solved</span>
</div>

<div class="ad-mission" data-id="cp-01" data-attempts="0">
<span class="ad-mission__num">Stage 1 · Triage · 1:10 AM</span>
<h4>Three Alerts, One Queue</h4>
<p><strong>SOC Queue · Overnight shift · 1:10 AM</strong><br>Three alerts land within the same ten minutes.<br><strong>A</strong> A routine password expiry notice.<br><strong>B</strong> An unfamiliar scheduled task observed on the domain controller.<br><strong>C</strong> A new member added to Server Admins with no change ticket on file.</p>
<p><strong>Task:</strong> Choose which one you work first, and type its letter.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Three Alerts, One Queue" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Rank by what each one would cost if it turns out to be real, not by which one sounds the most official.</p>
<p>A password expiry is routine by definition. An unexplained group change matters, but a running process already has the ability to act on its own, unattended, right now.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">A password expiry notice is the routine case by definition. It is not where an attacker's first move usually shows up.</div>
<div class="ad-miss" data-guess="c">Worth working, but it is a one-time change that already happened. B is already running and can keep acting while you decide.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{b}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A running task can act again on its own schedule. A group change already happened once and needs investigating, but it is not doing anything further while you decide. Work the one still in motion first.</p>
</div>
<div>
<span>What to do</span>
<p>Classify it, then start the investigation.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="cp-02" data-attempts="0">
<span class="ad-mission__num">Stage 1 · Triage · 1:12 AM</span>
<h4>Classify It</h4>
<p><strong>SOC Queue · Overnight shift · 1:12 AM</strong><br>An unfamiliar scheduled task is observed running on the domain controller. Nobody on the team recognizes it.<br><strong>A</strong> P1, Critical.<br><strong>B</strong> P2, High.<br><strong>C</strong> P3, Routine.</p>
<p><strong>Task:</strong> Classify the alert, and type its letter.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Classify It" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Nothing confirmed yet makes this an active breach, and nothing makes it routine either. An unexplained task with the ability to act on its own sits in the middle.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">Nothing here is a confirmed active breach yet. That is what the investigation is about to determine, not where classification starts.</div>
<div class="ad-miss" data-guess="c">An unexplained task that can act on its own is never routine. Routine is reserved for things with a known, benign explanation.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{b}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>High, not Critical, because nothing is confirmed as an active breach yet. High, not Routine, because an unexplained task that can act on its own is never routine. It gets worked after any open P1, ahead of everything else tonight.</p>
</div>
<div>
<span>What to do</span>
<p>Start the investigation.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="cp-03" data-attempts="0">
<span class="ad-mission__num">Stage 2 · Malware Response · 1:20 AM</span>
<h4>Find It</h4>
<p><strong>SOC Queue · Overnight shift · 1:20 AM</strong><br>Find the scheduled task on the domain controller that nobody on the team created.</p>
<p><strong>Task:</strong> Report its exact name.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Find It" placeholder="task name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{systemindexmaintenance}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A task built to blend in takes a name that sounds like routine maintenance. Read what it actually runs, not just its name.</p>
<ol>
<li>Open Task Scheduler with Win+R and <code>taskschd.msc</code>.</li>
<li>Open Task Scheduler Library and sort by Name.</li>
<li>Find the task nobody on the team recognizes, then open its Actions tab.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-ScheduledTask | Where-Object TaskPath -eq "\" | Select-Object TaskName, State</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="windowsdiagnosticssync">That was the same attacker's first attempt, and your team already closed it. Keep looking for the one still open tonight.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{systemindexmaintenance}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Naming it is Verify. You now have something concrete instead of a vague "something is running" report.</p>
</div>
<div>
<span>What to do</span>
<p>Find what it is trying to reach, which is the next step.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="cp-04" data-attempts="0">
<span class="ad-mission__num">Stage 2 · Malware Response · 1:25 AM</span>
<h4>Close the Door It Is Using</h4>
<p><strong>SOC Queue · Overnight shift · 1:25 AM</strong><br>The task is reaching out through an outbound firewall rule.</p>
<p><strong>Task:</strong> Find and disable that rule, then type the port it allowed.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Close the Door It Is Using" placeholder="port number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{8080}">Submit</button>
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
<li><code>Get-NetFirewallRule -Group "PurveX Lab" -Direction Outbound | Where-Object DisplayName -like "*Helper*" | Disable-NetFirewallRule</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="4444">That rule was the first beacon's channel, and your team already closed it. Find the rule matching tonight's task instead.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{8080}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Contain comes before cleanup. Disabling the rule stops the beacon even if the task itself is still sitting there waiting to be investigated further.</p>
</div>
<div>
<span>What to do</span>
<p>Check whether this is the whole story, or whether the attacker left something else behind.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="cp-05" data-attempts="0">
<span class="ad-mission__num">Stage 3 · Baseline Check · 1:40 AM</span>
<h4>The Same Night, a Different Account</h4>
<p><strong>SOC Queue · Overnight shift · 1:40 AM</strong><br>The third alert from the start of the shift is still open: a new member added to Server Admins with no change ticket on file. Worth a second look now that the task has been found on the same night.</p>
<p><strong>Task:</strong> Find the account added to Server Admins with no change ticket, and report its username.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for The Same Night, a Different Account" placeholder="first.last" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{ezra.lund}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Server Admins is empty by default. Whoever is in it now either belongs there on paper, or does not.</p>
<ol>
<li>Open Active Directory Users and Computers with Win+R and <code>dsa.msc</code>.</li>
<li>Find the Server Admins group and open its Members tab.</li>
<li>For each member, check their Description for a change ticket reference.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-ADGroupMember -Identity "Server Admins" | Get-ADUser -Properties Description | Select-Object SamAccountName, Description</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="theo.walsh">That account's membership was ordinary privilege creep, a different and already-closed finding. Find the account with no ticket or HR record at all behind tonight's grant.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{ezra.lund}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>An IT Support Specialist does not need domain-admin-adjacent access, and this account's own Description says no ticket or HR record explains the grant. The same night a persistence mechanism appeared, someone also gave themselves a way back in through a legitimate-looking account.</p>
</div>
<div>
<span>What to do</span>
<p>Remove the excess access, which is the next step.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="cp-06" data-attempts="0">
<span class="ad-mission__num">Stage 3 · Baseline Check · 1:45 AM</span>
<h4>Remove It</h4>
<p><strong>SOC Queue · Overnight shift · 1:45 AM</strong><br>Confirmed: ezra.lund's role does not need Server Admins.</p>
<p><strong>Task:</strong> Remove ezra.lund from Server Admins, then type the name of the group you removed them from.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Remove It" placeholder="group name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{server admins}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Removing from a group and disabling the account are not the same action. ezra.lund still needs IT Users.</p>
<ol>
<li>Open ezra.lund's Properties and go to the Member Of tab.</li>
<li>Select Server Admins and click Remove.</li>
<li>Confirm ezra.lund still shows IT Users afterward.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Remove-ADGroupMember -Identity "Server Admins" -Members "ezra.lund" -Confirm:$false</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="it users">That is the group to keep, not the one to remove. Remove the access-level group instead.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{server admins}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Two separate-looking alerts, worked back to back, turn out to be the same attacker's work: a persistence mechanism to keep acting, and a privileged account to keep a way back in once the task is found.</p>
</div>
<div>
<span>What to do</span>
<p>Put the two findings in order, which is the last step before escalation.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="cp-07" data-attempts="0">
<span class="ad-mission__num">Stage 4 · Kill Chain · 1:55 AM</span>
<h4>Put It in Order</h4>
<p><strong>SOC Queue · Overnight shift · 1:55 AM</strong><br>Three confirmed findings from tonight: the scheduled task, the firewall rule it used, and the excess Server Admins membership. Two of them are the same Cyber Kill Chain stage, Installation, two separate ways to keep access to the domain. The third is a different stage entirely.<br><strong>A</strong> The firewall rule is Command and Control, the channel back out. The task and the group membership are both Installation.<br><strong>B</strong> The scheduled task is Command and Control. The firewall rule and the group membership are both Installation.<br><strong>C</strong> The group membership is Command and Control. The task and the firewall rule are both Installation.</p>
<p><strong>Task:</strong> Choose which kill chain reading fits the evidence, and type its letter.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Put It in Order" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{a}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Match each finding to what it actually does, not to when it was found. Installation is a way to keep access. Command and Control is the channel a compromised system uses to reach back out to the attacker.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="b">The task itself does not reach out anywhere. It is what keeps running without a person present, which is Installation. The rule it relies on is the channel, which is Command and Control.</div>
<div class="ad-miss" data-guess="c">A group membership does not open a channel to anywhere. It is a second way to keep access, which is Installation, the same stage as the task.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{a}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The task and the backdoor group membership are both Installation: two separate ways to keep access to the domain, so losing one does not mean losing the foothold. The firewall rule is Command and Control: the channel the task actually used to reach out. Read as one chain instead of three unrelated tickets, the full picture is an attacker who got in, built two ways to stay in, and opened one channel to keep acting from outside. That channel is closed and both backdoors are gone, which is why this intrusion never reached the stage after this one: doing something with the access, rather than just keeping it.</p>
</div>
<div>
<span>What to do</span>
<p>Write up the full chain for handoff, which is the last step.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="cp-08" data-attempts="0">
<span class="ad-mission__num">Stage 5 · Escalation · 2:00 AM</span>
<h4>Hand It Up as One Incident</h4>
<p><strong>SOC Queue · Overnight shift · 2:00 AM</strong><br>Three alerts came in separately tonight. Read against the sign-ins and the beacon from earlier this phase, they are not even the start of something new.</p>
<p><strong>Task:</strong> Type the single word that best names what connects all three findings tonight: the scheduled task, the excess group membership, and the firewall rule.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Hand It Up as One Incident" placeholder="one word" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{intrusion}" data-accept="attacker|compromise">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Not three separate mistakes. One actor, moving through stages you already know by name.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="malware">Malware describes one finding, not what ties all three together. Name the thing all three are evidence of.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{intrusion}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A SOC that reads these as three unrelated tickets closes each one and never sees the chain. A SOC that reads them as one intrusion hands up a complete picture: the sign-ins that got someone in, the first beacon your team found and closed, and this second attempt to hold the same ground. Twice now, the chain got stopped at Installation and Command and Control, before it ever reached the stage where an attacker actually does something with the access. That is the whole job this phase has been building toward.</p>
</div>
<div>
<span>What to do</span>
<p>File the full write-up. The overnight shift is done.</p>
</div>
</div>
</div>
</div>
