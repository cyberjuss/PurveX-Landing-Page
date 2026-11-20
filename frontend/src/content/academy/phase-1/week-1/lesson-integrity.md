### Integrity

Integrity means that information stays accurate, and changes only when someone with permission changes it on purpose. When integrity fails:

<ul>
<li>The data still looks completely normal, and every system says it's working fine</li>
<li>You can no longer trust what you're reading, which is why we call this failure a <strong>lie</strong></li>
<li>Nobody is stopped from working, so people keep making decisions from that data, and those decisions stay wrong until someone notices the numbers don't match reality</li>
</ul>

Integrity matters most where a quiet change is the harm in itself, such as:

- payroll amounts
- medication doses
- firewall rules
- ticket status

The firewall rule is a good example of how quiet this can be. A changed rule doesn't announce itself. It simply starts letting through traffic it used to block, and everything downstream carries on as if that had always been the plan.

**Controls:** hashing, digital signatures and audit logs.

These controls work differently from the ones that protect confidentiality:

<ul>
<li>None of them stops a change from happening</li>
<li>They make the change <strong>visible afterwards</strong>, by giving you something reliable to compare against</li>
<li>Preventing the change in the first place is a separate job, and it belongs to access control</li>
</ul>

That difference shapes how you investigate, too:

<ul>
<li><strong>Confidentiality</strong> asks whether anyone could have seen the data</li>
<li><strong>Integrity</strong> asks whether the data is still what it was</li>
</ul>

You can only answer that second question if someone recorded the original beforehand, because memory and assumption don't count as evidence.

```check
prompt: Jordan saved a fingerprint of the wire file on Friday. What can that fingerprint do on Monday?
level: 1
* Show whether the file changed since Friday :: Integrity controls make a change visible afterwards by giving you something reliable to compare against.
Stop anyone from changing the file :: Preventing a change is access control's job. Integrity controls show a change after it happens.
Keep other departments from reading the file :: Keeping a file private is confidentiality, which is access control and encryption.
why: Hashing, signatures and audit logs don't stop a change. They make it visible afterwards, and only because someone recorded the original first.
```

```match
prompt: Each property asks its own question. Match them.
level: 1
Confidentiality = Could anyone have seen this?
Integrity = Is this still what it was?
Availability = Can people reach it when they need it?
```
