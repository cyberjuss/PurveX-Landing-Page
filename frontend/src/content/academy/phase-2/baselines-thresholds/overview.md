<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>If you have never looked at what normal traffic looks like, how would you ever recognize abnormal traffic?</p>
</div>

### Overview

Last week gave you the mindset: check the baseline before you trust the alert. This week gives you the baseline itself, and the machinery that turns a mismatch into a working detection. You will start with your own hosted lab's network, because the mindset means nothing applied to an environment you have never actually looked at. From there you will practice spotting an outlier against a baseline in three different kinds of data, place MITRE ATT&CK's shared vocabulary on top of attacker behavior you have already seen in Shift, meet Zero Trust as the architecture that assumes the baseline can be broken, and learn how a threshold turns "this looks odd" into a rule that fires consistently.

None of this is abstract. Your own lab pod, the Shift incidents you have already worked, and the P1/P2/P3 severities from last week all show up again here as the material you practice on.

### Questions Answered in This Week

- What does your own lab environment actually look like, and what can reach what?
- How do you tell an outlier from a baseline, and does the method change with the kind of data?
- What is the MITRE ATT&CK framework, and how does it name what an attacker is doing?
- What is Zero Trust, and why does it assume the network boundary will fail?
- How does a detection threshold get set, and what does it cost to set it wrong in either direction?
- Why do detections matter enough to justify the work of building and tuning them?
