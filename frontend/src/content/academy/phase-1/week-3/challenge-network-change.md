<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>The Three-Minute Job</h3>
<p class="ad-brief__ask">Something on web01, the Ubuntu server, has been calling out to the domain controller every three minutes, day and night, and nobody on the current team remembers setting it up. Find out what it is, what it hands over, and shut it down the right way.</p>
<p>Hosted lab required, with both machines reachable.</p>
<ul>
<li>The job is already running in your lab. web01 ships with tcpdump, tshark, Wireshark and Nmap installed, so there is nothing to download.</li>
<li>Read a command before you run it as root. <code>sudo</code> does not ask twice.</li>
</ul>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 5 solved</span>
</div>

<div class="ad-mission" data-id="w3-01" data-attempts="0">
<span class="ad-mission__num">Ticket 01 · Warm-up · Tools · High · Cron · INC-1057</span>
<h4>What's Calling Out Every Three Minutes</h4>
<p><strong>Priya Shah · Operations · 7:40 AM</strong><br>Our monitoring flagged web01 making a short outbound connection to the domain controller every few minutes, all night. Nobody on the current team remembers setting that up. Before I escalate this as an incident, find out what it actually is.</p>
<p><strong>Task:</strong> Open a terminal on web01, confirm it can still reach the domain controller, then find the scheduled job behind the recurring connection. Report the name of the script it runs.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for What's Calling Out Every Three Minutes" placeholder="a script file name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{settlement-push.sh}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A job that runs itself on a schedule with nobody signed in is a cron job, and Ubuntu keeps the ones that are not a single user's own crontab in one folder.</p>
<ul>
<li>Confirm the path first: <code>ping -c 4 dc01</code>.</li>
<li>List what is scheduled: <code>ls /etc/cron.d</code>.</li>
<li>Read the one that does not look like it shipped with the OS: <code>cat /etc/cron.d/purvex-settlement</code>.</li>
<li>That line names how often the job runs and the full path to the script it calls. Report the script's file name, not the schedule.</li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="purvex-settlement">That is the cron job's own name. Read the line inside it for the script it actually runs.</div>
<div class="ad-miss" data-guess="3">That is how often it runs, in minutes. Report the name of the script, not the interval.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{settlement-push.sh}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A job nobody remembers setting up is exactly how old automation survives past the people who built it. It keeps running long after the reason for it is forgotten, and every run is another chance for whatever it carries to go wrong quietly.</p>
</div>
<div>
<span>What to do</span>
<p>Before touching anything, read what the job actually does. The next ticket finds out who it signs in as and how.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="w3-02" data-attempts="0">
<span class="ad-mission__num">Ticket 02 · Apply it · Common Ports · High · Nmap · INC-1057</span>
<h4>Scan the Door It Knocks On</h4>
<p><strong>Alex Rivera · IT · 8:15 AM</strong><br>Good, so it is a cron job talking to the directory. Before we look at what it sends, I want to know whether it even has a safe way to send it. Scan the domain controller from web01 and check.</p>
<p><strong>Task:</strong> From web01, scan dc01 with Nmap for the two directory ports, plain LDAP and encrypted LDAPS. Report the one that is open.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Scan the Door It Knocks On" placeholder="a port number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{389}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>LDAP and its encrypted twin run on two different, well-known ports. A connect scan tells you which one actually answers.</p>
<ul>
<li>Run <code>nmap -sT -sV dc01</code> from a terminal on web01.</li>
<li>Find the two LDAP-related lines in the output.</li>
<li>One of them answers. Report that port number.</li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="636">That is the encrypted port, and the scan should show it closed or filtered. Report the one that actually answered.</div>
<div class="ad-miss" data-guess="22|80|3389">That port belongs to web01 itself. Scan dc01, the domain controller, not the machine you are scanning from.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{389}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Port 389 is open and 636 is not, so a simple bind from this job has nowhere safer to go even if someone wanted it to. Whatever the job signs in with has to cross the wire in the clear, every three minutes, whether anyone is watching or not.</p>
</div>
<div>
<span>What to do</span>
<p>Now that you know the bind cannot be encrypted, capture one and see exactly what it exposes.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="w3-03" data-attempts="0">
<span class="ad-mission__num">Ticket 03 · Apply it · Protocols · Critical · tcpdump · INC-1057</span>
<h4>Capture the Bind</h4>
<p><strong>Alex Rivera · IT · 8:50 AM</strong><br>Port 389, confirmed. Now capture the job itself. I want to know exactly what it hands the directory, not just that it can.</p>
<p><strong>Task:</strong> Capture web01's traffic while the job runs, find the LDAP simple bind, and read the password it signs in with.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Capture the Bind" placeholder="the password" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{Autumn2026}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A simple bind sends the account name and password as plain bytes inside the LDAP message, not encrypted and not even Base64. You do not have to wait up to three minutes for the job: sudoers already lets you fire it on demand.</p>
<ul>
<li>Start a capture: <code>sudo tcpdump -i any -w /tmp/cap.pcap port 389</code>.</li>
<li>In another terminal, trigger the job now: <code>sudo /usr/local/bin/settlement-push.sh</code>.</li>
<li>Stop the capture after a few seconds with Ctrl-C.</li>
<li>Read it: <code>tshark -r /tmp/cap.pcap -Y "ldap.protocolOp == 0" -V</code>, or open <code>cap.pcap</code> in Wireshark, filter on <code>ldap</code>, and open the bindRequest packet.</li>
<li>Find the <strong>simple</strong> field under the bind's authentication choice. That is the password.</li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="svc-settlements">That is the account name signing in. Report the password that goes with it, in the same bind.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{Autumn2026}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Nothing here is a bug. LDAP's simple bind has worked exactly this way since before TLS existed, and plenty of old automation still uses it because it has always worked. The only thing protecting this password was whether anyone happened to be capturing traffic at the right three minutes, and you just proved that is not protection at all.</p>
</div>
<div>
<span>What to do</span>
<p>Treat this password as already known to anyone who wanted it. The next ticket takes the account out of service.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="w3-04" data-attempts="0">
<span class="ad-mission__num">Ticket 04 · Apply it · Protocols · Critical · Active Directory · INC-1057</span>
<h4>Take the Account Out of Service</h4>
<p><strong>Priya Shah · Operations · 9:30 AM</strong><br>If that password has been crossing the network in the clear this whole time, I do not want it trusted again. Disable the account, and find out what else that job has been sending while we are at it.</p>
<p><strong>Task:</strong> Disable <code>svc-settlements</code> in Active Directory. On web01, remove the cron job and the sudo access that let it run unprompted. Then report the file the job pulled off the share, unencrypted, in the same run.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Take the Account Out of Service" placeholder="a file name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{settlement-batch-0930.csv}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The bind was only half the job. Once it is in, the script pulls a file over SMB, and plain SMB does not encrypt the file body either.</p>
<ul>
<li>Disable the account: in Active Directory Users and Computers, find <strong>Service Settlements</strong> in the Service Accounts folder and disable it, or run <code>Disable-ADAccount svc-settlements</code> on the domain controller.</li>
<li>On web01, remove the schedule: <code>sudo rm /etc/cron.d/purvex-settlement</code>.</li>
<li>Remove the access that let it run as root without a password: <code>sudo rm /etc/sudoers.d/purvex-settlement</code>.</li>
<li>Find the file in the same capture, or list the share it reads: <code>smbclient -L dc01 -N</code>, then browse the Finance share.</li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="finance">That is the share it reads from. Report the file inside it.</div>
<div class="ad-miss" data-guess="autumn2026">That was the password, from the last ticket. This one wants the file the job pulled off the share.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{settlement-batch-0930.csv}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Encrypting the bind would only have protected the password. The file itself, a real settlement batch with account numbers and dollar amounts, left the share over plain SMB in the same run and was just as readable. A fix that only covers the sign-in misses half of what was actually exposed.</p>
</div>
<div>
<span>What to do</span>
<p>Confirm the account no longer signs in and the job no longer fires. If Operations still needs this report, it needs a new account, a new password, and a protocol that does not hand either one over for free.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="w3-05" data-attempts="0">
<span class="ad-mission__num">Ticket 05 · Stretch · TLS · Critical · Hardening · INC-1057</span>
<h4>Name the Fix</h4>
<p><strong>Jordan Ellis · Finance · 10:30 AM</strong><br>Operations still wants this report running, just not like that. Before they rebuild it, tell them which protocol actually closes this, by name, so it does not come back as a different job with the same problem.</p>
<p><strong>Task:</strong> Name the encrypted replacement for the plain LDAP simple bind the job used.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Name the Fix" placeholder="a protocol name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{ldaps}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>You already found its port number in the scan, and it was the one that was not open.</p>
<ul>
<li>Plain LDAP runs on 389. Its TLS-wrapped twin runs on 636 and has its own name, not just "LDAP with TLS."</li>
<li>Name that protocol.</li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="tls|ssl">Those are the general technology. Name the specific LDAP-over-TLS protocol by its own name.</div>
<div class="ad-miss" data-guess="ldap">That is the one that just leaked a password. Name its encrypted replacement.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{LDAPS}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>LDAPS wraps the entire bind in TLS before anything, including the password, ever reaches the wire, the same way HTTPS wraps HTTP. It costs the job nothing it was not already able to do: the account, the password and the query all stay the same. Only the channel changes.</p>
</div>
<div>
<span>What to do</span>
<p>When Operations rebuilds the job, point it at port 636 with LDAPS from the start, and check any other script still binding on 389 before it finds its own INC-1057.</p>
</div>
</div>
</div>
</div>
