### Risk, Threats, and Vulnerabilities

People mix up these three words. An analyst keeps them apart, because the split is what lets you rank a queue instead of treating every scary word as the same problem.

**Vulnerability** is a weakness that could be exploited. An unlocked door is a vulnerability, but it is not the same as someone walking through it:

- unpatched software
- a misconfigured firewall
- weak passwords
- an open port

**Threat** is something or someone that could use that weakness. A burglar on the block is a threat, but it is not the same as your door being open:

- a hacker
- malware
- an insider
- a natural disaster
- a nation-state actor

**Risk** is the likelihood and impact of a threat actually using a vulnerability. Analysts write it as **Risk = Threat × Vulnerability × Impact**.

If any part is zero, the risk is zero. No vulnerability means no risk even when a threat exists. No threat means no risk even when a vulnerability exists.

A security program manages risk. You rarely eliminate threats outright. Instead, you close weaknesses and lower what a hit would cost.

<div class="academy-analogy">
<span class="academy-analogy__tag">Think of it like a house on the block</span>
<ul>
<li>A <strong>vulnerability</strong> is an unlocked door.</li>
<li>A <strong>threat</strong> is a burglar in the neighborhood.</li>
<li><strong>Risk</strong> is the chance the burglar finds and uses that unlocked door, and what it costs you if he does.</li>
</ul>
</div>

When a ticket or an alert sounds urgent, name all three parts before you escalate:

- What is weak
- Who or what could use it
- What it would cost if they did

If one of those is missing, you are not looking at risk yet. You are looking at a word.
