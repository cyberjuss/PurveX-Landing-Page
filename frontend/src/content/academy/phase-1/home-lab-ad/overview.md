<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Before you can recognize what is abnormal in an investigation, what does "normal" actually look like in this environment?</p>
</div>

### Before You Touch a Ticket, Learn the Environment

You cannot call something suspicious until you know what **normal** looks like. In this lab, normal is PurveX Financial.

PurveX Financial is a mid-sized wealth firm. Client money, financial records, and regulated data such as GLBA and SOX all sit in this environment. That is what is at stake on every ticket.

The firm is your baseline for judging every account, group, and login. A 2 AM login from a Wealth Management workstation is a different question than a 2 AM login from a random lab machine.

Either login might still be legitimate. You need to know the environment before you can decide whether it fits.

The environment is small enough to hold in your head:

- Five departments
- Nine people
- A defined set of groups

A real desk works the same way. You learn who works where, what access they should have, which groups matter, and what normal activity looks like.

### This Is Not a Textbook Directory

A textbook gives you `User1` inside `OU=Users` and explains everything. Real environments are not that clean, and this one is built to feel like a real firm.

Here you work with departments, access groups, job titles, and tickets that may not tell the whole story.

A job title does not set anyone's access. A person whose title says Helpdesk does not automatically belong in the **Helpdesk** group.

Callers and tickets can be wrong, and handling that is part of the job. Do not act on whatever appears in front of you. **Verify it.**

### Your Role

<div class="ad-goals">
<div class="ad-goals__head"><span class="ad-goals__kicker">Analyst Brief</span><span class="ad-goals__scope">purvexfinancial.local</span></div>
<p class="ad-goals__lede">You are the analyst on this environment. Reading the company page is not enough. For any account in front of you, you should be able to answer five questions.</p>
<ol class="ad-goals__checks">
<li>Does this account belong in this OU?</li>
<li>Should this user be a member of this group?</li>
<li>Does this person's department match their account?</li>
<li>Is this login consistent with what we know about the user?</li>
<li>Does this activity make sense for this environment?</li>
</ol>
<div class="ad-goals__flags">
<span class="ad-goals__label">Work the lab until these stand out</span>
<ul>
<li>A user in the wrong department</li>
<li>A group with the wrong member</li>
<li>A login that does not fit</li>
</ul>
</div>
<p class="ad-goals__goal"><span class="ad-goals__label">The goal</span>Not to memorize the directory to pass a ticket. To see when something <strong>does not belong</strong>.</p>
</div>

### Start With the Baseline

The next four tabs lay out the firm: the org chart, the access levels, the data, and the full user directory. Learn them before you build the lab, because every later check is measured against them.

**If you do not know PurveX Financial, you are not investigating. You are guessing.**

***Domain: purvexfinancial.local***
