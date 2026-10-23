<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>A process-creation event tells you powershell.exe ran. It does not tell you what it actually did. Can you turn on the log that does?</p>
</div>

**Situation:** PowerShell is the single most common tool in a real intrusion after an attacker already has a foothold, precisely because it is already on every Windows machine and does almost anything. A process-creation event only ever shows that powershell.exe launched. It never shows what script or command it ran, which is the part that actually matters.

**Task:** Turn on PowerShell's own script-block logging, run a command, and find the exact text of what you ran preserved in the log.

**What you need:** Your hosted lab running, with the domain controller reachable the way every other exercise reaches it.

### Turn It On

This setting is off by default, the same way Process Creation auditing was off until you turned it on in an earlier ticket. Open PowerShell as an administrator and enable it.

```powershell
New-Item -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging" -Force | Out-Null
Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging" -Name "EnableScriptBlockLogging" -Value 1
```

This is the same registry key Group Policy writes when an administrator turns this setting on through the GUI instead.

### Run Something and Find It

Run a short command with a line you will recognize later.

```powershell
Write-Host "PurveX-script-logging-check"
```

Open Event Viewer and go to Applications and Services Logs → Microsoft → Windows → PowerShell → Operational.

<div class="ad-mission" data-id="la2-03" data-attempts="0">
<p><strong>Task:</strong> Find the event logging the command you just ran, with its full text. What event ID does PowerShell use to log the text of a script block?</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the event ID that logs script block text" placeholder="Event ID" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{4104}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>4104</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Open that event and your own line is sitting right in the Message field, exactly as you typed it. A process-creation event would have shown you that powershell.exe ran. Only this event shows you what it actually did.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="la2-06" data-attempts="0">
<p><strong>Task:</strong> Suppose a process-creation event instead showed <code>powershell.exe -EncodedCommand &lt;base64&gt;</code>. That event shows only the raw, still-encoded argument. Which log actually shows you the decoded, readable command PowerShell is about to run? Type its letter.<br><strong>A</strong> The process-creation event is enough on its own. Nothing else is needed.<br><strong>B</strong> Script-block logging (4104), since it logs PowerShell's own interpretation of the command after decoding, not just the raw text it launched with.<br><strong>C</strong> Neither log ever shows decoded content under any circumstance.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for which log shows the decoded command" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. Script-block logging (4104)</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A process-creation event hands you the command exactly as it was launched, obfuscation and all. Script-block logging hands you what PowerShell itself decoded that into right before running it. That difference is the entire reason this setting exists on top of process-creation auditing instead of replacing it.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="la2-04" data-attempts="0">
<p><strong>Task:</strong> An attacker who knows this logging exists sometimes encodes a command to make it harder to read in a 4104 event. What does script-block logging still capture even then? Type its letter.<br><strong>A</strong> Nothing useful, an encoded command defeats this logging completely.<br><strong>B</strong> The block still logs, encoded text and all, which is still far more than a process-creation event alone would ever show.<br><strong>C</strong> PowerShell refuses to run a command that is encoded.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what script-block logging still captures when a command is encoded" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. The block still logs, encoded text and all, which is still far more than a process-creation event alone would ever show</code></p>
</div>
<div>
<span>Why it matters</span>
<p>An encoded block is harder to read at a glance, but it is still there in full, waiting to be decoded. The evidence survives even when it is deliberately made uglier, which is the whole point of logging the content instead of just the fact that something ran.</p>
</div>
</div>
</div>
</div>

### Why It Matters

Most of what matters in a real intrusion happens inside the command, not in the fact that a process launched. This is the one setting that keeps the inside of the command instead of throwing it away.
