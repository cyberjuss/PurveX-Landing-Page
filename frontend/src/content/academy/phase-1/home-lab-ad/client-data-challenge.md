<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>The Client Data Review</h3>
<p class="ad-brief__ask">Before an auditor arrives, can you find what client data sits on the file shares, check it is sound, and make sure only the right people can read it?</p>
<p>Compliance has asked the desk for a review of the department shares on the domain controller. Each task wants one answer you can only get by opening the files or the directory, and the last one asks for a change your lab has to show.</p>
<p>Every record here is synthetic. The SSNs are in a range that is never issued, the phone numbers are reserved for fiction, and the email addresses use example.com.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 7 solved</span>
</div>

<div class="ad-mission" data-id="cd-01" data-attempts="0">
<span class="ad-mission__num">Task 01 · Data inventory · Low</span>
<h4>Where the Numbers Live</h4>
<p><strong>Situation:</strong> The auditor's first question is always the same: where does the firm keep Social Security numbers? Nobody on the team is sure which file holds them.</p>
<p><strong>Task:</strong> Look through the department folders under <code>C:\PurveX\Shares</code> and find the file with a column of Social Security numbers. Type its file name.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Where the Numbers Live" placeholder="file name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{client-register-sample.csv}" data-accept="client-register-sample|client-register">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
<a class="ad-how" href="/range/phase-1/home-lab-setup#the-data" target="_blank" rel="noopener">Learn how<span> · The Data</span></a>
</div>
<div class="ad-hint__text">
<p>Each department keeps its own folder. Open the files and read the header row: the one you want has a column named for the number.</p>
<ol>
<li>On the domain controller, open File Explorer at <code>C:\PurveX\Shares</code>.</li>
<li>Open each department folder and look at the files inside.</li>
<li>Open a file in Notepad and read its second line, which names the columns.</li>
<li>Type the name of the file whose columns include <code>ssn</code>.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-ChildItem C:\PurveX\Shares -Recurse -File | Select-String -Pattern "ssn" -List</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="clients">That is the folder. Type the name of the file inside it.</div>
<div class="ad-miss" data-guess="portfolio-summary-sample.csv|portfolio-summary-sample|kyc-review-log-sample.csv|kyc-review-log-sample">That file is about the same clients but holds no Social Security numbers. Read the column names again.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{client-register-SAMPLE.csv}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>You cannot protect data you have not found. Knowing exactly which file holds the most sensitive field is the first line of any data review, and auditors ask for it before anything else.</p>
</div>
<div>
<span>What to do</span>
<p>Record each sensitive file, where it lives and who owns it. That list is what every later decision about access and monitoring rests on.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="cd-02" data-attempts="0">
<span class="ad-mission__num">Task 02 · Data inventory · Low</span>
<h4>Counting the Book</h4>
<p><strong>Situation:</strong> If the register ever leaked, the firm would have to tell every client in it. Compliance needs the number now, not after an incident.</p>
<p><strong>Task:</strong> Count the clients in the register you found. Type the number.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Counting the Book" placeholder="a number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{8}" data-accept="eight">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
<a class="ad-how" href="/range/phase-1/home-lab-setup#the-data" target="_blank" rel="noopener">Learn how<span> · The Data</span></a>
</div>
<div class="ad-hint__text">
<p>The first line is a banner and the second names the columns. Neither is a client.</p>
<ol>
<li>Open <code>client-register-SAMPLE.csv</code> in Notepad.</li>
<li>Count the lines that start with a client ID such as <code>C-1001</code>.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>(Get-Content C:\PurveX\Shares\Clients\client-register-SAMPLE.csv | Select-Object -Skip 1 | ConvertFrom-Csv).Count</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="10">That counts the banner and the header row as clients. Count only the lines with a client ID.</div>
<div class="ad-miss" data-guess="9">One of those lines is the header row. Count only the lines with a client ID.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{8}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The number of people in a file sets the size of a breach: how many notices go out, and how much the firm reports to regulators. A team that knows it in advance responds in hours instead of days.</p>
</div>
<div>
<span>What to do</span>
<p>Keep the count with the file's entry in the data inventory, and update it as the register grows.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="cd-03" data-attempts="0">
<span class="ad-mission__num">Task 03 · Compliance · Low</span>
<h4>Waiting on Paperwork</h4>
<p><strong>Situation:</strong> A client whose identity has not been verified should not be trading. Compliance wants to know how many reviews are still open before the auditor asks.</p>
<p><strong>Task:</strong> Open the KYC review log in the Compliance folder. Count the clients still awaiting documents and type the number.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Waiting on Paperwork" placeholder="a number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{2}" data-accept="two">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
<a class="ad-how" href="/range/phase-1/home-lab-setup#the-data" target="_blank" rel="noopener">Learn how<span> · The Data</span></a>
</div>
<div class="ad-hint__text">
<p>KYC stands for know your customer: the check that a client is who they say they are. Read the status column.</p>
<ol>
<li>Open <code>C:\PurveX\Shares\Compliance\kyc-review-log-SAMPLE.csv</code>.</li>
<li>Count the rows whose status is <code>Awaiting documents</code>.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-Content C:\PurveX\Shares\Compliance\kyc-review-log-SAMPLE.csv | Select-Object -Skip 1 | ConvertFrom-Csv | Group-Object status</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="1">One of them is under enhanced review, which is a different status. Count only Awaiting documents.</div>
<div class="ad-miss" data-guess="3">Enhanced review is a different status from Awaiting documents. Count only the second.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{2}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>C-1004 and C-1008 have not had their identity confirmed. Open KYC reviews are among the first things an auditor samples, and an account trading without one is a finding against the firm.</p>
</div>
<div>
<span>What to do</span>
<p>Send the two open reviews to Compliance with their dates, so the documents are chased before the audit rather than during it.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="cd-04" data-attempts="0">
<span class="ad-mission__num">Task 04 · Finance · Medium</span>
<h4>One Signature on Every Payment</h4>
<p><strong>Situation:</strong> The auditor will ask who can send the firm's money and who checks them. Finance keeps its vendor payments on the share.</p>
<p><strong>Task:</strong> Open the vendor payments file in the Finance folder and find who approved the payments. Type the account name.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for One Signature on Every Payment" placeholder="account name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{jordan.ellis}" data-accept="jordan-ellis|jordan ellis">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
<a class="ad-how" href="/range/phase-1/home-lab-setup#the-data" target="_blank" rel="noopener">Learn how<span> · The Data</span></a>
</div>
<div class="ad-hint__text">
<p>Read the last column of every row, not just the first.</p>
<ol>
<li>Open <code>C:\PurveX\Shares\Finance\vendor-payments-SAMPLE.csv</code>.</li>
<li>Read the <code>approved_by</code> column on every payment.</li>
<li>Type the account you find there.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="ledgerline">That is a vendor being paid. Read who approved the payments.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{jordan.ellis}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>One person approved every payment, so nobody checks their work. That is a gap in separation of duties: a changed bank detail or a payment that should not go out has no second pair of eyes before the money leaves.</p>
</div>
<div>
<span>What to do</span>
<p>Raise it as a control finding, not a person problem. Payments above a set amount, and every change to where a vendor is paid, should need a second approver.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="cd-05" data-attempts="0">
<span class="ad-mission__num">Task 05 · Operations · Medium</span>
<h4>The Batch That Did Not Balance</h4>
<p><strong>Situation:</strong> Operations reconciles each night's settlement batch. The auditor will want to see how exceptions are handled, starting with any that are still open.</p>
<p><strong>Task:</strong> Open the settlement batches file in the Operations folder and find the batch that did not reconcile. Type its batch number.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for The Batch That Did Not Balance" placeholder="batch number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{sb-2026-1015}" data-accept="sb20261015|2026-1015">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
<a class="ad-how" href="/range/phase-1/home-lab-setup#the-data" target="_blank" rel="noopener">Learn how<span> · The Data</span></a>
</div>
<div class="ad-hint__text">
<p>Every batch but one has the same status.</p>
<ol>
<li>Open <code>C:\PurveX\Shares\Operations\settlement-batches-SAMPLE.csv</code>.</li>
<li>Read the <code>status</code> column and find the row that is not Reconciled.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="2">That is the number of trades that did not match. Type the batch they belong to.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{SB-2026-1015}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Two trades in that batch did not match. An unmatched trade is either an error or money that went somewhere it should not, and until someone explains it the books for that night cannot be trusted. That is an integrity question, not just an accounting one.</p>
</div>
<div>
<span>What to do</span>
<p>Make sure the exception has an owner and a ticket, and that taylor.osei, who reconciled the batch, records how the two trades were resolved.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="cd-06" data-attempts="0">
<span class="ad-mission__num">Task 06 · Integrity · Medium</span>
<h4>Fingerprint the Register</h4>
<p><strong>Situation:</strong> If anyone ever edits the client register without permission, the firm needs a way to prove it. A record of the file's hash today is that proof later.</p>
<p><strong>Task:</strong> Take the SHA-256 hash of the client register as it sits on the share, without opening and saving it first. Type the hash.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Fingerprint the Register" placeholder="64 hex characters" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{30a686be6a88e251ecdc84a4addc4336348f7edc32992a36ac2efff9404fcbea}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
<a class="ad-how" href="/range/phase-1/week-2#hashing-and-integrity" target="_blank" rel="noopener">Learn how<span> · Hashing and Integrity</span></a>
</div>
<div class="ad-hint__text">
<p>This is the same check you ran on the installer mirrors in Week 2. Saving the file in an editor can change its bytes, and then its hash, so hash it untouched.</p>
<ol>
<li>On the domain controller, open PowerShell.</li>
<li>Run <code>Get-FileHash C:\PurveX\Shares\Clients\client-register-SAMPLE.csv -Algorithm SHA256</code>.</li>
<li>Copy the Hash value and paste it here.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="#">A SHA-256 hash is 64 letters and digits. Run Get-FileHash with -Algorithm SHA256 and copy the whole value.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{30a686be6a88e251ecdc84a4addc4336348f7edc32992a36ac2efff9404fcbea}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A hash is a fingerprint of the exact bytes. Change one digit in one client's row and the hash changes completely, so a recorded hash lets anyone prove later whether the file is still the one the firm signed off. If your hash differs from this one, the file on your share has already been changed.</p>
</div>
<div>
<span>What to do</span>
<p>Record the hash with the date in the data inventory and check it on a schedule. A mismatch with no approved change behind it is an integrity incident.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="cd-07" data-attempts="0">
<span class="ad-mission__num">Task 07 · Access control · High</span>
<h4>Who Can Read the Register</h4>
<p><strong>Situation:</strong> The register is only needed by the two advisors who own the clients and the two Compliance reviewers who check them. The auditor will ask who else can read it.</p>
<p><strong>Task:</strong> Create a security group named <code>Client Data Readers</code> in AccessLevels holding exactly <code>sam.whitfield</code>, <code>jamie.torres</code>, <code>devon.brooks</code> and <code>morgan.lee</code>. Then check the permissions on the <code>Shares</code> share and type the group that can read it today.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Who Can Read the Register" placeholder="group name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{domain-users}" data-accept="domain users|purvex\domain users">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
<a class="ad-how" href="/range/phase-1/home-lab-directory#groups" target="_blank" rel="noopener">Learn how<span> · Groups</span></a>
</div>
<div class="ad-hint__text">
<p>Least privilege means the people who need the data and nobody else. Build that group first, then look at who the share actually lets in.</p>
<ol>
<li>Open Active Directory Users and Computers with Win+R and <code>dsa.msc</code>.</li>
<li>Right-click <code>AccessLevels</code>, choose New, Group, and create <code>Client Data Readers</code> as a Global Security group.</li>
<li>Add the two advisors and the two Compliance reviewers on its Members tab, and nobody else.</li>
<li>In PowerShell, run <code>Get-SmbShareAccess -Name Shares</code> and read the AccountName that has Read.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="client-data-readers">That is the group you built. Type the group the share lets read it today.</div>
<div class="ad-miss" data-guess="everyone|authenticated-users">Read the AccountName on the Shares share itself with Get-SmbShareAccess.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{Domain Users}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Every account in the domain can read every client's Social Security number, including the help desk, Operations and any account an attacker takes over. The four people who need it are a fraction of that. This is broken access control, the same failure Week 4 opened with.</p>
</div>
<div>
<span>What to do</span>
<p>Give <code>Client Data Readers</code> read access to the Clients folder and remove Domain Users from it, then confirm an account outside the group is refused. Raise the share permissions as a finding with the change, so it goes through approval rather than around it.</p>
</div>
</div>
</div>
</div>
