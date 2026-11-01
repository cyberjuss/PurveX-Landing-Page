### Working a Malware Alert

When an endpoint alert fires, the goal is not to remove the malware yourself. It is to stop the spread and keep the evidence, then hand the incident up with a clear picture. The order matters.

A tier-1 response runs in this order:

1. Verify
2. Contain
3. Preserve
4. Escalate

Containment comes before cleanup, and evidence is never destroyed.

#### Verify

First, confirm the alert is real. Check what the tool flagged, on which host and for which user. Then rule out a known-good file the scanner mislabeled.

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

### What Would You Do?

**The ticket:** Taylor Osei in Compliance opened an email attachment named `Invoice_Q3.exe` this morning, thinking it was a vendor invoice. Ten minutes later, Defender for Endpoint flags his machine: `svchost.exe` is making an outbound connection it has never made before. Taylor says the file is no longer in his Downloads folder, and he does not remember deleting it.

What would you do?

Walk through Verify, Contain, Preserve and Escalate for this specific ticket, not the general case.

#### Verify, for this ticket

`svchost.exe` is a legitimate Windows process, so the connection itself is not automatically proof of anything. What makes this worth acting on is the combination: a new outbound connection, a file that opened and then disappeared, and a department that regularly opens real vendor invoices. Check whether the destination address matches any business service IT already uses. If it does not, this reads as a trojan that ran once and is now hiding behind a trusted process name.

#### Contain, for this ticket

Isolate Taylor's machine from the network now, since the alert shows it is already talking to something outside. Do not power it off. Shutting it down can lose whatever is still sitting in memory, which is often the only copy of what the trojan actually did.

#### Preserve, for this ticket

Leave the machine as it is rather than running a cleanup scan. The vanished file and the live outbound connection are the evidence of what arrived and where it is talking to, and a cleanup pass can erase both before anyone else looks at them.

#### Escalate, for this ticket

Hand up:

- Taylor's name and host
- The file name and when he opened it
- The outbound destination Defender flagged
- The fact that the host is already isolated

That gives the next analyst everything needed to pick up the investigation without re-asking Taylor what happened.
