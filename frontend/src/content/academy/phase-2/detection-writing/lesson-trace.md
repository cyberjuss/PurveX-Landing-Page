### The TRACE Method
<!-- art: layers -->

A query that produces a table is not yet a detection. A detection needs to name what it is hunting for, scope itself to the right data, count the right thing, decide at what point that count becomes worth someone's attention, and say what happens when it fires. **TRACE** is a five-part way to build that, in order, using nothing this phase has not already taught you.

The five parts, in the order you actually build them:

1. **Technique.** Decide what ATT&CK technique you are hunting, before you write a line of KQL.
2. **Reference.** Scope the query to the table and time window where that technique actually shows up.
3. **Aggregate.** Turn raw events into the one count you actually care about.
4. **Condition.** Set the line where that count becomes worth a human's attention.
5. **Escalation.** Decide what happens the moment the detection fires.

Each part gets its own page next, building toward one real, complete detection for Password Spraying, T1110.003.
