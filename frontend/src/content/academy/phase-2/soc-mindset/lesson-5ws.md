### The 5 W's of an Investigation

Checking an alert against the baseline tells you *that* something doesn't fit. It doesn't give you a record that another analyst, your lead or an auditor could follow. That's what the 5 W's are for. Who, what, when, where and why are the questions that turn a mismatch into a documented account.

The idea is old. Journalists have used these five questions to structure a factual story for over a century. Scholars trace them back further still, to Aristotle's way of judging the circumstances of an act. Today, incident response guidance recommends the same five questions as a starting point for what to document, sometimes adding how as a sixth.

Each question pulls out one piece of the alert. Skip one, and someone else has to fill the gap later.

- **Who** is the account or user involved, and does this match what they normally do?
- **What** happened, stated as a fact rather than in the alert's own words?
- **When** did it happen, and does the timing fit a normal pattern for that account or system?
- **Where** in the environment did it happen: which host, which network segment, which application?
- **Why** might this have happened, considering both the innocent explanation and the malicious one?

The order matters less than covering all five before you decide. An analyst who can answer who, what and when, but not where or why, has only a partial case. Partial cases are where investigations go wrong, because the gaps get filled with assumptions instead of facts.

```sort
prompt: Sort each alert detail into the question it answers.
Who: The account name that triggered the alert | The job title and shift of the person it belongs to
What: The exact action the log recorded | Whether that action succeeded or failed
When: The timestamp of the event | Whether that time falls inside or outside a normal shift
Where: The hostname or IP address involved | Which network segment that host sits on
Why: The business reason the account might have done this | Whether an attacker would have a reason to do the same thing
```
