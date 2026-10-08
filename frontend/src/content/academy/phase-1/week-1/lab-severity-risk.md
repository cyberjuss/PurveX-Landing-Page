<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Two machines have the same vulnerability. Why is it an emergency on one of them and almost nothing on the other?</p>
</div>

**Situation:** A scanner reports a vulnerability as Critical and every team in the building wants it fixed first. The score it printed was calculated by someone who has never seen your network.

**Task:** Score three findings with the official CVSS calculator, first the way a vendor publishes them and then the way they apply to your own lab machine. Rank the three by what you would fix first, and be ready to say why your order differs from the scores.

**What you need:** Your hosted lab running, and Firefox on the Ubuntu desktop. CVSS stands for Common Vulnerability Scoring System, the standard most scanners and advisories use to rate a weakness.

### Before You Start

Commit to an answer before you open anything.

1. A finding scores 9.8 out of 10. Does that mean it is dangerous on every machine that has it?
2. Which matters more for how urgent a fix is, how bad the flaw is or what the machine holds?
3. Can the same finding honestly carry two different scores at the same time?

Write your three answers down.

### Open the Calculator

In Firefox on the Ubuntu desktop, open the calculator published by FIRST, the organisation that maintains the standard.

```
https://www.first.org/cvss/calculator/3.1
```

The page has two groups that matter today. Base Score describes the flaw itself and never changes. Environmental Score describes the flaw on one specific machine, and it is the half almost nobody uses.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-1/PLACEHOLDER-cvss-calculator.png" alt="The FIRST CVSS version 3.1 calculator open in Firefox with the Base Score group visible" />
<figcaption>Screenshot 1. [ADD IMAGE] The official calculator, with Base and Environmental groups.</figcaption>
</figure>
</div>

### Score the Base

Enter each vector string below into the calculator and record the Base Score it returns. A vector string is shorthand for every answer the calculator asks for.

| Finding | Vector |
| ----- | ----- |
| A. Remote code execution, no login needed | `AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H` |
| B. A logged-in user can become root | `AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H` |
| C. Any local user can read a config file | `AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N` |

Write down the three Base Scores. Rank the findings by those numbers alone.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-1/PLACEHOLDER-cvss-base.png" alt="The calculator showing a Base Score for the first vector string" />
<figcaption>Screenshot 2. [ADD IMAGE] Finding A scored on the flaw alone.</figcaption>
</figure>
</div>

### Describe Your Actual Machine

Now answer two questions about the Ubuntu server in your pod, using what you already know about it.

First, what does it hold? It has a default web page and a practice account. It stores no client records and no money moves through it. In CVSS terms the Confidentiality Requirement, Integrity Requirement and Availability Requirement are all Low.

Those three requirements are the CIA triad, written as calculator inputs. The standard is asking how much each property is worth on this machine.

Second, who can reach it? Nothing on the internet can open a connection to your pod. Only the browser gateway and the other machine beside it can. That makes the Modified Attack Vector Adjacent rather than Network.

### Score the Environment

Scroll to the Environmental Score group. For finding A, set these and watch the number move.

1. Confidentiality Requirement: Low
2. Integrity Requirement: Low
3. Availability Requirement: Low
4. Modified Attack Vector: Adjacent

Record the Environmental Score beside the Base Score you wrote earlier. Repeat for findings B and C.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-1/PLACEHOLDER-cvss-environmental.png" alt="The calculator showing the Environmental Score group with the three security requirements set to Low" />
<figcaption>Screenshot 3. [ADD IMAGE] The same finding, scored for a machine that holds nothing.</figcaption>
</figure>
</div>

### Score It Again as Something That Matters

Keep finding A loaded. Now score it as though the machine were the domain controller beside it, which holds every account in the business.

1. Confidentiality Requirement: High
2. Integrity Requirement: High
3. Availability Requirement: High
4. Modified Attack Vector: Adjacent

Record this third number. You now have one flaw with three scores and no numbers were invented.

### Check Yourself

1. Did the Base Score change at any point during this lab?
2. For finding A, which was higher, the Environmental Score for the practice server or for the domain controller?
3. The three Security Requirements are named after which model from this week?
4. Did your ranking by Environmental Score match your ranking by Base Score?

### Take It Further

A scanner reports the same Critical finding on two machines. One is a test box rebuilt every night. The other is the server that issues client statements.

The team can fix one today. Say which you choose, and name the CVSS input that justifies the choice to a manager who only saw the word Critical.

### Why It Matters

Teams that patch in score order spend their week on whatever the vendor rated highest, while the quiet medium-severity flaw on the machine holding client data waits. Regulators do not ask what the scanner said. They ask what the firm knew about the data at risk, and the environmental score is where that reasoning gets written down.
