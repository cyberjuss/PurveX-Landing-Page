<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>How do you trust a file or a password when you cannot see inside it?</p>
</div>

### Overview

Encryption keeps data private. Hashing proves data was not changed. This week you learn what each one guarantees.

Three methods make data look scrambled. Only one test tells them apart:

| Method | Can you get the original back? |
|---|---|
| Encoding | Yes. Anyone can. |
| Encryption | Yes, but only with the key |
| Hashing | No. Never. |

**Why it matters:** in 2012, 6.5 million LinkedIn password hashes leaked. They had no salt, so most were cracked within days. In 2023, analysts tracked a poisoned 3CX installer by sharing its hash.

**By Friday you can:**

- Tell encoding, encryption and hashing apart on sight
- Verify a download with a hash
- Explain why passwords need a salt and a slow hash
- Handle a BitLocker recovery call and a vendor password breach
