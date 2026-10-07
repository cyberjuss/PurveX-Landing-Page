<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>How do you trust a file or a password when you cannot see inside it?</p>
</div>

### Introduction

Most of the data you will handle on the desk arrives unreadable. A string in a config file, a password column in a leaked table, a long value printed beside a download link. None of it means anything on sight, and the common instinct is to call all of it encrypted and move on. That instinct is wrong often enough to cause real damage, because the three methods that make data unreadable offer three completely different guarantees.

Encryption keeps data private, and it can be reversed by whoever holds the key. Hashing proves data was not changed, and it cannot be reversed by anybody at all. Encoding is a format change that anybody can undo in a single step, and it guarantees nothing whatsoever. This week is about learning what each one actually promises, because the practical question you will face is never what the value looks like. It is what somebody could do with it if they had a copy.

| Method | Can you get the original back? |
|---|---|
| Encoding | Yes. Anyone can. |
| Encryption | Yes, but only with the key |
| Hashing | No. Never. |

The consequences of confusing them are well documented. In 2012 around 6.5 million LinkedIn password hashes leaked. They had been stored without a salt, which meant identical passwords produced identical values and the whole set could be attacked at once rather than one account at a time. Most were cracked within days. The failure was not that the passwords were hashed badly in some abstract sense, but that the storage method chosen offered far less protection than the people who chose it believed.

The same ideas work in your favour just as reliably. In 2023 analysts tracked a poisoned 3CX installer across many organisations by sharing one hash of the malicious file. Any team holding that value could check their own copies in seconds and know with certainty whether they had the compromised build. That is the other half of the week: these are not only things that get done to you, they are tools you use to establish facts.

By the end of the week you should be able to tell encoding, encryption and hashing apart on sight, verify a download against a published hash, explain why a password store needs both a salt and a slow algorithm, and work a BitLocker recovery call and a vendor password breach without guessing at any step.

### Questions Answered in This Week

- How do you tell encoding, encryption and hashing apart when all three look scrambled?
- What does a hash actually prove about a file, and what does it not prove?
- How do you verify a download, and what do you do when the hash does not match?
- What does encryption protect, and why does the key matter more than the algorithm?
- What is the difference between symmetric and asymmetric encryption, and where is each used?
- How should a system store passwords, and why is a salt not a secret?
- Why does somebody else's breach become your problem, and what do you do first?
