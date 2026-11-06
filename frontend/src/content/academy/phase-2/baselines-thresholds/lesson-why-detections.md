### Why Detections Matter

A detection is how everything this phase has taught keeps working when you aren't there to watch. The investigation mindset, the baseline, the ATT&CK technique and the threshold all get written down together as a rule. That rule fires on its own at any hour, whether or not an analyst happens to be looking at that account at that moment.

Without one, catching an attacker depends entirely on a person noticing in time, and nobody watches every account every second. Think of the password-spray incidents you've already worked in Shift, where dozens of accounts were hit in under a minute. That's the pattern a detection exists to catch, because by the time someone happens to scroll past it, the attacker may already be inside.

A detection also does something a one-off manual catch never can. It catches the same pattern again, for every account and every time, without anyone having to remember to look. That's the whole economic case for detection engineering, the Tier 3 work you met in Week 1. A detection you build and tune once replaces an endless amount of manual watching, and it keeps working on the night nobody is paying close attention.

```connect
prompt: Connect each gap to the consequence of leaving it undetected.
No detection on password spraying = An attacker tries hundreds of accounts quietly, and the first anyone notices is after a successful break-in
No detection on audit logging being disabled = The SOC goes blind to exactly the activity an attacker most wants hidden, at the moment they need it hidden
A detection set with too high a threshold = A real attack produces enough signal to qualify, but not enough to cross the bar, and it passes through unflagged
A detection that nobody ever tunes = It keeps firing on last year's baseline while this year's normal behavior has already moved past it
```
