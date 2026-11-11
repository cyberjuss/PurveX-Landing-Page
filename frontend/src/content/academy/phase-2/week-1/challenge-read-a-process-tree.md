<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Follow the Process Tree to What Keeps It Alive</h3>
<p class="ad-brief__ask">An alert says a process ran. Can you hunt it to what keeps it alive, and shut that down without destroying the evidence?</p>
<p>Hosted lab required, with the domain controller reachable. Sysmon is installed.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 4 solved</span>
</div>

### Build the Hunt Query

Theo Walsh escalated this one from Tier 2 with a reminder worth keeping. A process name on its own rarely tells you much, but its parent and its command line usually do. Sysmon records every new process as a Process Create event (Event ID 1) in its own log, and PowerShell can filter and read those events directly.

```powershell
$hits = Get-WinEvent -LogName "Microsoft-Windows-Sysmon/Operational" -FilterHashtable @{ Id = 1 } |
    Where-Object { $_.Message -match "WindowStyle Hidden" }
$xml = [xml]$hits[0].ToXml()
$xml.Event.EventData.Data | Where-Object Name -in "Image","ParentImage","CommandLine" | Select-Object Name, "#text"
```

The query pulls every process-creation event and keeps only the ones whose command line asked for a hidden window. From there, it reads each event's raw Sysmon XML and prints the three fields that matter: what ran, what launched it, and what it was told to do.

<div class="ad-mission" data-id="mw2-01" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1137 · Medium</span>
<p><strong>Task:</strong> Run the query above and read the CommandLine field it returns. What remote address and port is the command trying to reach? Report it as address:port.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the remote address and port" placeholder="address:port" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{203.0.113.77:4444}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Look at the CommandLine field your query printed. Somewhere in it, a network connection is written out in full, with the address and port together.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="4444">That is only the port. Report the full address and port together, as address:port.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>203.0.113.77:4444</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Notice how little the process name told you on its own. The command line, read straight from the event's XML, told you exactly where this process is reaching and how often, and that's the evidence an escalation actually needs.</p>
</div>
</div>
</div>
</div>

### Weigh the Parent

Now look at the ParentImage field your query returned. It points to the system service that hosts the task scheduler, which means no person launched this from their own session.

<div class="ad-mission" data-id="mw2-06" data-attempts="0">
<span class="ad-mission__num">Ticket 02 · INC-1138 · Medium</span>
<p><strong>SOC Analyst · Alert Triage · 10:20 AM</strong><br>A second alert comes in with the exact same PowerShell command line as before, but a different ParentImage: <code>winword.exe</code>.</p>
<p><strong>Task:</strong> What would that change about how you read this event? Type its letter.<br><strong>A</strong> Nothing. The command line is identical either way, so the story is the same.<br><strong>B</strong> It would suggest the process was spawned by a document someone opened, a very different initial-access story than a pre-existing scheduled task quietly persisting.<br><strong>C</strong> Word cannot launch PowerShell under any circumstance, so this would be impossible.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what a different parent process would change" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Keep the two fields apart. The command line tells you what ran, while the parent tells you how it got there.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">The ParentImage is a different field from CommandLine, and it answers a different question: how the process got launched, not what it was told to do.</div>
<div class="ad-miss" data-guess="c">Office applications spawning PowerShell is a real, common pattern, not an impossibility. It is one of the clearest signs of a malicious document.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. A document someone opened, not a pre-existing task</code></p>
</div>
<div>
<span>Why it matters</span>
<p>When an office application spawns PowerShell, it's usually a phishing attachment doing its job the moment someone opens it. That's a much earlier stage of an attack than a task that has been sitting on the box for weeks, and it calls for a different response. So even with an identical command line, the parent changes the story, because it answers a different question.</p>
</div>
</div>
</div>
</div>

### Find What Keeps Bringing It Back

One process-creation event still doesn't explain why the same command runs again every 15 minutes with nobody typing it. Something on this box must be scheduling it, and rather than clicking through Task Scheduler, you can have PowerShell list every scheduled task along with its action and arguments.

```powershell
Get-ScheduledTask | Where-Object {
    $action = $_.Actions | Select-Object -First 1
    $action.Execute -eq "powershell.exe" -and $action.Arguments -match "Hidden"
} | Select-Object TaskName, State
```

Expect more than one result here. This lab's own background sync task also runs PowerShell with a hidden window, and that one is legitimate. Tell the two apart by reading each task's Arguments.

```powershell
(Get-ScheduledTask -TaskName "<each name the filter returned>").Actions.Arguments
```

One result runs `-File` against a real script on disk, with a name and a purpose you can go and read. The other uses `-Command` with an address and port typed straight into the task, and there's no file, no owner and no business reason anyone could name.

Once you've picked out the suspicious task, the next question is how its traffic is getting out at all.

```powershell
Get-NetFirewallRule -Direction Outbound -Action Allow -Enabled True |
    Get-NetFirewallPortFilter | Where-Object RemotePort -eq 4444 |
    Get-NetFirewallRule | Select-Object DisplayName, Description
```

<div class="ad-mission" data-id="mw2-07" data-attempts="0">
<span class="ad-mission__num">Ticket 03 · INC-1139 · High</span>
<p><strong>SOC Analyst · Persistence Hunt · 10:35 AM</strong><br>The same command relaunches every 15 minutes with nobody typing it. Something on this box is scheduling it.</p>
<p><strong>Task:</strong> Run the scheduled-task query above and tell the two hidden-PowerShell tasks apart by their Arguments. Report the name of the one with no file and no owner, the one relaunching the command from the first step.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the suspicious scheduled task's name" placeholder="Task name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{WindowsDiagnosticsSync}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Compare the Arguments. One task points to a real <code>-File</code> on disk that has a name and a purpose, while the other hardcodes <code>-Command</code> with an address and port and nothing else.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="purvex coach lab sync">That one is this lab's own legitimate sync task, and it runs a real file with a real purpose. Take a look at the other task's Arguments instead.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>WindowsDiagnosticsSync</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A scheduled task that relaunches the same hardcoded command every 15 minutes, with no file and no owner behind it, is persistence. It's how an attacker holds on to a machine after a restart. The firewall rule you found is what lets that traffic leave. Next to the lab's real sync task, neither one looks suspicious at a glance, which is why reading the arguments is what separates them.</p>
</div>
</div>
</div>
</div>

### Contain It Without Destroying the Evidence

It's tempting to delete the task outright, but that would erase the configuration that proves what it was built to do. Instead, an analyst disables it. That stops it from firing again while leaving its action, trigger and history in place for whoever investigates next.

```powershell
Disable-ScheduledTask -TaskName "WindowsDiagnosticsSync"
```

<div class="ad-mission ad-mission--capstone" data-id="mw2-02" data-attempts="0">
<span class="ad-mission__num">Ticket 04 · INC-1140 · High</span>
<p><strong>SOC Analyst · Containment · 10:45 AM</strong><br>You have the address, the task name, and the firewall rule letting it talk. Now contain it without destroying the evidence.</p>
<p><strong>Task:</strong> Run the command above against the task you found, then check its new state from the command line with <code>(Get-ScheduledTask -TaskName "WindowsDiagnosticsSync").State</code>. Report what it says.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the task's state after disabling it" placeholder="State" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{disabled}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Order matters here. Run <code>Disable-ScheduledTask</code> against the task first, and only after that check its State property again.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="ready|running">That state means the task is still set to fire, so it hasn't been disabled yet. Run Disable-ScheduledTask against it first, then check its state again.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>Disabled</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Unregister-ScheduledTask would have stopped the task too, but it would also have deleted its action, trigger and history. That's the very record a later investigation needs to confirm what the task was and how long it ran. Disabling it stops the persistence and keeps the proof.</p>
</div>
<div>
<span>What to do</span>
<p>Before you move on, log three things: the address, the task name, and the firewall rule. That way, the next person won't have to hunt it all down again.</p>
</div>
</div>
</div>
</div>

### Why It Matters

An EDR alert only hands you a process name. The real decision comes from what sits underneath it: the process tree, the task keeping it alive and the firewall rule letting it talk. Those tell you whether you're looking at ordinary administration or something that needs containing right now. When it's the second, you contain it the way you just did, from the command line and without losing the evidence of what it was.
