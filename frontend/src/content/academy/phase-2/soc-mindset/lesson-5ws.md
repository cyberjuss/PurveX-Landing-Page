### The 5 W's of an Investigation

Checking an alert against the baseline tells you *that* something doesn't fit. On its own, though, it doesn't give you a record that another analyst, your lead, or an auditor could pick up and follow. That's what the 5 W's are for: who, what, when, where, and why are the questions that turn a mismatch into a documented account. Journalists have used these same five questions to structure a factual story for over a century, and scholars trace the idea back even further, to Aristotle's framework in the Nicomachean Ethics for judging the circumstances of an act. Today, incident response guidance recommends the same five questions as a starting point for what to document during an incident, sometimes adding how as a sixth.

Each question pulls out one specific piece of the alert, so skipping any of them leaves a gap that someone else will have to fill in later:

- **Who** is the account or user involved, and does this match what they normally do?
- **What** actually happened, stated as a fact rather than the alert's own characterization of it?
- **When** did it happen, and does the timing fit a normal pattern for that account or system?
- **Where** in the environment did it happen: which host, which network segment, which application?
- **Why** might this have happened, considering both the innocent explanation and the malicious one?

The order matters less than covering all five before you commit to a decision. An analyst who can answer who, what, and when, but not where or why, has only a partial case, and partial cases are where investigations go wrong, because the gaps get filled with assumptions instead of facts.

```sort
prompt: Sort each alert detail into the question it answers.
Who: The account name that triggered the alert | The job title and shift of the person it belongs to
What: The exact action the log recorded | Whether that action succeeded or failed
When: The timestamp of the event | Whether that time falls inside or outside a normal shift
Where: The hostname or IP address involved | Which network segment that host sits on
Why: The business reason the account might have done this | Whether an attacker would have a reason to do the same thing
```
