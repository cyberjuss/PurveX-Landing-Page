<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>One Timeline, Two Machines</h3>
<p class="ad-brief__ask">An incident rarely stays on one machine. Can you line up two logs, two operating systems, into one account?</p>
<p>Hosted lab required, with both machines reachable.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 3 solved</span>
</div>

### Make Two Real Events

If you only ever read one machine's log, you'll miss whatever happened on another machine just before or just after. To see why, start by making some evidence of your own. Sign in to your domain controller the normal way, and then, separately, open a terminal session to the Ubuntu server.

You've now produced two real authentication events on two different machines, a few minutes apart. That's what an investigation looks like once it spreads beyond a single box.

### Read Each Machine's Own Account

Start with the domain controller. Open Event Viewer and find the 4624 (successful logon) event that your sign-in just produced.

Then switch to the Ubuntu server, open a terminal, and read the authentication log for your SSH session.

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
<p>Look at the start of the journalctl line. Before the message text begins, it names the process that accepted your connection.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="ssh">That's the command you ran on the client side. The log credits the service on the Ubuntu server that accepted the connection.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>sshd</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Windows records a logon against a Logon Type and a security subsystem, while Linux records it against a process name. Neither format is wrong, but you can only line the two up once you know what each side calls the same kind of event.</p>
</div>
</div>
</div>
</div>

### Read a Pattern, Not Just an Event

<div class="ad-mission" data-id="la2-05" data-attempts="0">
<span class="ad-mission__num">Ticket 02 · INC-1142 · Medium</span>
<p><strong>SOC Queue · Baseline Review · 2:00 PM</strong><br>Your DC sign-in and SSH session a few minutes later were both genuinely you. Now suppose the SOC saw that same pattern on jordan.ellis's account instead. In weeks of history, that account has never once signed in to the DC and then opened an SSH session to the Ubuntu server. Taken one at a time, neither event looks unusual.</p>
<p><strong>Task:</strong> What does the pair together suggest? Type its letter.<br><strong>A</strong> Nothing. If each event is fine on its own, the pair is fine too.<br><strong>B</strong> The pair is more worth a second look than either event alone, since it is a pattern of movement across the pod that this account has never shown before.<br><strong>C</strong> Two separate machines' logs can never be analyzed together, only one at a time.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what an unfamiliar pattern across two machines suggests" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Think of a baseline as more than what one event normally looks like. It also covers what a normal sequence of events looks like for a given account.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">Each event looking fine on its own is exactly why the pair needs a second look, because neither log by itself shows the unfamiliar sequence.</div>
<div class="ad-miss" data-guess="c">You've just read both logs in this lab and lined up the timing yourself. So it is possible. It doesn't happen automatically.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. The pair together is worth a second look</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A baseline covers more than what one event normally looks like. It also covers what a normal sequence of events looks like for one account. When an account suddenly goes somewhere it has never gone before, one machine's log cannot show you that. The other half of the pattern happened somewhere else.</p>
</div>
</div>
</div>
</div>

### Name What a Single Log Would Miss

<div class="ad-mission ad-mission--capstone" data-id="la2-02" data-attempts="0">
<span class="ad-mission__num">Ticket 03 · INC-1143 · Medium</span>
<p><strong>SOC Lead · Process Review · 2:30 PM</strong><br>A newer analyst asks why the team bothers checking both machines' logs at all when the domain controller already logs the sign-in.</p>
<p><strong>Task:</strong> You now have two real events, a few minutes apart, on two machines that trust each other. If an analyst only ever read the domain controller's log, what would they miss? Type its letter.<br><strong>A</strong> Nothing. The domain controller's log already contains everything that happens anywhere in the pod.<br><strong>B</strong> Whether the same person who signed in to the domain controller also reached the Ubuntu server around the same time, since that activity only exists in the Ubuntu server's own log.<br><strong>C</strong> The exact time of the domain controller sign-in, which only the Ubuntu log records.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what reading only one machine's log would miss" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Think back to where you found the SSH sign-in. You read it in the Ubuntu server's journalctl output, not in Event Viewer on the domain controller.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">The SSH sign-in you just read exists only in the Ubuntu server's journalctl output, so the domain controller's log never saw it.</div>
<div class="ad-miss" data-guess="c">The domain controller already records the time of its own sign-ins, so it doesn't need the Ubuntu log for that.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. Whether the same person who signed in to the domain controller also reached the Ubuntu server around the same time, since that activity only exists in the Ubuntu server's own log</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Nothing links the two events for you. An analyst has to read both logs and notice the timing, and that is the work a SIEM is built to speed up. It does not replace it.</p>
</div>
</div>
</div>
</div>

### Why It Matters

You worked with two machines and two log formats, and together they told one sequence of events. The habit to take from this lab will outlast any tool you use: before you decide what happened, check whether another machine's log holds the other half of the story.
