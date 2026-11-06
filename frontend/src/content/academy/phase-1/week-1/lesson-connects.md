### How It All Connects

You've now met every piece of this week, and they fit together as a chain that runs in one direction. A vulnerability gives a threat a way in, and if that threat succeeds, one or more parts of the CIA triad fail. Risk sits over the whole chain as your estimate, made in advance, of how likely it is to run all the way through and what it would cost if it did.

Because the chain runs in that order, it's also the order to work through when something lands in front of you:

- the vulnerability
- the threat that could use it
- the CIA property that would fail
- the impact of that failure

Taking those steps one at a time keeps a single frightening detail from driving your conclusion, and it leaves you with a write-up that someone else can act on.

```order
prompt: Put the chain in the order you work through it.
The vulnerability
The threat that could use it
The CIA property that would fail
The impact of that failure
```

### Trade-offs

There's one more idea to carry into the challenge, which is that the three properties pull against each other:

- Stronger **confidentiality**, such as extra MFA prompts, makes data harder for the wrong person to reach, but also harder for the right one.
- Easier **availability**, such as a file share open to everyone, means people can always reach their work, but it removes the barrier that keeps the wrong people out.

Since no setup gets the most out of all three at once, security work turns out to be a series of decisions rather than a checklist. For the data in front of you, decide which property matters most, then choose your control knowing what you're giving up. Patient records and a public status page need opposite answers, and both answers are right for their own data.
