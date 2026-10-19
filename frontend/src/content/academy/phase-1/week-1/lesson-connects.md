### How It All Connects

The pieces from this week fit together in one direction, as a chain. A vulnerability gives a threat a way in, and if that threat succeeds, one or more parts of the CIA triad fail. Risk is the measure of how likely the chain is to complete and what it would cost, worked out before any of it has happened.

Work through it in that order when something lands in front of you:

- the vulnerability
- the threat that could use it
- the CIA property that would fail
- the impact of that failure

Taking the steps in sequence stops you jumping to a conclusion from a single frightening detail, and it produces a description somebody else can act on without repeating your work.

```order
prompt: Put the chain in the order you work through it.
The vulnerability
The threat that could use it
The CIA property that would fail
The impact of that failure
```

### Trade-offs

The three properties are not independent of one another, and in practice they compete:

- Stronger **confidentiality**, such as extra MFA prompts or an air gap, makes data harder for the wrong person to reach, but also harder for the right one.
- Easier **availability**, such as a file share open to everyone, means people can always get to their work, but it removes the barrier that keeps the wrong people out.

No configuration maximizes all three at once, which is why security work is a series of decisions rather than a checklist. Decide which property matters most for the particular data in front of you, then choose the control, knowing what you are giving up. Patient records and a public status page call for opposite answers, and both answers are correct for their own data.
