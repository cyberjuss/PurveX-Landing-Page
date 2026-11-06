### How It All Connects

You've now met every piece of this week, and they fit together as a chain that runs in one direction. A vulnerability gives a threat a way in, and if that threat succeeds, one or more parts of the CIA triad fail. Risk sits over the whole chain as your estimate, made in advance, of how likely it is to run all the way through and what it would cost if it did.

Because the chain runs in that order, it's also the order to work through when something lands in front of you:

- the vulnerability
- the threat that could use it
- the CIA property that would fail
- the impact of that failure

Taking those steps one at a time keeps a single frightening detail from driving your conclusion, and it leaves you with a write-up that someone else can act on.

```order
prompt: The client export ended up in the Operations share. Work the ticket through in order.
level: 3
Vulnerability: the Operations share lets the whole department read it
Threat: a curious colleague, or an attacker using one of their accounts
CIA property: confidentiality fails, because client data is readable by the wrong people
Impact: clients' account numbers and balances exposed, and a report owed to Compliance
```

### Trade-offs

There's one more idea to carry into the challenge, which is that the three properties pull against each other:

- Stronger **confidentiality**, such as extra MFA prompts, makes data harder for the wrong person to reach, but also harder for the right one.
- Easier **availability**, such as a file share open to everyone, means people can always reach their work, but it removes the barrier that keeps the wrong people out.

Since no setup gets the most out of all three at once, security work turns out to be a series of decisions rather than a checklist. For the data in front of you, decide which property matters most, then choose your control knowing what you're giving up. Patient records and a public status page need opposite answers, and both answers are right for their own data.

### Check yourself

A scanner flags a critical flaw on a test server. The server holds no data, and nothing outside the lab can reach it. Is this a high risk?

<details class="lk-answer">
<summary>Compare your answer</summary>

No. The flaw is real, but risk needs all three parts, and here the likelihood is low because nothing can reach the server, and the impact is low because there's nothing on it to lose. Patch it in the normal cycle. If the server were ever connected to the network or started holding data, you'd score it again, because both of those would change the answer.

</details>

