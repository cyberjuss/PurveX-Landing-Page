### How It All Connects

You've now met every piece of this week, and they fit together as a chain that runs in one direction. A vulnerability gives a threat a way in, and if that threat succeeds, one or more parts of the CIA triad fail. Risk sits over the whole chain as your estimate, made in advance, of how likely it is to run all the way through and what it would cost if it did.

Because the chain runs in that order, it's also the order to work through when something lands in front of you:

- the vulnerability
- the threat that could use it
- the CIA property that would fail
- the impact of that failure

<svg class="lk-fig" viewBox="0 0 600 160" role="img" aria-label="The chain, left to right. A vulnerability lets a threat in, the threat makes a CIA property fail, and the failure has an impact. Risk spans the whole chain as an estimate of how likely it is to run all the way through and what it would cost."><text class="f-k" x="300" y="16" text-anchor="middle">RISK</text><text class="f-s" x="300" y="33" text-anchor="middle">how likely the whole chain runs, and what it would cost</text><path class="f-line f-line--acc" d="M12 58 V44 H588 V58"/><rect class="f-acc" x="8" y="70" width="128" height="66" rx="10"/><text class="f-t" x="72" y="99" text-anchor="middle">Vulnerability</text><text class="f-s" x="72" y="120" text-anchor="middle">a weakness</text><path class="f-line" d="M138 103 H152"/><polygon class="f-head" points="152,98 160,103 152,108"/><rect class="f-acc" x="160" y="70" width="128" height="66" rx="10"/><text class="f-t" x="224" y="99" text-anchor="middle">Threat</text><text class="f-s" x="224" y="120" text-anchor="middle">uses the weakness</text><path class="f-line" d="M290 103 H304"/><polygon class="f-head" points="304,98 312,103 304,108"/><rect class="f-bad" x="312" y="70" width="128" height="66" rx="10"/><text class="f-t" x="376" y="99" text-anchor="middle">CIA fails</text><text class="f-s" x="376" y="120" text-anchor="middle">leak, lie or lockout</text><path class="f-line" d="M442 103 H456"/><polygon class="f-head" points="456,98 464,103 456,108"/><rect class="f-bad" x="464" y="70" width="128" height="66" rx="10"/><text class="f-t" x="528" y="99" text-anchor="middle">Impact</text><text class="f-s" x="528" y="120" text-anchor="middle">what it costs</text></svg>

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

The three properties also pull against each other:

- Stronger **confidentiality**, such as extra MFA prompts, makes data harder for the wrong person to reach, but also harder for the right one.
- Easier **availability**, such as a file share open to everyone, means people can always reach their work, but it removes the barrier that keeps the wrong people out.

Since no setup gets the most out of all three at once, security work turns out to be a series of decisions rather than a checklist. For the data in front of you, decide which property matters most, then choose your control knowing what you're giving up. Patient records and a public status page need opposite answers, and both answers are right for their own data.

```check
prompt: To stop the help desk calls, someone opens the Finance share to everyone in the firm. Which property got stronger, and which one paid for it?
level: 2
* Availability got stronger, and confidentiality paid for it :: Everyone can always reach the files, and that now includes people who shouldn't.
Confidentiality got stronger, and availability paid for it :: Opening a share removes a barrier, which makes data easier to reach, not harder.
Integrity got stronger, and nothing paid for it :: Every setup gives something up. Opening access trades privacy for convenience.
why: The three properties pull against each other, so every control is a decision about which one matters most for that data.
```

```sort
prompt: One last mix of the whole week. Which property does each control protect?
level: 1
Confidentiality: Authentication | Access control | Encryption
Integrity: Hashing | Digital signatures | Audit logs
Availability: Backups | Redundancy | Patching
```

