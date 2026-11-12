<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Tuesday After the Breach</h3>
<p class="ad-brief__ask">Last night, a training vendor that PurveX staff use announced a breach. This morning the IT desk is full of tickets that come down to one question. Is this encoded, encrypted or hashed, and what does that mean we have to do?</p>
<p>Everything the tickets mention is waiting in the IT share on your domain controller. They're separate calls from the same morning, not one chain, but the last one circles back to the script you check in Ticket 02.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 5 solved</span>
</div>

<div class="ad-mission" data-id="w2-03" data-attempts="0" data-hands-on="false">
<span class="ad-mission__num">Ticket 01 · Warm-up · Encryption · Medium · INC-1091</span>
<h4>The Recovery Key Call</h4>
<p><strong>Phone call · 8:30 AM</strong><br>"Hi, it's Sam Whitfield from Wealth Management. My laptop rebooted for an update and now there's a blue BitLocker screen asking for a 48-digit key. I'm calling from my personal phone and I have a client in ten minutes. Can you just read me the key?"<br><strong>A</strong> Read the key out straight away. The client meeting can't wait.<br><strong>B</strong> Confirm it's really Sam first, for example by calling back on the number in the directory or checking with Sam's manager, then give the key.<br><strong>C</strong> Tell Sam the data can't be recovered and the laptop has to be wiped.</p>
<p><strong>Task:</strong> Choose what you do and type its letter.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for The Recovery Key Call" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The recovery key is the one thing that unlocks the whole encrypted drive. Ask yourself who would gain from getting it read out over the phone, especially the morning after a breach.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">Anyone can say they're Sam, and urgency is a classic pressure tactic. The key unlocks everything on the drive, so check who you're talking to first.</div>
<div class="ad-miss" data-guess="c">Nothing is lost. BitLocker is doing its job, and the recovery key unlocks the drive with all of Sam's data intact.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{b}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Verify Sam through a channel you already trust before reading the key, since an unknown number and a deadline is exactly how attackers talk their way past disk encryption, and log the request so the key gets rotated once the laptop is back in IT's hands.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="w2-01" data-attempts="0">
<span class="ad-mission__num">Ticket 02 · Apply it · Encoding · High · INC-1091</span>
<h4>Decode the Settlement Script</h4>
<p><strong>Taylor Osei · Operations · 8:40 AM</strong><br>"The clearing vendor's support team wants a copy of our settlement upload script to debug a failed transfer. The comment at the top says the password is encrypted, so I can just send it, right? It's in the IT share."</p>
<p><strong>Task:</strong> Answer Taylor. Find out whether that password really is encrypted, and report what it is.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Decode the Settlement Script" placeholder="the password" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{Settle-Now-2026!}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Analysts decode values like this in CyberChef, the free tool from GCHQ that runs in the browser. A value made only of the digits 0 to 9 and the letters a to f is usually hex. Undo one layer at a time until you can read it.</p>
<ol>
<li>On your lab's domain controller, open <code>C:\PurveX\Shares\IT\settlement-upload.ps1</code> and copy the value of <code>$Password</code>.</li>
<li>Open CyberChef at <code>gchq.github.io/CyberChef</code> and paste the value into Input.</li>
<li>Drag in From Hex. If the output still isn't readable and ends in <code>=</code>, add From Base64 below it.</li>
</ol>
<p>In PowerShell, the same two steps:</p>
<ul>
<li><code>$hex = "553256306447786c4c553576647930794d44493249513d3d"; $b64 = -join ($hex -split '(..)' | Where-Object { $_ } | ForEach-Object { [char][Convert]::ToInt32($_, 16) }); [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($b64))</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="553256306447786c4c553576647930794d44493249513d3d|purvex-settle">That's straight from the script. Decode the $Password value and report what it says.</div>
<div class="ad-miss" data-guess="U2V0dGxlLU5vdy0yMDI2IQ==">That's one layer down, and it's Base64. Add From Base64 after From Hex.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{Settle-Now-2026!}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The comment called it AES encryption, but it was hex wrapped around Base64, two encodings anyone can reverse in seconds with no key. Sending the script to the vendor would have handed the settlement account's real password to a company that was breached last night.</p>
</div>
<div>
<span>What to do</span>
<p>Tell Taylor not to send it, and send the vendor a copy with the password line removed. Because the password has sat readable in a shared folder, treat it as exposed and have it changed. Ticket 05 comes back to the proper fix.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="w2-02" data-attempts="0">
<span class="ad-mission__num">Ticket 03 · Apply it · Hashing · High · INC-1058 · INC-1091</span>
<h4>Catch the Altered Download</h4>
<p><strong>Riley Kwan · Operations · 9:05 AM</strong><br>"The breach notice says to update the VPN client today, so I grabbed version 2.4.1 from the IT share, except there are three different mirrors of it, each with a checksum IT posted next to it. Which one's actually safe to install?"</p>
<p><strong>Task:</strong> Answer Riley. Find out which mirror isn't safe to install, quarantine it, and report its file name.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Catch the Altered Download" placeholder="a file name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{vpn-client-2.4.1-mirror-b.txt}" data-accept="vpn-client-2.4.1-mirror-b|mirror-b.txt|mirror-b">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A file's SHA-256 changes completely if even one character changes, so the genuine copies all produce exactly the published value, and an altered copy produces something else.</p>
<ol>
<li>On your lab's domain controller, read the published value in <code>C:\PurveX\Shares\IT\checksums.txt</code>.</li>
<li>In PowerShell, run <code>Get-FileHash C:\PurveX\Shares\IT\vpn-client-2.4.1-mirror-a.txt</code>, then the same command on mirror-b and mirror-c, and compare each Hash value to the one in checksums.txt.</li>
<li>Move the one that doesn't match into <code>C:\PurveX\Quarantine</code>. Moving keeps it as evidence.</li>
</ol>
<p>In PowerShell, checking all three mirrors in one command:</p>
<ul>
<li><code>Get-FileHash C:\PurveX\Shares\IT\vpn-client-2.4.1-mirror-*.txt | Select-Object Path, Hash</code></li>
<li><code>Move-Item C:\PurveX\Shares\IT\vpn-client-2.4.1-mirror-b.txt C:\PurveX\Quarantine\</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="vpn-client-2.4.1-mirror-a.txt|vpn-client-2.4.1-mirror-c.txt|mirror-a|mirror-c|a|c">That mirror's hash matches the published checksum, so it's the genuine file. Compare the other two.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{vpn-client-2.4.1-mirror-b.txt}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>All three files looked the same at a glance. Only the hash showed that mirror B differs, and opening it shows why: it says it's an unsigned build. On a day when attackers know staff are rushing to update, a tampered installer is what they'd plant.</p>
</div>
<div>
<span>What to do</span>
<p>Keep the altered copy in quarantine as evidence, point Riley to a mirror that matches, and tell IT so the bad mirror can be traced and taken down.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="w2-04" data-attempts="0">
<span class="ad-mission__num">Ticket 04 · Stretch · Storing Passwords · Critical · INC-1058 · INC-1091</span>
<h4>Crack the Shared Hash</h4>
<p><strong>Alex Rivera · IT · 10:15 AM</strong><br>"The breached vendor stored passwords as plain SHA-256, with no salt. I pulled the slice of its user table with PurveX accounts into <code>exported-hashes.txt</code> in the IT share, and two of our staff come back with the exact same hash.</p>
<p>Same hash with no salt means the same password. Can you tell who, and what it is, before anyone else reuses it?"</p>
<p><strong>Task:</strong> Answer Alex. Find the password those two accounts share, make sure neither can keep using it, and report the password.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Crack the Shared Hash" placeholder="the password" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{Winter2026}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>With no salt, the same password always produces the same hash. So you can hash every word in the list and look for a match, which is what an attacker holding this table would do.</p>
<ul>
<li>On your lab's domain controller, open <code>C:\PurveX\Shares\IT\exported-hashes.txt</code> and find the two accounts with the same hash.</li>
<li>Open CyberChef, and paste the whole contents of <code>common-passwords.txt</code> into Input, one word per line.</li>
<li>Add Fork, then SHA2 set to 256 below it. Fork hashes every line on its own instead of the whole block as one value.</li>
<li>Read down the Output for the line whose hash matches the one from the table. That word is the password.</li>
<li>For both accounts, open the account in Active Directory Users and Computers, and on the Account tab tick User must change password at next logon.</li>
</ul>
<p>In PowerShell, the same hashing and matching in one command:</p>
<ul>
<li><code>$t = Import-Csv C:\PurveX\Shares\IT\exported-hashes.txt; $sha = [Security.Cryptography.SHA256]::Create(); Get-Content C:\PurveX\Shares\IT\common-passwords.txt | ForEach-Object { $w = $_; $h = -join ($sha.ComputeHash([Text.Encoding]::ASCII.GetBytes($w)) | ForEach-Object { $_.ToString("x2") }); $t | Where-Object sha256 -eq $h | ForEach-Object { "$($_.account) uses $w" } }</code></li>
<li><code>"taylor.osei", "jordan.ellis" | ForEach-Object { Set-ADUser $_ -ChangePasswordAtLogon $true }</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="taylor.osei|jordan.ellis">That's one of the two accounts. Report the password they share.</div>
<div class="ad-miss" data-guess="5d2c4f6de7f85dcc139b10980150a5b4e1b2e22328bdac7817aa72c45e41b3b3">That's the shared hash. Hash the words in the list until one matches it, and report that word.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{Winter2026}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Because the vendor used no salt, the table gave away who shares a password before anything was cracked, and a list of twenty common passwords was enough to find it. If either person reuses Winter2026 at PurveX, the attacker already has a working company password.</p>
</div>
<div>
<span>What to do</span>
<p>Force a change at next logon for everyone in the dump, starting with these two, and ask them not to reuse passwords between work and outside services. A salted, slow hash like the one the lesson describes is what stops one breach from turning into this.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="w2-05" data-attempts="0" data-hands-on="false">
<span class="ad-mission__num">Ticket 05 · Stretch · Wrap-up · Report to the IT Lead · INC-1091</span>
<h4>Fix the Script for Good</h4>
<p><strong>Alex Rivera · IT · 11:00 AM</strong><br>"Back to the settlement script from this morning. Operations still needs it to run every night. What's the right fix?"<br><strong>A</strong> Encrypt the password properly with AES, and keep the key in the same script so it can decrypt it at run time.<br><strong>B</strong> Take the password out of the script, store it in a secrets vault or run the job under a managed service account, and change the password that was exposed.<br><strong>C</strong> Replace the password with its SHA-256 hash, so nobody can read it.</p>
<p><strong>Task:</strong> Choose the fix and type its letter.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Fix the Script for Good" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Think about what each of the three methods can and can't do. The script has to send the real password to the vendor every night.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">Encryption only protects data from people who don't have the key. With the key sitting in the same script, anyone who can read the script can decrypt the password.</div>
<div class="ad-miss" data-guess="c">A hash can't be turned back into the password, so the script couldn't sign in to the vendor any more. Hashing is for checking a password, not for sending one.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{b}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A vault or a managed service account is the only one of these three that actually keeps the password out of the script, so move it there and rotate the exposed password with the vendor.</p>
</div>
</div>
</div>
</div>
