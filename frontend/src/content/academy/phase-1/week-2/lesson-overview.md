<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>How do you trust a file or a password when you cannot see inside it?</p>
</div>

### Overview

Most of the data you handle on the desk arrives unreadable: a string in a config file, a password column in a leaked table, a long value beside a download link. The instinct is to call all of it "encrypted" and move on. That instinct causes real damage often enough, because the three methods that scramble data offer very different guarantees.

- **Encryption** keeps data private. It can be reversed by whoever holds the key.
- **Hashing** proves data was not changed. It cannot be reversed by anybody at all.
- **Encoding** is a format change anybody can undo in one step. It guarantees nothing.

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

Confusing them has a documented cost. In 2012, roughly 6.5 million LinkedIn password hashes leaked, stored without a salt, so identical passwords produced identical values and the whole set could be attacked at once. Over 60% cracked within a week.

The same ideas cut the other way too. In 2023, analysts tracked a poisoned 3CX installer across many organizations by sharing one hash of the malicious file, and any team holding that value could check their own copies in seconds. These methods aren't only done to you. They're tools you use.

By the end of the week you will be able to tell encoding, encryption and hashing apart on sight, verify a download against a published hash, explain why a password store needs both a salt and a slow algorithm, and work a BitLocker recovery call or a vendor breach without guessing.
