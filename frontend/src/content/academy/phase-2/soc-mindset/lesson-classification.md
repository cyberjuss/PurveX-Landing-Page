### Classifying an Incident

Once you've confirmed that something really is wrong, you're only halfway there. The other half is deciding how urgently it needs to be worked, and that decision has a name: severity classification. If you get it wrong in one direction, a real breach sits in the queue behind routine tickets. Get it wrong in the other direction, and every alert becomes a fire drill, which teaches the team to stop trusting the word "critical."

The good news is that you already have a working version of this scale. In your own Shift console, every incident carries a severity of P1, P2, or P3, and the console spells out what each one means:

- **P1, Critical:** gets worked first.
- **P2, High:** comes after any open P1.
- **P3, Routine:** gets worked when the queue allows.

That three-level scale isn't unique to this course, either. Most SOCs use some version of it, because urgency only needs to be detailed enough to answer one question: what gets worked next?

The formal standard behind all this is NIST SP 800-61, the US federal government's guidance on handling incidents. Its most recent revision, Revision 3 from 2025, organizes incident response around the six functions of the NIST Cybersecurity Framework 2.0 rather than handing down one fixed severity table. In other words, it leaves the exact scale for your organization to define, just as your Shift console defines its own P1 through P3. What every revision does insist on is that severity gets judged by impact, not by how alarming the alert's wording sounds. Impact means:

- How many systems or users are affected
- How critical those systems are
- How reversible the damage is

That point about wording is worth sitting with, because a queue full of alerts is full of language designed to sound urgent. An analyst who ranks the queue by how frightening each alert reads is doing the opposite of what this lesson teaches. The question that really matters is what each one would cost the business if it were left unworked. So classify by impact, and let the label follow the impact, never the other way around.

```sort
prompt: Sort each incident by the severity it would most likely get.
P1 — Critical: Ransomware actively encrypting a file server | Confirmed domain admin account compromise
P2 — High: A phishing email reported before anyone clicked it was clicked by one user | Malware found on a single workstation, contained before it spread
P3 — Routine: A password reset request outside normal hours with no other red flags | A vulnerability scan flags an out-of-date but unexploited plugin
```
