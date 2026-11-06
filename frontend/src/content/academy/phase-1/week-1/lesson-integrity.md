### Integrity

Integrity means information stays accurate. It changes only when someone with permission changes it on purpose. When integrity fails, the data still looks normal. Nothing is missing, and every system says it's working. What you've lost is the ability to trust what you read, which is why we call this failure a **lie**. Nobody is stopped from working, so people keep making decisions from that data. Those decisions stay wrong until someone notices the numbers don't match reality.

For that reason, integrity matters most where a quiet change is the harm in itself, such as:

- payroll amounts
- medication doses
- firewall rules
- ticket status

The firewall rule shows how quiet this can be. A changed rule doesn't announce itself. It starts letting through traffic it used to block, and everything downstream carries on as if that had always been the plan.

**Controls:** hashing, digital signatures and audit logs.

These controls work differently from the ones that protect confidentiality. None of them stops a change. A hash doesn't prevent someone editing a file, and an audit log doesn't prevent someone editing a record. What they do is make the change **visible afterwards**. They give you a reliable way to compare what you have now with what you should have. Preventing the change is a separate job. That belongs to access control, the same control that protects confidentiality.

That difference also shapes how you investigate. With confidentiality, you ask whether anyone could have seen the data. With integrity, you ask whether the data is still what it was. You can only answer that second question if someone put a control in place beforehand. Without one, nothing recorded what the data looked like, so all you have to compare against is memory and assumption. Neither counts as evidence.

```match
prompt: Each property asks its own question. Match them.
Confidentiality = Could anyone have seen this?
Integrity = Is this still what it was?
```
