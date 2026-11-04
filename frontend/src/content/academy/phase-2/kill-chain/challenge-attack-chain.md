<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>The Chain You Already Worked</h3>
<p class="ad-brief__ask">Three attackers, three different doors. Can you step back and read the pattern underneath all three?</p>
<p>No new ticket here. Just the three campaigns from this phase, read side by side.</p>
</div>

### Three Doors, Three Chains

1. **The Credential Campaign.** Exploitation twice over: a wide password spray (T1110.003) against six throwaway accounts, then a narrower, targeted guess (T1110.001) against one real admin account. Installation followed (T1053.005, a scheduled task), then Command and Control over a non-standard port (T1571). Stopped there. Actions on Objectives never happened at all.
2. **The Phishing Chain.** The only one of the three with a real Delivery stage: a spearphishing attachment (T1566.001), disguised with a double extension (T1036.007). You hashed it and checked a real reputation database, watched its beacon leave on a live capture, then found the data it had staged for exfiltration (T1074.001), moved and ready to leave, before it ever did.
3. **The Open Door.** No guessing, no attachment. One inbound rule left over from before Zero Trust (T1021.002) was the whole way in. You proved real traffic was crossing it before closing it, then found the same two later stages behind a different door: Installation and Command and Control, then a file staged on a share it had no business sitting on (T1074.001), ready to leave the same way.

### The Pattern Underneath

When you line the three up, a pattern appears that no single campaign makes obvious. Every one of them reached Command and Control, each on a different port. Two of them, Phishing Chain and Open Door, went further still and reached Actions on Objectives, getting far enough to stage real data for exfiltration, while Credential Campaign never got that far. Even so, not one of the three got anything out. Three different front doors led to the same back-door technique once each attacker was inside. And because a domain controller has no real reason to reach the open internet, its outbound traffic stands out. Closing that one channel is what stopped every chain before its objective was completed, whether or not the attacker had reached the staging step.

### Two Findings That Were Never Part of a Chain

You may have noticed that two tickets from this phase are missing from that list: Approved Overnight, or Not? and Baseline a Team, Then Find Who Breaks It. That's deliberate. For a moment, both looked as if they might belong to one of the three campaigns, but neither did. The first was a legitimate sign-in that only sounded like an attack, and the second was ordinary privilege creep that nobody had reviewed in a year. Real SOC and sysadmin work is full of findings like these, running alongside whatever the real campaigns are doing. Telling them apart from the chain is as much a part of the job as working the chain itself.

### Why the First Two Stages Barely Show Up

Reconnaissance and Weaponization barely appear in any of the three campaigns, and that isn't a gap in how this phase was designed. A SOC rarely gets a clear look at either stage. Weaponization happens entirely outside the systems you can see, and Reconnaissance usually surfaces only after the fact, as a few odd log entries that nobody connects to anything until the rest of the chain is visible. What you've worked through instead is three real campaigns, each with its own artifacts and the stage where it was stopped. That's the whole picture this phase was built to show you.
