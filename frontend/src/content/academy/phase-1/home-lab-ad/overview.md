<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Before you can recognize what is abnormal in an investigation, what does "normal" look like in this environment?</p>
</div>

### Before You Touch a Ticket, Learn the Environment

You can't call something suspicious until you know what **normal** looks like. In this lab, normal is PurveX Financial: a mid-sized wealth management firm whose environment holds client money and records regulated under GLBA and SOX. That's what's at stake on every ticket.

The firm is also your baseline for judging any sign-in. A 2 AM login from a Wealth Management workstation raises a different question than one from an unfamiliar lab machine — either could be legitimate, and only knowing the environment tells you which.

It's small enough to hold in your head: five departments, nine people, a defined set of groups. A real desk works the same way — you learn who works where, and over time you learn what normal looks like.

### A Directory Built Like a Real Firm

A textbook gives you `User1` inside `OU=Users` and explains everything. Real environments are messier, so this lab is too: real departments and access groups, tickets that may not tell the whole story.

A job title doesn't set access either: somebody titled Helpdesk doesn't belong in the **Helpdesk** group just because of that title. Membership follows what the job needs, and a ticket has to approve it. Callers and tickets can be wrong too, which is why you verify what either one tells you before you act on it.

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

The next four tabs lay out the firm: the org chart, the access levels, the data, and the full user directory. Learn them before you build the lab, because you will measure every later check against them.

Without that baseline, any answer you give on a ticket is a guess.

***Domain: purvexfinancial.local***
