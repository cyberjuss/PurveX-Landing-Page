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

You are the analyst on this environment, and reading the company page is not enough. You should be able to answer these questions:

- Does this account belong in this OU?
- Should this user be a member of this group?
- Does this person's department match their account?
- Is this login consistent with what we know about the user?
- Does this activity make sense for this environment?

Work the lab until anything out of place starts to stand out:

- A user in the wrong department
- A group with the wrong member
- A login that does not fit

The goal is not to memorize the directory to pass a ticket. The goal is to see when something **does not belong**.

### Start With the Baseline

The next four tabs lay out the firm: the org chart, the access levels, the data, and the full user directory. Learn them before you build the lab, because every later check is measured against them.

**If you do not know PurveX Financial, you are not investigating. You are guessing.**

***Domain: purvexfinancial.local***
