### Integrity

Integrity means that information stays accurate, changing only when someone with permission deliberately changes it. When integrity fails, the data still looks completely normal, because nothing is missing and every system says it's working fine. What you've actually lost is the ability to trust what you're reading, and that's why we call this failure a **lie**. Since nobody is stopped from working, people keep making decisions based on that data, and those decisions stay wrong until someone notices the numbers don't match reality.

For that reason, integrity matters most where a quiet change is the harm in itself, such as:

- payroll amounts
- medication doses
- firewall rules
- ticket status

The firewall rule is a good example of how quiet this can be. Once someone changes a rule, it doesn't announce itself. It simply starts letting through traffic it used to block, and everything downstream carries on as if that had always been the plan.

**Controls:** hashing, digital signatures and audit logs.

These controls work differently from the ones that protect confidentiality, so it's worth being clear on how. None of them actually stops a change from happening: a hash doesn't prevent someone from editing a file, and an audit log doesn't prevent someone from editing a record. Instead, what they do is make the change **visible afterwards**, by giving you a reliable way to compare what you have now with what you should have. Preventing the change in the first place is a separate job, and it belongs to access control, the same control that protects confidentiality.

That difference also shapes how you'll investigate. With confidentiality, you're asking whether anyone could have seen the data, whereas with integrity, you're asking whether the data is still what it was. However, you can only answer that second question if someone put a control in place beforehand. Without one, nothing recorded what the data originally looked like, so all you'd have to compare against is memory and assumption, and neither of those counts as evidence.

```match
prompt: Each property asks its own question. Match them.
Confidentiality = Could anyone have seen this?
Integrity = Is this still what it was?
```
