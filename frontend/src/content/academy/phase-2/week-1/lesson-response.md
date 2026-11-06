### Working a Malware Alert

When an endpoint alert fires, your goal isn't to remove the malware yourself. Instead, it's to stop the spread and keep the evidence, and then hand the incident up with a clear picture. The order you do that in matters.

A Tier 1 response runs in this order:

1. Verify
2. Contain
3. Preserve
4. Escalate

Two rules sit underneath that order: containment always comes before cleanup, and evidence is never destroyed.

#### Verify

First, confirm that the alert is real. Check what the tool flagged, on which host and for which user, and then rule out a known-good file that the scanner might have mislabeled.

That quick check against context saves the team from chasing a false alarm. After all, a normal business tool the scanner doesn't recognize is a very different situation from a fresh download that just ran.

#### Contain

Once you know it's real, isolate the host from the network so the malware can't spread or talk to the attacker. Most endpoint tools can quarantine a machine with a single action.

This is the most important step, especially with a worm or ransomware. Disconnecting one machine early can be the difference between losing one host and losing the whole environment.

#### Preserve

It's tempting to wipe the machine straight away, but don't wipe or rebuild it yet. It holds the evidence that tells responders what the file was, where it came from, and what it did.

Wiping too early destroys that trail, in the same way that deleting a suspicious account destroys the evidence of an intrusion. So contain it, and then leave it for the team that will investigate.

#### Escalate

Finally, hand the incident up with what you found:

- the host and the account
- the file and when it ran
- the path it likely came in through
- what you already contained, and when

A good escalation lets the next analyst start working instead of gathering the basics all over again. In fact, that write-up is as much the result of a Tier 1 malware response as the containment itself.

```order
prompt: Put the tier-1 response in order.
Verify: confirm the alert is real
Contain: isolate the host from the network
Preserve: do not wipe or rebuild it yet
Escalate: hand it up with what you found
```

### What Would You Do?

**The ticket:** Taylor Osei in Compliance opened an email attachment named `Invoice_Q3.exe` this morning, thinking it was a vendor invoice. Ten minutes later, Defender for Endpoint flags his machine: `svchost.exe` is making an outbound connection it has never made before. Taylor says the file is no longer in his Downloads folder, and he does not remember deleting it.

Before reading on, think about what you would do.

Then let's walk through Verify, Contain, Preserve and Escalate for this specific ticket, rather than the general case.

#### Verify, for this ticket

`svchost.exe` is a legitimate Windows process, so the connection on its own doesn't prove anything. What makes this worth acting on is the combination: a new outbound connection, a file that opened and then disappeared, and a department that regularly opens real vendor invoices. So check whether the destination address matches any business service IT already uses. If it doesn't, this looks like a trojan that ran once and is now hiding behind a trusted process name.

#### Contain, for this ticket

Since the alert shows the machine is already talking to something outside, isolate Taylor's machine from the network now. Don't power it off, though, because shutting it down can lose whatever is still sitting in memory, which is often the only record of what the trojan did.

#### Preserve, for this ticket

For the same reason, leave the machine as it is rather than running a cleanup scan. The vanished file and the live outbound connection are your evidence of what arrived and where it's talking to. A cleanup pass could erase both before anyone else looks.

#### Escalate, for this ticket

Then hand up:

- Taylor's name and host
- The file name and when he opened it
- The outbound destination Defender flagged
- The fact that the host is already isolated

With all of that, the next analyst has everything they need to pick up the investigation without asking Taylor what happened all over again.
