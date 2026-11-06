### Integrity

Integrity means that information stays accurate, and changes only when someone with permission changes it on purpose. When integrity fails, the data still looks completely normal and every system says it's working fine. What you've lost is the ability to trust what you're reading, which is why we call this failure a **lie**. Since nobody is stopped from working, people keep making decisions from that data, and those decisions stay wrong until someone notices the numbers don't match reality.

Integrity matters most where a quiet change is the harm in itself, such as:

- payroll amounts
- medication doses
- firewall rules
- ticket status

The firewall rule is a good example of how quiet this can be. A changed rule doesn't announce itself. It simply starts letting through traffic it used to block, and everything downstream carries on as if that had always been the plan.

**Controls:** hashing, digital signatures and audit logs.

Notice that these controls work differently from the ones that protect confidentiality. None of them stops a change from happening. What they do is make the change **visible afterwards**, by giving you something reliable to compare against. Preventing the change in the first place is a separate job, and it belongs to access control.

That difference shapes how you investigate, too. With confidentiality, you're asking whether anyone could have seen the data, while with integrity, you're asking whether the data is still what it was. You can only answer that second question if someone recorded the original beforehand, because memory and assumption don't count as evidence.

```match
prompt: Each property asks its own question. Match them.
Confidentiality = Could anyone have seen this?
Integrity = Is this still what it was?
```
