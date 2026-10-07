<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>How do you trust a file or a password when you cannot see inside it?</p>
</div>

### Introduction

Most of the data you will handle on the desk arrives unreadable. A string in a config file, a password column in a leaked table, a long value printed beside a download link. None of it means anything on sight, and the common instinct is to call all of it encrypted and move on. That instinct is wrong often enough to cause real damage, because the three methods that make data unreadable offer three completely different guarantees.

Three methods make data unreadable, and they promise three different things:

- **Encryption** keeps data private. It can be reversed by whoever holds the key.
- **Hashing** proves data was not changed. It cannot be reversed by anybody at all.
- **Encoding** is a format change anybody can undo in one step. It guarantees nothing.

The practical question you will face is never what a value looks like. It is what somebody could do with it if they had a copy.

| Method | Can you get the original back? |
|---|---|
| Encoding | Yes. Anyone can. |
| Encryption | Yes, but only with the key |
| Hashing | No. Never. |

### Why it matters

Confusing them has a documented cost. In 2012 around 6.5 million LinkedIn password hashes leaked, and because they had been stored without a salt, identical passwords produced identical values and the whole set could be attacked at once rather than one account at a time. Most of them were cracked within days. The storage method had offered far less protection than the people who chose it believed, which is the failure this week is trying to make visible to you before you meet it.

The same ideas work in your favour just as reliably. In 2023 analysts tracked a poisoned 3CX installer across many organisations by sharing a single hash of the malicious file, and any team holding that one value could check their own copies in seconds. So these are not only things done to you. They are tools you pick up and use to establish facts.

By the end of the week you can:

- Tell encoding, encryption and hashing apart on sight
- Verify a download against a published hash
- Explain why a password store needs both a salt and a slow algorithm
- Work a BitLocker recovery call and a vendor password breach without guessing

### Questions Answered in This Week

- How do you tell encoding, encryption and hashing apart when all three look scrambled?
- What does a hash actually prove about a file, and what does it not prove?
- How do you verify a download, and what do you do when the hash does not match?
- What does encryption protect, and why does the key matter more than the algorithm?
- What is the difference between symmetric and asymmetric encryption, and where is each used?
- How should a system store passwords, and why is a salt not a secret?
- Why does somebody else's breach become your problem, and what do you do first?
