<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Put the Right One to Work</h3>
<p class="ad-brief__ask">Can you pick the right transformation for a real design decision, then catch a teammate calling one by the wrong name?</p>
<p>Hosted lab required, with Firefox open on the Ubuntu desktop. Builds on the Tell Encoding, Hashing, and Encryption Apart challenge above.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 3 solved</span>
</div>

### Match the Job to the Tool

<div class="ad-mission" data-id="w2e-c3" data-attempts="0">
<span class="ad-mission__num">Ticket 03 · INC-1094 · Medium</span>
<p><strong>Engineering · Design Review · 11:00 AM</strong><br>PurveX Financial's engineering team is designing how the client portal stores login passwords. The server only ever needs to check a password against what it has on file; it never needs to read the original back.</p>
<p><strong>Task:</strong> Which of the three transformations fits that job? Type its letter.<br><strong>A</strong> Encoding.<br><strong>B</strong> Encryption.<br><strong>C</strong> Hashing.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for which transformation fits password storage" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{c}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The job never needs the original value back, only a way to confirm a guess matches it. One of the three has no reverse operation at all, by design.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">Encoding is reversible by anyone, since its rule is public. Storing a password that way lets anyone who reads it recover the real password.</div>
<div class="ad-miss" data-guess="b">Encryption needs a key kept somewhere, and whoever holds that key could read every password back. The job never needs the original at all.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>C. Hashing</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Hashing. The server stores the hash and compares against it, and never needs the original, so one-way is a feature.</p>
</div>
</div>
</div>
</div>

### Read a Real Value Cold

<div class="ad-mission" data-id="w2e-c4" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1095 · Low</span>
<p><strong>Task:</strong> You intercept the value <code>YWR2aXNvcnk=</code> in a log. Encoding, encryption or hashing? Type its letter.<br><strong>A</strong> Encoding.<br><strong>B</strong> Encryption.<br><strong>C</strong> Hashing.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what the intercepted value is" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{a}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>This is the exact value you produced in the challenge above. Drop it back into CyberChef with "From Base64" and see what comes out.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="b">An AES-encrypted value does not end in a trailing <code>=</code> the way this one does, and this string reverses with a single public operation.</div>
<div class="ad-miss" data-guess="c">A SHA2-256 hash is a fixed 64-character string. This value is shorter and reverses cleanly, which a hash never does.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>A. Encoding</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The trailing <code>=</code> and the character set mark it as Base64. You could read it in seconds, so treating it as encrypted would be a costly mistake.</p>
</div>
</div>
</div>
</div>

### Prove a Teammate Wrong

<div class="ad-mission ad-mission--capstone" data-id="w2e-c5" data-attempts="0">
<span class="ad-mission__num">Ticket 05 · INC-1096 · High</span>
<p><strong>SOC Queue · Data-Loss Alert · 3:30 PM</strong><br>An alert flags data leaving IT-WKS04, Priya Nair's workstation, that reads <code>cGF5bG9hZA==</code>. Teammate noor.ahmadi says it is encrypted and the firm cannot know what it is.</p>
<p><strong>Task:</strong> Decode it yourself and report the actual word.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the decoded word" placeholder="one word" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{payload}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The trailing <code>=</code> and the character set are the same tell as the value you decoded in the challenge above. Use the same recipe.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="advisory">That is the word from the challenge above, encoded differently. Decode this value on its own.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>payload</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The teammate was wrong, and you proved it in seconds with the same CyberChef recipe. Calling a Base64 string "encrypted" isn't a small mistake — it tells a manager the data is safe when anyone reading the log can already read it.</p>
</div>
</div>
</div>
</div>

### Why It Matters

Naming the right tool for a design decision and reading a strange value cold are the same skill, used two different ways. The next challenge in this set uses encryption for real, on an actual file.
