<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>An alert says a process ran. Can you build the same hunt an analyst runs from the command line, follow it from one suspicious line to the mechanism keeping it alive, and shut that mechanism down without destroying the evidence?</p>
</div>

**Situation:** A process name alone rarely tells you anything. `powershell.exe` runs thousands of times a day on a normal domain controller for completely ordinary reasons. What makes one launch worth a second look is its parent, its exact command line, and whatever keeps relaunching it, all of which Sysmon records for every process on this machine.

**Task:** Work this entirely from PowerShell on your domain controller. Query Sysmon for the suspicious process, find what keeps bringing it back, and contain it without deleting the evidence that shows what it was.

**What you need:** Your hosted lab running, with the domain controller reachable the way every other exercise reaches it. Sysmon is already installed.

### Build the Hunt Query

Event Viewer works, but an analyst who hunts the same thing twice writes the query instead of clicking through it by hand. Sysmon's Process Create events (Event ID 1) sit in their own log, and PowerShell can filter and parse them directly.

```powershell
$hits = Get-WinEvent -LogName "Microsoft-Windows-Sysmon/Operational" -FilterHashtable @{ Id = 1 } |
    Where-Object { $_.Message -match "WindowStyle Hidden" }
$xml = [xml]$hits[0].ToXml()
$xml.Event.EventData.Data | Where-Object Name -in "Image","ParentImage","CommandLine" | Select-Object Name, "#text"
```

That pulls every process-creation event, keeps the one whose command line tried to run with a hidden window, then parses its raw Sysmon XML for the three fields that matter: what ran, what launched it, and what it was told to do.

<div class="ad-mission" data-id="mw2-01" data-attempts="0">
<p><strong>Task:</strong> Run the query above and read the CommandLine field it returns. What remote address and port is the command trying to reach? Report it as address:port.</p>
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
<p>The process name told you almost nothing. The command line, pulled straight from the event's own XML instead of a GUI click-through, told you exactly where this is reaching and how often, which is the actual evidence an escalation needs.</p>
</div>
</div>
</div>
</div>

### Weigh the Parent

The ParentImage field your query returned is a system service hosting the task scheduler, not a person's own interactive session.

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

### Find What Keeps Bringing It Back

A single process-creation event does not explain why the same command runs again every 15 minutes with nobody typing it. Something on this box is scheduling it, and PowerShell can list every scheduled task's own action and arguments instead of opening Task Scheduler by hand.

```powershell
Get-ScheduledTask | Where-Object {
    $action = $_.Actions | Select-Object -First 1
    $action.Execute -eq "powershell.exe" -and $action.Arguments -match "Hidden"
} | Select-Object TaskName, State
```

That filter will not return just one result. This lab's own background sync task also runs PowerShell with a hidden window, and it is legitimate. Tell the two apart by what each one's Arguments actually say.

```powershell
(Get-ScheduledTask -TaskName "<each name the filter returned>").Actions.Arguments
```

One result runs `-File` against a real script on disk, with a name and a purpose you can go read. The other runs `-Command` with a single hardcoded address and port typed directly into the task, no file, no owner, no business reason anyone could name.

Once you have the suspicious one, confirm what lets its traffic out at all.

```powershell
Get-NetFirewallRule -Direction Outbound -Action Allow -Enabled True |
    Get-NetFirewallPortFilter | Where-Object RemotePort -eq 4444 |
    Get-NetFirewallRule | Select-Object DisplayName, Description
```

<div class="ad-mission" data-id="mw2-07" data-attempts="0">
<p><strong>Task:</strong> Run the scheduled-task query above and tell the two hidden-PowerShell tasks apart by their Arguments. Report the name of the one with no file and no owner, the one actually relaunching the command from the first step.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the suspicious scheduled task's name" placeholder="Task name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{WindowsDiagnosticsSync}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="purvex coach lab sync">That is this lab's own legitimate sync task. It runs a real file with a real purpose. Read the other task's Arguments instead.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>WindowsDiagnosticsSync</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A scheduled task that relaunches the same hardcoded command every 15 minutes, with no file and no owner behind it, is how an attacker keeps a foothold after the machine restarts. The firewall rule you found is what lets its traffic leave at all. Neither one looks suspicious alone next to this lab's own real sync task. Reading what each one's arguments actually say is what separates them.</p>
</div>
</div>
</div>
</div>

### Contain It Without Destroying the Evidence

You could delete the task outright, but that erases the configuration that proves what it was built to do. An analyst disables it instead, which stops it from ever firing again while leaving its action, trigger, and history in place for whoever investigates next.

```powershell
Disable-ScheduledTask -TaskName "WindowsDiagnosticsSync"
```

<div class="ad-mission ad-mission--capstone" data-id="mw2-02" data-attempts="0">
<p><strong>Task:</strong> Run the command above against the task you found, then check its new state from the command line with <code>(Get-ScheduledTask -TaskName "WindowsDiagnosticsSync").State</code>. Report what it says.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the task's state after disabling it" placeholder="State" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{disabled}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="ready|running">That is the state before you disabled it, or the task is still set to fire. Run Disable-ScheduledTask against it first, then check its state again.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>Disabled</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Unregister-ScheduledTask would have deleted the task's action, trigger, and history along with its ability to run, the exact record a later investigation needs to confirm what it was and how long it ran. Disabling it stops the persistence and keeps the proof.</p>
</div>
<div>
<span>What to do</span>
<p>Log what you found and disabled, including the address, the task name, and the firewall rule, so the next person does not have to hunt it all over again.</p>
</div>
</div>
</div>
</div>

### Why It Matters

An EDR alert hands you a process name. The process tree underneath it, the task keeping it alive, and the firewall rule letting it talk are where the actual decision gets made: ordinary administration, or something that needs to be contained right now, the way you just contained it, from the command line, without losing the evidence of what it was.
