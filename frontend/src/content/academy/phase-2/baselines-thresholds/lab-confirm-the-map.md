<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>A diagram is a claim about a machine, not the machine itself. Can you confirm what Map Your Pod taught you by asking the domain controller directly, the way an administrator checks a diagram before trusting it?</p>
</div>

**Situation:** Map Your Pod turned your pod's ports into a diagram you built by dragging tasks onto the right numbers. That diagram is accurate, but you built it from the lesson's own words, not from the machine. On the job, nobody takes a diagram's word for what a server is actually running. They open the machine and ask it.

**Task:** On your domain controller, list every port Windows reports as listening right now and match it against the five ports Map Your Pod taught you.

**What you need:** Your hosted lab running, with the domain controller reachable through Guacamole the way every other exercise reaches it.

### Ask the Machine, Not the Diagram

Open PowerShell on the domain controller.

```powershell
Get-NetTCPConnection -State Listen | Sort-Object LocalPort | Select-Object LocalPort, OwningProcess | Format-Table -AutoSize
```

This is the same question Map Your Pod asked you to answer by memory and a drag-and-drop guess: what is this machine actually listening on, right now. The difference is that PowerShell is not asking you to remember anything. It is reading the machine's own state back to you.

Find the five ports the map taught: 53, 88, 389, 445, 3389. Each one should be in the list, because each one is a real service running on the machine right now.

### Read What the Map Left Out

A real domain controller listens on more than the five ports one lesson has room to teach. Scroll the rest of the list. You will see others too, maybe 135, 464, 636, 3268, or 9389. Each one is a real Windows service with its own job.

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
<p>Map Your Pod told you Kerberos was on 88. PowerShell just confirmed it from the machine's own state instead of asking you to trust the lesson.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="nm-02" data-attempts="0">
<p><strong>Task:</strong> The real list has ports the map never taught. What does that tell you about trusting a hand-drawn diagram alone? Type its letter.<br><strong>A</strong> A diagram only shows what someone chose to draw, not everything a machine actually runs.<br><strong>B</strong> Nothing. The diagram and the machine always match exactly.<br><strong>C</strong> Any port a diagram leaves out is a sign of compromise.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what the extra ports tell you" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{a}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>A. A diagram only shows what someone chose to draw, not everything a machine actually runs</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A baseline built from a lesson or a diagram is a starting point, not a ceiling. A real baseline comes from reading the machine, which is why the next lesson has you build one from your own pod's actual traffic.</p>
</div>
</div>
</div>
</div>

### Why It Matters

A map someone else drew is a guess until a real command confirms it. The habit this lab is really teaching is smaller than Kerberos or any one port: open the machine and ask, instead of trusting the picture of it.
