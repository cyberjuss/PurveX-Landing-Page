### Allowlisting and Blocklisting

Before anything can misbehave on a system, it has to be allowed to run in the first place, and that permission is governed by one of two opposite default postures. An allowlist (also called application whitelisting, documented formally in NIST SP 800-167) denies everything by default and only permits software that has been explicitly approved, typically identified by its file hash, its signer, or its installation path. A blocklist does the reverse: it allows everything by default and only denies what is already known to be malicious.

The difference in default posture is the whole point, and it is why the two controls catch different things. A blocklist only stops what someone has already seen and flagged, which means it does nothing against malware nobody has catalogued yet. An allowlist stops anything unapproved, known or not, which is why it is the stronger control against novel threats. That strength comes at a cost: building and maintaining an allowlist that does not break legitimate software is real, ongoing work, and it is why many organizations run blocklists everywhere and reserve allowlisting for their most sensitive systems rather than the whole fleet.

The terms "whitelist" and "blacklist" are still common in older documentation and some vendor tools. Current guidance, including from the UK's National Cyber Security Centre, has moved toward "allowlist" and "blocklist" (or "denylist") instead: equating "white" with permitted and "black" with denied carries baggage the function of the control does not need. This course uses the newer terms. You will still see the older ones in the field, and knowing both matters more than picking a side in the naming.

```match
prompt: Match each scenario to the control it describes.
A hospital workstation that can only run its 40 approved clinical applications, and nothing else = Allowlist
A corporate laptop that can run anything except a list of known malware signatures = Blocklist
A new, never-before-seen piece of malware that a blocklist has no signature for yet = What a blocklist misses
A legitimate new app an employee needs, blocked until IT adds it to the approved list = What an allowlist costs in upkeep
```
