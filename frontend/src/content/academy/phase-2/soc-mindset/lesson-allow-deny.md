### Allowlisting and Blocklisting

Before anything can misbehave on a system, it has to be allowed to run in the first place. That permission is governed by one of two opposite default postures. An allowlist, also called application whitelisting and documented formally in NIST SP 800-167, denies everything by default and only permits software that has been explicitly approved. Approved software is typically identified by its file hash, its signer, or its installation path. A blocklist does the reverse. It allows everything by default and only denies what is already known to be malicious.

The difference in default posture is the whole point, and it is why the two controls catch different things. A blocklist only stops what someone has already seen and flagged. That means it does nothing against malware nobody has catalogued yet. An allowlist stops anything unapproved, known or not. That is why it is the stronger control against novel threats. That strength comes at a cost. Building and maintaining an allowlist that does not break legitimate software is real, ongoing work. That is why many organizations run blocklists everywhere and reserve allowlisting for their most sensitive systems rather than the whole fleet.

The terms "whitelist" and "blacklist" are still common in older documentation and some vendor tools. Current guidance has moved toward "allowlist" and "blocklist," or "denylist," instead. The UK's National Cyber Security Centre is one source of that guidance. Equating "white" with permitted and "black" with denied carries baggage the function of the control does not need. This course uses the newer terms. You will still see the older ones in the field, and knowing both matters more than picking a side in the naming.

```match
prompt: Match each scenario to the control it describes.
A hospital workstation that can only run its 40 approved clinical applications, and nothing else = Allowlist
A corporate laptop that can run anything except a list of known malware signatures = Blocklist
A new, never-before-seen piece of malware that a blocklist has no signature for yet = What a blocklist misses
A legitimate new app an employee needs, blocked until IT adds it to the approved list = What an allowlist costs in upkeep
```

### Work the Queue

Everything this week taught is a way of reading an alert: the tier structure, the investigation mindset, the 5 W's, how it gets classified, and what control let it run in the first place. None of it holds up as theory. It only holds up against a real alert you have not seen yet.

Before you move on, open your Shift console and work three incidents from your queue. For each one:

- Name which tier would actually own it, and why.
- Run the 5 W's before you decide anything.
- Classify it P1, P2, or P3, by impact rather than by how urgent the wording sounds.

That is this week, done for real instead of read.
