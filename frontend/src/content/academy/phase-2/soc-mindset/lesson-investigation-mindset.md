### The Investigation Mindset

An alert tells you what tripped, not what happened. A sign-in alert at 2 AM looks suspicious until you find the account belongs to a night-shift administrator. Then it looks routine, until you find that it doesn't. The investigation mindset is the habit of checking before you decide, rather than deciding from the alert's label. Phase 1 built the same habit when it asked you to tell a vulnerability from a threat before ranking a risk. Now the thing you refuse to take at face value is the alert itself.

That checking also has a direction. Don't start by asking whether the activity is bad. Start by asking what normal is for this account, this host or this time of day. Only then ask whether what you see fits it. An admin account running a scheduled task at 2 AM fits its baseline. The same sign-in pattern on a help desk account that has never worked a night shift doesn't. It's that mismatch, not the hour itself, that makes the second one worth escalating.

Context is what makes that comparison possible. You gather it by asking the same few questions on every alert:

- Who does the account belong to, and what do they normally do?
- What does the device or host normally look like?
- What else in the environment changed around the same time?

An investigation that skips straight to "escalate or close" without that context isn't an investigation. It's a coin flip with extra steps.

```order
prompt: Put the investigation steps in the order you would run them.
Read the alert and note exactly what it claims
Pull the baseline for the account, host, or time window it involves
Compare what happened against that baseline
Decide: escalate, close as benign, or request more data
Document what you checked and why you decided what you decided
```
