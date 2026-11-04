### How It All Connects

By now you've met every piece of this week, and they fit together as a chain that runs in one direction. First, a vulnerability gives a threat a way in. Then, if that threat succeeds, one or more parts of the CIA triad fail. Risk sits over the whole chain as your estimate, made before any of it happens, of how likely the chain is to run all the way through and what it would cost if it did.

Because the chain runs in that order, it's also the order to work through when something lands in front of you:

- the vulnerability
- the threat that could use it
- the CIA property that would fail
- the impact of that failure

Taking the steps one at a time keeps you from jumping to a conclusion because of a single frightening detail. It also leaves you with a write-up that someone else can act on without having to repeat your work.

```order
prompt: Put the chain in the order you work through it.
The vulnerability
The threat that could use it
The CIA property that would fail
The impact of that failure
```

### Trade-offs

There's one more idea to carry into the challenges, and it's that the three properties don't live independently of each other. In practice, they pull against each other:

- Stronger **confidentiality**, such as extra MFA prompts or an air gap, makes data harder for the wrong person to reach, but also harder for the right one.
- Easier **availability**, such as a file share open to everyone, means people can always get to their work, but it removes the barrier that keeps the wrong people out.

Since no setup gets the most out of all three at once, security work turns out to be a series of decisions rather than a checklist you tick off. So for the data in front of you, decide which property matters most, and then choose your control knowing what you're giving up. Patient records and a public status page need opposite answers, for example, and both answers are right for their own data.
