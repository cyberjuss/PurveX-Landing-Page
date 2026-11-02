<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Ask the Machine, Not the Lesson</h3>
<p class="ad-brief__ask">A lesson names five services. Can you read the real list straight off the machine?</p>
<p>Hosted lab required, with the domain controller reachable.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 3 solved</span>
</div>

### Ask the Machine, Not the Lesson

Priya Nair keeps asking what else is actually running on the domain controller, and "five ports" has never been a real answer. Open PowerShell on the domain controller.

```powershell
Get-NetTCPConnection -State Listen | Sort-Object LocalPort | Select-Object LocalPort, OwningProcess | Format-Table -AutoSize
```

A lesson can tell you what a domain controller is for. Only the machine itself can tell you what it is actually running, right now, on your own pod. PowerShell is not asking you to remember anything. It is reading the machine's own state back to you.

Find the five ports you just learned: 53, 88, 389, 445, 3389. Each one should be in the list, because each one is a real service running on the machine right now.

### Read What the Lesson Left Out

A real domain controller listens on more than five ports. Scroll the rest of the list. You will see others too, maybe 135, 464, 636, 3268, or 9389. Each one is a real Windows service with its own job.

<div class="ad-mission" data-id="nm-01" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1147 · Low</span>
<p><strong>Task:</strong> Run the command above. Which port number is Kerberos ticket-checking confirmed listening on, right now, on your own domain controller?</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the port Kerberos listens on" placeholder="Port number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{88}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>This is one of the five ports named in the briefing above. Find it in your own LocalPort column.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="389|445|53|3389">That is one of the other four ports from the briefing. Kerberos specifically is the one you are after.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>88</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The lesson told you Kerberos was on 88. PowerShell just confirmed it from the machine's own state instead of asking you to trust the lesson.</p>
</div>
</div>
</div>
</div>

### Name a Port You Depend On

<div class="ad-mission" data-id="nm-03" data-attempts="0">
<span class="ad-mission__num">Ticket 02 · INC-1148 · Low</span>
<p><strong>Self-Check · Baseline Review · 11:00 AM</strong><br>One extra port you likely saw in your own output is 9389. Every <code>Get-ADUser</code>, <code>Get-ADGroupMember</code>, and other AD PowerShell command you have run all course has to reach the directory somehow.</p>
<p><strong>Task:</strong> What service listens on 9389, and why does it matter to you specifically? Type its letter.<br><strong>A</strong> Active Directory Web Services, which is what the PowerShell AD module actually talks to behind every one of those commands.<br><strong>B</strong> A second, backup DNS resolver.<br><strong>C</strong> A game server bundled with Windows Server by default.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what service listens on 9389" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{a}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Every AD PowerShell cmdlet you have run since Week 1 had to reach the directory through some service. This port is that service.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="b">DNS runs on port 53, which you already confirmed earlier in this lab. 9389 is a different service entirely.</div>
<div class="ad-miss" data-guess="c">Nothing resembling a game server ships listening on a domain controller. Every port in this list is a real Windows service with a real job.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>A. Active Directory Web Services</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Every PowerShell AD cmdlet you have run since Week 1 depended on this exact port being open, whether you ever noticed it or not. A lesson only has room to name the ports that explain the big picture. The real list shows you the ones you have been relying on the whole time.</p>
</div>
</div>
</div>
</div>

### Draw the Conclusion

<div class="ad-mission ad-mission--capstone" data-id="nm-02" data-attempts="0">
<span class="ad-mission__num">Ticket 03 · INC-1149 · Low</span>
<p><strong>Self-Check · Baseline Review · 11:15 AM</strong><br>Your own port list came back with entries the lesson never named.</p>
<p><strong>Task:</strong> What does that tell you about working from memory alone? Type its letter.<br><strong>A</strong> A lesson only has room to teach what matters most, not everything a machine actually runs.<br><strong>B</strong> Nothing. A lesson and the machine always match exactly.<br><strong>C</strong> Any port a lesson leaves out is a sign of compromise.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what the extra ports tell you" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{a}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>You just found 9389 yourself, a real and legitimate service the five-port summary never mentioned.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="b">You just ran the command yourself and found ports the lesson's five-port list never named. They did not match exactly.</div>
<div class="ad-miss" data-guess="c">9389 is a real, legitimate Windows service, not a sign of compromise. An unnamed port is simply one a short lesson had no room for.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>A. A lesson only has room to teach what matters most</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A baseline built from memory is a starting point, not a ceiling. A real baseline comes from reading the machine, which is why the next lesson has you build one from your own pod's actual traffic instead of a list anyone memorized.</p>
</div>
</div>
</div>
</div>

### Why It Matters

Five ports explain what a domain controller is for. The real list explains what yours is actually doing. The habit this lab teaches is smaller than any one port: open the machine and ask, instead of working from what you remember.
