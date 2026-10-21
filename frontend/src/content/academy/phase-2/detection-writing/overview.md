<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>What separates a detection that actually catches an attacker from a query that just looks like one?</p>
</div>

### Overview

Everything this phase has built, the investigation mindset, the baseline, ATT&CK's shared vocabulary, the threshold trade-off, comes together this week in the form every SOC actually ships it in: a written detection query. This week teaches KQL (Kusto Query Language), the language Microsoft Sentinel and Microsoft Defender both run their detections in, and a five-part method for writing one, TRACE, built from this phase's own lessons rather than handed down as an arbitrary checklist.

By the end of this week you should be able to look at a real KQL detection and know what each part of it is doing and why it is there, and you should be able to build one yourself from a plain description of the behavior you want to catch.

### Questions Answered in This Week

- What is KQL, and what does a basic query actually do?
- What is TRACE, and what does each letter stand for?
- How does a threshold from last week turn into an actual line of KQL?
- What makes one detection better than another that catches the same attack?
