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

Line the three up and a pattern shows up that no single campaign makes obvious: every one of them reached Command and Control, using three different ports. Two of the three, Phishing Chain and Open Door, even reached Actions on Objectives, far enough to stage real data for exfiltration. Credential Campaign never got that far at all. But not one of the three ever got anything out. Three different front doors led to the same back door technique once each attacker was inside, and a domain controller's own outbound traffic is unusual enough, on a machine with no real reason to reach the open internet, that closing that one channel is what stopped every chain before its objective was ever completed, whether the attacker had reached the staging step or not.

### Two Findings That Were Never Part of a Chain

Two tickets from this phase are missing from that list on purpose: Approved Overnight, or Not? and Baseline a Team, Then Find Who Breaks It. Both looked, for a moment, like they could belong to one of the three. Neither did. One was a legitimate sign-in that only sounded like an attack. The other was ordinary privilege creep nobody had reviewed in a year. Real SOC and sysadmin work is full of findings like that, running alongside whatever the real campaigns are doing, and telling them apart from the chain itself is as much the job as working the chain.

### Why the First Two Stages Barely Show Up

Reconnaissance and Weaponization barely show up across all three campaigns, and that is not a gap in this phase's design. A SOC rarely gets a clean look at either one directly: Weaponization happens entirely outside systems you can see, and Reconnaissance usually only shows up after the fact, as a handful of odd log entries nobody connects to anything until the rest of the chain is already visible. Three real campaigns, three real sets of artifacts, and the stage every one of them was actually stopped at: that is the whole picture this phase was built to show you.
