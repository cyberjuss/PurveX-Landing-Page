<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Prove the Signature Match, Then Find Its Limit</h3>
<p class="ad-brief__ask">Antivirus matches files against known signatures. Can you create one real enough to trigger an alert, and read it?</p>
<p>Hosted lab required, with the domain controller reachable. Defender is on by default.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 3 solved</span>
</div>

### Create the File

Noor Ahmadi wants proof that Windows Defender is working, not just switched on. The industry's standard way to check that safely is the EICAR test file, a harmless string that every antivirus product agrees to treat as malware. Open PowerShell on the domain controller and write it to a file.

```powershell
'X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*' | Out-File -Encoding ascii C:\Users\Public\eicar-test.com
```

Now watch closely. Defender's real-time protection usually reacts within a second or two, and often it acts before the command has even finished.

### Confirm It, Either Way

Check whether the file is still there. If it has already disappeared, Defender caught it the moment it was written. If it's still sitting there, scan it directly so Defender gets a look at it.

```powershell
Start-MpScan -ScanType CustomScan -ScanPath "C:\Users\Public\eicar-test.com"
```

Whichever way it went, Defender keeps a record of what it found, and that record is what you'll read next.

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
<p>What you just saw is a real signature match, the same mechanism the antivirus lesson described. Your file's contents matched a known-bad pattern in Defender's library, so the verdict came instantly, without any need to watch how the file behaved.</p>
</div>
</div>
</div>
</div>

### Weigh Two Verdicts

<div class="ad-mission" data-id="mw2-05" data-attempts="0">
<span class="ad-mission__num">Ticket 02 · INC-1135 · Medium</span>
<p><strong>SOC Analyst · Triage Question · 11:40 AM</strong><br>A hash lookup on a suspicious file would also return VirusTotal's combined verdict from more than seventy engines at once. Suppose Defender alone had said "no threat found," but a VirusTotal lookup showed 68 of 70 engines flagging the same file.</p>
<p><strong>Task:</strong> Which verdict should an analyst trust more? Type its letter.<br><strong>A</strong> Defender alone, since it is the one installed on the endpoint.<br><strong>B</strong> The multi-engine result, since broad agreement across many independent engines is stronger evidence than any single engine's verdict.<br><strong>C</strong> Neither. An analyst should ignore both and reverse-engineer the file by hand.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for which verdict an analyst should trust more" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>One engine missing a file happens all the time. So ask yourself what it means when sixty-eight separate engines, built independently, all agree.</p>
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
<p>One engine missing a file is normal, because every signature library has gaps. When sixty-eight independent engines flag the same file, though, the lone clean verdict is the one to doubt. That's why a hash and reputation lookup is worth running even after your own antivirus has come back clean.</p>
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
<p>EICAR was caught instantly because its signature is known in advance, on purpose. Ask yourself whether the same is true of a real attacker's file.</p>
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
<p>EICAR was caught instantly because its signature is known on purpose. A real attacker is counting on the opposite, a file nobody has catalogued yet. Closing that gap is what EDR is for, because it watches what a program does rather than what it looks like.</p>
</div>
</div>
</div>
</div>

### Why It Matters

You've just watched signature-based detection do exactly what it was built to do, which is catch something it already knows. In the next lab, you'll come at it from the other side and watch a process behave suspiciously, because behavior is what catches the file nobody has seen before.
