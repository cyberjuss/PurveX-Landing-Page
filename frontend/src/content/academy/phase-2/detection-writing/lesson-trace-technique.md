### T: Technique
<!-- art: radar -->

Technique is the first letter of TRACE, and one of the two that aren't KQL at all. It's a decision you make before you write any query: which ATT&CK technique is this detection trying to catch? The ATT&CK lesson in Baselines and Thresholds gave you the vocabulary. Password Spraying is T1110.003 and Kerberoasting is T1558.003. Each is a named pattern of attacker behavior, not a vague sense that "something looks off."

Name the technique first, rather than starting from the data and seeing what turns up. That keeps a detection from becoming a fishing expedition. Once you know you're hunting Password Spraying, you know the shape of the evidence: many failed sign-ins across many accounts in a short window. That shape decides everything that follows:

- Which table holds the evidence (Reference)
- Which field to count (Aggregate)
- What a normal rate of failure looks like versus an attack rate (Condition)

Without a named technique behind it, a detection is only a report that something happened, with no way to say whether it matters. The technique is what turns a query into a hypothesis you can test.
