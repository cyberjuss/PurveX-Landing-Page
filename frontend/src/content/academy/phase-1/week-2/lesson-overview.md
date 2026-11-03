<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>How do you trust a file or a password when you cannot see inside it?</p>
</div>

### Overview

Most of the data you handle on the desk arrives unreadable: a string in a config file, a password column in a leaked table, a long value beside a download link. The instinct is to call all of it "encrypted" and move on. That instinct causes real damage often enough, because the three methods that scramble data offer very different guarantees.

- **Encryption** keeps data private, reversible only by whoever holds the key.
- **Hashing** proves data was not changed, and cannot be reversed by anybody at all.
- **Encoding** is just a format change anybody can undo in one step, so it guarantees nothing.

The practical question you will face is never what a value looks like. It is what somebody could do with it if they had a copy.

| Method | Can you get the original back? |
|---|---|
| Encoding | Yes, and anyone can |
| Encryption | Yes, but only with the key |
| Hashing | No, and nobody can |

```connect
prompt: Connect each method to what it does.
Encryption = Keeps data private. Whoever holds the key can reverse it.
Hashing = Proves data was not changed. Nobody can reverse it.
Encoding = A format change anybody can undo in one step. It guarantees nothing.
```

### Why It Matters

Confusing them has a documented cost. In 2012, around 6.5 million LinkedIn password hashes leaked, stored without a salt, so identical passwords produced identical values and the whole set could be attacked at once rather than one account at a time — more than 60% were cracked within about a week.

The same ideas work in your favor just as reliably. In 2023, analysts tracked a poisoned 3CX installer across many organizations by sharing a single hash of the malicious file, so any team holding that one value could check their own copies in seconds. These methods aren't only things done to you; they're tools you can pick up and use.

By the end of the week you will be able to tell encoding, encryption and hashing apart on sight, verify a download against a published hash, explain why a password store needs both a salt and a slow algorithm, and work a BitLocker recovery call or a vendor breach without guessing.
