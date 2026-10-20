### Working a Malware Alert

When an endpoint alert fires, the goal is not to remove the malware yourself. It is to stop the spread and keep the evidence, then hand the incident up with a clear picture. The order matters.

A tier-1 response runs in this order:

1. Verify
2. Contain
3. Preserve
4. Escalate

Containment comes before cleanup, and evidence is never destroyed.

#### Verify

First, confirm the alert is real. Check what the tool flagged, on which host and for which user, then rule out a known-good file the scanner mislabeled.

A quick check against context saves the team from chasing a false positive. If the file is a normal business tool the scanner does not recognize, that is a very different outcome from a fresh download that just ran.

#### Contain

If it is real, isolate the host from the network so the malware cannot spread or talk to the attacker. Most endpoint tools can quarantine a machine with one action.

Containment is the single most important step, especially for a worm or ransomware. Disconnecting one machine early can be the difference between one host and the whole environment.

#### Preserve

Do not wipe or rebuild the machine yet. It holds the evidence that tells responders what the file was, where it came from and what it did.

Wiping too early destroys the trail, the same way deleting a suspicious account destroys the evidence of an intrusion. Contain, then leave it for the team that will investigate.

#### Escalate

Hand the incident up with what you found:

- the host and the account
- the file and when it ran
- the path it likely came in through
- what you already contained, and when

A good escalation lets the next analyst start work instead of re-gathering basics. That write-up is the deliverable of a tier-1 malware response, as much as the containment itself.

```order
prompt: Put the tier-1 response in order.
Verify: confirm the alert is real
Contain: isolate the host from the network
Preserve: do not wipe or rebuild it yet
Escalate: hand it up with what you found
```
