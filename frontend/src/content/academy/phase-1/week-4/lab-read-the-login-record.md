<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Every time someone proves who they are, a record is written. Can you make one, find it, and tell a success from a failure?</p>
</div>

**Situation:** Authentication is the moment a system decides you are who you claim to be, and it almost always leaves a trace. The first thing an investigation reads is that trace, because a run of failures followed by one success is what a break-in looks like from the log.

**Task:** On the Ubuntu server, produce a failed authentication and a successful one, then find both in the system log and tell them apart. Predict what the log will hold before you look.

**What you need:** Your hosted lab running, and a terminal on the Ubuntu desktop. Nothing is installed for this lab. You know your own password, which is in the lab panel.

### Before You Start

Commit to an answer before you type anything. Nothing is marked yet. The log settles each one.

<div class="ad-check ad-check--predict" data-check="w4e-p1">
<p class="ad-check__q">You type the wrong password for a sudo command. Is that attempt written down anywhere?</p>
<button type="button" class="ad-check__opt" data-i="0">No, only successful logins are recorded</button>
<button type="button" class="ad-check__opt" data-i="1">Yes, the failed attempt is logged</button>
<p class="ad-check__note">Locked in. You will go and find your own failed attempt in a moment.</p>
</div>

<div class="ad-check ad-check--predict" data-check="w4e-p2">
<p class="ad-check__q">In an investigation, which is usually the more interesting line?</p>
<button type="button" class="ad-check__opt" data-i="0">A single successful login</button>
<button type="button" class="ad-check__opt" data-i="1">A run of failures, then a success</button>
<p class="ad-check__note">Locked in. You will produce exactly this shape and read it back.</p>
</div>

<div class="ad-check ad-check--predict" data-check="w4e-p3">
<p class="ad-check__q">Does a failed authentication tell you the account exists?</p>
<button type="button" class="ad-check__opt" data-i="0">Always, a failure means the account is real</button>
<button type="button" class="ad-check__opt" data-i="1">Not on its own, the password was simply wrong</button>
<p class="ad-check__note">Locked in. Keep this one in mind. It matters for how you read a log.</p>
</div>

### Produce a Failure

Open a terminal on the Ubuntu desktop. First clear any remembered sudo session, then run a command as root and type the wrong password on purpose.

```bash
sudo -k
sudo true
```

When it asks for a password, type something wrong three times. It gives up with "3 incorrect password attempts". You have just created a failed authentication, which is now in the log.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-4/PLACEHOLDER-sudo-fail.png" alt="Terminal showing three incorrect password attempts for a sudo command" />
<figcaption>Screenshot 1. [ADD IMAGE] A failed authentication, on purpose.</figcaption>
</figure>
</div>

### Produce a Success

Now run it again and type your real password.

```bash
sudo true
```

It returns with no message, which means it worked. That success is in the log too, right after the failures.

### Read the Record

The system log holds both. Read the recent authentication lines.

```bash
sudo journalctl -e _COMM=sudo
```

Scroll to the end. You will see your failed attempts marked `authentication failure`, then a line showing the session was opened for root. The failures and the success sit together, with times, which is exactly how an analyst reads them.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-4/PLACEHOLDER-journal-auth.png" alt="journalctl output showing authentication failure lines followed by a successful session opened line" />
<figcaption>Screenshot 2. [ADD IMAGE] The failures and the success, in order.</figcaption>
</figure>
</div>

### The Same Thing on Windows

A domain controller records the same events with numbers every analyst learns. On Windows you open Event Viewer and read the Security log.

* **4624** is a successful logon.
* **4625** is a failed logon.

A burst of 4625 events followed by a 4624 for the same account is the Windows version of what you just made on Linux. The log is in a different place and the events have numbers rather than words, but the story it tells is the same.

### Check Yourself

Answer from what you saw, not from what you remember reading.

<div class="ad-check" data-check="w4e-c1" data-answer="1">
<p class="ad-check__q">Was your failed sudo attempt recorded in the log?</p>
<button type="button" class="ad-check__opt" data-i="0">No, only the success was</button>
<button type="button" class="ad-check__opt" data-i="1">Yes, the failures were logged with the success</button>
<p class="ad-check__note">Both are recorded. Failed authentication is often the more useful of the two, because a run of failures is the first sign of someone trying to get in.</p>
</div>

<div class="ad-check" data-check="w4e-c2" data-answer="0">
<p class="ad-check__q">On a Windows domain controller, which Event ID is a failed logon?</p>
<button type="button" class="ad-check__opt" data-i="0">4625</button>
<button type="button" class="ad-check__opt" data-i="1">4624</button>
<button type="button" class="ad-check__opt" data-i="2">3389</button>
<p class="ad-check__note">4625 is a failed logon, 4624 is a success. These two numbers come up in almost every SOC interview, so they are worth remembering now.</p>
</div>

<div class="ad-check" data-check="w4e-c3" data-answer="1">
<p class="ad-check__q">You find forty failed logons for one account, then one success. What does that pattern suggest?</p>
<button type="button" class="ad-check__opt" data-i="0">Nothing, people mistype passwords</button>
<button type="button" class="ad-check__opt" data-i="1">Someone may have guessed the password after many tries</button>
<button type="button" class="ad-check__opt" data-i="2">The account was deleted</button>
<p class="ad-check__note">Many failures then a success is the shape of a password being guessed. It does not prove an attack, but it is exactly what you escalate for a closer look.</p>
</div>

<div class="ad-check" data-check="w4e-c4" data-answer="1">
<p class="ad-check__q">A failed login for the name "jsmith" tells you what about that account?</p>
<button type="button" class="ad-check__opt" data-i="0">The account definitely exists</button>
<button type="button" class="ad-check__opt" data-i="1">Only that something tried that name with a wrong password</button>
<button type="button" class="ad-check__opt" data-i="2">The account was locked</button>
<p class="ad-check__note">A failure means an attempt was made, not that the account is real. Attackers guess names too, so a failure alone proves only that someone tried.</p>
</div>

### Take It Further

You are handed a day of logs from one server. For one account you count sixty failed logins between 2am and 3am, all from the same address, and no success at all.

Say what that account was likely subjected to, and whether the absence of any success makes the event more or less worth reporting.

### Why It Matters

Authentication logs are the first evidence in most investigations, because they record who tried to get in and whether they made it. An analyst who can produce these events, find them and read the story in their order is doing the opening move of real incident work, before any tool more advanced than the system log.
