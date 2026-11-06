<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>How do you trust a file or a password when you cannot see inside it?</p>
</div>

### Overview

A lot of the data you'll handle on the desk arrives looking unreadable, whether it's a string in a config file, a column of leaked passwords or a long value printed next to a download link. The natural instinct is to call all of it "encrypted" and move on. That instinct causes real damage, because there are three different ways to scramble data, and each one offers a very different guarantee.

- **Encryption** keeps data private, reversible only by whoever holds the key.
- **Hashing** proves data was not changed, and cannot be reversed by anybody at all.
- **Encoding** is a format change anybody can undo in one step, so it guarantees nothing.

Because of those differences, the question you'll face on the job is never what a value looks like. It's what somebody could do with that value if they had a copy of it.

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

Mixing these up has a real, documented cost. In 2012, about 6.5 million LinkedIn password hashes leaked, and because they'd been stored without a salt, identical passwords had identical hashes. That let attackers go after the whole set at once instead of one account at a time, and more than 60% of them were cracked within about a week.

The good news is that the same ideas work just as well in your favor. In 2023, analysts tracked a poisoned 3CX installer across many organizations by sharing a single hash of the malicious file, which let any team check its own copies in seconds.

By the end of this week, you'll be able to tell the three apart on sight and verify a download against a published hash. You'll also be able to explain why stored passwords need both a salt and a slow algorithm, which is what lets you work a vendor breach without guessing.
