### Tools Analysts Use Against Malware
<!-- art: terminal -->

Verify, Contain, Preserve and Escalate describe what you do, but not what you click. In practice, a handful of tools carry almost every step of that response, and knowing what each one does, and doesn't do, is what turns the framework into real work.

#### Antivirus

Traditional antivirus catches malware by matching each file against a library of known-bad signatures. It's fast, and it's still useful, because a large share of what hits an endpoint is already known.

It does have a clear limit, though. A signature only exists for malware someone has already seen. A brand-new file, a slightly altered copy of an old one, or malware that never writes a file to disk can pass straight through. That gap is why antivirus alone isn't the whole answer, and why the next tool sits on top of it.

#### EDR

EDR stands for Endpoint Detection and Response, and it's the main tool you'll work inside for a malware alert. Rather than matching known signatures, it watches behavior on the endpoint: what a process does, what it connects to, and what it touches on disk. In your own lab environment, the EDR is Microsoft Defender for Endpoint.

Two parts of it map directly onto the response you've just learned. The first is the device timeline, a view of everything observed on that host in time order. That's where Verify happens, because you read what the process did rather than just what it was named.

Source: [Microsoft Learn: Investigate devices in Microsoft Defender for Endpoint](https://learn.microsoft.com/en-us/defender-endpoint/investigate-machines)

The second is the response actions, which are where Contain happens. Isolating a device cuts it off from the rest of the network but keeps its connection to Defender. The tool keeps watching, and you keep working on the host, without it reaching anything else.

Source: [Microsoft Learn: Take response actions on a device in Microsoft Defender for Endpoint](https://learn.microsoft.com/en-us/defender-endpoint/respond-machine-alerts)

#### Sandbox

A sandbox is an isolated environment built to run a suspicious file and watch what it does, without letting it touch a real endpoint. As a Tier 1 analyst, you'll rarely build or run one yourself. Instead, you'll submit a file to one through your EDR or another security tool. Then you read its report: what the file wrote to disk, what it connected to and what it tried to change.

That report can turn a Verify decision from a guess into a fact. After all, a file that does nothing suspicious when it runs is a completely different case from one that immediately tries to contact an outside address.

#### Hash and file reputation lookup

You already know from Phase 1 that a file's hash is a short fingerprint of its exact contents, and that tools such as Defender name files by their SHA-256. A file reputation service takes that fingerprint and checks it against many sources at once, instead of just one.

VirusTotal is the best-known example. Looking up a hash there returns the combined verdict of more than seventy antivirus engines and other security tools, based on files other people have already submitted.

Source: [VirusTotal: API v3 Overview](https://docs.virustotal.com/reference/overview)

Be careful with one thing, though: a lookup with no result isn't the same as a clean result. It usually means nobody has submitted that exact file before, which is common for anything new or rare, so treat an empty result as unknown rather than safe.

#### The SIEM

Last of all is the SIEM, which you met in Week 1, and your own Shift console is one. For a malware alert, it's where the endpoint alert first shows up. It's also where you check whether the same host, account or file appears anywhere else, before you decide how far the incident reaches.

```sort
prompt: Match each tool to what it does.
Antivirus: Matches a file against known-bad signatures, and misses what has no signature yet
EDR: Watches process behavior, holds the device timeline, and isolates a host from the network
Sandbox: Runs a suspicious file in isolation and reports what it did
Hash and file reputation lookup: Checks a file's fingerprint against many security engines at once
SIEM: Shows whether the same host, account or file shows up anywhere else in the environment
```
