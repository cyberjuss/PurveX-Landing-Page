### T: Technique
<!-- art: radar -->

Technique is the first letter of TRACE and the only one that is not KQL at all. It is a decision you make before you write a line of query: what specific ATT&CK technique is this detection trying to catch. Week 4's ATT&CK lesson already gave you the vocabulary for this. Password Spraying is T1110.003, and Kerberoasting is T1558.003, each a named, catalogued pattern of attacker behavior rather than a vague sense that "something looks off."

Naming the technique first, rather than starting from the data and seeing what turns up, is what keeps a detection from becoming a fishing expedition. Once you know you are hunting Password Spraying specifically, you already know the shape of the evidence: many failed sign-ins, across many accounts, in a short window. That shape decides everything that follows. It tells you which table holds the evidence (Reference), which field to count (Aggregate), and what a normal rate of failure looks like versus an attack rate (Condition).

A detection with no named technique behind it is really just a report that something happened, with no way to say whether that something matters. The technique is what turns a query into a hypothesis you can test.

<details class="academy-deeper">
<summary>From the field</summary>

[Add your own experience here: a time you started writing a query before deciding what technique it was for, and had to start over once you figured out what you were actually hunting.]

</details>
