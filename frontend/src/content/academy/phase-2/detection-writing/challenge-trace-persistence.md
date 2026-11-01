<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Build the Detection That Would Have Caught It</h3>
<p class="ad-brief__ask">You already read TRACE built end to end for Password Spraying. Can you build a second one yourself, for a technique your own lab already showed you, then prove it actually fires?</p>
<p>In Phase 2 Week 1 you found <code>WindowsDiagnosticsSync</code> by hand: a scheduled task on the domain controller relaunching a hidden PowerShell command every 15 minutes, reaching <code>203.0.113.77:4444</code>, with no file and no owner behind it. That is T1053.005, Scheduled Task. Microsoft Defender for Endpoint is the EDR this environment uses, and its process telemetry lives in <code>DeviceProcessEvents</code>. Build the five TRACE letters for this exact technique, one at a time, then test the finished query against two real-looking scenarios to prove it tells them apart.</p>
<p>Each step takes a short answer, and the hint unlocks after two misses. Nothing here runs against a live tenant; type the KQL exactly as asked.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 6 solved</span>
</div>

<div class="ad-mission" data-id="tr-01" data-attempts="0">
<span class="ad-mission__num">T · Technique · INC-1150 · Medium</span>
<p><strong>Detection Engineering · Theo Walsh · 10:00 AM</strong><br>Theo Walsh wants a standing detection for what you found by hand in Week 1, not another one-off manual hunt the next time it happens.</p>
<p><strong>Task:</strong> Name the ATT&CK technique ID this detection hunts. Use the same format as the lesson: <code>T####.###</code>.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the ATT&CK technique ID" placeholder="T####.###" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{t1053.005}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>You named this exact technique already, twice: once reading <code>WindowsDiagnosticsSync</code> in your own lab, once in the Credential Campaign's own scheduled-task finding.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="t1110.003|t1110.001">That is a credential-guessing technique from Phase 2 Week 1's own campaign, not what a relaunching scheduled task with no owner is.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>T1053.005</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Naming the technique before writing a line of KQL is what keeps a detection from becoming a fishing expedition. Once you know this hunts Scheduled Task persistence, you already know the shape of the evidence: a process, with a flag that hides its window, launching again and again from the same machine.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="tr-02" data-attempts="0">
<span class="ad-mission__num">R · Reference · INC-1150 · Medium</span>
<p><strong>Task:</strong> Scope the query to a reasonable time window. This evidence lives in Microsoft Defender for Endpoint's process table, <code>DeviceProcessEvents</code>; a relaunching task is checked over days, not hours. Type only the <code>where</code> clause for a 7-day window.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the Reference where clause" placeholder="where ..." autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{where timegenerated > ago(7d)}" data-accept="where timegenerated>ago(7d)">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The lesson's own Reference step scoped <code>SigninLogs</code> with <code>where TimeGenerated > ago(24h)</code>. Same shape, longer window.</p>
<p><code>ago()</code> takes a duration; this one needs days, not hours.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="ago(24h)">24 hours is right for Password Spraying's fast burst. A task relaunching every 15 minutes needs a window measured in days to show the pattern.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>where TimeGenerated &gt; ago(7d)</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A task that relaunches every 15 minutes shows up dozens of times a day, so a 7-day window catches the pattern even if nobody looks for a week. A 24-hour window, right for Password Spraying's fast burst, would be the wrong choice here: too short to show a steady pattern repeating over days.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="tr-03" data-attempts="0">
<span class="ad-mission__num">A · Aggregate · INC-1150 · Medium</span>
<p><strong>Task:</strong> Turn the raw events into the one count that matters: how many times a hidden-window PowerShell process launched, per device, per day. Filter to <code>powershell.exe</code> with <code>"Hidden"</code> in its command line, then write the <code>summarize</code> line, counting by device and day.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the Aggregate line" placeholder="summarize ..." autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{summarize launchcount = count() by devicename, bin(timegenerated, 1d)}" data-accept="summarize launchcount=count() by devicename,bin(timegenerated,1d)">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The lesson counted failed sign-ins per account per hour with <code>summarize FailedCount = count() by UserPrincipalName, bin(TimeGenerated, 1h)</code>. This one counts launches per device per day instead.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="dcount">A spray needed <code>dcount</code> to count distinct accounts hit from one source. This is the opposite shape: one device, counted plainly, not distinct anything.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>summarize LaunchCount = count() by DeviceName, bin(TimeGenerated, 1d)</code></p>
</div>
<div>
<span>Why it matters</span>
<p>One row per device per day, with a count, is what turns "a process launched" into "this process launched 96 times today on this one machine." That number is what Condition actually runs on next.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="tr-04" data-attempts="0">
<span class="ad-mission__num">C · Condition · INC-1150 · Medium</span>
<p><strong>Task:</strong> A task relaunching every 15 minutes produces roughly 96 hidden-window launches a day. An analyst running one script by hand a few times a day should never come close. The lesson's own Condition step named its threshold first with <code>let threshold = 5;</code>, then applied it with <code>where FailedCount > threshold</code>. Using 20 as the threshold here, type only the <code>let</code> line that names it.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the let threshold line" placeholder="let threshold = ...;" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{let threshold = 20;}" data-accept="let threshold=20;|let threshold=20">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>KQL's <code>let</code> statement needs its trailing semicolon, the same way the lesson's own example did.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="where launchcount > 20|where launchcount>20">That applies a threshold, but it never names one. Define it with <code>let</code> first, the way the lesson's own Condition step does.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>let threshold = 20;</code></p>
</div>
<div>
<span>Why it matters</span>
<p>20 is not a number borrowed from a blog post. It sits well under a true 15-minute relaunch (about 96 a day) and well above what a person manually running a script a handful of times would ever produce, the same reasoning the lesson used to justify 5 failed sign-ins an hour for Password Spraying. The rest of the query reads <code>where LaunchCount > threshold</code>, the same shape as the lesson's own <code>where FailedCount > threshold</code>.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="tr-05" data-attempts="0">
<span class="ad-mission__num">E · Escalation · INC-1150 · Medium</span>
<p><strong>Task:</strong> Decide what happens the moment this detection fires. A confirmed persistence mechanism already running against a domain controller is not routine, but it is not an active breach with a hand on the keyboard either. Type the priority and severity, as the lesson's own example used them: a letter and a word.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the escalation priority and severity" placeholder="P#, severity" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{p2, high}" data-accept="p2,high|p2 high">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The lesson escalated Password Spraying the same way: worked after any open P1, but not routine enough to wait for P3.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="p1, critical|p1 critical">P1 is for an active breach with confirmed access in progress. This is a confirmed foothold already sitting there, serious, but not that.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>P2, High</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Escalation is never KQL, the same way Technique never is. It is the judgment call, made in advance, that routes the alert and tells whoever works the queue how fast to move on it.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="tr-06" data-attempts="0">
<span class="ad-mission__num">Prove It · INC-1150 · High</span>
<p><strong>Detection Review · Theo Walsh · 11:00 AM</strong><br>Theo Walsh hands you two device summaries from the finished query's output and asks which one this detection actually fires on.<br><strong>WM-WKS07:</strong> 94 hidden-window <code>powershell.exe</code> launches today.<br><strong>IT-WKS02:</strong> 6 hidden-window <code>powershell.exe</code> launches today, all during a scripted patch run Alex Rivera kicked off by hand.</p>
<p><strong>Task:</strong> Which device does the finished query, threshold 20, actually fire on? Type its letter.<br><strong>A</strong> WM-WKS07 only.<br><strong>B</strong> IT-WKS02 only.<br><strong>C</strong> Both.<br><strong>D</strong> Neither.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for which device the detection fires on" placeholder="A, B, C, or D" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{a}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Run each number against <code>LaunchCount &gt; threshold</code> with threshold 20. 94 and 6 do not land the same way.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="b">6 is well under the threshold of 20. This detection does not fire on IT-WKS02.</div>
<div class="ad-miss" data-guess="c">Only one of the two counts actually clears 20. Check each against the threshold separately.</div>
<div class="ad-miss" data-guess="d">94 is well past the threshold of 20. This detection does fire, just not on both devices.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>A. WM-WKS07 only</code></p>
</div>
<div>
<span>Why it matters</span>
<p>94 clears the threshold of 20 by a wide margin; 6, a handful of runs during one visible, attributable patch job, does not come close. That gap is the whole point of Condition: a detection that fired on both would have buried WindowsDiagnosticsSync under Alex Rivera's own routine work the first week it ran. A detection built from a real baseline, not a guess, is what tells the two apart.</p>
</div>
</div>
</div>
</div>

### Why It Matters

The lesson built one detection for you, start to finish, for Password Spraying. Building a second one yourself, for a technique your own lab already handed you real evidence for, is what turns TRACE from something you read into something you can actually do the next time a vague alert needs a standing answer instead of another hour of manual hunting.
