### Integrity

Integrity means that information stays accurate and unchanged unless an authorized person deliberately changes it. When it fails, the data continues to look entirely normal. Nothing is missing and every system reports itself working. What has gone is your ability to trust what you are reading, which is why this failure is a **lie**. Decisions keep being made on the data, and they keep being wrong, until somebody notices the numbers no longer match reality.

It matters most where a silent change is itself the harm:

- payroll amounts
- medication doses
- firewall rules
- ticket status

A firewall rule that has been changed does not announce itself. It simply allows traffic that used to be blocked, and everything downstream behaves as though that was always the intention.

**Controls:** hashing, digital signatures and audit logs.

It is worth being precise about what these do, because they work differently from the controls protecting confidentiality. None of them prevents a change. A hash does not stop somebody editing a file and an audit log does not stop somebody editing a record. What they do is make the change **visible afterwards**, by giving you a reliable way to compare what you have now against what you should have.

That shapes how you investigate. Confidentiality asks whether anyone could have seen this. Integrity asks whether this is still what it was, and answering that depends entirely on whether somebody put a control in place beforehand. If nothing was recording the original state, you are comparing the data against memory and assumption, which is not evidence.
