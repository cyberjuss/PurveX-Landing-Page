### How It All Connects

The pieces form a chain. A vulnerability gives a threat a way in. If the threat succeeds, part of the CIA triad fails. Risk is your estimate, made in advance, of how likely that chain is to run through and what it would cost.

Work through it in that order when something lands in front of you:

- the vulnerability
- the threat that could use it
- the CIA property that would fail
- the impact of that failure

That keeps one frightening detail from driving your conclusion, and leaves a write-up someone else can act on.

```order
prompt: Put the chain in the order you work through it.
The vulnerability
The threat that could use it
The CIA property that would fail
The impact of that failure
```

### Trade-offs

The three properties pull against each other:

- Stronger **confidentiality**, such as extra MFA prompts, makes data harder to reach for everyone, including the right people.
- Easier **availability**, such as a share open to everyone, removes the barrier that keeps the wrong people out.

No setup maximizes all three. For the data in front of you, decide which property matters most and choose your control knowing what you give up. Patient records and a public status page need opposite answers.
