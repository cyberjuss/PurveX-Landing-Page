<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>An incident rarely stays on one machine. Can you read two different logs, on two different operating systems, and line them up into one account of what happened?</p>
</div>

**Situation:** Every machine keeps its own log, in its own format, on its own clock. An analyst who only ever reads one machine's log at a time misses the thing that actually matters about most real incidents: what happened on one machine right before or right after something happened on another.

**Task:** Sign in to both machines in your pod within the same few minutes, then find each sign-in in that machine's own log and read what each one actually recorded.

**What you need:** Your hosted lab running, with both machines reachable the way every other exercise reaches them.

### Make Two Real Events

Sign in to your domain controller the normal way. Then, separately, open a terminal session to the Ubuntu server.

You have just produced two real authentication events, on two different machines, within the same few minutes of each other. That is the shape of an investigation that actually spans an environment, not just one box.

### Read Each Machine's Own Account

On the domain controller, open Event Viewer and find the 4624 (successful logon) your sign-in just produced.

On the Ubuntu server, open a terminal and read the authentication log for your SSH session.

```bash
sudo journalctl -u ssh -n 20
```

<div class="ad-mission" data-id="la2-01" data-attempts="0">
<p><strong>Task:</strong> Read the Ubuntu log line for your SSH sign-in. Which process name does journalctl credit with accepting it?</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for which process accepted the SSH sign-in" placeholder="Process name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{sshd}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>sshd</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The Windows side credits a logon to a Logon Type and a security subsystem. The Linux side credits it to a process name instead. Neither format is wrong, but a correlation across the two only works once you know what each side actually calls the same kind of event.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="la2-02" data-attempts="0">
<p><strong>Task:</strong> You now have two real events, a few minutes apart, on two machines that trust each other. If an analyst only ever read the domain controller's log, what would they miss? Type its letter.<br><strong>A</strong> Nothing. The domain controller's log already contains everything that happens anywhere in the pod.<br><strong>B</strong> Whether the same person who signed in to the domain controller also reached the Ubuntu server around the same time, since that activity only exists in the Ubuntu server's own log.<br><strong>C</strong> The exact time of the domain controller sign-in, which only the Ubuntu log actually records.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what reading only one machine's log would miss" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. Whether the same person who signed in to the domain controller also reached the Ubuntu server around the same time, since that activity only exists in the Ubuntu server's own log</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Nothing links the two events automatically. An analyst has to go read both logs and notice the timing themselves, which is the actual work a SIEM is built to speed up, not replace.</p>
</div>
</div>
</div>
</div>

### Why It Matters

Two machines, two log formats, one real sequence of events. The habit this lab teaches outlasts any one tool: before you decide what happened, check whether another machine's log has the other half of the story.
