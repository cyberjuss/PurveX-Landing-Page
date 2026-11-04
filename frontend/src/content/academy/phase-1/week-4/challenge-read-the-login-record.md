<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Produce the Record, Then Read It</h3>
<p class="ad-brief__ask">Every time someone proves who they are, a record gets written. Can you make one, find it, and tell a success from a failure?</p>
<p>Hosted lab required, with a terminal open on the Ubuntu desktop.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 4 solved</span>
</div>

### Before You Start

Make a prediction for each of these before you type anything. Nothing gets marked here, and the log will show you whether you were right.

<div class="ad-check ad-check--predict" data-check="w4e-p1">
<p class="ad-check__q">You type the wrong password for a sudo command. Is that attempt written down anywhere?</p>
<button type="button" class="ad-check__opt" data-i="0">No, only successful logins are recorded</button>
<button type="button" class="ad-check__opt" data-i="1">Yes, the failed attempt is logged</button>
<p class="ad-check__note">Got it. You'll go and find your own failed attempt in a moment.</p>
</div>

<div class="ad-check ad-check--predict" data-check="w4e-p2">
<p class="ad-check__q">In an investigation, which is usually the more interesting line?</p>
<button type="button" class="ad-check__opt" data-i="0">A single successful login</button>
<button type="button" class="ad-check__opt" data-i="1">A run of failures, then a success</button>
<p class="ad-check__note">Got it. You'll produce exactly this shape and read it back.</p>
</div>

<div class="ad-check ad-check--predict" data-check="w4e-p3">
<p class="ad-check__q">Does a failed authentication tell you the account exists?</p>
<button type="button" class="ad-check__opt" data-i="0">Always, a failure means the account is real</button>
<button type="button" class="ad-check__opt" data-i="1">Not on its own, the password was simply wrong</button>
<p class="ad-check__note">Got it. Keep this one in mind, because it matters for how you read a log.</p>
</div>

### Produce a Failure

In a log, a break-in often looks like a run of failures followed by one success, so that's the pattern you're going to create. Open a terminal on the Ubuntu desktop. First, clear any remembered sudo session, and then run a command as root and type the wrong password on purpose.

```bash
sudo -k
sudo true
```

When it asks for a password, type something wrong three times, until it gives up with "3 incorrect password attempts". You've just created a failed authentication, and it's now sitting in the log.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-4/PLACEHOLDER-sudo-fail.png" alt="Terminal showing three incorrect password attempts for a sudo command" />
<figcaption>Screenshot 1. [ADD IMAGE] A failed authentication, on purpose.</figcaption>
</figure>
</div>

### Produce a Success

Now run the same command again, and this time type your real password.

```bash
sudo true
```

It returns without any message, which means it worked. That success is in the log too, right after the failures.

### Read the Record

Since the system log holds both, let's read the recent authentication lines.

```bash
sudo journalctl -e _COMM=sudo
```

Scroll to the end, and you'll see your failed attempts marked `authentication failure`, followed by a line showing that a session was opened for root. The failures and the success sit together, each with a time, and reading them side by side like that is exactly what an analyst does.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-4/PLACEHOLDER-journal-auth.png" alt="journalctl output showing authentication failure lines followed by a successful session opened line" />
<figcaption>Screenshot 2. [ADD IMAGE] The failures and the success, in order.</figcaption>
</figure>
</div>

### The Same Thing on Windows

Windows records the same kinds of events, using numbers that every analyst learns. On a domain controller, you'd open Event Viewer and read the Security log, where two numbers matter most:

* **4624** is a successful logon.
* **4625** is a failed logon.

So a burst of 4625 events followed by a 4624 for the same account is the Windows version of what you just created on Linux. The log lives in a different place, and the events have numbers rather than words, but the story they tell is the same.

### Check Yourself

Answer based on what you actually saw, rather than on what you remember reading.

<div class="ad-mission" data-id="w4e-c1" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1118 · Low</span>
<p><strong>Task:</strong> Was your failed sudo attempt recorded in the log? Type its letter.<br><strong>A</strong> No, only the success was.<br><strong>B</strong> Yes, the failures were logged with the success.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for whether the failed sudo attempt was recorded" placeholder="A or B" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Scroll a few lines further up from the "session opened" line in your journalctl output, and look at what's just above it.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">Scroll further up in your journalctl output. The three "authentication failure" lines are right above the success.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. Yes, failures are logged too</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Both are recorded. In fact, failed authentication is often the more useful of the two, because a run of failures is the first sign that someone is trying to get in.</p>
</div>
</div>
</div>
</div>

### Name the Windows Event ID

<div class="ad-mission" data-id="w4e-c2" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1119 · Low</span>
<p><strong>Task:</strong> On a Windows domain controller, which Event ID is a failed logon? Type its letter.<br><strong>A</strong> 4625.<br><strong>B</strong> 4624.<br><strong>C</strong> 3389.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for which event ID is a failed logon" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{a}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Look back at "The Same Thing on Windows" above, where the success and the failure are listed right next to each other.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="b">4624 is the successful logon, the Windows twin of what your sudo success wrote to the Linux log.</div>
<div class="ad-miss" data-guess="c">3389 is a port number, RDP's, not an Event ID. Look at the two numbers listed in "The Same Thing on Windows."</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>A. 4625</code></p>
</div>
<div>
<span>Why it matters</span>
<p>4625 is a failed logon, and 4624 is a success. It's worth memorizing these two, because they come up in almost every SOC interview.</p>
</div>
</div>
</div>
</div>

### Read a Burst of Failures

<div class="ad-mission" data-id="w4e-c3" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1120 · Low</span>
<p><strong>Task:</strong> You find forty failed logons for one account, then one success. What does that pattern suggest? Type its letter.<br><strong>A</strong> Nothing, people mistype passwords.<br><strong>B</strong> Someone may have guessed the password after many tries.<br><strong>C</strong> The account was deleted.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what forty failures then a success suggests" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Compare this with the three failures you just made on purpose. Scale matters here, because forty is far beyond what someone fumbling their own password looks like.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">Nobody mistypes a password forty times in a row. That volume is the shape of something automated trying one guess after another.</div>
<div class="ad-miss" data-guess="c">A deleted account cannot log in at all, successfully or not. This pattern needs the account to still exist.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. Someone may have guessed the password</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Many failures followed by a success is the shape of a password being guessed. It doesn't prove an attack on its own, but it's exactly the kind of pattern you escalate for a closer look.</p>
</div>
</div>
</div>
</div>

### Know What a Single Failure Does Not Prove

<div class="ad-mission" data-id="w4e-c4" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1121 · Low</span>
<p><strong>Task:</strong> A failed login for the name "jsmith" tells you what about that account? Type its letter.<br><strong>A</strong> The account definitely exists.<br><strong>B</strong> Only that something tried that name and failed.<br><strong>C</strong> The account was locked.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what a failed login for a name tells you" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Attackers guess account names just as often as they guess passwords, so a failure on its own can't tell you which part of the guess was wrong.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">A failure doesn't confirm the name is real, because an attacker guessing names gets exactly the same failure against a name that doesn't exist.</div>
<div class="ad-miss" data-guess="c">A lockout is its own separate event, not something a single failed login by itself tells you.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. Only that something tried that name and failed</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A failure tells you an attempt was made, not that the account is real. Since attackers guess names too, a failure alone only proves that someone tried. So look at the details before you decide: on Windows, for example, the 4625 sub-status code tells an unknown name apart from a wrong password.</p>
</div>
</div>
</div>
</div>

### Why It Matters

Authentication logs are the first evidence in most investigations, because they record who tried to get in and whether they made it. In the next challenge, you'll use them to make a harder, real-world judgment call.
