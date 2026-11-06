<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Tuesday After the Breach</h3>
<p class="ad-brief__ask">Last night, a training vendor that PurveX staff use announced a breach. This morning the IT desk is full of tickets that come down to one question. Is this encoded, encrypted or hashed, and what does that mean we have to do?</p>
<p>Everything the tickets mention is waiting in the IT share on your domain controller. Work them in order, because each one leans on the one before it.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 5 solved</span>
</div>

<div class="ad-mission" data-id="w2-03" data-attempts="0">
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
<p>Encryption is only as strong as the way its key is handed out. A caller on an unknown number, a deadline and a request for the key is how attackers talk their way past disk encryption. The morning after a breach is when they try.</p>
</div>
<div>
<span>What to do</span>
<p>Verify the caller through a channel you already trust, then read the key. Log the request in the ticket, because a recovery key that was given out should be rotated once the laptop is back in IT's hands.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="w2-01" data-attempts="0">
<span class="ad-mission__num">Ticket 02 · Apply it · Encoding · High · INC-1091</span>
<h4>Decode the Settlement Script</h4>
<p><strong>Taylor Osei · Operations · 8:40 AM</strong><br>The clearing vendor's support team wants a copy of our settlement upload script to debug a failed transfer. The comment at the top says the password is encrypted, so I can just send it, right? It's in the IT share.</p>
<p><strong>Task:</strong> Open <code>settlement-upload.ps1</code> in the IT share, find out what the "encrypted" password really is, and report it.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Decode the Settlement Script" placeholder="the password" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{Settle-Now-2026!}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Analysts decode values like this in CyberChef, the free tool from GCHQ that runs in the browser. A value made only of the digits 0 to 9 and the letters a to f is usually hex. Undo one layer at a time until you can read it.</p>
<ol>
<li>Open <code>C:\PurveX\Shares\IT\settlement-upload.ps1</code> and copy the value of <code>$Password</code>.</li>
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
<p><strong>Riley Kwan · Operations · 9:05 AM</strong><br>The breach notice says to update the VPN client today. I found three download mirrors of version 2.4.1 in the IT share. IT published a checksum next to them. Which one is safe to install?</p>
<p><strong>Task:</strong> Hash the three mirrors in the IT share and compare each with <code>checksums.txt</code>. Move the one that doesn't match into <code>C:\PurveX\Quarantine</code>, and report its file name.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Catch the Altered Download" placeholder="a file name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{vpn-client-2.4.1-mirror-b.txt}" data-accept="vpn-client-2.4.1-mirror-b|mirror-b.txt|mirror-b">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A file's SHA-256 changes completely if even one character changes, so the genuine copies all produce exactly the published value, and an altered copy produces something else.</p>
<ol>
<li>Read the published value in <code>C:\PurveX\Shares\IT\checksums.txt</code>.</li>
<li>Hash each <code>vpn-client-2.4.1-mirror-*.txt</code> file and compare.</li>
<li>Move the one that doesn't match into <code>C:\PurveX\Quarantine</code>. Moving keeps it as evidence.</li>
</ol>
<p>In PowerShell:</p>
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
<p><strong>Alex Rivera · IT · 10:15 AM</strong><br>The breached vendor stored passwords as plain SHA-256, with no salt. The slice of its user table with PurveX accounts is in the IT share as <code>exported-hashes.txt</code>. Two of our staff have the same hash, which means the same password. Find out what it is, and make sure neither of them keeps using it.</p>
<p><strong>Task:</strong> Find the two accounts that share a hash and crack it with <code>common-passwords.txt</code>. Then force both accounts to change their password at next logon, and report the password.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Crack the Shared Hash" placeholder="the password" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{Winter2026}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>With no salt, the same password always produces the same hash. So you can hash every word in the list and look for a match, which is what an attacker holding this table would do.</p>
<ol>
<li>Open <code>exported-hashes.txt</code> and find the two accounts with the same hash.</li>
<li>Hash each word in <code>common-passwords.txt</code> with SHA-256 and find the one that matches.</li>
<li>For both accounts, open the account in Active Directory Users and Computers, and on the Account tab tick User must change password at next logon.</li>
</ol>
<p>In PowerShell:</p>
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
<p>Force a change at next logon for everyone in the dump, starting with these two, and ask them not to reuse passwords between work and outside services. A salted, slow hash, like the ones the lesson describes, is what stops one breach from turning into this.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="w2-05" data-attempts="0">
<span class="ad-mission__num">Ticket 05 · Stretch · Wrap-up · Report to the IT Lead · INC-1091</span>
<h4>Fix the Script for Good</h4>
<p><strong>Alex Rivera · IT · 11:00 AM</strong><br>Back to the settlement script from this morning. Operations still needs it to run every night. What's the right fix?<br><strong>A</strong> Encrypt the password properly with AES, and keep the key in the same script so it can decrypt it at run time.<br><strong>B</strong> Take the password out of the script, store it in a secrets vault or run the job under a managed service account, and change the password that was exposed.<br><strong>C</strong> Replace the password with its SHA-256 hash, so nobody can read it.</p>
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
<p>Encoding hides nothing, encryption with the key beside it hides nothing either, and hashing can't be reversed, so none of them works for a password a script has to use. The secret has to live somewhere that's protected by access control and encryption, not in a text file in a shared folder.</p>
</div>
<div>
<span>What to do</span>
<p>Move the credential into a vault or a managed service account, change the exposed password with the vendor, and remove the old script from the share. Then search the other shares for the same pattern, because a script like this is rarely the only one.</p>
</div>
</div>
</div>
</div>
