### The TRACE Method
<!-- art: layers -->

As you saw in the last lesson, a query that produces a table isn't a detection yet. To become one, it needs to:

- Name what it is hunting for
- Scope itself to the right data
- Count the right thing
- Decide at what point that count becomes worth someone's attention
- Say what happens when it fires

**TRACE** is a five-part way to build all of that, step by step, using only what this phase has already taught you.

Here are the five parts, in the order you build them:

1. **Technique.** Decide what ATT&CK technique you are hunting, before you write a line of KQL.
2. **Reference.** Scope the query to the table and time window where that technique actually shows up.
3. **Aggregate.** Turn raw events into the one count you actually care about.
4. **Condition.** Set the line where that count becomes worth a human's attention.
5. **Escalation.** Decide what happens the moment the detection fires.

Over the next few pages, each part gets its own lesson. By the end, they'll add up to one real, complete detection for Password Spraying (T1110.003).
