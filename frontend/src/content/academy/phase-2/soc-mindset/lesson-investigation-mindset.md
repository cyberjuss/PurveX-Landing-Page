### The Investigation Mindset

An alert tells you what tripped, not what happened. A sign-in alert at 2 AM reads as suspicious until you check that the account belongs to a night-shift administrator, and reads as routine right up until you check that it does not. The investigation mindset is the discipline of checking before you decide, instead of deciding from the alert's label alone. It is the same muscle Phase 1 built when it asked you to tell a vulnerability from a threat before you could rank a risk. Here, the thing you are refusing to accept at face value is the alert itself.

That checking has a direction. You do not start by asking whether the activity is bad. You start by asking what the baseline for this account, this host, or this time of day actually is, and only then ask whether what you are looking at fits it. An admin account running a scheduled task at 2 AM fits its baseline. The same login pattern on a help desk account that has never worked a night shift does not, and that mismatch, not the hour itself, is what makes it worth escalating.

Context is what makes that comparison possible, and context comes from asking the same handful of questions on every alert: who the account belongs to and what they normally do, what the device or host normally looks like, and what else in the environment moved around the same time. An investigation that skips straight to "escalate or close" without gathering that context is not really an investigation. It is a coin flip with extra steps.

```order
prompt: Put the investigation steps in the order you would actually run them.
Read the alert and note exactly what it claims
Pull the baseline for the account, host, or time window it involves
Compare what actually happened against that baseline
Decide: escalate, close as benign, or request more data
Document what you checked and why you decided what you decided
```
