<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>The Quarterly Access Review</h3>
<p class="ad-brief__ask">Every quarter, PurveX Financial's auditors ask one question: does everyone have exactly the access their job needs, and can we prove who did what? Can you find what fails that test in your own directory and fix it before they arrive?</p>
<p>Compliance has sent IT the findings from this quarter's review. Each ticket is a real account or setting in your lab.</p>
<p>Auditors want evidence, not just a fix, so you'll pull some of it from the Windows Security log with <strong>Event Viewer</strong>. The event IDs you read there are the same ones a SOC analyst searches for in a SIEM every day.</p>
<p>This quarter's findings are already in your directory. Work them on your domain controller.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 6 solved</span>
</div>

<div class="ad-mission" data-id="w4-06" data-attempts="0">
<span class="ad-mission__num">Finding 01 · Authentication · Evidence · Event Viewer · INC-1093</span>
<h4>Has Someone Been Guessing?</h4>
<p><strong>Devon Brooks · Compliance · 8:45 AM</strong><br>Before we shut the shared reception login down, the auditors want to know one thing: has anyone been trying to guess its password? The Security log on the domain controller will say.</p>
<p><strong>Task:</strong> Find the failed sign-ins for <code>frontdesk.shared</code> in the Security log and report how many there are.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Has Someone Been Guessing?" placeholder="a number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{5}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Windows records a failed sign-in as Event ID 4625 and a successful one as 4624. Filter the log down to failures, then find the ones for this account.</p>
<ol>
<li>Open Event Viewer with Win+R and <code>eventvwr.msc</code>, then Windows Logs, Security.</li>
<li>Choose Filter Current Log, type <code>4625</code> in the event IDs box, and click OK.</li>
<li>Use Find to look for <code>frontdesk.shared</code>, or open each event and read Account Name under "Account For Which Logon Failed".</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>(Get-WinEvent -FilterHashtable @{ LogName = "Security"; Id = 4625 } | Where-Object { $_.Properties[5].Value -like "frontdesk.shared*" }).Count</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="4625|4624">That's the event ID. Count how many of those events name frontdesk.shared.</div>
<div class="ad-miss" data-guess="#">Filter the Security log to Event ID 4625 and count only the events whose account is frontdesk.shared.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{5}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Five failed sign-ins, each with a different wrong password, isn't a receptionist mistyping. It's someone guessing at an account whose password everyone can see anyway. The log turns "we think it's risky" into evidence the auditors can put in their report.</p>
</div>
<div>
<span>What to do</span>
<p>Export the five events and attach them to the finding, then disable the account in the next step. In a SOC you'd run the same 4625 search in the SIEM across every server at once.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="w4-01" data-attempts="0">
<span class="ad-mission__num">Finding 02 · Authentication · High · INC-1093</span>
<h4>Retire the Shared Login</h4>
<p><strong>Devon Brooks · Compliance · 9:00 AM</strong><br>The auditors found a login at reception that three people use, and the password is on a sticky note on the monitor. When something goes wrong at the front desk, we can't say which of them did it. Find the account and shut it down.</p>
<p><strong>Task:</strong> Find the account in the Operations users folder that more than one person signs in with, disable it, and report its username.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Retire the Shared Login" placeholder="a username" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{frontdesk.shared}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A shared account usually gives itself away in its name or its Description. Check the accounts in Departments, Operations, Users.</p>
<ol>
<li>In Active Directory Users and Computers, open Departments, Operations, Users.</li>
<li>Read the Description of each account until you find the shared one.</li>
<li>Right-click it and choose Disable Account.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-ADUser -SearchBase "OU=Users,OU=Operations,OU=Departments,$((Get-ADDomain).DistinguishedName)" -Filter * -Properties Description | Select-Object SamAccountName, Description</code></li>
<li><code>Disable-ADAccount frontdesk.shared</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="riley.kwan|taylor.osei">That's a named person's own account. Look for the one whose Description says it's shared.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{frontdesk.shared}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Authentication is meant to prove who someone is. A login three people share proves nothing about which of them acted, and a password on a sticky note means anyone walking past can sign in as all three of them.</p>
</div>
<div>
<span>What to do</span>
<p>Disable the shared account, give each receptionist their own login, and add them to the same group so they keep the access they need. Then every action at the front desk can be traced to one person.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="w4-02" data-attempts="0">
<span class="ad-mission__num">Finding 03 · Authentication · Executive Request · INC-1093</span>
<h4>The MFA Exemption Request</h4>
<p><strong>CFO · 9:45 AM</strong><br>The MFA prompts slow me down when I'm approving payments between meetings. Can IT turn MFA off for the executive team? We're careful with our passwords.<br><strong>A</strong> Agree. Executives are busy, and their passwords are long.<br><strong>B</strong> Keep MFA on, and offer a faster method, such as number matching on the phone app or a hardware key. Executives who approve payments are exactly who attackers phish.<br><strong>C</strong> Turn MFA off, but make executives change their password every month instead.</p>
<p><strong>Task:</strong> Choose how IT should answer and type its letter.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for The MFA Exemption Request" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A password is one factor, something you know. Ask what an attacker needs once they've phished it, and who an attacker most wants to phish at a financial firm.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">A long password still falls to a convincing phishing page. MFA is what stops a stolen password from being enough on its own.</div>
<div class="ad-miss" data-guess="c">Changing a password more often doesn't help once it's been phished, because the attacker uses it straight away. A second factor is what stops them.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{b}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The people who can approve payments are the first target of business email compromise. Exempting them from MFA would leave the firm's most valuable accounts protected by a password alone.</p>
</div>
<div>
<span>What to do</span>
<p>Say no to the exemption, and fix the real complaint instead by moving the executives to a quicker method. Phishing-resistant options such as passkeys or hardware keys are both faster and safer.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="w4-03" data-attempts="0">
<span class="ad-mission__num">Finding 04 · Authorization · High · INC-1071 · INC-1093</span>
<h4>Access That Outlived the Audit</h4>
<p><strong>Devon Brooks · Compliance · 10:30 AM</strong><br>Noor Ahmadi on the help desk can still open our case files. Noor was given access in March to export data for one audit, and nobody took it away. Please remove it today.</p>
<p><strong>Task:</strong> Open <code>noor.ahmadi</code>, find the group that gives Compliance access, remove Noor from it, and report the group's name.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Access That Outlived the Audit" placeholder="a group name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{Compliance Users}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Authorization comes from groups. Read Noor's Member Of tab and the account's Description, which says how the access started.</p>
<ol>
<li>Use Find to open <code>noor.ahmadi</code> and read the Description.</li>
<li>On the Member Of tab, select the Compliance group and click Remove.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-ADPrincipalGroupMembership noor.ahmadi | Select-Object Name</code></li>
<li><code>Remove-ADGroupMember -Identity "Compliance Users" -Members noor.ahmadi -Confirm:$false</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="domain-users|it-users">That group is part of Noor's normal job. Remove the one that gives Compliance access.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{Compliance Users}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Noor was authorized correctly in March, for one task. The task ended and the access didn't, so a help desk technician could still read Compliance's case files months later. Access that outlives its reason is the most common finding in any access review.</p>
</div>
<div>
<span>What to do</span>
<p>Remove the membership and note the date in the ticket. For future one-off access, set an end date when you grant it, or put a reminder in the ticket to take it back.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="w4-04" data-attempts="0">
<span class="ad-mission__num">Finding 05 · Authorization · Critical · INC-1093</span>
<h4>The Temporary Domain Admin</h4>
<p><strong>Alex Rivera · IT · 11:15 AM</strong><br>During the server migration, someone added a member of staff to Domain Admins "just for the weekend". The migration finished weeks ago. The auditors want to know who it is, and that it's been fixed.</p>
<p><strong>Task:</strong> Find the staff account in Domain Admins that shouldn't be there, remove it, and report its username.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for The Temporary Domain Admin" placeholder="a username" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{priya.nair}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Domain Admins should hold only the built-in Administrator and the few accounts whose job is running the domain. A help desk technician isn't one of them.</p>
<ol>
<li>In Active Directory Users and Computers, open the Users container and then Domain Admins.</li>
<li>On the Members tab, find the staff account and click Remove.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-ADGroupMember "Domain Admins" | Select-Object SamAccountName</code></li>
<li><code>Remove-ADGroupMember -Identity "Domain Admins" -Members priya.nair -Confirm:$false</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="administrator">The built-in Administrator belongs there. Look for a named member of staff.</div>
<div class="ad-miss" data-guess="alex.rivera">Alex is in IT Admins, not Domain Admins. Read the Domain Admins members list itself.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{priya.nair}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Domain Admins can do anything in the domain, including reading every mailbox and resetting every password. A help desk account with that power is a single phished password away from handing the whole firm to an attacker.</p>
</div>
<div>
<span>What to do</span>
<p>Remove the membership, confirm Priya still has the help desk access the job needs, and check the Security log for anything done with the extra rights in the meantime. Next time, grant admin rights through a separate admin account with an end date.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="w4-05" data-attempts="0">
<span class="ad-mission__num">Finding 06 · Broken Access Control · Client Portal · INC-1093</span>
<h4>Change One Number in the URL</h4>
<p><strong>Client complaint · 2:00 PM</strong><br>A client signed in to the PurveX client portal and viewed their statement at <code>/statements?client=1042</code>. Out of curiosity they changed it to <code>1043</code> and saw another client's statement. What failed, and what's the fix?<br><strong>A</strong> Authentication failed, so the fix is to add MFA to the portal.<br><strong>B</strong> Broken access control. The server must check, on every request, that the signed-in client owns the statement being asked for.<br><strong>C</strong> Encryption failed, so the fix is to turn on HTTPS.</p>
<p><strong>Task:</strong> Choose the failure and the fix and type its letter.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Change One Number in the URL" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The client really was who they said they were, and the connection was private. Ask what the server forgot to check after that.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">The client was correctly signed in as themselves. MFA proves identity, which wasn't the problem here.</div>
<div class="ad-miss" data-guess="c">HTTPS keeps the page private between the client and the server. The server itself handed over a statement it should have refused.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{b}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Authentication worked, but the server never checked authorization. Anyone signed in could read any client's statement just by counting. This is the top risk in OWASP's list, and at a financial firm it's a reportable breach of client data.</p>
</div>
<div>
<span>What to do</span>
<p>Report it to the portal's developers as a critical issue, with the two URLs as proof, and to Compliance as a possible breach. The fix belongs on the server: check ownership on every request, whatever the address asks for.</p>
</div>
</div>
</div>
</div>
