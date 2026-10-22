### The 5 W's of an Investigation

Checking an alert against the baseline tells you *that* something does not fit. It does not by itself give you a record another analyst, your lead, or an auditor can pick up and follow. The 5 W's, who, what, when, where, and why, are the questions that turn a mismatch into a documented account. The framework is old. Writers on incident response trace it back to Aristotle, who used the same questions to judge the morality of an act: what was done, who did it, where, and why. Digital forensics guidance recommends the same five questions as a starting point for what to document during an incident, sometimes with how added as a sixth.

Each question pulls a specific piece of the alert apart, and skipping one leaves a gap someone else will have to fill in later:

- **Who** is the account or user involved, and does this match what they normally do?
- **What** actually happened, stated as a fact rather than the alert's own characterization of it?
- **When** did it happen, and does the timing fit a normal pattern for that account or system?
- **Where** in the environment did it happen: which host, which network segment, which application?
- **Why** might this have happened, considering both the innocent explanation and the malicious one?

The order matters less than covering all five before you commit to a decision. An analyst who can answer who, what, and when but not where or why has a partial case. A partial case is where investigations go wrong, because the gaps get filled with assumptions instead of facts.

```sort
prompt: Sort each alert detail into the question it answers.
Who: The account name that triggered the alert | The job title and shift of the person it belongs to
What: The exact action the log recorded | Whether that action succeeded or failed
When: The timestamp of the event | Whether that time falls inside or outside a normal shift
Where: The hostname or IP address involved | Which network segment that host sits on
Why: The business reason the account might have done this | Whether an attacker would have a reason to do the same thing
```
