### Integrity

Integrity means information stays accurate and changes only when someone with permission changes it. When it fails, the data still looks normal and every system says it's fine. You've lost the ability to trust it, which is why we call it a **lie**. People keep working from that data, and their decisions stay wrong until someone notices.

It matters most where a quiet change is the harm:

- payroll amounts
- medication doses
- firewall rules
- ticket status

A changed firewall rule doesn't announce itself. It starts letting through traffic it used to block, and everything carries on.

**Controls:** hashing, digital signatures and audit logs.

None of these stops a change. They make it **visible afterwards**, by giving you something reliable to compare against. Preventing the change is access control's job.

With confidentiality, you ask whether anyone could have seen the data. With integrity, you ask whether it's still what it was. You can only answer that if a control recorded the original beforehand. Memory and assumption aren't evidence.

```match
prompt: Each property asks its own question. Match them.
Confidentiality = Could anyone have seen this?
Integrity = Is this still what it was?
```
