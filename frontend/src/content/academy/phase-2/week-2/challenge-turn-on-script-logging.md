<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Keep What a Process Launch Alone Throws Away</h3>
<p class="ad-brief__ask">A process-creation event tells you powershell.exe ran, not what it did. Can you turn on the log that does?</p>
<p>Hosted lab required, with the domain controller reachable.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 3 solved</span>
</div>

### Turn It On

After the scheduled-task finding you reported, Alex Rivera wants script-block logging turned on across the domain, starting with your own machine. Like Process Creation auditing before you enabled it in an earlier ticket, this setting is off by default. Open PowerShell as an administrator and switch it on.

```powershell
New-Item -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging" -Force | Out-Null
Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging" -Name "EnableScriptBlockLogging" -Value 1
```

That's the same registry key Group Policy writes when an administrator turns the setting on through the GUI, so you're making exactly the change a policy would.

### Run Something and Find It

Next, run a short command containing a line you'll recognize when you see it again.

```powershell
Write-Host "PurveX-script-logging-check"
```

Now go looking for it. Open Event Viewer and go to Applications and Services Logs → Microsoft → Windows → PowerShell → Operational.

<div class="ad-mission" data-id="la2-03" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1144 · Low</span>
<p><strong>Task:</strong> Find the event logging the command you just ran, with its full text. What event ID does PowerShell use to log the text of a script block?</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the event ID that logs script block text" placeholder="Event ID" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{4104}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Check the events in the PowerShell Operational log from around the time you ran your command. One of them has your exact line in its Message field.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="4624|4625">Those are logon events, and they come from the Security log. Look in the PowerShell Operational log instead.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>4104</code></p>
</div>
<div>
<span>Why it matters</span>
<p>When you open that event, your own line is sitting in the Message field exactly as you typed it. A process-creation event would only have told you that powershell.exe ran, whereas this one shows you what it did.</p>
</div>
</div>
</div>
</div>

### Find What a Process-Creation Event Would Miss

<div class="ad-mission" data-id="la2-06" data-attempts="0">
<span class="ad-mission__num">Ticket 02 · INC-1145 · Medium</span>
<p><strong>SOC Analyst · Alert Review · 4:00 PM</strong><br>A process-creation event shows <code>powershell.exe -EncodedCommand &lt;base64&gt;</code>. All it records is the raw argument, still encoded.</p>
<p><strong>Task:</strong> Which log shows you the decoded, readable command PowerShell is about to run? Type its letter.<br><strong>A</strong> The process-creation event is enough on its own. Nothing else is needed.<br><strong>B</strong> Script-block logging (4104), since it logs PowerShell's own interpretation of the command after decoding, not just the raw text it launched with.<br><strong>C</strong> Neither log ever shows decoded content under any circumstance.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for which log shows the decoded command" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Think about what PowerShell has to do with a Base64 string before it can run it as a command.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">The process-creation event in the alert shows only the encoded argument, which you can't read, so it can't be the full picture.</div>
<div class="ad-miss" data-guess="c">PowerShell has to decode the command before it can run it, and that decoded text is what lands in the kind of event you read in the step above.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. Script-block logging (4104)</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A process-creation event gives you the command exactly as it was launched, obfuscation and all. Script-block logging gives you what PowerShell decoded it into just before running it. That difference is why this setting sits alongside process-creation auditing rather than replacing it.</p>
</div>
</div>
</div>
</div>

### Know What Survives Obfuscation

<div class="ad-mission ad-mission--capstone" data-id="la2-04" data-attempts="0">
<span class="ad-mission__num">Ticket 03 · INC-1146 · High</span>
<p><strong>Detection Engineering · Design Question · 4:15 PM</strong><br>An attacker who knows this logging exists Base64-encodes a command before running it, hoping to keep it unreadable.</p>
<p><strong>Task:</strong> What does script-block logging capture once PowerShell runs that command? Type its letter.<br><strong>A</strong> Nothing useful, an encoded command defeats this logging completely.<br><strong>B</strong> The decoded, plain-text command, since PowerShell has to decode it before it can run, and script-block logging captures what the engine executes.<br><strong>C</strong> PowerShell refuses to run a command that is encoded.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what script-block logging captures when a command is encoded" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>You worked through this same logic one question ago with the EncodedCommand argument, so apply that reasoning here.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">Encoding only disguises the command on its way in, so it can't stop logging from capturing what runs.</div>
<div class="ad-miss" data-guess="c">PowerShell runs Base64-encoded commands all the time. It's a normal feature, not something it refuses.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. The decoded, plain-text command</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Encoding only disguises a command on its way in. Once PowerShell decodes it so it can run, script-block logging writes down the decoded text, just as the previous question showed. Hiding a command behind Base64 doesn't keep it out of this log. It only delays the moment it becomes readable, and that moment is the one that matters.</p>
</div>
</div>
</div>
</div>

### Why It Matters

In a real intrusion, what matters most is usually what the command did, not the bare fact that a process launched. Script-block logging is the setting that keeps that part of the record instead of throwing it away.
