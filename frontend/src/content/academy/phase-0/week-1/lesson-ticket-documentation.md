<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>If you got hit by a bus tomorrow, could someone else finish your open tickets from your notes alone?</p>
</div>

### Why This Actually Matters

A ticket note isn't paperwork you do after the real work is finished. It's the only record that the problem, the investigation, and the fix ever happened. Three groups depend on it being good:

* **The next technician**, who reopens the ticket in six months when the same symptom comes back, and needs to know what was already tried.
* **Your manager**, during a review, an audit, or a client asking "what happened to my account last Tuesday."
* **A SOC analyst**, months from now, pulling up every ticket tied to an account before deciding whether something is normal user behavior or a real incident.

That third one surprises new technicians. A password reset ticket looks like routine Help Desk work right up until an analyst is trying to explain why an account authenticated from a new device at 2 AM, and your ticket note is the only thing that says whether that reset was the user calling in, or someone else.

### A Ticket Nobody Can Use

> Fixed printer issue.

That's the entire note, word for word, on a real ticket. It tells the next person nothing: which printer, what was wrong with it, what was actually done, or whether it's really fixed. If the same printer jams again next week, whoever picks up the new ticket is starting from zero.

### A Ticket Someone Can Actually Use

> User: Riley Kwan (Operations). Reported: 3rd floor printer (HP-OPS-01) shows "offline" in Windows, cannot print since ~9:00 AM.
>
> Checked: Print Spooler service on PRINT-SVR01, found it stopped. Server had rebooted at 8:57 AM for scheduled patching (KB5034441).
>
> Action: Restarted Print Spooler service on PRINT-SVR01 (`Restart-Service -Name Spooler`). Confirmed printer shows "Ready" in Windows and had Riley print a test page successfully at 9:41 AM.
>
> Root cause: Spooler did not auto-start cleanly after the patch reboot. Flagged to team lead to check if this happens on other print servers after the same patch cycle.

Same fix, completely different value. Anyone who opens this ticket later knows exactly what happened without asking a single follow-up question, and it surfaced a pattern (patch reboot breaking the spooler) worth checking on other servers before it becomes ten more tickets.

### What a Good Note Always Has

* **The symptom in the user's words**, not your interpretation of it. "Cannot print" and "printer shows offline" are both worth recording.
* **What you checked**, even the things that turned out fine. Ruling something out is real information for the next person.
* **What you changed**, specifically enough to reverse it if it turns out to be wrong.
* **How you confirmed it was actually fixed**, and from where (your machine, the user's machine, a test).
* **Timestamps.** "Started around 9 AM" is far more useful later than no time at all.

### What to Leave Out

Don't record the user's password, even temporarily, even in a "for reference" note. Don't paste full error dumps if a summary and the error code capture what matters. A ticket is a record, not a dumping ground, and anything sensitive written into it sits there indefinitely for anyone with ticket-system access to read.

<div class="academy-thinklike">
<span class="academy-thinklike__tag">Think Like an Analyst</span>
<p>During an investigation, ticket history is one of the first places an analyst checks on a flagged account. A vague note ("reset PW") can't tell them whether a reset was a legitimate user request or the first step of an account takeover. A specific one, who called, how they were verified, what was reset, can answer that in seconds instead of turning into a much longer investigation.</p>
</div>
