<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>The Nightly Settlement Push</h3>
<p class="ad-brief__ask">When a job moves data between two servers, can you read the wire and say what an onlooker would learn?</p>
<p>Compliance is reviewing how PurveX Financial moves settlement data. A job on web01 signs in to the directory every night and copies the settlement batch off the Finance share. Nobody has looked at what that job actually sends.</p>
<p>You have both machines. Capture the job on web01, read what crosses, and finish by containing what you find.</p>
</div>

<p>This challenge needs the cloud lab, because the capture runs on the Ubuntu server and the job talks to your domain controller.</p>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 6 solved</span>
</div>

<div class="ad-mission" data-id="cap-01" data-attempts="0">
<span class="ad-mission__num">Task 01 · INC-1057 · Low</span>
<h4>Where the Job Signs In</h4>
<p><strong>Situation:</strong> Compliance asked which services the nightly job touches on the domain controller. The job runs on web01 every three minutes and nothing in the runbook records the ports it uses.</p>
<p><strong>Task:</strong> Capture the job on web01 and give the port number that carries its sign-in to the directory.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Where the Job Signs In" placeholder="a port number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{389}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A capture only shows traffic while it is running, so start the capture first and then make the job run.</p>
<ol>
<li>Open a terminal on the Ubuntu desktop and find the interface with <code>ip -brief address</code>.</li>
<li>Start a capture on that interface, filtering to the domain controller with <code>sudo tcpdump -i ens5 -n host dc01</code>.</li>
<li>In a second terminal, run the job now with <code>sudo /usr/local/bin/settlement-push.sh</code>.</li>
<li>Read the destination ports in the capture and pick the one that carries the directory sign-in rather than the file copy.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="445|139">That is the port the file copy uses. The sign-in happens first, on a different port.</div>
<div class="ad-miss" data-guess="636">Nothing in this capture is using the encrypted directory port. Read the port the job actually used.</div>
<div class="ad-miss" data-guess="#">Run the job while the capture is running, then read the destination port on the first packets to the domain controller.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{389}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Port 389 is the directory port that carries no encryption of its own. Anything the job sends across it is readable by whoever can see the wire, and that includes the credentials it signs in with.</p>
</div>
<div>
<span>What to do</span>
<p>Record the ports a job uses before you certify it. A job that reaches the directory on 389 instead of 636 is a finding on its own, even before you read what it sent.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="cap-02" data-attempts="0">
<span class="ad-mission__num">Task 02 · INC-1057 · Medium</span>
<h4>Who the Job Signs In As</h4>
<p><strong>Situation:</strong> The reviewer wants to know which account the nightly job uses. The job was set up by a contractor in 2019 and the handover notes name no account at all.</p>
<p><strong>Task:</strong> Read the directory sign-in out of your capture and give the account name the job uses.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Who the Job Signs In As" placeholder="account name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{svc-settlements}" data-accept="svc-settlements@purvexfinancial.local|svcsettlements@purvexfinanciallocal">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A sign-in on port 389 carries the account name as readable text, so the bytes of the packet are enough.</p>
<ol>
<li>Capture again with the contents shown, using <code>sudo tcpdump -i ens5 -A -n host dc01 and port 389</code>.</li>
<li>Run the job with <code>sudo /usr/local/bin/settlement-push.sh</code> while that capture runs.</li>
<li>Read the printed bytes for a name in the form of a sign-in, and ignore the directory path that follows it.</li>
<li>Wireshark shows the same thing under Edit then Find Packet, searching Packet bytes for a string.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="administrator">That is not the account in the capture. Read the name the job presented when it signed in.</div>
<div class="ad-miss" data-guess="student">That is your own account on the Ubuntu server, not the one the job uses.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{svc-settlements}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A service account that signs in across the network is an account an attacker can reuse. Knowing its name is the first half of taking it over, and the capture gives that away without any access to either server.</p>
</div>
<div>
<span>What to do</span>
<p>Keep an owner and a purpose on every service account, so a reviewer never has to read the wire to learn what a job runs as. The description on this one names the job and the server.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="cap-03" data-attempts="0">
<span class="ad-mission__num">Task 03 · INC-1057 · Critical</span>
<h4>What the Sign-In Gives Away</h4>
<p><strong>Situation:</strong> Compliance asked whether the nightly job protects its credentials in transit. The vendor who built it stated in writing that the connection is safe.</p>
<p><strong>Task:</strong> Read the same sign-in again and give the password the job sends.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for What the Sign-In Gives Away" placeholder="the password" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{Autumn2026}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A simple bind sends the account and the password in the same packet, one after the other.</p>
<ol>
<li>Capture with contents shown again, using <code>sudo tcpdump -i ens5 -A -n host dc01 and port 389</code>.</li>
<li>Run the job with <code>sudo /usr/local/bin/settlement-push.sh</code>.</li>
<li>Find the packet holding the account name from the last task and read the printable text that follows it.</li>
<li>In Wireshark, right click that packet and choose Follow then TCP Stream to see both values together.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="svc-settlements">That is the account name. The value you want sits next to it in the same bind.</div>
<div class="ad-miss" data-guess="purvexfinancial.local">That is the directory the job searched, not the secret it presented.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{Autumn2026}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>An LDAP simple bind puts the password on the wire with no encryption around it. Anyone who can capture on either server now holds a working directory credential, and the vendor's assurance was wrong.</p>
</div>
<div>
<span>What to do</span>
<p>Treat this password as burned and raise it as an incident, not a finding. Test a vendor's claim about encryption rather than filing it, because a capture settles the question in one run.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="cap-04" data-attempts="0">
<span class="ad-mission__num">Task 04 · INC-1057 · Critical</span>
<h4>The File on the Wire</h4>
<p><strong>Situation:</strong> After the sign-in, the job copies the settlement batch off the Finance share. The batch holds client account numbers and amounts for the day.</p>
<p><strong>Task:</strong> Read the copied file out of your capture and give the first settlement reference in it.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for The File on the Wire" placeholder="a reference" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{SB-0930-4417}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The file copy runs on a different port from the sign-in, so widen the capture to catch both halves of the job.</p>
<ol>
<li>Capture the whole conversation with <code>sudo tcpdump -i ens5 -A -n host dc01</code>.</li>
<li>Run the job with <code>sudo /usr/local/bin/settlement-push.sh</code>.</li>
<li>Look for the rows of the file in the printed bytes, which start with a header line naming the columns.</li>
<li>Wireshark reads it more comfortably. Capture there, then use File then Export Objects then SMB to pull the file straight out.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="reference|account|settles|amount">That is a column heading from the file. The value you want is the first entry under it.</div>
<div class="ad-miss" data-guess="#">References in this file carry letters as well as digits. Read the first full value in the Reference column.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{SB-0930-4417}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Windows does not encrypt file sharing by default, so the batch crossed the network in readable rows. Client account numbers and settlement amounts were exposed to anyone capturing on either server.</p>
</div>
<div>
<span>What to do</span>
<p>Report the exposure with the file name and what it contained, because the data matters more than the protocol. Ask whether SMB encryption can be required on shares that carry client data.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="cap-05" data-attempts="0">
<span class="ad-mission__num">Task 05 · INC-1057 · Low</span>
<h4>Narrowing the Capture</h4>
<p><strong>Situation:</strong> Your findings are going to a reviewer who has Wireshark but has never used it. They need one filter that shows the directory sign-in and nothing else.</p>
<p><strong>Task:</strong> Give the Wireshark display filter that leaves only the directory traffic on screen.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Narrowing the Capture" placeholder="a display filter" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{ldap}" data-accept="tcp.port==389|tcp.port eq 389">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A Wireshark display filter can name the protocol itself, which is shorter than filtering on the port.</p>
<ol>
<li>Open your capture in Wireshark and look at the Protocol column for the sign-in packets.</li>
<li>Type that protocol name in lower case into the display filter bar and press Enter.</li>
<li>Check that only the directory conversation is left and the file copy has gone.</li>
<li>Filtering on the port number works as well, and both forms are accepted here.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="port389|port 389">That is capture filter wording. A display filter names the protocol or uses the tcp.port form.</div>
<div class="ad-miss" data-guess="smb|smb2">That filter shows the file copy. You want the sign-in that happened before it.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{ldap}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A capture of a busy server is unreadable until it is filtered. Handing a reviewer the one filter that isolates the evidence is the difference between a finding they can confirm and one they take on trust.</p>
</div>
<div>
<span>What to do</span>
<p>Put the filter in the report next to the screenshot. Anyone can then reproduce what you saw instead of asking you to run the capture again.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="cap-06" data-attempts="0">
<span class="ad-mission__num">Task 06 · INC-1057 · Critical</span>
<h4>Containing a Burned Credential</h4>
<p><strong>Situation:</strong> You recovered a working directory password from a capture that anyone on either server could have taken. Your lead wants the account stopped before the next run and asks what the job should have been using.</p>
<p><strong>Task:</strong> Disable <code>svc-settlements</code> in Active Directory, then name the protocol the job should sign in with instead.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Containing a Burned Credential" placeholder="a protocol" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{ldaps}" data-accept="636|ldap over tls|ldap over ssl">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Disabling keeps the account and its history, where deleting would destroy the evidence a review still needs.</p>
<ol>
<li>On the domain controller, open Active Directory Users and Computers with Win+R and <code>dsa.msc</code>.</li>
<li>Find <code>svc-settlements</code> under ServiceAccounts, right click it and choose Disable Account.</li>
<li>Name the protocol that carries the same directory sign-in inside encryption.</li>
<li>In PowerShell: <code>Disable-ADAccount -Identity svc-settlements</code>.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="ldap">That is the protocol the job already uses, and it is the reason the password was readable.</div>
<div class="ad-miss" data-guess="https|ssh|sftp">Those protect other kinds of traffic. Name the encrypted form of the directory protocol itself.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{ldaps}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A password read off the wire works until it is changed, and nothing in the directory records that it was taken. Every night the job ran, it handed the same credential to anyone watching.</p>
</div>
<div>
<span>What to do</span>
<p>Disable the account and keep it as evidence, then have the job rebuilt on LDAPS with a new credential. Check whether any other job signs in on 389 before you close the review.</p>
</div>
</div>
</div>
</div>
