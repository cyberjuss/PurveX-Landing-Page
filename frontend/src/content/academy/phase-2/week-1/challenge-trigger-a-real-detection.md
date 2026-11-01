<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Prove the Signature Match, Then Find Its Limit</h3>
<p class="ad-brief__ask">Antivirus works by matching a file against a library of known-bad signatures. Can you create a file real enough to prove it, and read the detection it triggers?</p>
<p>You cannot ethically create real malware to test a defense. Noor Ahmadi wants Windows Defender's coverage confirmed live, not assumed from a vendor datasheet. The antivirus industry solved that problem decades ago with the EICAR test file: a short, completely harmless text string that every antivirus engine is built to recognize and flag, on purpose, so PurveX Financial's defenders can prove detection actually works without touching anything dangerous. Create a real EICAR test file on your domain controller, let Windows Defender react to it, and read the exact detection it logs.</p>
<p>Your hosted lab needs to be running, with the domain controller reachable. Windows Defender is already on by default. Each step takes a short answer, and the hint unlocks after two misses.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 3 solved</span>
</div>

### Create the File

Open PowerShell on the domain controller and write the standard EICAR string to a file.

```powershell
'X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*' | Out-File -Encoding ascii C:\Users\Public\eicar-test.com
```

Watch what happens. Defender's real-time protection usually reacts within a second or two, often before the command even finishes.

### Confirm It, Either Way

If the file is gone a moment later, Defender already caught it on write. If it is still there, scan it directly.

```powershell
Start-MpScan -ScanType CustomScan -ScanPath "C:\Users\Public\eicar-test.com"
```

Either way, Defender logs what it found.

```powershell
Get-MpThreatDetection | Select-Object -First 1 -ExpandProperty ThreatName
```

<div class="ad-mission" data-id="mw2-03" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1134 · Low</span>
<p><strong>Task:</strong> Run the command above. What threat name does Windows Defender report for the file you just created?</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the threat name Defender reports" placeholder="Threat name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{eicar test file}" data-accept="virus:dos/eicar_test_file|eicar_test_file">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Run <code>Get-MpThreatDetection</code> exactly as shown and read the ThreatName property it prints.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="eicar">Give the full threat name Defender printed, not just the file's own common nickname.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>Virus:DOS/EICAR_Test_File</code></p>
</div>
<div>
<span>Why it matters</span>
<p>That is a real signature match, the exact mechanism the antivirus lesson described: your file's contents matched a known-bad pattern in Defender's library, instantly, with no behavior analysis needed at all.</p>
</div>
</div>
</div>
</div>

### Weigh Two Verdicts

<div class="ad-mission" data-id="mw2-05" data-attempts="0">
<span class="ad-mission__num">Ticket 02 · INC-1135 · Medium</span>
<p><strong>SOC Analyst · Triage Question · 11:40 AM</strong><br>A hash lookup on a suspicious file would also return VirusTotal's combined verdict from more than seventy engines at once. Suppose Defender alone had said "no threat found," but a VirusTotal lookup showed 68 of 70 engines flagging the same file.</p>
<p><strong>Task:</strong> Which verdict should an analyst trust more? Type its letter.<br><strong>A</strong> Defender alone, since it is the one actually installed on the endpoint.<br><strong>B</strong> The multi-engine result, since broad agreement across many independent engines is stronger evidence than any single engine's verdict.<br><strong>C</strong> Neither. An analyst should ignore both and reverse-engineer the file by hand.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for which verdict an analyst should trust more" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>One engine missing a file is ordinary. Think about what it means for sixty-eight separate, independent engines to agree.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">Being installed on the endpoint does not make one engine's signature library more complete than the combined judgment of seventy others.</div>
<div class="ad-miss" data-guess="c">Reverse-engineering every file by hand does not scale, and it ignores evidence that is already sitting right there in the lookup.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. The multi-engine result</code></p>
</div>
<div>
<span>Why it matters</span>
<p>One engine missing a file is normal, every signature library has gaps. Seventy independent engines missing the same file at once is a different story, which is exactly why a hash and reputation lookup is worth running even when your own local antivirus already came back clean.</p>
</div>
</div>
</div>
</div>

### Know the Limit

<div class="ad-mission ad-mission--capstone" data-id="mw2-04" data-attempts="0">
<span class="ad-mission__num">Ticket 03 · INC-1136 · Medium</span>
<p><strong>Security Architecture · Design Question · 1:00 PM</strong><br>PurveX Financial's security team is deciding whether signature-based antivirus alone is enough coverage. A real attacker rarely ships malware that exactly matches a known signature.</p>
<p><strong>Task:</strong> What does that mean for antivirus alone? Type its letter.<br><strong>A</strong> Nothing, antivirus catches everything a file-based threat can do.<br><strong>B</strong> A new or slightly altered file can pass straight through signature matching, which is why EDR watches behavior instead of only matching files.<br><strong>C</strong> Antivirus is obsolete and should be disabled.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what this means for antivirus alone" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>EICAR caught instantly because its signature is permanently, deliberately known in advance. A real attacker's file usually is not.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">EICAR only caught instantly because its signature was already known. A file nobody has seen before has no signature to match yet.</div>
<div class="ad-miss" data-guess="c">Catching known threats instantly, the way EICAR just did, is still real value. The gap is only for what is not known yet.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. A new or slightly altered file can pass straight through signature matching, which is why EDR watches behavior instead of only matching files</code></p>
</div>
<div>
<span>Why it matters</span>
<p>EICAR caught instantly because its signature is deliberately, permanently known. A real attacker counts on their file not being known yet, which is exactly the gap EDR's behavior watching exists to close.</p>
</div>
</div>
</div>
</div>

### Why It Matters

You just watched signature-based detection do exactly what it is built to do: catch something it already knows. The next lab in this week watches a process behave suspiciously instead, which is what catches the file it has never seen before.
