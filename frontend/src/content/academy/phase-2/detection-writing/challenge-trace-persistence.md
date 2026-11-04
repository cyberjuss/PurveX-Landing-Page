<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Build the Detection That Would Have Caught It</h3>
<p class="ad-brief__ask">You disabled <code>WindowsDiagnosticsSync</code> by hand in Week 1. The rule that let it call out is still open. Build the standing detection, then close what you left behind.</p>
<p>Hosted lab required, with the domain controller reachable.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 8 solved</span>
</div>

<div class="ad-mission" data-id="tr-01" data-attempts="0">
<span class="ad-mission__num">T · Technique · INC-1150 · Medium</span>
<p><strong>Detection Engineering · Theo Walsh · 10:00 AM</strong><br>You found this by hand in Week 1. Theo Walsh doesn't want another one-off manual hunt the next time it happens, so they want a standing detection for it.</p>
<p><strong>Task:</strong> Name the ATT&CK technique ID this detection hunts. Use the same format as the lesson: <code>T####.###</code>.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the ATT&CK technique ID" placeholder="T####.###" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{t1053.005}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>You've already named this technique twice, once while reading <code>WindowsDiagnosticsSync</code> in your own lab and again in the Credential Campaign's scheduled-task finding.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="t1110.003|t1110.001">That's a credential-guessing technique from Phase 2 Week 1's campaign. A scheduled task with no owner that keeps relaunching is a different technique.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>T1053.005</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Naming the technique before you write any KQL keeps the detection from becoming a fishing expedition. Once you know you're hunting Scheduled Task persistence, you already know the shape of the evidence: a process with a flag that hides its window, launching again and again on the same machine.</p>
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
<p>In the lesson's Reference step, you scoped <code>SigninLogs</code> with <code>where TimeGenerated > ago(24h)</code>. Use the same shape here, just with a longer window.</p>
<p><code>ago()</code> takes a duration, and this one needs to be measured in days rather than hours.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="ago(24h)">24 hours suits Password Spraying's fast burst. To show the pattern of a task relaunching every 15 minutes, you need a window measured in days.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>where TimeGenerated &gt; ago(7d)</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A task that relaunches every 15 minutes shows up dozens of times a day, so a 7-day window catches the pattern even if nobody looks for a week. The 24-hour window that suited Password Spraying's fast burst would be wrong here, because it's too short to show a steady pattern repeating over several days.</p>
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
<p>The lesson counted failed sign-ins per account per hour with <code>summarize FailedCount = count() by UserPrincipalName, bin(TimeGenerated, 1h)</code>. This time, you're counting launches per device per day.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="dcount">A spray needed <code>dcount</code> to count the distinct accounts hit from one source. This is the opposite shape, a single device with a plain count, so you aren't counting anything distinct.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>summarize LaunchCount = count() by DeviceName, bin(TimeGenerated, 1d)</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Getting one row per device per day, with a count, turns "a process launched" into "this process launched 96 times today on this one machine." That number is what Condition runs on in the next step.</p>
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
<p>Remember that KQL's <code>let</code> statement needs its trailing semicolon, just as it did in the lesson's example.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="where launchcount > 20|where launchcount>20">That applies a threshold without ever naming it. Define it with <code>let</code> first, the way the lesson's Condition step does.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>let threshold = 20;</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The 20 isn't borrowed from a blog post. It sits well below a true 15-minute relaunch, which comes to about 96 a day, and well above anything a person running a script by hand a few times would produce. That's the same reasoning the lesson used to justify 5 failed sign-ins an hour for Password Spraying. The rest of the query then reads <code>where LaunchCount > threshold</code>, matching the lesson's <code>where FailedCount > threshold</code>.</p>
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
<p>Think back to how the lesson escalated Password Spraying. It was worked after any open P1, but it wasn't routine enough to wait for P3.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="p1, critical|p1 critical">P1 is reserved for an active breach with confirmed access in progress. What you have here is a foothold that's already sitting there, which is serious, but it isn't that.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>P2, High</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Like Technique, Escalation is never KQL. It's a judgment call you make in advance, and it routes the alert and tells whoever works the queue how quickly to act on it.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="tr-06" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1150 · Medium</span>
<p><strong>Task:</strong> You picked a 7-day window and a threshold of 20 from reasoning alone. Now check the real task. On your own domain controller, run <code>(Get-ScheduledTask -TaskName "WindowsDiagnosticsSync").Triggers.Repetition.Interval</code>. It returns an ISO 8601 duration like <code>PT15M</code>. Type the number of minutes it represents.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the real repetition interval in minutes" placeholder="a number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{15}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The task object itself still exists, because disabling it in Week 1 removed only its ability to fire, not its definition. Read <code>PT15M</code> as a Period of Time of 15 Minutes.</p>
<ol>
<li>Open PowerShell on the domain controller.</li>
<li><code>Get-ScheduledTask -TaskName "WindowsDiagnosticsSync"</code> confirms it is still there and now Disabled.</li>
<li><code>.Triggers.Repetition.Interval</code> reads the schedule straight off that trigger.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="pt15m">That's the raw ISO 8601 value. Strip the wrapper and report just the number of minutes it names.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>15</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Until now, every number in this detection came from reasoning about what seemed defensible. This one came straight from the task's definition on your own machine. That means the 7-day window and the threshold of 20 are no longer guesses. They're sized against a real 15-minute interval that produces about 96 launches a day, just as an analyst would size them against a vendor's documented schedule rather than a hunch.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="tr-07" data-attempts="0">
<span class="ad-mission__num">Prove It · INC-1150 · High</span>
<p><strong>Detection Review · Theo Walsh · 11:00 AM</strong><br>Theo Walsh hands you two device summaries from the finished query's output and asks which one this detection actually fires on.<br><strong>WM-WKS07:</strong> 94 hidden-window <code>powershell.exe</code> launches today.<br><strong>IT-WKS02:</strong> 6 hidden-window <code>powershell.exe</code> launches today, all during a scripted patch run Alex Rivera kicked off by hand.</p>
<p><strong>Task:</strong> Which device does the finished query, threshold 20, actually fire on? Type its letter.<br><strong>A</strong> WM-WKS07 only.<br><strong>B</strong> IT-WKS02 only.<br><strong>C</strong> Both.<br><strong>D</strong> Neither.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for which device the detection fires on" placeholder="A, B, C, or D" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{a}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Test each number against <code>LaunchCount &gt; threshold</code>, with the threshold set to 20. You'll find that 94 and 6 land differently.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="b">6 is well under the threshold of 20, so this detection doesn't fire on IT-WKS02.</div>
<div class="ad-miss" data-guess="c">Only one of the two counts clears 20. Check each one against the threshold separately.</div>
<div class="ad-miss" data-guess="d">94 is well past the threshold of 20, so the detection does fire, just not on both devices.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>A. WM-WKS07 only</code></p>
</div>
<div>
<span>Why it matters</span>
<p>94 clears the threshold of 20 by a wide margin. The 6, a handful of runs during one visible patch job with a known owner, doesn't come close. That gap is the whole point of Condition. A detection that fired on both would have buried WindowsDiagnosticsSync under Alex Rivera's routine work in its very first week. Because this one is built from a real baseline rather than a guess, it can tell the two apart.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="tr-08" data-attempts="0">
<span class="ad-mission__num">Close What's Still Open · INC-1150 · High</span>
<p><strong>Detection Review · Theo Walsh · 11:10 AM</strong><br>Disabling <code>WindowsDiagnosticsSync</code> in Week 1 stopped the task, but it never touched the outbound rule that let it reach <code>203.0.113.77:4444</code> in the first place. That rule is still enabled on your domain controller right now.</p>
<p><strong>Task:</strong> Find the outbound rule named <code>Windows Update Assistant Network</code> and disable it, then run <code>Get-NetFirewallRule -DisplayName "Windows Update Assistant Network" | Select-Object Enabled</code> and type what it now reports.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the firewall rule's Enabled state after disabling it" placeholder="True or False" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{false}" data-accept="disabled">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A detection tells you something is happening, but it doesn't stop it. Those are two different jobs, and this ticket stays open until you do the second one yourself.</p>
<ol>
<li><code>Get-NetFirewallRule -DisplayName "Windows Update Assistant Network" | Disable-NetFirewallRule</code></li>
<li>Confirm it with <code>Get-NetFirewallRule -DisplayName "Windows Update Assistant Network" | Select-Object DisplayName, Enabled</code>.</li>
</ol>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="true|enabled">That's the state from before you disabled it. Run <code>Disable-NetFirewallRule</code> against the rule first, then check Enabled again.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>False</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A standing KQL detection and a disabled task both leave the door itself unlocked. The rule that let <code>WindowsDiagnosticsSync</code> reach out was never part of the Week 1 fix, so it stayed open through every mission in this challenge until you closed it just now. Writing the detection was the engineering half of this ticket, and closing the rule is what actually ends it.</p>
</div>
</div>
</div>
</div>

### Why It Matters

In the lesson, you watched one detection get built from start to finish for Password Spraying. Here you built a second one yourself, for a technique your own lab had already given you real evidence of. That's what turns TRACE from something you've read into something you can do the next time a vague alert needs a standing answer instead of another hour of manual hunting. And because you pulled the real 15-minute interval from your own task and closed the rule it depended on, this was real detection work, not just a KQL exercise with a story around it.
