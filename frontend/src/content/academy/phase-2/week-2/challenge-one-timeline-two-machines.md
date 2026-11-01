<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>One Timeline, Two Machines</h3>
<p class="ad-brief__ask">An incident rarely stays on one machine. Can you read two different logs, on two different operating systems, and line them up into one account of what happened?</p>
<p>Every machine keeps its own log, in its own format, on its own clock. A PurveX Financial analyst who only ever reads one machine's log at a time misses the thing that actually matters about most real incidents: what happened on one machine right before or right after something happened on another. Sign in to both machines in your pod within the same few minutes, then find each sign-in in that machine's own log and read what each one actually recorded.</p>
<p>Your hosted lab needs to be running, with both machines reachable. Each step takes a short answer, and the hint unlocks after two misses.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 3 solved</span>
</div>

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
<span class="ad-mission__num">Hands-on · INC-1141 · Low</span>
<p><strong>Task:</strong> Read the Ubuntu log line for your SSH sign-in. Which process name does journalctl credit with accepting it?</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for which process accepted the SSH sign-in" placeholder="Process name" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{sshd}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The journalctl line names the process that accepted your connection right at the start of the line, before the message text.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="ssh">That is the client-side command name. The log credits the service that accepted the connection on the Ubuntu server.</div>
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

### Read a Pattern, Not Just an Event

<div class="ad-mission" data-id="la2-05" data-attempts="0">
<span class="ad-mission__num">Ticket 02 · INC-1142 · Medium</span>
<p><strong>SOC Queue · Baseline Review · 2:00 PM</strong><br>Your own DC sign-in and SSH session are both really you, minutes apart. Suppose the SOC instead saw the same pattern on jordan.ellis's account, which has never once shown a DC sign-in followed by an SSH session to the Ubuntu server before, not in weeks of history. Neither event alone looks unusual.</p>
<p><strong>Task:</strong> What does the pair together suggest? Type its letter.<br><strong>A</strong> Nothing. If each event is fine on its own, the pair is fine too.<br><strong>B</strong> The pair is more worth a second look than either event alone, since it is a pattern of movement across the pod that this account has never shown before.<br><strong>C</strong> Two separate machines' logs can never be analyzed together, only one at a time.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what an unfamiliar pattern across two machines suggests" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A baseline is not just what one event looks like normally. It is what a normal sequence of events looks like for one account.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">Each event looking fine alone is exactly why the pair needs a second look: neither log by itself shows the unfamiliar sequence.</div>
<div class="ad-miss" data-guess="c">You just read both logs together in this lab and lined up the timing yourself. It is possible, just not automatic.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. The pair together is worth a second look</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A baseline is not just what one event normally looks like. It is what a normal sequence of events looks like for one account. An account suddenly moving somewhere it has never gone before is exactly the kind of outlier a single machine's log can never show you on its own, because the other half of the pattern never happened on that machine.</p>
</div>
</div>
</div>
</div>

### Name What a Single Log Would Miss

<div class="ad-mission ad-mission--capstone" data-id="la2-02" data-attempts="0">
<span class="ad-mission__num">Ticket 03 · INC-1143 · Medium</span>
<p><strong>SOC Lead · Process Review · 2:30 PM</strong><br>A newer analyst asks why the team bothers checking both machines' logs at all when the domain controller already logs the sign-in.</p>
<p><strong>Task:</strong> You now have two real events, a few minutes apart, on two machines that trust each other. If an analyst only ever read the domain controller's log, what would they miss? Type its letter.<br><strong>A</strong> Nothing. The domain controller's log already contains everything that happens anywhere in the pod.<br><strong>B</strong> Whether the same person who signed in to the domain controller also reached the Ubuntu server around the same time, since that activity only exists in the Ubuntu server's own log.<br><strong>C</strong> The exact time of the domain controller sign-in, which only the Ubuntu log actually records.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what reading only one machine's log would miss" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>You read the SSH sign-in from the Ubuntu server's own journalctl output, not from Event Viewer on the domain controller.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">The SSH sign-in you just read lives only in the Ubuntu server's own journalctl output. The domain controller's log never saw it.</div>
<div class="ad-miss" data-guess="c">The domain controller's own log records its own sign-in's time directly, with no need for the Ubuntu log at all.</div>
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
