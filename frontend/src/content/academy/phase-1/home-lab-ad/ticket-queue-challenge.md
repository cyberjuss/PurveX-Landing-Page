<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Ticket Queue</h3>
<p class="ad-brief__ask">When a request lands in your queue, can you check what is true in Active Directory and then make the change the ticket needs?</p>
<p>This is the PurveX Financial help desk queue. Requests come from staff, HR and auditors. Treat each one as a claim to verify, and check the account or folder it names before you make the change.</p>
<p>Each ticket asks for a short finding once the work is done, like a count or an account state. Your lab has to show the change before an answer is accepted, so the answer always reflects the directory after you act.</p>
<p>The Range download plants the ticket objects when it builds your lab. If you built the lab earlier, download the script from Build the Environment again and run it once.</p>
<p>Capital letters and punctuation such as spaces or dashes do not matter. You get three tries per ticket. The hint unlocks after two misses and the explanation unlocks once you solve the ticket or use all three tries.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 5 solved</span>
</div>

<div class="ad-mission" data-id="tq-01" data-attempts="0">
<span class="ad-mission__num">Ticket 01 · INC-1041 · Low</span>
<h4>Missing Announcements</h4>
<p><strong>Jamie Torres · Wealth Management · 9:12 AM</strong><br>I started last week and I still have not gotten a single company-wide email. Everyone else on my team has. Can you check my access?</p>
<p><strong>Your task:</strong> Find the group that sends firm-wide announcements and add Jamie if she is missing. Then report how many members the group has.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="a number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{9}">Submit</button>
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
<p><strong>Your task:</strong> Open Riley's account before you take the action she asked for. Restore sign-in if something is blocking her, then report what was wrong by typing <code>locked</code> or <code>disabled</code>.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="locked or disabled" autocomplete="off" autocapitalize="off" spellcheck="false">
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
<p><strong>IT Manager · Information Technology · 10:30 AM</strong><br>Casey Reed starts on the help desk today. Create the account as <code>casey.reed</code> and give Casey the same access as the rest of IT Users, nothing more. Clean up anything in that group that is not a current IT person.</p>
<p><strong>Your task:</strong> Create <code>casey.reed</code> with IT Users only and remove anyone from <code>IT Users</code> who is not a current IT person. Before you delete the leftover intern account, report the ticket number written in its Description.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="ticket number" autocomplete="off" autocapitalize="off" spellcheck="false">
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
<p><strong>Compliance Audit · Auditor request · 1:05 PM</strong><br><code>svc-backup-job</code> has no usable run window on its Description. Auditors want the approved hours written on the account. Those hours are not on this ticket, but they are already recorded on the folder that holds the account.</p>
<p><strong>Your task:</strong> Find the approved run window on the folder that holds <code>svc-backup-job</code> and write it on the account's Description. Then type the same window here in the format 00:00-00:00.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="00:00-00:00" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{01:00-03:00}" data-accept="1:00-3:00">Submit</button>
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

<div class="ad-mission ad-mission--capstone" data-id="tq-05" data-attempts="0">
<span class="ad-mission__num">Ticket 05 · INC-1045 · High</span>
<h4>The Transfer That Did Not Happen</h4>
<p><strong>Human Resources · Transfer notice · 11:20 AM</strong><br>Taylor Osei has transferred from Operations to Compliance, effective today. Move the account so Compliance policies apply, and put Taylor in the Compliance group instead of Operations.</p>
<p><strong>Your task:</strong> Move Taylor's account into the Compliance Users folder and swap the department groups. Then report the title still written on <code>taylor.osei</code>, because an HR notice does not update every field.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="title on the account" autocomplete="off" autocapitalize="off" spellcheck="false">
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
