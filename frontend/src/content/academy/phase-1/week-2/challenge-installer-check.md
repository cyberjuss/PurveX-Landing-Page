<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>The Mirror That Does Not Match</h3>
<p class="ad-brief__ask">When you cannot see inside a file or a password, can you still prove what it is?</p>
<p>In this challenge, you'll hash the files you're given, compare them to a published checksum, and work out what a leaked password export really proves.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 6 solved</span>
</div>

<div class="ad-mission" data-id="cry-01" data-attempts="0">
<span class="ad-mission__num">Task 01 · INC-1058 · Medium</span>
<h4>Three Mirrors and One Checksum</h4>
<p><strong>Situation:</strong> IT keeps three mirrored copies of the VPN client manifest, so a download never fails. A checksum published on 22 September says what the genuine file should hash to, but nobody has checked the mirrors against it since then.</p>
<p><strong>Task:</strong> Hash all three mirrors in <code>C:\PurveX\Shares\IT</code> and give the file name of the one that does not match <code>checksums.txt</code>.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Three Mirrors and One Checksum" placeholder="a file name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{vpn-client-2.4.1-mirror-b.txt}" data-accept="mirror-b|vpn-client-2.4.1-mirror-b">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Remember that a checksum is only useful if you compare against a value published somewhere the file itself can't change, so use the published checksum file as your reference rather than the other mirrors.</p>
<ol>
<li>Open PowerShell on the domain controller and change to <code>C:\PurveX\Shares\IT</code>.</li>
<li>Read the published value with <code>Get-Content checksums.txt</code>.</li>
<li>Hash every mirror at once with <code>Get-FileHash *.txt -Algorithm SHA256</code>.</li>
<li>Compare each hash against the published one and name the file that differs.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="checksums.txt">That is the published value you compare against, not one of the mirrors.</div>
<div class="ad-miss" data-guess="vpn-client-2.4.1-mirror-a.txt|vpn-client-2.4.1-mirror-c.txt|mirror-a|mirror-c">That mirror matches the published checksum. Hash all three and compare each one.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{vpn-client-2.4.1-mirror-b.txt}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>It's tempting to trust the two mirrors that agree with each other, but that proves nothing on its own, because a mirror can be replaced just as easily as a file. The published checksum is the only value that could show which copy was altered after it was signed off.</p>
</div>
<div>
<span>What to do</span>
<p>So the next step is to stop distributing from that mirror and keep the file for review. When you do check further, compare the published value against the vendor's own copy rather than the other mirrors, so a source that's been changed can't vouch for itself.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="cry-02" data-attempts="0">
<span class="ad-mission__num">Task 02 · INC-1058 · Medium</span>
<h4>What Changed Inside It</h4>
<p><strong>Situation:</strong> A different hash tells you that a file changed, but it says nothing at all about what changed. Before the mirror is reported to the vendor, your lead wants to see the actual difference.</p>
<p><strong>Task:</strong> Compare the mirror that failed against one that passed and give the name of the field whose line differs.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for What Changed Inside It" placeholder="a field name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{signed-by}" data-accept="signedby">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Since the manifests are plain text, a line-by-line comparison will show you the change that the hash only hinted at.</p>
<ol>
<li>In PowerShell, read both files with <code>Get-Content</code> and compare them with <code>Compare-Object</code>.</li>
<li>Read the line that differs and look at the field name before the colon.</li>
<li>Compare that line against the same line in a mirror that matched.</li>
<li>Give the field name rather than the whole line.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="version|package|product">That field reads the same in all three mirrors. Compare the files and find the line that actually differs.</div>
<div class="ad-miss" data-guess="sha256|checksum|hash">The hash is what told you something changed. The answer is a field inside the manifest itself.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{signed-by}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The failing mirror claims to be version 2.4.1, yet it carries a build nobody signed. Anyone installing from it would have trusted that version number, and that's exactly the one thing the altered file left intact.</p>
</div>
<div>
<span>What to do</span>
<p>When you report it, include both what the hash proved and what the comparison showed, because a good report needs both. Keep in mind that a version number is only a claim, whereas a signature is something you can actually check.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="cry-03" data-attempts="0">
<span class="ad-mission__num">Task 03 · INC-1058 · Low</span>
<h4>Naming the Algorithm</h4>
<p><strong>Situation:</strong> In the same folder, a password export lists one hash per account, but it never says how those hashes were made. Before anyone decides whether they're weak, your lead wants the algorithm named.</p>
<p><strong>Task:</strong> Read <code>exported-hashes.txt</code> and name the hashing algorithm from the length of the values.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Naming the Algorithm" placeholder="an algorithm" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{sha-256}" data-accept="sha256|sha2">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Each hashing algorithm produces a value of one fixed length, so counting the characters is enough to name it.</p>
<ol>
<li>Open <code>exported-hashes.txt</code> and look at one of the hash values.</li>
<li>Count its characters, which are written in hexadecimal.</li>
<li>A value of 64 hexadecimal characters is 256 bits.</li>
<li>Name the algorithm that produces a 256-bit hash.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="md5">MD5 produces 32 hexadecimal characters. Count the length of these values again.</div>
<div class="ad-miss" data-guess="sha-1|sha1">SHA-1 produces 40 hexadecimal characters. These values are longer than that.</div>
<div class="ad-miss" data-guess="bcrypt|base64">Those have their own shapes, and neither is 64 hexadecimal characters. Read the length.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{sha-256}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>SHA-256 is fast to compute. That speed is a strength when you're checking a file, but it's a weakness when you're storing a password, because a fast hash lets an attacker try billions of guesses a second against a stolen list.</p>
</div>
<div>
<span>What to do</span>
<p>So flag that these passwords were stored with a plain, fast hash and no salt. A password store should use a slow algorithm built for the job instead, such as bcrypt or Argon2id.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="cry-04" data-attempts="0">
<span class="ad-mission__num">Task 04 · INC-1058 · Medium</span>
<h4>Cracking a Weak Hash</h4>
<p><strong>Situation:</strong> The vendor review left a short list of common passwords next to the export. If any staff password is on that list, its hash will give it up in seconds, and that's exactly what an attacker would try first.</p>
<p><strong>Task:</strong> Recover the password behind <code>taylor.osei</code>'s hash using <code>common-passwords.txt</code> and give the password.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Cracking a Weak Hash" placeholder="the password" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{Winter2026}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Cracking a fast hash is really just organized guessing: you hash each candidate and stop when one matches the target.</p>
<ol>
<li>Read <code>taylor.osei</code>'s hash from <code>exported-hashes.txt</code>.</li>
<li>On the Ubuntu server, hash each candidate and compare it, looping the list with <code>while read p; do printf '%s' "$p" | sha256sum; done &lt; common-passwords.txt</code>.</li>
<li>Find the line whose hash equals the target and read the password beside it.</li>
<li>The same works on the domain controller in PowerShell, hashing each line with the .NET SHA256 class.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="taylor.osei|svc-settlements">That is an account name. The answer is the password its hash stands for.</div>
<div class="ad-miss" data-guess="5d2c4f6de7f85dcc139b10980150a5b4e1b2e22328bdac7817aa72c45e41b3b3">That is the hash itself. Give the password that produces it.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{Winter2026}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A password that's on a common list is effectively already public, so hashing it protects nothing. With a fast, unsalted hash, the match turns up in seconds, which leaves the account open to anyone holding the export.</p>
</div>
<div>
<span>What to do</span>
<p>Any account whose password was recovered this way needs a forced reset, along with a length requirement that keeps the new password off guessing lists. One cracked hash calls for a reset, but a pattern across many accounts points to a policy problem.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="cry-05" data-attempts="0">
<span class="ad-mission__num">Task 05 · INC-1058 · Medium</span>
<h4>The Hash That Repeats</h4>
<p><strong>Situation:</strong> As you read through the export, you notice that two accounts show the same hash value. Since the algorithm is the same, that can only mean the same input went in.</p>
<p><strong>Task:</strong> Name the other account whose hash matches <code>taylor.osei</code>.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for The Hash That Repeats" placeholder="account name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{jordan.ellis}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Because a hash is deterministic, two identical hashes mean two identical passwords.</p>
<ol>
<li>Read every row of <code>exported-hashes.txt</code>.</li>
<li>Find the hash value that appears twice.</li>
<li>Name the account that shares it with <code>taylor.osei</code>.</li>
<li>You already know the password behind that hash from the last task.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="riley.kwan|noah.kim">That account has its own hash. Find the one that matches taylor.osei exactly.</div>
<div class="ad-miss" data-guess="winter2026">That is the shared password. Name the account that reused it.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{jordan.ellis}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Identical hashes reveal password reuse without any cracking at all. That also means the password you recovered in the last task now opens both accounts, so an attacker who cracks one hash gets the second for free.</p>
</div>
<div>
<span>What to do</span>
<p>Reset both accounts, and report the reuse as a finding in its own right. If each password had been salted, the reuse would have stayed hidden, because the same password would then have hashed to two different values.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="cry-06" data-attempts="0">
<span class="ad-mission__num">Task 06 · INC-1058 · Medium</span>
<h4>Containing the Unsigned Mirror</h4>
<p><strong>Situation:</strong> By now you've shown that one mirror fails the published checksum and carries a build nobody signed. Your lead wants it off the share before anyone installs it, but kept somewhere it can still be reviewed.</p>
<p><strong>Task:</strong> Move the failing mirror from <code>C:\PurveX\Shares\IT</code> to <code>C:\PurveX\Quarantine</code>, then name the thing a trustworthy build carries that this one did not.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Containing the Unsigned Mirror" placeholder="one word" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{signature}" data-accept="digital signature|code signing|code signature">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Moving the file is the right call, because it keeps the file as evidence, whereas deleting it would destroy what a review still needs.</p>
<ol>
<li>On the domain controller, open PowerShell and change to <code>C:\PurveX\Shares\IT</code>.</li>
<li>Move the failing mirror with <code>Move-Item vpn-client-2.4.1-mirror-b.txt C:\PurveX\Quarantine</code>.</li>
<li>Confirm it is gone from the share and present in Quarantine.</li>
<li>Name what a genuine build carries that proves who made it, which the altered file no longer claimed.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="checksum|hash">A checksum tells you a file changed, not who made it. Name what proves the maker.</div>
<div class="ad-miss" data-guess="version">A version is a claim the altered file kept. Name the part that can be checked.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{signature}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A checksum proves a file hasn't changed since it was published, while a signature proves who published it. The altered mirror kept its version number but lost its signature, and that missing signature is the claim that would have failed a check.</p>
</div>
<div>
<span>What to do</span>
<p>With the file safely in quarantine for review, the lasting fix is to distribute only builds that carry a valid signature. And check the signature before the checksum, because a correct checksum of the wrong file will still pass.</p>
</div>
</div>
</div>
</div>
