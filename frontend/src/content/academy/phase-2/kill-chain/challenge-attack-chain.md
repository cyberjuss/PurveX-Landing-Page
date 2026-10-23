### Challenge: The Chain You Already Worked

This challenge does not add a new ticket. It asks you to step back from the three campaigns you worked this phase and read them side by side.

Three attackers, three different ways in, three different sets of real artifacts in your own lab:

1. **The Credential Campaign.** Exploitation twice over: a wide password spray (T1110.003) against six throwaway accounts, then a narrower, targeted guess (T1110.001) against one real admin account. Installation followed (T1053.005, a scheduled task), then Command and Control over a non-standard port (T1571). Stopped there. Actions on Objectives never happened.
2. **The Phishing Chain.** The only one of the three with a real Delivery stage: a spearphishing attachment (T1566.001), disguised with a double extension (T1036.008). You hashed it and checked a real reputation database, watched its beacon leave on a live capture, then found and moved the data it had staged (T1074.001) before anyone pulled it out.
3. **The Open Door.** No guessing, no attachment. One inbound rule left over from before Zero Trust (T1021.002) was the whole way in. You proved real traffic was crossing it before closing it, then found the same two later stages, Installation and Command and Control, behind a different door.

Line the three up and a pattern shows up that no single campaign makes obvious: every one of them reached Command and Control, using three different ports, and not one of them reached Actions on Objectives. Three different front doors led to the same back door technique once each attacker was inside. A domain controller's own outbound traffic is unusual enough, on a machine with no real reason to reach the open internet, that closing the channel is what broke every chain before it finished.

Two tickets from this phase are missing from that list on purpose: Approved Overnight, or Not? and Baseline a Team, Then Find Who Breaks It. Both looked, for a moment, like they could belong to one of the three. Neither did. One was a legitimate sign-in that only sounded like an attack. The other was ordinary privilege creep nobody had reviewed in a year. Real SOC and sysadmin work is full of findings like that, running alongside whatever the real campaigns are doing, and telling them apart from the chain itself is as much the job as working the chain.

Reconnaissance and Weaponization barely show up across all three campaigns, and that is not a gap in this phase's design. A SOC rarely gets a clean look at either one directly: Weaponization happens entirely outside systems you can see, and Reconnaissance usually only shows up after the fact, as a handful of odd log entries nobody connects to anything until the rest of the chain is already visible. Three real campaigns, three real sets of artifacts, and the stage every one of them was actually stopped at: that is the whole picture this phase was built to show you.
