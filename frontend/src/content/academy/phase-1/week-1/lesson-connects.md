### How It All Connects

Everything you've learned this week fits together as a chain that runs in one direction. A vulnerability gives a threat a way in. If that threat succeeds, one or more parts of the CIA triad fail. Risk is your estimate, made before any of it happens, of how likely that chain is to run all the way through and what it would cost if it did.

So when something lands in front of you, work through it in that same order:

- the vulnerability
- the threat that could use it
- the CIA property that would fail
- the impact of that failure

Taking the steps in order keeps you from jumping to a conclusion because of one frightening detail. It also leaves you with a write-up that someone else can act on without having to repeat your work.

```order
prompt: Put the chain in the order you work through it.
The vulnerability
The threat that could use it
The CIA property that would fail
The impact of that failure
```

### Trade-offs

One last thing before the challenges: the three properties don't live independently of each other. In practice, they pull against each other:

- Stronger **confidentiality**, such as extra MFA prompts or an air gap, makes data harder for the wrong person to reach, but also harder for the right one.
- Easier **availability**, such as a file share open to everyone, means people can always get to their work, but it removes the barrier that keeps the wrong people out.

No setup gets the most out of all three at once, which is why security work is a series of decisions rather than a checklist you tick off. For the data in front of you, decide which property matters most, then choose your control knowing what you're giving up. Patient records and a public status page need opposite answers, and both answers are right for their own data.
