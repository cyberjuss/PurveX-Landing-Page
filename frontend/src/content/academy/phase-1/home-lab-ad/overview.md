<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Before you can recognize what is abnormal in an investigation, what does "normal" look like in this environment?</p>
</div>

### Before You Touch a Ticket, Learn the Environment

You cannot call something suspicious until you know what **normal** looks like. In this lab, normal is PurveX Financial.

PurveX Financial is a mid-sized wealth firm. Client money and regulated records covered by GLBA and SOX all sit in this environment. That is what is at stake on every ticket.

The firm is your baseline for judging every account and login. A 2 AM login from a Wealth Management workstation is a different question than a 2 AM login from a random lab machine.

Either login might still be legitimate. You need to know the environment before you can decide whether it fits.

The environment is small enough to hold in your head:

- Five departments
- Nine people
- A defined set of groups

A real desk works the same way. You learn who works where and what access they should have. Over time you also learn what normal activity looks like.

### A Directory Built Like a Real Firm

A textbook gives you `User1` inside `OU=Users` and explains everything. Real environments are messier, and this lab copies a real firm.

Here you work with real departments and access groups, and with tickets that may not tell the whole story.

A job title does not set anyone's access. A person whose title says Helpdesk does not belong in the **Helpdesk** group because of that title.

Callers and tickets can be wrong, and handling that is part of the job. Verify what a ticket or caller tells you before you act on it.

### Your Role

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
