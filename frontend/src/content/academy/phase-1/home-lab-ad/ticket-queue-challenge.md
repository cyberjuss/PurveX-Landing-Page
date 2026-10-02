<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Ticket Queue</h3>
<p class="ad-brief__ask">When a request lands in your queue, can you check what is true in Active Directory and then make the change the ticket needs?</p>
<p>This is the PurveX Financial help desk queue. Requests come from staff, HR, auditors and vendors. Treat each one as a claim to verify and check what it names before you make the change. Later tickets take you beyond Active Directory into DNS, the firewall, Group Policy and the file shares on your domain controller.</p>
<p>Each ticket asks for a short finding once the work is done, like a count or an account state. Your lab has to show the change before an answer is accepted, so the answer always reflects the directory after you act.</p>
<p>The Range download plants the ticket objects when it builds your lab. If you built the lab earlier, download the script from Build the Environment again and run it once.</p>
<p>The Low, Medium, High and Critical label on each ticket is its business priority, not its difficulty. Capital letters and punctuation such as spaces or dashes do not matter. You get three tries per ticket. A common wrong answer gets a short note on where to look. The hint unlocks after two misses and the explanation unlocks once you solve the ticket or use all three tries.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 15 solved</span>
</div>

<div class="ad-queue-section">
<h3>Accounts and access</h3>
<p>These tickets happen in Active Directory Users and Computers, which opens with Win+R and <code>dsa.msc</code>. Most of them come down to reading an account's Account and Member Of tabs before you change anything.</p>
</div>

<div class="ad-mission" data-id="tq-01" data-attempts="0">
<span class="ad-mission__num">Ticket 01 · INC-1041 · Low</span>
<h4>Missing Announcements</h4>
<p><strong>Jamie Torres · Wealth Management · 9:12 AM</strong><br>I started last week and I still have not gotten a single company-wide email. Everyone else on my team has. Can you check my access?</p>
<p><strong>Task:</strong> Find the group that sends firm-wide announcements and add Jamie if she is missing. Then report how many members the group has.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Missing Announcements" placeholder="a number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{9}" data-lab-answer="members:All Employees">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Company-wide mail comes from a firm-wide group, not a department group. Look in AccessLevels and read each group's Description.</p>
<ol>
<li>Open Active Directory Users and Computers with Win+R and <code>dsa.msc</code>.</li>
<li>Expand AccessLevels and open the group whose Description mentions company-wide announcements.</li>
<li>On the Members tab, add <code>jamie.torres</code> if she is missing and click Apply.</li>
<li>Count the members and type the number here.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="jamie-torres|all-employees">Report how many members the group has as a number.</div>
<div class="ad-miss" data-guess="#">Count every entry on the Members tab of All Employees once Jamie is in it.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{9}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Jamie was missing from <code>All Employees</code>, so every company-wide notice skipped her. That includes the policy and security updates staff are expected to follow.</p>
</div>
<div>
<span>What to do</span>
<p>Add her to <code>All Employees</code> and confirm she appears on its member list. The next company-wide email will reach her.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="tq-02" data-attempts="0">
<span class="ad-mission__num">Ticket 02 · INC-1042 · Low</span>
<h4>Locked Out</h4>
<p><strong>Riley Kwan · Operations · 8:47 AM</strong><br>It will not let me sign in. I have typed my password wrong a few times, so I think I locked myself out. Can you unlock me?</p>
<p><strong>Task:</strong> Open Riley's account before you take the action she asked for. Restore sign-in if something is blocking her, then report what was wrong by typing <code>locked</code> or <code>disabled</code>.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Locked Out" placeholder="locked or disabled" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{disabled}" data-accept="account-is-disabled|account-disabled">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A caller describes a symptom, and the Account tab shows the cause. Locked out and disabled are separate settings with separate fixes.</p>
<ol>
<li>Open Active Directory Users and Computers with Win+R and <code>dsa.msc</code>.</li>
<li>Right-click the domain and use Find to search for <code>riley.kwan</code>.</li>
<li>Open the account and go to the Account tab. Check both Unlock account and Account is disabled.</li>
<li>Fix the setting that is blocking her, then submit the cause rather than the word she used.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-ADUser riley.kwan -Properties LockedOut, Enabled | Select-Object Name, LockedOut, Enabled</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="locked|locked-out|lockout|account-locked|account-locked-out|unlock|unlocked">Riley described a symptom. Open the Account tab and check both Unlock account and Account is disabled before you decide.</div>
<div class="ad-miss" data-guess="enabled|enable">That is the state after your fix. Report what was blocking Riley before you changed anything.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
        <p class="ad-flag__code"><code>GTF{disabled}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Riley believed she was locked out, but the account was disabled. An unlock would not have restored sign-in, and she would have stayed blocked while the ticket showed as closed.</p>
</div>
<div>
<span>What to do</span>
<p>Enable the account after you read the Account tab, and close the ticket on what you verified rather than on the word the caller used.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="tq-03" data-attempts="0">
<span class="ad-mission__num">Ticket 03 · INC-1043 · Medium</span>
<h4>New Hire Access</h4>
<p><strong>IT Manager · Information Technology · 10:30 AM</strong><br>Casey Reed starts on the help desk today and needs the same access as the rest of the IT team. I also suspect a few old accounts are still sitting in IT Users.</p>
<p><strong>Task:</strong> Create <code>casey.reed</code> with IT Users only and remove anyone from <code>IT Users</code> who is not a current IT person. Before you delete the leftover intern account, report the ticket number written in its Description.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for New Hire Access" placeholder="ticket number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{ctf-ticket-1043}" data-accept="1043|ctf-1043">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Create Casey in Departments → IT → Users and copy the groups of a current IT person. A leftover intern and a service account do not belong in a staff group.</p>
<ol>
<li>Open Active Directory Users and Computers with Win+R and <code>dsa.msc</code>.</li>
<li>Expand <code>Departments</code> → <code>IT</code> → <code>Users</code> and create <code>casey.reed</code> there.</li>
<li>Open the Members tab of <code>IT Users</code> and open each name that is not a current IT person.</li>
<li>Copy the ticket number from the intern's Description, then delete the intern and remove the service account from the group.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="inc-1043">That is the queue number on this ticket. Report the reference written in the intern account's Description.</div>
<div class="ad-miss" data-guess="old-intern|old-intern-account">That is the account. Open its General tab and report the ticket number in Description.</div>
<div class="ad-miss" data-guess="casey-reed">Casey is the new hire. Report the ticket number in the leftover intern account's Description.</div>
<div class="ad-miss" data-guess="1044|ctf-ticket-1044|svc-backup-job">That belongs to the backup service account. Open the leftover intern account and read its Description.</div>
<div class="ad-miss" data-guess="1041|1042|1045|1047|1050|1051|ctf-ticket-1041|ctf-ticket-1042|ctf-ticket-1045|ctf-ticket-1047|ctf-ticket-1050|ctf-ticket-1051">That reference belongs to another account. Open the leftover intern account in IT Users and read its Description.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
        <p class="ad-flag__code"><code>GTF{ctf-ticket-1043}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>IT Users held a leftover intern account and a backup service account. Adding Casey without cleaning that up would have left unused access in place, which is exactly what attackers look for.</p>
</div>
<div>
<span>What to do</span>
<p>Create Casey with IT Users only. Remove the service account from the staff group and delete the intern account, then confirm the member list shows only current IT staff and Casey.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="tq-04" data-attempts="0">
<span class="ad-mission__num">Ticket 04 · INC-1044 · Medium</span>
<h4>The Backup Account</h4>
<p><strong>Compliance Audit · Auditor request · 1:05 PM</strong><br>Our review of <code>svc-backup-job</code> found no approved run window on the account, so we cannot sign off on it. IT tells us the approved hours were recorded in the directory when the account was set up.</p>
<p><strong>Task:</strong> Find the approved run window on the folder that holds <code>svc-backup-job</code> and write it on the account's Description. Then type the same window here in the format 00:00-00:00.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for The Backup Account" placeholder="00:00-00:00" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{01:00-03:00}" data-accept="1:00-3:00|0100-0300|1am-3am|1:00am-3:00am">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The account's Description says the window is not set. The approved hours are on the OU directly above the account.</p>
<ol>
<li>Open Active Directory Users and Computers with Win+R and <code>dsa.msc</code>.</li>
<li>Use Find on the domain to locate <code>svc-backup-job</code> and note the folder that holds it.</li>
<li>Open that OU's Properties and read its Description.</li>
<li>Write the window into the account's Description on the General tab and click Apply. Then type the same window here.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="window-not-set">That is the account's current Description. The approved hours are on the folder that holds the account.</div>
<div class="ad-miss" data-guess="serviceaccounts">That is the folder. Type the approved window from its Description in the format 00:00-00:00.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
        <p class="ad-flag__code"><code>GTF{01:00-03:00}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Auditors cannot rely on hours that only live on a folder. With the window on the account, a sign-in at noon stands out as a problem instead of passing unnoticed.</p>
</div>
<div>
<span>What to do</span>
<p>Copy the approved window from the ServiceAccounts folder onto the account's Description and confirm it saved.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="tq-05" data-attempts="0">
<span class="ad-mission__num">Ticket 05 · INC-1045 · High</span>
<h4>The Transfer That Did Not Happen</h4>
<p><strong>Human Resources · Transfer notice · 11:20 AM</strong><br>Taylor Osei transferred from Operations to Compliance, effective today. Taylor reports to the Compliance manager now and starts on Compliance work this morning.</p>
<p><strong>Task:</strong> Move Taylor's account into the Compliance Users folder and swap the department groups. Then report the title still written on <code>taylor.osei</code>, because an HR notice does not update every field.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for The Transfer That Did Not Happen" placeholder="title on the account" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{operations-analyst}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Group Policy follows the folder, but groups do not move with the account. You have to change them yourself. Title is a separate field on the General tab.</p>
<ol>
<li>Open Active Directory Users and Computers with Win+R and <code>dsa.msc</code>.</li>
<li>Right-click <code>taylor.osei</code> and choose Move, then select Departments → Compliance → Users.</li>
<li>On the Member Of tab, add <code>Compliance Users</code> and remove <code>Operations Users</code>.</li>
<li>Open the General tab and type the Title you see, not the department HR named.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="compliance|compliance-analyst|compliance-officer|regulatory-analyst">That is where HR says Taylor works now. Type the Title field on taylor.osei exactly as it is written.</div>
<div class="ad-miss" data-guess="operations">That is a department. Type the full Title field from the General tab.</div>
<div class="ad-miss" data-guess="compliance-users|operations-users">That is a group. Report the Title field on the General tab.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
        <p class="ad-flag__code"><code>GTF{operations-analyst}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Taylor still sat in Operations with Operations access, so Compliance policies did not apply and the old access stayed open. An HR notice changes nothing in the directory until someone acts on it.</p>
</div>
<div>
<span>What to do</span>
<p>Move the account to Departments → Compliance → Users and swap <code>Operations Users</code> for <code>Compliance Users</code>. Confirm both before you close the ticket.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="tq-11" data-attempts="0">
<span class="ad-mission__num">Ticket 06 · INC-1047 · Medium</span>
<h4>Contractor Offboarding</h4>
<p><strong>Operations Manager · Operations · 4:40 PM</strong><br>Kai Mendes was a contractor helping the settlements team, and the engagement is now over. We will still need Kai's records for the final invoice review next month.</p>
<p><strong>Task:</strong> Disable <code>kai.mendes</code> and remove it from <code>Operations Users</code> without deleting the account. Then report the sponsor named in the account's Description.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Contractor Offboarding" placeholder="first and last name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{taylor-osei}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A leaver's account is disabled rather than deleted so its history stays available to auditors.</p>
<ol>
<li>Open Active Directory Users and Computers with Win+R and <code>dsa.msc</code>.</li>
<li>Right-click the domain and use Find to search for <code>kai.mendes</code>.</li>
<li>Open the account and read the sponsor in Description on the General tab.</li>
<li>Remove <code>Operations Users</code> on the Member Of tab. Then right-click the account and choose Disable Account.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Remove-ADGroupMember "Operations Users" -Members kai.mendes</code></li>
<li><code>Disable-ADAccount kai.mendes</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="kai-mendes">That is the contractor. The sponsor is the person named in Kai's Description on the General tab.</div>
<div class="ad-miss" data-guess="operations-manager">The manager raised the ticket. Report the sponsor named in Kai's Description by first and last name.</div>
<div class="ad-miss" data-guess="taylor|osei">Type the sponsor's first and last name.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{taylor-osei}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A contractor account that stays enabled after the work ends is an unwatched way in. If its password leaks, nobody notices the sign-in because nobody expects one.</p>
</div>
<div>
<span>What to do</span>
<p>Disable the account and remove its groups on the day the engagement ends. Keep the account itself so its history stays available for audits.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="tq-12" data-attempts="0">
<span class="ad-mission__num">Ticket 07 · INC-1048 · Medium</span>
<h4>Admin Rights Request</h4>
<p><strong>Sam Whitfield · Wealth Management · 9:58 AM</strong><br>I need a charting tool installed before a client meeting this afternoon and the IT queue is backed up. A colleague said that if I am in the Server Admins group I can install it myself. Can you add me?</p>
<p><strong>Task:</strong> Read the Description on <code>Server Admins</code> before you decide. Leave Sam's groups as they are and report the access level the group grants as a number.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Admin Rights Request" placeholder="a number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{2}" data-accept="level-2|level2">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A request names the access someone wants. The group's Description tells you what that access really covers.</p>
<ol>
<li>Open Active Directory Users and Computers with Win+R and <code>dsa.msc</code>.</li>
<li>Expand AccessLevels and open <code>Server Admins</code>.</li>
<li>Read Description on the General tab and compare it with what Sam needs.</li>
<li>Do not add Sam. Type the access level from the Description here.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="no|deny|denied">Leaving Sam's groups alone is right. Report the access level number from the Description on Server Admins.</div>
<div class="ad-miss" data-guess="server-admins">Report the access level as a number.</div>
<div class="ad-miss" data-guess="#">Open Server Admins in AccessLevels and read the level named at the start of its Description.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{2}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Server Admins controls the firm's servers. An advisor with that access could be tricked into running malware with server rights, and installing one app does not need it.</p>
</div>
<div>
<span>What to do</span>
<p>Deny the request and route the install to IT through a normal software ticket. Grant the access a job needs rather than the access a shortcut needs.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="tq-13" data-attempts="0">
<span class="ad-mission__num">Ticket 08 · INC-1049 · Medium</span>
<h4>Audit Finding</h4>
<p><strong>Internal Audit · Quarterly access review · 2:15 PM</strong><br>Our quarterly review found a staff account whose password never expires. Policy allows that setting only on service accounts.</p>
<p><strong>Task:</strong> Find the staff account with Password never expires set and clear the setting without disabling the account. Then report its username.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Audit Finding" placeholder="username" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{noah-kim}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A search for this setting also finds <code>svc-backup-job</code>, which is allowed to keep it. The account you want belongs to a person.</p>
<ol>
<li>Run the search below in PowerShell on the domain controller.</li>
<li>Skip the service account and note the person's username.</li>
<li>Open that account in Active Directory Users and Computers and clear Password never expires on the Account tab. Then click Apply.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Search-ADAccount -PasswordNeverExpires -UsersOnly | Select-Object Name, SamAccountName</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="svc-backup-job|service-backup">Service accounts may keep this setting. Find the account that belongs to a person.</div>
<div class="ad-miss" data-guess="administrator|guest|krbtgt">That is a built-in account rather than a staff member. Look for a person whose account sits in a department Users folder.</div>
<div class="ad-miss" data-guess="noah|kim">Type the full username as Active Directory shows it.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{noah-kim}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A person's password that never expires stays valid forever if it leaks. It also survives every forced reset the firm uses to lock attackers out.</p>
</div>
<div>
<span>What to do</span>
<p>Clear the setting on staff accounts and leave it only on documented service accounts. Recheck the list during each access review.</p>
</div>
</div>
</div>
</div>

<div class="ad-queue-section">
<h3>Computers and groups</h3>
<p>These tickets still use Active Directory Users and Computers, this time for computer objects and groups rather than people.</p>
</div>

<div class="ad-mission" data-id="tq-14" data-attempts="0">
<span class="ad-mission__num">Ticket 09 · INC-1050 · Low</span>
<h4>New Laptop Missing Policies</h4>
<p><strong>Jordan Ellis · Finance and Accounting · 8:20 AM</strong><br>My new laptop FIN-LT14 is joined to the domain, but I still do not have the Finance drive maps my old one had. Can you take a look?</p>
<p><strong>Task:</strong> Find where <code>FIN-LT14</code> sits in the directory and move it to Departments → FinanceAccounting → Workstations. Then report the name of the folder it was sitting in.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for New Laptop Missing Policies" placeholder="folder name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{computers}" data-accept="cn=computers">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A computer that joins the domain without a chosen OU lands in a default container, and no OU-linked Group Policy can reach it there.</p>
<ol>
<li>Open Active Directory Users and Computers with Win+R and <code>dsa.msc</code>.</li>
<li>Expand <code>purvexfinancial.local</code> and look inside the default folders until you find <code>FIN-LT14</code>.</li>
<li>Right-click the laptop and choose Move, then select Departments → FinanceAccounting → Workstations.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>(Get-ADComputer FIN-LT14).DistinguishedName</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="users|cn=users">The laptop is not in that folder. Expand each default folder under purvexfinancial.local until you see FIN-LT14.</div>
<div class="ad-miss" data-guess="financeaccounting|workstations|finance">That is where the laptop belongs now. Report the folder it was sitting in before you moved it.</div>
<div class="ad-miss" data-guess="domain-controllers">That folder holds only domain controllers. Expand the other default folders until you see FIN-LT14.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{computers}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Finance drive maps and security settings come from policy linked to the Finance OU. A laptop left in the default container misses them, including any screen-lock or hardening rules.</p>
</div>
<div>
<span>What to do</span>
<p>Move new computers into their department's Workstations OU as soon as they join. Admins can also point new joins at a better default OU with the <code>redircmp</code> command.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="tq-15" data-attempts="0">
<span class="ad-mission__num">Ticket 10 · INC-1051 · High</span>
<h4>Group Cannot Open the Share</h4>
<p><strong>Finance Manager · Finance and Accounting · 11:05 AM</strong><br>IT created a Finance Reports group last week so our team could read the reports share. Jordan and Devon are both in it, but neither of them can open the share.</p>
<p><strong>Task:</strong> Find why <code>Finance Reports</code> grants no access and fix the group without changing its members. Then report how many members it has.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Group Cannot Open the Share" placeholder="a number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{2}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Only one kind of group can grant permissions. Check the Group type on the General tab.</p>
<ol>
<li>Open Active Directory Users and Computers with Win+R and <code>dsa.msc</code>.</li>
<li>Expand AccessLevels and open <code>Finance Reports</code>.</li>
<li>On the General tab, change Group type from Distribution to Security and click Apply.</li>
<li>Count the entries on the Members tab.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Set-ADGroup "Finance Reports" -GroupCategory Security</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="security|distribution">That explains the fault. Report how many members the group has as a number.</div>
<div class="ad-miss" data-guess="#">Count the entries on the Members tab of Finance Reports. Changing the group type does not change who is in it.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{2}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A distribution group is for email and cannot grant access, so every permission set on it did nothing. People blocked from files they need start looking for workarounds that skip security.</p>
</div>
<div>
<span>What to do</span>
<p>Convert the group to a Security group and keep its members. Then confirm the share permission names the group.</p>
</div>
</div>
</div>
</div>

<div class="ad-queue-section">
<h3>Network</h3>
<p>DNS turns names into addresses. On the domain controller you can query it with <code>Resolve-DnsName</code> in PowerShell and edit its records in DNS Manager, which opens with Win+R and <code>dnsmgmt.msc</code>.</p>
</div>

<div class="ad-mission" data-id="tq-16" data-attempts="0">
<span class="ad-mission__num">Ticket 11 · INC-1052 · High</span>
<h4>Share Will Not Open by Name</h4>
<p><strong>Riley Kwan · Operations · 8:05 AM</strong><br>None of us can open the shared drive at \\files this morning. Typing the server's IP address works, but the name just times out.</p>
<p><strong>Task:</strong> Find what the name <code>files</code> resolves to and correct its DNS record so it points at the domain controller, which hosts the shares. Then report the wrong address the record held.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Share Will Not Open by Name" placeholder="IP address" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{192.0.2.50}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>When an IP address works but the name does not, the network is fine and name resolution is the problem.</p>
<ol>
<li>On the domain controller run <code>Resolve-DnsName files</code> and note the address it returns.</li>
<li>Run <code>ipconfig</code> to see the domain controller's own IPv4 address.</li>
<li>Open DNS Manager with Win+R and <code>dnsmgmt.msc</code>, then go to Forward Lookup Zones → <code>purvexfinancial.local</code>.</li>
<li>Open the <code>files</code> host record and change its address to the domain controller's address.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Test-NetConnection files -Port 445</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="@dcip">That is the domain controller's own address, which the record should hold after your fix. Report the wrong address it held before.</div>
<div class="ad-miss" data-guess="192.0.2.80">That address belongs to the payroll record. Report the address the files record held.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{192.0.2.50}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Every device that asked for <code>files</code> was sent to an address where no server exists. One wrong record took the shared drive away from the whole firm even though the server never went down.</p>
</div>
<div>
<span>What to do</span>
<p>Point the record back at the server that hosts the shares and confirm the name resolves. Then find out who changed the record and why.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="tq-20" data-attempts="0">
<span class="ad-mission__num">Ticket 12 · INC-1056 · High</span>
<h4>Payroll Works for Some People</h4>
<p><strong>Devon Brooks · Compliance · 1:20 PM</strong><br>The payroll portal at payroll.purvexfinancial.local opens fine for me, but Morgan sitting next to me gets a timeout. When Morgan refreshes a few times it sometimes loads. IT moved payroll to a new server last month.</p>
<p><strong>Task:</strong> Find why the name <code>payroll</code> resolves differently between attempts and remove the stale record, so the name points only at the domain controller. In this lab the domain controller stands in for the new payroll server. Report the stale record's address.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Payroll Works for Some People" placeholder="IP address" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{192.0.2.80}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A name with two A records is handed out in turn, which DNS calls round robin. If one address belongs to a server that no longer exists, every other lookup fails.</p>
<ol>
<li>On the domain controller run <code>Resolve-DnsName payroll</code> and look at how many addresses come back.</li>
<li>Run <code>ipconfig</code> to find the domain controller's own address, then test the other one with <code>Test-NetConnection</code>.</li>
<li>Open DNS Manager with Win+R and <code>dnsmgmt.msc</code>, go to Forward Lookup Zones → <code>purvexfinancial.local</code> and delete the stale <code>payroll</code> record.</li>
<li>Clients cache answers, so <code>ipconfig /flushdns</code> clears the old address from a machine that still has it.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-DnsServerResourceRecord -ZoneName purvexfinancial.local -Name payroll -RRType A</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="@dcip">That is the domain controller's address, which is the record to keep. Report the address of the record you removed.</div>
<div class="ad-miss" data-guess="192.0.2.50">That address belongs to the files record. Report the second address that payroll returned.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{192.0.2.80}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The old server's record survived the migration, so roughly every other lookup sent people to a machine that no longer exists. Intermittent failures like this burn hours because the fault never shows up when someone tests it once.</p>
</div>
<div>
<span>What to do</span>
<p>Delete the stale record and flush the cache on any client that still fails. Removing old records is part of every server migration, and DNS scavenging can catch the ones people forget.</p>
</div>
</div>
</div>
</div>

<div class="ad-queue-section">
<h3>Firewall, policy and files</h3>
<p>These tickets use three more tools on the domain controller. Windows Defender Firewall opens with <code>wf.msc</code>, Group Policy Management opens with <code>gpmc.msc</code> and File Explorer shows the shares under <code>C:\PurveX</code>.</p>
</div>

<div class="ad-mission" data-id="tq-17" data-attempts="0">
<span class="ad-mission__num">Ticket 13 · INC-1053 · High</span>
<h4>Vendor Remote Access Left Open</h4>
<p><strong>Vendor Management · Vendor offboarding · 9:30 AM</strong><br>Northwind Advisory finished its support engagement last week. While it ran, IT opened remote access on the domain controller so their engineer could connect from home. We are closing out the vendor file now.</p>
<p><strong>Task:</strong> Find the inbound firewall rule on the domain controller that was opened for the vendor and disable it. Leave the built-in Remote Desktop rules alone, then report the port the vendor rule allowed.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Vendor Remote Access Left Open" placeholder="port number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{3389}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Temporary rules usually carry a name or description that mentions the vendor. Check who the rule allows as well as which port it opens.</p>
<ol>
<li>Open Windows Defender Firewall with Advanced Security with Win+R and <code>wf.msc</code>.</li>
<li>Select Inbound Rules and sort by Name or Group to find the vendor rule.</li>
<li>Read its Protocols and Ports and its Scope tabs, then right-click the rule and choose Disable Rule.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-NetFirewallRule -Direction Inbound -Enabled True | Where-Object DisplayName -like "*Vendor*"</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="tcp|udp">That is the protocol. Report the port number from the rule's Protocols and Ports tab.</div>
<div class="ad-miss" data-guess="any">Any is the rule's scope and the reason it is dangerous. Report the local port number it allowed.</div>
<div class="ad-miss" data-guess="#">Read Local port on the vendor rule's Protocols and Ports tab. The built-in Remote Desktop rules are not the vendor rule.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{3389}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The rule let any address on the internet try Remote Desktop against the domain controller. Exposed RDP is one of the most common ways ransomware crews get in.</p>
</div>
<div>
<span>What to do</span>
<p>Disable the rule and keep it as a record of the change. Temporary access should come with an end date that someone checks.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="tq-18" data-attempts="0">
<span class="ad-mission__num">Ticket 14 · INC-1054 · Medium</span>
<h4>Screens That Never Lock</h4>
<p><strong>Internal Audit · Control test · 3:40 PM</strong><br>Finance workstations are supposed to lock after ten minutes, but every Finance screen we tested stayed open over lunch. Operations staff mentioned their screens lock sooner than they would like.</p>
<p><strong>Task:</strong> Find the screen lock GPO and link it to the Finance and Accounting OU, then remove its link from the wrong department. Report the name of the OU it was linked to.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Screens That Never Lock" placeholder="OU name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{operations}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A GPO only applies where it is linked. The Scope tab of a GPO lists every place it is linked.</p>
<ol>
<li>Open Group Policy Management with Win+R and <code>gpmc.msc</code>.</li>
<li>Expand Group Policy Objects, select the screen lock GPO and read its Scope tab.</li>
<li>Right-click the FinanceAccounting OU and choose Link an Existing GPO.</li>
<li>Under the wrong OU, right-click the GPO's link and choose Delete to remove only the link.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-GPInheritance -Target "OU=FinanceAccounting,OU=Departments,DC=purvexfinancial,DC=local"</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="financeaccounting|finance|finance-and-accounting">That is where the GPO belongs now. Report the OU the link was on before your fix.</div>
<div class="ad-miss" data-guess="departments">The link sat on a single department OU. Read the Links list on the GPO's Scope tab.</div>
<div class="ad-miss" data-guess="it|compliance|wealthmanagement">Read the Links list on the screen lock GPO's Scope tab and report the OU it shows.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{operations}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>An unlocked Finance screen lets anyone walking past reach payroll and client records. The control existed on paper but never applied to the people it was written for.</p>
</div>
<div>
<span>What to do</span>
<p>Link the GPO where the Finance accounts live and remove the stray link. Then test one Finance workstation before you tell Audit it is fixed.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="tq-19" data-attempts="0">
<span class="ad-mission__num">Ticket 15 · INC-1055 · Critical</span>
<h4>The Invoice Nobody Saved</h4>
<p><strong>Jordan Ellis · Finance and Accounting · 7:50 AM</strong><br>There is a new invoice on our Finance share that nobody remembers saving. I double-clicked it to check the amount and nothing happened.</p>
<p><strong>Task:</strong> Find the suspicious file in <code>C:\PurveX\Shares\Finance</code> on the domain controller and move it to <code>C:\PurveX\Quarantine</code> without opening it. Then report its full file name with every extension.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for The Invoice Nobody Saved" placeholder="full file name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{invoice_0923.pdf.exe}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Windows hides known file extensions by default, so a program can pass for a document. The Type column and the modified time are worth a look too.</p>
<ol>
<li>Open File Explorer and go to <code>C:\PurveX\Shares\Finance</code>.</li>
<li>On the View menu, turn on File name extensions and compare the files.</li>
<li>Cut the suspicious file and paste it into <code>C:\PurveX\Quarantine</code> without opening it.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-ChildItem C:\PurveX\Shares\Finance | Select-Object Name, Length, LastWriteTime</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="invoice_0923.pdf|invoice_0923|invoice-0923.pdf">Windows is hiding at least one extension. Turn on File name extensions on the View menu and type the whole name.</div>
<div class="ad-miss" data-guess="invoice_0923.exe">Type every extension in the name in the order it appears.</div>
<div class="ad-miss" data-guess="q3-budget-summary.csv|vendor-contacts.csv">That file is an expected Finance export. Compare the extensions and modified times of the other files.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{Invoice_0923.pdf.exe}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A program named to look like a PDF is a classic way malware gets opened. Jordan already double-clicked it, so the laptop Jordan used needs checking as well.</p>
</div>
<div>
<span>What to do</span>
<p>Quarantine the file without opening it and keep it as evidence. Then escalate with the file name, its timestamp and who opened it. Thank Jordan for reporting it quickly, because people who fear blame stop reporting.</p>
</div>
</div>
</div>
</div>