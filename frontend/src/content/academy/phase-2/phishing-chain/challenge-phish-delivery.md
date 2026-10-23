<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>The Attachment PurveX Never Sent</h3>
<p class="ad-brief__ask">Can you spot the one file on a department share that was never supposed to be there?</p>
<p>The mail gateway flagged an attachment and pulled a copy onto the Wealth Management share for review before anyone opens it. Whoever sent it wanted it to look like a routine document. This is Delivery: the point in a real intrusion where the weapon actually reaches the target, before anything has run and before anyone has clicked anything.</p>
<p>Work it in your own lab. The file cannot run on its own; it is plain text standing in for the real thing.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 1 solved</span>
</div>

<div class="ad-mission ad-mission--capstone" data-id="dl-01" data-attempts="0">
<span class="ad-mission__num">Ticket 01 · INC-1074 · Medium</span>
<h4>Find the Disguise</h4>
<p><strong>IT Lead · Mail gateway flag · 8:45 AM</strong><br>One attachment on the Wealth Management share does not belong. Windows Explorer hides file extensions by default, which is exactly what this one is counting on.</p>
<p><strong>Task:</strong> Find the file in <code>C:\PurveX\Shares\WealthManagement</code> and report its full name, both extensions included.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Find the Disguise" placeholder="a file name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{q3_rebalance_summary.pdf.exe}" data-accept="q3 rebalance summary.pdf.exe">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A file ending in two extensions shows a program dressed as a document. Windows runs whatever the last one says, not the one in the middle of the name.</p>
<ol>
<li>Open File Explorer, go to the View tab, and tick File name extensions if it is not already on.</li>
<li>Open <code>C:\PurveX\Shares\WealthManagement</code> and read every file's full name.</li>
<li>Report the one with two extensions, exactly as it is written.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-ChildItem C:\PurveX\Shares\WealthManagement | Select-Object Name</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="q3_rebalance_summary.pdf">That is only the first extension, the one meant to be seen. Report the file's full name, exactly as Windows stores it.</div>
<div class="ad-miss" data-guess="portfolio-summary-sample.csv">That is the real department data already on this share. Find the file that does not belong.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{Q3_Rebalance_Summary.pdf.exe}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A double extension is one of the oldest tricks in the book, and it still works because Explorer hides extensions by default. Anyone who opened this expecting a PDF would have run a program instead. Whoever opened it is where Exploitation actually happens, the stage right after this one.</p>
</div>
</div>
</div>
</div>
