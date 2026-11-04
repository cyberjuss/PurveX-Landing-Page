### Allowlisting and Blocklisting

Before anything can misbehave on a system, it has to be allowed to run in the first place, and that permission follows one of two opposite default settings. An allowlist, also called application whitelisting and formally documented in NIST SP 800-167, blocks everything by default and only permits software that has been explicitly approved. That approved software is usually identified by its file hash, its signer, or the path it's installed to. A blocklist works the other way round: it allows everything by default and only blocks what's already known to be malicious.

That difference in the default is the whole point, and it's why the two controls catch different things. A blocklist only stops what someone has already seen and flagged, so it does nothing against malware nobody has catalogued yet. An allowlist, on the other hand, stops anything that hasn't been approved, whether it's known or not, which makes it the stronger control against brand-new threats. That strength comes at a cost, though. Building and maintaining an allowlist that doesn't break legitimate software is real, ongoing work, so many organizations use blocklists everywhere and keep allowlisting for their most sensitive systems.

You'll still see the terms "whitelist" and "blacklist" in older documentation and some vendor tools. Current guidance, including from the UK's National Cyber Security Centre, has moved towards "allowlist" and "blocklist", or "denylist", because equating "white" with permitted and "black" with denied carries baggage the control itself doesn't need. This course uses the newer terms, but since you'll meet the older ones in the field, knowing both matters more than picking a side.

```match
prompt: Match each scenario to the control it describes.
A hospital workstation that can only run its 40 approved clinical applications, and nothing else = Allowlist
A corporate laptop that can run anything except a list of known malware signatures = Blocklist
A new, never-before-seen piece of malware that a blocklist has no signature for yet = What a blocklist misses
A legitimate new app an employee needs, blocked until IT adds it to the approved list = What an allowlist costs in upkeep
```

### Work the Queue

Looking back, everything this week taught is a way of reading an alert: the tier structure, the investigation mindset, the 5 W's, how an incident gets classified, and what control let something run in the first place. None of that sticks as theory, though. It only really sticks once you've used it on a real alert you haven't seen before.

So before you move on, open your Shift console and work three incidents from your queue. For each one:

- Name which tier would actually own it, and why.
- Run the 5 W's before you decide anything.
- Classify it P1, P2, or P3, by impact rather than by how urgent the wording sounds.

Do that, and you'll have done this week for real rather than just read it.
