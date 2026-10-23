<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Antivirus works by matching a file against a library of known-bad signatures. Can you create a file real enough to prove it, and read the detection it triggers?</p>
</div>

**Situation:** You cannot ethically create real malware to test a defense. The antivirus industry solved that problem decades ago with the EICAR test file: a short, completely harmless text string that every antivirus engine is built to recognize and flag, on purpose, so defenders can prove detection actually works without touching anything dangerous.

**Task:** Create a real EICAR test file on your domain controller, let Windows Defender react to it, and read the exact detection it logs.

**What you need:** Your hosted lab running, with the domain controller reachable the way every other exercise reaches it. Nothing is installed. Windows Defender is already on by default.

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
<p><strong>Task:</strong> Run the command above. What threat name does Windows Defender report for the file you just created?</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the threat name Defender reports" placeholder="Threat name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{eicar test file}" data-accept="virus:dos/eicar_test_file|eicar_test_file">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
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

<div class="ad-mission" data-id="mw2-05" data-attempts="0">
<p><strong>Task:</strong> A hash lookup on this exact file would also return VirusTotal's combined verdict from more than seventy engines at once, the lesson's own number. Defender alone just gave you one engine's verdict. If Defender had said "no threat found" but a VirusTotal lookup showed 68 of 70 engines flagging the same file, which verdict should an analyst trust more? Type its letter.<br><strong>A</strong> Defender alone, since it is the one actually installed on the endpoint.<br><strong>B</strong> The multi-engine result, since broad agreement across many independent engines is stronger evidence than any single engine's verdict.<br><strong>C</strong> Neither. An analyst should ignore both and reverse-engineer the file by hand.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for which verdict an analyst should trust more" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
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

<div class="ad-mission ad-mission--capstone" data-id="mw2-04" data-attempts="0">
<p><strong>Task:</strong> A real attacker rarely ships malware that exactly matches a known signature. What does that mean for antivirus alone? Type its letter.<br><strong>A</strong> Nothing, antivirus catches everything a file-based threat can do.<br><strong>B</strong> A new or slightly altered file can pass straight through signature matching, which is why EDR watches behavior instead of only matching files.<br><strong>C</strong> Antivirus is obsolete and should be disabled.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what this means for antivirus alone" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
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
