### Tools Analysts Use Against Malware
<!-- art: terminal -->

Verify, Contain, Preserve and Escalate describe what you do. They do not describe what you click. A few tools carry almost every step of that response, and knowing what each one actually does, and does not do, is what turns the framework into real work.

#### Antivirus

Traditional antivirus catches malware by matching a file against a library of known-bad signatures. It is fast and it is still useful, because a large share of what hits an endpoint is already known.

It also has a clear limit. A signature only exists for malware someone has already seen, so a brand-new file, a slightly altered copy of an old one, or malware that never writes a file to disk at all can pass straight through. That gap is why antivirus alone is not the whole answer, and why the next tool exists on top of it.

#### EDR

EDR stands for Endpoint Detection and Response, and it is the main tool you will actually work inside for a malware alert. Instead of matching known signatures, it watches behavior on the endpoint: what a process does, what it connects to, what it touches on disk. Microsoft Defender for Endpoint is the EDR used in your own lab environment.

Two parts of it matter for the response you already learned. The device timeline is a chronological view of everything observed on that host, which is where Verify actually happens: you read what the process did, not just what it was named.

Source: [Microsoft Learn: Investigate devices in Microsoft Defender for Endpoint](https://learn.microsoft.com/en-us/defender-endpoint/investigate-machines)

The response actions are where Contain happens. Isolating a device cuts it off from the rest of the network while keeping its connection to Defender itself, so the tool can keep watching and you can keep working the host without it reaching anything else.

Source: [Microsoft Learn: Take response actions on a device in Microsoft Defender for Endpoint](https://learn.microsoft.com/en-us/defender-endpoint/respond-machine-alerts)

#### Sandbox

A sandbox is an isolated environment built to run a suspicious file and watch what it does, without letting it touch a real endpoint. As a tier-1 analyst you will rarely build or operate one yourself. You will submit a file to one through your EDR or another security tool, then read its report: what the file wrote to disk, what it connected to, what it tried to change.

That report can turn a Verify decision from a guess into a fact. A file that does nothing suspicious when detonated is a different case entirely from one that immediately tries to contact an external address.

#### Hash and file reputation lookup

You already know that a file's hash is a short fingerprint of its exact contents, and that tools such as Defender name files by their SHA-256. A hash and file reputation service takes that fingerprint and checks it against many other sources at once instead of just one.

VirusTotal is the best-known example. A hash lookup there returns the combined verdict of more than seventy antivirus engines and other security tools, built from files other people have already submitted.

Source: [VirusTotal: API v3 Overview](https://docs.virustotal.com/reference/overview)

A lookup with no result is not the same as a clean result. It usually just means nobody has submitted that exact file before, which is common for something new or rare, so treat an empty result as unknown rather than as safe.

#### The SIEM

You already met the SIEM in Week 1, and your own Shift console is one. For a malware alert specifically, it is where the endpoint alert first surfaces and where you check whether the same host, account or file shows up anywhere else before you decide how far this incident actually reaches.

```sort
prompt: Match each tool to what it actually does.
Antivirus: Matches a file against known-bad signatures, and misses what has no signature yet
EDR: Watches process behavior, holds the device timeline, and isolates a host from the network
Sandbox: Runs a suspicious file in isolation and reports what it actually did
Hash and file reputation lookup: Checks a file's fingerprint against many security engines at once
SIEM: Shows whether the same host, account or file shows up anywhere else in the environment
```
