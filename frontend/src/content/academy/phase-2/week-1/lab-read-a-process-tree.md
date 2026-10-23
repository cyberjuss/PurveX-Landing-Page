<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>An alert says a process ran. Can you find what launched it, what it was told to do, and name the stage of an intrusion that behavior actually matches?</p>
</div>

**Situation:** A process name alone rarely tells you anything. `powershell.exe` runs thousands of times a day on a normal domain controller for completely ordinary reasons. What makes one launch worth a second look is its parent, and the exact command line it was handed, both of which Sysmon records for every process on this machine.

**Task:** On your domain controller, find a real process-creation event in Sysmon, read its parent and its command line, and name what it is actually doing.

**What you need:** Your hosted lab running, with the domain controller reachable the way every other exercise reaches it. Sysmon is already installed.

### Find the Event

Open Event Viewer on the domain controller and go to Applications and Services Logs → Microsoft → Windows → Sysmon → Operational. Filter for Event ID 1, Process Create.

Scroll until you find a `powershell.exe` launch with `-WindowStyle Hidden` in its command line. Read the ParentImage field above it and the full CommandLine field below it.

<div class="ad-mission" data-id="mw2-01" data-attempts="0">
<p><strong>Task:</strong> Read the CommandLine field on that event. What remote address and port is the command trying to reach? Report it as address:port.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the remote address and port" placeholder="address:port" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{203.0.113.77:4444}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>203.0.113.77:4444</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The process name told you almost nothing. The command line told you exactly where this is reaching and how often, which is the actual evidence an escalation needs.</p>
</div>
</div>
</div>
</div>

### Read the Parent, Not Just the Command

The ParentImage above your event is a system service hosting the task scheduler, not a person's own interactive session.

<div class="ad-mission" data-id="mw2-06" data-attempts="0">
<p><strong>Task:</strong> Suppose the exact same command line had a different ParentImage instead: <code>winword.exe</code>. What would that change about how you read this event? Type its letter.<br><strong>A</strong> Nothing. The command line is identical either way, so the story is the same.<br><strong>B</strong> It would suggest the process was spawned by a document someone opened, a very different initial-access story than a pre-existing scheduled task quietly persisting.<br><strong>C</strong> Word cannot launch PowerShell under any circumstance, so this would be impossible.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what a different parent process would change" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. A document someone opened, not a pre-existing task</code></p>
</div>
<div>
<span>Why it matters</span>
<p>An office application spawning PowerShell is one of the most common signs of a phishing attachment doing its job the moment it is opened, a completely different stage and a completely different response than a task that has already been sitting there for weeks. The command line told you what ran. The parent told you how it got there, and those are two different questions with two different answers.</p>
</div>
</div>
</div>
</div>

### Name the Stage

The same command runs again every 15 minutes, launched silently by the task scheduler rather than typed by a person, and it survives a reboot because the schedule itself does.

<div class="ad-mission ad-mission--capstone" data-id="mw2-02" data-attempts="0">
<p><strong>Task:</strong> A hidden process that relaunches itself on a schedule, without anyone typing a command, matches which Cyber Kill Chain stage? Type its letter.<br><strong>A</strong> Delivery, because a file had to arrive first.<br><strong>B</strong> Installation, because this is how an attacker keeps a foothold after the machine restarts.<br><strong>C</strong> Actions on Objectives, because it is the attacker's actual goal.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for which Kill Chain stage this matches" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. Installation</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A scheduled task that keeps relaunching the same command is a textbook persistence mechanism, the Installation stage's whole purpose. Delivery already happened earlier and left no trace in this event, and nothing here shows the attacker's actual end goal yet, only that they built a way to keep coming back.</p>
</div>
</div>
</div>
</div>

### Why It Matters

An EDR alert hands you a process name. The process tree underneath it, the parent that launched it and the exact arguments it ran with, is where the actual decision gets made: ordinary administration, or something that needs to be contained right now.
