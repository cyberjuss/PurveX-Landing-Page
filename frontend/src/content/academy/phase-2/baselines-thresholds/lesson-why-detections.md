### Why Detections Matter

A detection is what turns everything this phase has taught into something that happens without you sitting there watching for it. The investigation mindset, the baseline, the ATT&CK technique, the threshold: a detection is where those ideas get written down as a rule that fires on its own at any hour, whether or not an analyst happens to be looking at that exact account at that exact moment.

Without a working detection, catching an attacker depends entirely on a human noticing in time. Humans do not watch every account every second. A password-spray attack across dozens of accounts in under a minute is exactly the pattern a detection exists to catch. You have already worked this kind of incident in Shift. By the time a person happens to scroll past it manually, the attacker may already be inside.

A detection also does something a one-off manual catch cannot: it catches the same pattern again, for every account, every time, without anyone having to remember to look. That is the entire economic case for detection engineering, the work Tier 3 analysts do that Week 1 introduced. One detection, built and tuned once, replaces an unbounded amount of manual watching. It keeps working on the night nobody happens to be paying close attention.

```connect
prompt: Connect each gap to the consequence of leaving it undetected.
No detection on password spraying = An attacker tries hundreds of accounts quietly, and the first anyone notices is after a successful break-in
No detection on audit logging being disabled = The SOC goes blind to exactly the activity an attacker most wants hidden, at the moment they need it hidden
A detection set with too high a threshold = A real attack produces enough signal to qualify, but not enough to cross the bar, and it passes through unflagged
A detection that nobody ever tunes = It keeps firing on last year's baseline while this year's normal behavior has already moved past it
```
