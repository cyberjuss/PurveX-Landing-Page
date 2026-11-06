<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>The Chain You Already Worked</h3>
<p class="ad-brief__ask">Four attackers, four different ways in. Can you step back and read the pattern underneath all four?</p>
<p>No new ticket here. Just the four campaigns from this phase, read side by side.</p>
</div>

### Four Ways In, Four Chains

1. **The Credential Campaign.** Exploitation twice over: a wide password spray (T1110.003) against six throwaway accounts, then a narrower, targeted guess (T1110.001) against one real admin account. Installation followed (T1053.005, a scheduled task), then Command and Control over a non-standard port (T1571). Stopped there. Actions on Objectives never happened at all.
2. **The Phishing Chain.** The only one of the four with a real Delivery stage: a spearphishing attachment (T1566.001), disguised with a double extension (T1036.007). You hashed it and checked a real reputation database, and watched its beacon leave on a live capture. Then you found the data it had staged for exfiltration (T1074.001) before it ever left.
3. **The Open Door.** No guessing, no attachment. One inbound rule left over from before Zero Trust (T1021.002) was the whole way in. You proved real traffic was crossing it before closing it. Behind that different door you found the same later stages, Installation and Command and Control. Then you found a file staged on a share where it had no business (T1074.001), ready to leave the same way.
4. **The Keys to the Domain.** No guess, no attachment and no open door. The attacker used Kerberos as designed, requesting an RC4 service ticket to crack offline (T1558.003, Kerberoasting). Then they asked a domain controller for replication data they had no right to (T1003.006, DCSync). That second step is Actions on Objectives, because the objective was the domain's password hashes. There was no malware, no Installation and no outbound channel to close.

### The Pattern Underneath

When you line the first three up, a pattern appears that no single campaign makes obvious. Every one of them reached Command and Control, each on a different port. Two of them, Phishing Chain and Open Door, went further and staged real data for exfiltration. Credential Campaign never got that far. Even so, none of the three got anything out. Three different front doors led to the same back-door technique once each attacker was inside. A domain controller has no real reason to reach the open internet, so its outbound traffic stands out. Closing that one channel stopped all three chains before they reached their objective.

The fourth campaign breaks that pattern, and that's the lesson in it. Keys to the Domain never needed a channel out, because it used trusted features of Active Directory from the inside. Watching outbound traffic would never have caught it. Only the domain controller's own audit log could. A defense that works against three chains can still miss the fourth, which is why a SOC watches more than one stage.

### Two Findings That Were Never Part of a Chain

You may have noticed that two tickets from this phase are missing from that list: Approved Overnight, or Not? and Baseline a Team, Then Find Who Breaks It. That's deliberate. For a moment, both looked as if they might belong to one of the campaigns, but neither did. The first was a legitimate sign-in that only sounded like an attack, and the second was ordinary privilege creep that nobody had reviewed in a year. Real SOC and sysadmin work is full of findings like these, running alongside whatever the real campaigns are doing. Telling them apart from the chain is as much a part of the job as working the chain itself.

### Why the First Two Stages Barely Show Up

Reconnaissance and Weaponization barely appear in any of the four campaigns, and that isn't a gap in how this phase was designed. A SOC rarely gets a clear look at either stage. Weaponization happens entirely outside the systems you can see. Reconnaissance usually surfaces only after the fact, as a few odd log entries nobody connects until the rest of the chain is visible. What you've worked through instead is four real campaigns, each with its own artifacts and the stage where it was stopped. That's the whole picture this phase was built to show you.
