### T: Technique
<!-- art: radar -->

Technique is the first letter of TRACE, and one of the two that aren't KQL at all. It's a decision you make before you write a single line of query: which specific ATT&CK technique is this detection trying to catch? Week 4's ATT&CK lesson already gave you the vocabulary. Password Spraying is T1110.003 and Kerberoasting is T1558.003, and each is a named, catalogued pattern of attacker behavior rather than a vague sense that "something looks off."

Naming the technique first, instead of starting from the data and seeing what turns up, keeps a detection from becoming a fishing expedition. Once you know you're hunting Password Spraying, you already know the shape of the evidence, which is many failed sign-ins across many accounts in a short window. That shape then decides everything that follows:

- Which table holds the evidence (Reference)
- Which field to count (Aggregate)
- What a normal rate of failure looks like versus an attack rate (Condition)

Without a named technique behind it, a detection is really just a report that something happened, with no way to say whether it matters. The technique is what turns a query into a hypothesis you can test.
