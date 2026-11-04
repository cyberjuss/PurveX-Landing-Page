### The Investigation Mindset

An alert tells you what tripped, not what actually happened. A sign-in alert at 2 AM looks suspicious until you find that the account belongs to a night-shift administrator, and it looks routine right up until you find that it doesn't. The investigation mindset is the habit of checking before you decide, rather than deciding from the alert's label alone. It's the same muscle Phase 1 built when it asked you to tell a vulnerability from a threat before you ranked a risk, except that now the thing you're refusing to take at face value is the alert itself.

That checking also has a direction. Rather than starting with whether the activity is bad, you start by asking what the baseline actually is for this account, this host, or this time of day, and only then ask whether what you're looking at fits it. For example, an admin account running a scheduled task at 2 AM fits its baseline, while the same login pattern on a help desk account that has never worked a night shift doesn't. It's that mismatch, not the hour itself, that makes the second one worth escalating.

What makes that comparison possible is context, and you gather it by asking the same handful of questions on every alert: who the account belongs to and what they normally do, what the device or host normally looks like, and what else in the environment changed around the same time. An investigation that skips straight to "escalate or close" without gathering that context isn't really an investigation at all. It's a coin flip with extra steps.

```order
prompt: Put the investigation steps in the order you would actually run them.
Read the alert and note exactly what it claims
Pull the baseline for the account, host, or time window it involves
Compare what actually happened against that baseline
Decide: escalate, close as benign, or request more data
Document what you checked and why you decided what you decided
```
