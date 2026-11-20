### Risk

Once you know the weakness and the threat, risk is the idea that ties them together. It's how likely it is that a threat exploits a vulnerability, combined with how much damage that would do. It lets you compare problems that otherwise have nothing in common, so you aren't ranking your work by how alarming each item sounds.

**Risk = Threat × Vulnerability × Impact**

Writing risk as a multiplication makes one thing obvious straight away: **if any part is zero, the risk is zero.**

- A threat with no weakness to exploit produces no risk.
- A weakness that nothing can reach produces no risk.
- A flaw on a machine that holds nothing and connects to nothing produces no risk.

In practice, though, teams rarely score those three parts separately. Threat and vulnerability together describe one thing, how likely this is to happen, so most teams combine them and score risk as **likelihood × impact**. Know both:

<ul>
<li><strong>Threat × Vulnerability × Impact</strong> shows you what you are measuring</li>
<li><strong>Likelihood × impact</strong> is how you will see it measured almost everywhere</li>
</ul>

<svg class="lk-fig" viewBox="0 0 540 300" role="img" aria-label="A risk grid with likelihood up the side and impact along the bottom. A VPN with no MFA sits at high likelihood and high impact. An old intern account sits in the middle. An isolated test box sits at low likelihood and low impact."><rect class="f-heat2" x="120" y="20" width="130" height="76"/><rect class="f-heat3" x="250" y="20" width="130" height="76"/><rect class="f-heat3" x="380" y="20" width="130" height="76"/><rect class="f-heat1" x="120" y="96" width="130" height="76"/><rect class="f-heat2" x="250" y="96" width="130" height="76"/><rect class="f-heat3" x="380" y="96" width="130" height="76"/><rect class="f-heat1" x="120" y="172" width="130" height="76"/><rect class="f-heat1" x="250" y="172" width="130" height="76"/><rect class="f-heat2" x="380" y="172" width="130" height="76"/><text class="f-s" x="110" y="63" text-anchor="end">High</text><text class="f-s" x="110" y="139" text-anchor="end">Medium</text><text class="f-s" x="110" y="215" text-anchor="end">Low</text><text class="f-s" x="185" y="268" text-anchor="middle">Low</text><text class="f-s" x="315" y="268" text-anchor="middle">Medium</text><text class="f-s" x="445" y="268" text-anchor="middle">High</text><text class="f-k" x="315" y="293" text-anchor="middle">IMPACT</text><text class="f-k" transform="translate(34 134) rotate(-90)" text-anchor="middle">LIKELIHOOD</text><circle class="f-dot" cx="445" cy="48" r="6"/><text class="f-s" x="445" y="76" text-anchor="middle">VPN, no MFA</text><circle class="f-dot" cx="315" cy="124" r="6"/><text class="f-s" x="315" y="152" text-anchor="middle">Old intern account</text><circle class="f-dot" cx="185" cy="200" r="6"/><text class="f-s" x="185" y="228" text-anchor="middle">Isolated test box</text></svg>

The further up and to the right a problem sits, the sooner it needs fixing.

This also explains where a security program spends its time. Since you can rarely remove the threat, the work goes into the other two parts:

- It **closes vulnerabilities**, so the likelihood falls.
- It **reduces impact**, so a successful attack costs less. Backups and network segmentation are good examples.

So before you escalate anything, get in the habit of naming three things:

<ul>
<li>The vulnerability</li>
<li>The threat that could use it</li>
<li>The impact if it did</li>
</ul>

An escalation that includes all three gives the person receiving it what they need to decide, while one that only says "this looks bad" sends them off to redo your work.

```check
prompt: Two servers have the same critical flaw. One holds the client database and can be reached from the internet. The other is a test box with no data and no network connection. Which is the higher risk?
level: 2
* The client database server :: Likelihood is high because it can be reached, and impact is high because client data is on it.
They're the same risk, because the flaw is the same :: The flaw is only one part. Risk also depends on whether anything can reach it and what's at stake.
The test box, because test systems get less attention :: Less attention would only matter if something could reach it, and nothing can.
why: The same vulnerability can be urgent on one machine and close to nothing on another. Likelihood and impact make the difference.
```

```sort
prompt: You have budget for six fixes. Does each lower the likelihood of an attack, or the damage when one gets through?
level: 3
Lowers likelihood: Turn on MFA for the VPN | Disable the old intern account | Close port 23 on the domain controller
Lowers impact: Keep offline backups of the Finance share | Separate the client systems from the office network | Limit the client list to Wealth Management only
```
