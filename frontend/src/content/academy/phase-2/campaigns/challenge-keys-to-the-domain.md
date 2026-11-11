<div class="ad-brief">
<p class="rd-kicker">Campaign 4 of 4</p>
<h3>The Keys to the Domain</h3>
<p class="ad-brief__ask">No guessed password, no attachment, no open door. Can you catch Kerberoasting and DCSync, AD used exactly as designed?</p>
<p>Most steps check your Phase 1 lab, so keep it running.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 9 solved</span>
</div>

<div class="ad-mission" data-id="rk-01" data-attempts="0">
<span class="ad-mission__num">Stage 1 · Exploitation · T1558.003 Kerberoasting · INC-1079 · High</span>
<h4>Read the Ticket Request</h4>
<p><strong>IT Lead · Routine log review · 9:00 AM</strong><br>The domain controller logs every service ticket request it receives, and one of them in the Security log is worth a second look.</p>
<p><strong>Task:</strong> Find the Kerberos service ticket request (event 4769) for <code>svc-reports</code>, and report the Ticket Encryption Type field exactly as it appears in the log.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Read the Ticket Request" placeholder="a hex value" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{0x17}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A healthy, modern service ticket uses AES, and this one doesn't.</p>
<ol>
<li>Open Event Viewer, Windows Logs → Security, and filter for Event ID 4769.</li>
<li>Find the request where the Service Name is <code>svc-reports</code>.</li>
<li>Read Ticket Encryption Type in the General tab. It is written as a hex code.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-WinEvent -LogName Security -FilterHashtable @{Id=4769} -MaxEvents 50 | Format-List TimeCreated, Message</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="0x12">That's AES256, the encryption a healthy modern ticket uses. This ticket uses something weaker, so read the value again.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{0x17}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>0x17 is RC4, a fast encryption type that can be broken. Attacker tools request RC4 on purpose, because an RC4 ticket can be cracked offline against the account's password hash, while an AES ticket resists that far better. CISA and its Five Eyes partners list Kerberoasting among the most common techniques they see turn a single foothold into full domain control.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="rk-02" data-attempts="0">
<span class="ad-mission__num">Stage 1 · Exploitation · T1558.003 Kerberoasting · INC-1079 · High</span>
<h4>Find the Account Behind It</h4>
<p><strong>IT Lead · Follow-up · 9:05 AM</strong><br>svc-reports has a Service Principal Name registered, and that's what allowed anyone to request a ticket for it in the first place.</p>
<p><strong>Task:</strong> Find the SPN registered on <code>svc-reports</code> and report it exactly as Active Directory stores it.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Find the Account Behind It" placeholder="an SPN" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{reports/svc-reports.purvexfinancial.local}" data-accept="reports/svc-reports.purvexfinancial.local">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>An SPN lets any domain user ask for a ticket to that service by name, without ever touching the account's password.</p>
<ol>
<li>Open Active Directory Users and Computers, find <code>svc-reports</code>, and open its Attribute Editor tab.</li>
<li>Read the <code>servicePrincipalName</code> attribute.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-ADUser svc-reports -Properties ServicePrincipalNames | Select-Object -ExpandProperty ServicePrincipalNames</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{REPORTS/svc-reports.purvexfinancial.local}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Any domain user, not just an admin, can ask for a ticket to any registered SPN. That's normal Kerberos behavior rather than a bug, which means the SPN itself isn't the weakness. The weakness is the account behind it.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="rk-04" data-attempts="0">
<span class="ad-mission__num">Stage 1 · Exploitation · T1558.003 Kerberoasting · INC-1079 · High</span>
<h4>Check What Let This Happen</h4>
<p><strong>IT Lead · Follow-up · 9:08 AM</strong><br>RC4 showed up in that ticket request for a reason. Every account has a setting that controls which encryption types it's allowed to use.</p>
<p><strong>Task:</strong> Read the <code>msDS-SupportedEncryptionTypes</code> attribute on <code>svc-reports</code> and report its raw value.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Check What Let This Happen" placeholder="a number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{4}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>This attribute is a bitmask. A value of 4 means only RC4-HMAC is allowed, while 24 would mean both AES128 and AES256 are.</p>
<ol>
<li>Open Active Directory Users and Computers, find <code>svc-reports</code>, and open its Attribute Editor tab.</li>
<li>Read <code>msDS-SupportedEncryptionTypes</code>.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-ADUser svc-reports -Properties msDS-SupportedEncryptionTypes | Select-Object msDS-SupportedEncryptionTypes</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{4}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Without AES enabled here, every ticket for this account has to come back as RC4, no matter who asks or what tool they use. So the weak encryption wasn't the attacker's choice. It was the account's own configuration, left over from before the domain required AES.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="rk-03" data-attempts="0">
<span class="ad-mission__num">Stage 1 · Exploitation · T1558.003 Kerberoasting · INC-1079 · High</span>
<h4>Close the Attack Surface</h4>
<p><strong>IT Lead · Follow-up · 9:10 AM</strong><br>Nobody can confirm that this SPN still points at a service that runs. In fact, the reporting job it was built for was retired months ago.</p>
<p><strong>Task:</strong> Remove the SPN from <code>svc-reports</code>, then report how many SPNs the account has left.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Close the Attack Surface" placeholder="a number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{0}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Without an SPN, nobody can ask for a service ticket to this account at all. That closes the Kerberoasting path completely, rather than just making it harder.</p>
<ol>
<li>Open PowerShell as administrator.</li>
<li>Run <code>setspn -D "REPORTS/svc-reports.purvexfinancial.local" svc-reports</code>.</li>
<li>Confirm with <code>Get-ADUser svc-reports -Properties ServicePrincipalNames</code>.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{0}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>If a service genuinely needs its SPN, the account stays Kerberoastable, so it also needs AES turned on and a long, random password. When nobody can explain an SPN and the job behind it no longer runs, the simplest fix is to remove it outright. Either way is better than leaving a crackable ticket sitting in the directory.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="rk-05" data-attempts="0">
<span class="ad-mission__num">Stage 2 · Actions on Objectives · T1003.006 DCSync · INC-1080 · High</span>
<h4>Turn On the Audit That Would Catch It</h4>
<p><strong>IT Lead · Hardening review · 2:00 PM</strong><br>DCSync lets an account with replication rights ask a domain controller for every password hash in the directory. It's the same request one real domain controller makes of another during normal replication. Right now, nothing is watching to see who asks.</p>
<p><strong>Task:</strong> Enable Directory Service Access auditing on the domain controller, then report the event ID a domain controller writes when that access happens.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Turn On the Audit That Would Catch It" placeholder="an event ID" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{4662}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>It's an advanced audit subcategory that's off by default, much like the process-creation auditing you fixed earlier this phase.</p>
<ol>
<li>Open Group Policy Management with Win+R and <code>gpmc.msc</code>, then edit <code>Default Domain Controllers Policy</code>.</li>
<li>Go to Computer Configuration, Policies, Windows Settings, Security Settings, Advanced Audit Policy Configuration, Audit Policies, DS Access.</li>
<li>Open <strong>Audit Directory Service Access</strong>, tick Configure, and tick Success.</li>
<li>Run <code>gpupdate /force</code>, then confirm with <code>auditpol /get /subcategory:"Directory Service Access"</code>.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="4769">That's the Kerberos ticket event from the earlier step. DCSync uses AD replication rather than a service ticket.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{4662}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>With this subcategory off, a real DCSync request leaves no record of its own. All you'd see is the normal, unremarkable replication traffic between domain controllers. Turning it on is what makes the next step possible.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="rk-06" data-attempts="0" data-hands-on="false">
<span class="ad-mission__num">Stage 2 · Actions on Objectives · T1003.006 DCSync · INC-1080 · High</span>
<h4>Know What You Are Looking For</h4>
<p><strong>IT Lead · Hardening review · 2:05 PM</strong><br>Auditing is on, so now you need the one detail that separates a real DCSync request from a domain controller's own replication traffic.<br><strong>A</strong> The account name, since only administrators ever appear in event 4662.<br><strong>B</strong> The access mask: Control Access (0x100), naming the replication-change rights in Properties, requested by an account that isn't a known domain controller.<br><strong>C</strong> The time of day, since replication only happens overnight.</p>
<p><strong>Task:</strong> Choose the detail that distinguishes the two, and type its letter.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Know What You Are Looking For" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Domain controllers replicate with each other constantly and legitimately, at any hour, under their own computer accounts. So the question isn't whether this access happened, but who asked for it.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">Any account can appear here, including a compromised ordinary user account that has been granted the right permissions. The name alone won't tell you that.</div>
<div class="ad-miss" data-guess="c">Real replication happens around the clock, not just overnight, so the time alone proves nothing.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{b}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Every real domain controller replicates under its own computer account, so that's the first thing a defender rules out. Control Access (0x100) alone isn't enough by itself, since ordinary, unrelated operations carry that same right too. The real signal is that access mask together with the Properties field naming the two replication rights, DS-Replication-Get-Changes and DS-Replication-Get-Changes-All. That combination has to come from something other than a domain controller's own computer account: a user account, a server or a workstation all count. Before you escalate, check for the common legitimate exceptions, such as Azure AD Connect.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="rk-07" data-attempts="0">
<span class="ad-mission__num">Stage 2 · Actions on Objectives · T1003.006 DCSync · INC-1080 · High</span>
<h4>Rule Out the Legitimate Case First</h4>
<p><strong>IT Lead · Hardening review · 2:10 PM</strong><br>Before this becomes an incident, rule out the one account in your lab that's actually supposed to carry this right.</p>
<p><strong>Task:</strong> Name the one account in your lab that legitimately has replication rights by default, in the form it would appear as the requester in event 4662.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Rule Out the Legitimate Case First" placeholder="an account name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{dc01$}" data-accept="dc01">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>By default, this right belongs to the domain controller's own computer account, not to a person's account.</p>
<ol>
<li>Every domain controller has a computer account in Active Directory, named after the machine with a trailing <code>$</code>.</li>
<li>In this lab, that machine is <code>dc01</code>.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="administrator">An administrator's user account doesn't carry replication rights by default. That right belongs to the domain controller's computer account.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{DC01$}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Your lab has only one domain controller, so it has no real replication partner. In your environment, then, event 4662 carrying this access from anything other than <code>DC01$</code> has no innocent explanation. On a real network with several DCs, you'd also check the requester against a known list of replication partners. This lab lets you skip straight to the finding.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="rk-08" data-attempts="0">
<span class="ad-mission__num">Stage 3 · Real Evidence · Low</span>
<h4>Read the Richer Log</h4>
<p><strong>IT Lead · Tooling note · 2:15 PM</strong><br>Sysmon is now running on the domain controller. It logs process creation in more detail than the plain Security log, including the parent process, the full command line and the binary's hash.</p>
<p><strong>Task:</strong> Find the Sysmon Process Creation event (event 1) for <code>klist.exe</code>, and report the name of its parent process.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Read the Richer Log" placeholder="a process name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{powershell.exe}" data-accept="powershell">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Where the plain Security log tells you a process ran, Sysmon also tells you what started it.</p>
<ol>
<li>Open Event Viewer and expand Applications and Services Logs → Microsoft → Windows → Sysmon → Operational.</li>
<li>Filter for Event ID 1 and find the one where Image ends in <code>klist.exe</code>.</li>
<li>Read ParentImage in the event's details.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-WinEvent -LogName "Microsoft-Windows-Sysmon/Operational" -FilterXPath "*[System[(EventID=1)]]" -MaxEvents 50 | Where-Object Message -match "klist.exe"</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{powershell.exe}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Process lineage is the thing the plain Security log can't give you. It tells you not only that a tool ran, but what launched it. A SOC with only 4624 and 4625 can prove that a sign-in happened, but a SOC with Sysmon can prove what that sign-in did once it was in.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="rk-09" data-attempts="0" data-hands-on="false">
<span class="ad-mission__num">Stage 4 · Write-Up · Medium</span>
<h4>Two Techniques and No Malware</h4>
<p><strong>SOC Lead · Final write-up · 2:30 PM</strong><br>You've worked four campaigns this phase. Three of them needed something delivered or guessed to get started, but this one needed neither.</p>
<p><strong>Task:</strong> Name the single word that best describes what Kerberoasting and DCSync both abuse to work at all.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Two Techniques and No Malware" placeholder="one word" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{trust}" data-accept="design|features|functionality">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Notice that neither technique exploits a bug. Both use Kerberos and Active Directory replication exactly as Microsoft built them to work.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{trust}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Any domain user can ask for a service ticket, and any domain controller can ask another for replication data. Both are trusted, intended behavior. That's why CISA's guide spends less time on exploits and more on the handful of signs that separate a feature's normal use from its abuse: an encryption type, an access mask, a requester that isn't a domain controller.</p>
</div>
</div>
</div>
</div>
