<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Before you can recognize what is abnormal in an investigation, what does "normal" look like in this environment?</p>
</div>

### Before You Touch a Ticket, Learn the Environment

You can't call something suspicious until you know what **normal** looks like, so that's where the Home Lab starts. Here, normal is PurveX Financial, a mid-sized wealth management firm whose systems hold client money and records regulated under GLBA and SOX, two US financial regulations. Keep that in mind, because it's what's at stake on every ticket you'll work.

The firm is also your baseline for judging any sign-in. For example, a 2 AM login from a Wealth Management workstation raises a different question than one from an unfamiliar machine. Either one could be legitimate, and only knowing the environment tells you which.

Fortunately, the firm is small enough to hold in your head: five departments, nine people and a defined set of groups. A real desk works the same way. You learn who works where, and over time you get a feel for what normal looks like.

### A Directory Built Like a Real Firm

A textbook would give you `User1` inside `OU=Users` and explain everything for you. Real environments are messier than that, so this lab is too. It has real departments and access groups, and tickets that may not tell you the whole story.

One consequence of that messiness is that a job title doesn't set access. Someone with Helpdesk in their title doesn't belong in the **Helpdesk** group just because of the title. Instead, membership follows what the job actually needs, and a ticket has to approve it. Keep in mind, too, that callers and tickets can be wrong, which is why you verify what either one tells you before you act on it.

### The Role You Play

<div class="ad-goals-cue"><button type="button" class="ad-goals-open"><span class="ad-goals-open__tag">Analyst Brief</span><span class="ad-goals-open__text">Three questions to ask, written for the role you picked.</span><span class="ad-goals-open__cta">Open brief</span></button></div>
<div class="ad-goals" hidden>
<div class="ad-goals__head"><span class="ad-goals__kicker">Analyst Brief</span><span class="ad-goals__scope">purvexfinancial.local</span></div>
<p class="ad-goals__lede">You are the analyst here. Ask these about any account.</p>
<ol class="ad-goals__checks">
<li>Is it in the right OU?</li>
<li>Does it belong in this group?</li>
<li>Does this login fit the user?</li>
</ol>
<p class="ad-goals__goal"><span class="ad-goals__label">The goal</span>Spot what <strong>does not belong</strong>.</p>
</div>

### Start With the Baseline

The next four tabs lay out the firm for you: the org chart, the access levels, the data, and the full user directory. It's worth learning them before you build the lab, because every check you make later will be measured against them.

Without that baseline, any answer you give on a ticket would just be a guess.

***Domain: purvexfinancial.local***
