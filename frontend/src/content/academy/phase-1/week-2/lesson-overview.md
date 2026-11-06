<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>How do you trust a file or a password when you cannot see inside it?</p>
</div>

### Overview

Data often arrives looking unreadable: a string in a config file, a column of leaked passwords, a long value next to a download link. The instinct is to call it "encrypted". That's often wrong, and costly, because there are three ways to scramble data and each guarantees something different.

- **Encryption** keeps data private, reversible only by whoever holds the key.
- **Hashing** proves data was not changed, and cannot be reversed by anybody at all.
- **Encoding** is a format change anybody can undo in one step, so it guarantees nothing.

So the question on the job isn't what a value looks like. It's what someone could do with a copy of it.

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

In 2012, about 6.5 million LinkedIn password hashes leaked. They had no salt, so identical passwords had identical hashes and attackers could crack the whole set at once. More than 60% fell within about a week.

The same ideas work for you. In 2023, analysts tracked a poisoned 3CX installer across many organizations by sharing one hash of the malicious file. Any team could check its own copies in seconds.

By the end of this week, you'll tell the three apart on sight, verify a download against a published hash, and explain why stored passwords need a salt and a slow algorithm.
