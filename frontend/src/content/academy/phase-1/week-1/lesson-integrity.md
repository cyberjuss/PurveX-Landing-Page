### Integrity

Integrity means that information stays accurate, and only changes when someone with permission deliberately changes it. When integrity fails, the data still looks completely normal. Nothing is missing and every system says it's working fine. What you've actually lost is the ability to trust what you're reading, which is why we call this failure a **lie**. Because nobody is stopped from working, people keep making decisions based on that data, and those decisions keep being wrong until someone finally notices the numbers don't match reality.

Integrity matters most where a quiet change is the harm in itself, such as:

- payroll amounts
- medication doses
- firewall rules
- ticket status

Take the firewall rule as an example. A rule that someone has changed doesn't announce itself. It simply starts letting through traffic it used to block, and everything downstream carries on as if that had always been the plan.

**Controls:** hashing, digital signatures and audit logs.

These controls work differently from the ones that protect confidentiality, and it's worth being clear on how. None of them actually stops a change from happening: a hash doesn't prevent someone from editing a file, and an audit log doesn't prevent someone from editing a record. What they do is make the change **visible afterwards**, by giving you a reliable way to compare what you have now with what you should have. Preventing the change in the first place is the job of access control, the same control that protects confidentiality.

That difference shapes how you'll investigate. With confidentiality, you're asking whether anyone could have seen the data. With integrity, you're asking whether the data is still what it was. You can only answer that second question if someone put a control in place beforehand. If nothing recorded what the data originally looked like, all you have to compare against is memory and assumption, and neither of those counts as evidence.

```match
prompt: Each property asks its own question. Match them.
Confidentiality = Could anyone have seen this?
Integrity = Is this still what it was?
```
