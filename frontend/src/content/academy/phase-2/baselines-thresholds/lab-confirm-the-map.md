<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Five services explain why a domain controller exists. Dozens more are actually running on it right now. Can you read the real list straight from the machine instead of settling for the five a lesson has room to teach?</p>
</div>

**Situation:** You just learned the five ports that explain what a domain controller is for: DNS, Kerberos, LDAP, SMB, RDP. That is the map a lesson can fit in one page. It is not the map the machine itself would give you if you asked.

**Task:** On your domain controller, list every port Windows reports as listening right now, confirm the five you just learned are really there, and read what else is running that the lesson never had room to mention.

**What you need:** Your hosted lab running, with the domain controller reachable through Guacamole the way every other exercise reaches it.

### Ask the Machine, Not the Lesson

Open PowerShell on the domain controller.

```powershell
Get-NetTCPConnection -State Listen | Sort-Object LocalPort | Select-Object LocalPort, OwningProcess | Format-Table -AutoSize
```

A lesson can tell you what a domain controller is for. Only the machine itself can tell you what it is actually running, right now, on your own pod. PowerShell is not asking you to remember anything. It is reading the machine's own state back to you.

Find the five ports you just learned: 53, 88, 389, 445, 3389. Each one should be in the list, because each one is a real service running on the machine right now.

### Read What the Lesson Left Out

A real domain controller listens on more than five ports. Scroll the rest of the list. You will see others too, maybe 135, 464, 636, 3268, or 9389. Each one is a real Windows service with its own job.

<div class="ad-mission" data-id="nm-01" data-attempts="0">
<p><strong>Task:</strong> Run the command above. Which port number is Kerberos ticket-checking confirmed listening on, right now, on your own domain controller?</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the port Kerberos listens on" placeholder="Port number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{88}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
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

<div class="ad-mission" data-id="nm-03" data-attempts="0">
<p><strong>Task:</strong> One extra port you likely saw is 9389. Every <code>Get-ADUser</code>, <code>Get-ADGroupMember</code>, and other AD PowerShell command you have run all course has to reach the directory somehow. What service listens on 9389, and why does it matter to you specifically? Type its letter.<br><strong>A</strong> Active Directory Web Services, which is what the PowerShell AD module actually talks to behind every one of those commands.<br><strong>B</strong> A second, backup DNS resolver.<br><strong>C</strong> A game server bundled with Windows Server by default.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what service listens on 9389" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{a}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
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

<div class="ad-mission ad-mission--capstone" data-id="nm-02" data-attempts="0">
<p><strong>Task:</strong> The real list has ports the lesson never named. What does that tell you about working from memory alone? Type its letter.<br><strong>A</strong> A lesson only has room to teach what matters most, not everything a machine actually runs.<br><strong>B</strong> Nothing. A lesson and the machine always match exactly.<br><strong>C</strong> Any port a lesson leaves out is a sign of compromise.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what the extra ports tell you" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{a}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
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
