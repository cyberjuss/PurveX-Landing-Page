<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>If you change three things at once and the problem goes away, do you actually know what fixed it?</p>
</div>

### A Process, Not a Guess

A new technician's first instinct is to start trying things: reboot it, reinstall it, restart the service, see what sticks. Sometimes that works. It also burns time, and when it does happen to fix something, nobody, including you, knows which change actually did it. The next time the same symptom shows up, you're starting from zero again.

A method fixes that. Same six steps, every ticket, regardless of whether it's a printer, a login failure, or a server that fell off the network.

### Step 1: Get the Actual Symptom, Not the User's Diagnosis

A user telling you "the internet is down" and a user whose browser can't resolve a hostname are not the same report, even though it's the same person saying it. Users describe the effect, not the cause, and their guess at the cause is usually wrong. Your job is to get specific:

* What exactly happens? An error message, a blank screen, a spinning icon that never finishes?
* Does it happen every time, or only sometimes?
* When did it start?
* Does it affect one app or everything?
* Does it affect just this user, or others nearby too?

"The internet is down" and "Outlook won't send, but Chrome works fine" point you in completely different directions. You can't know which one you're dealing with until you ask.

### Step 2: Ask What Changed

Almost every problem traces back to a change. A Windows update installed overnight. A password expired. A cable got unplugged during a desk move. The user installed something. IT pushed a Group Policy update. Somebody's account got moved to a different OU.

"What changed?" is the single highest-value question in troubleshooting, because a system that was working yesterday and isn't today has a cause, and that cause is almost always something that changed in between. If nothing the user knows about changed, that's useful too: it points you toward something changing upstream, on the server or network side, that the user never saw.

### Step 3: Form a Theory You Can Test

Once you have a real symptom and a sense of what changed, you should be able to state a specific, testable guess: "The printer stopped working for everyone on the third floor at 9 AM, right when the print server rebooted for patching. The print spooler service on that server is my first suspect."

That's a theory. "Something's wrong with the network" is not, because there's nothing to actually go check.

### Step 4: Test It Before You Touch Anything Else

Confirm the theory before you start changing configuration. For the print server example: is the Print Spooler service running? Check `Get-Service -Name Spooler` on the server, or open `services.msc` and look. If it's stopped, that's your answer. If it's running fine, your theory was wrong, and you go back to Step 3, not straight to trying random fixes.

This is the step people skip under pressure, and it's the one that saves the most time. A confirmed cause takes one fix. An unconfirmed guess can take five.

### Step 5: Fix It, Then Prove It's Fixed

Apply the fix, then verify from the user's side, not just yours. Restarting the spooler service and confirming it shows "Running" tells you the service is up. It doesn't tell you the user can actually print again. Have them try it, or check yourself from a machine on that print queue. "I fixed my part" and "the problem is actually gone" are different claims, and only the second one closes the ticket.

### Step 6: Document What Actually Happened

Write down the real symptom, what you found, what you changed, and how you confirmed it. Not "fixed printer issue." The next lesson covers what a documentation actually needs to include and why a vague note causes real problems down the line.

<div class="academy-thinklike">
<span class="academy-thinklike__tag">Think Like an Analyst</span>
<p>"What changed?" is also the first question in an actual security investigation, not just a Help Desk one. A machine that starts behaving differently, more outbound connections, a new scheduled task, a service account logging in at an unusual hour, has a cause. Finding what changed right before the odd behavior started is how an analyst finds the initial point of compromise, the same instinct you're building here on far lower-stakes tickets.</p>
</div>
