<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Can you actually use everything on this page, or did you just read it?</p>
</div>

### Operation Day One

You've read the org chart, the access levels, the data categories, and the Active Directory concepts. Reading isn't the same as knowing. This is a short, self-graded challenge built entirely on GovTechFinancial's real environment, the one you built in **Build This Lab**. Work through each mission there, in the actual domain, then reveal the flag to check yourself.

Each flag follows the format `GTF{...}`, GovTechFinancial's own. No login, no submission, no leaderboard, this is entirely for you to confirm you can actually navigate the environment, not just recite facts about it.

<div class="ad-mission">
<span class="ad-mission__num">Mission 01</span>
<h4>Recon</h4>
<p>Find Jordan Ellis's account. What OU is it in, and what security group is he a member of?</p>
<details class="ad-flag">
<summary>Reveal flag</summary>
<p><code>GTF{ou-users-financeaccounting-finance-accounting-users}</code></p>
<p>Jordan sits in <code>OU=Users,OU=FinanceAccounting,OU=Departments</code> and belongs to <code>Finance Accounting Users</code>, GovTechFinancial's standard-access group for that department.</p>
</details>
</div>

<div class="ad-mission">
<span class="ad-mission__num">Mission 02</span>
<h4>The Odd One Out</h4>
<p>Every one of the nine users belongs to exactly one standard-access group, except one person, who belongs to two. Who, and what's the second group?</p>
<details class="ad-flag">
<summary>Reveal flag</summary>
<p><code>GTF{alex-rivera-it-admins}</code></p>
<p>Alex Rivera is a member of both <code>IT Users</code> and <code>IT Admins</code>. Same OU as Priya Nair, different access.</p>
</details>
</div>

<div class="ad-mission">
<span class="ad-mission__num">Mission 03</span>
<h4>Access, Not Department</h4>
<p><code>Server Admins</code> and <code>Helpdesk</code> (Level 2 and Level 3) live in their own OU, not nested inside <code>Departments</code> alongside IT, Compliance, and the rest. Which OU, and why does that placement make sense?</p>
<details class="ad-flag">
<summary>Reveal flag</summary>
<p><code>GTF{accesslevels}</code></p>
<p><code>OU=AccessLevels</code>. Those groups describe what an account can do across the whole domain, not which department it belongs to, so nesting them under any one department wouldn't make sense.</p>
</details>
</div>

<div class="ad-mission">
<span class="ad-mission__num">Mission 04</span>
<h4>The Container Trap</h4>
<p>Suppose a new hire's account got created and accidentally left sitting in the default <code>CN=Users</code> container instead of a real department OU. Name two concrete things that would break because of that, not just "it's messy."</p>
<details class="ad-flag">
<summary>Reveal flag</summary>
<p><code>GTF{no-gpo-no-delegation}</code></p>
<p>(1) No GPO could ever be linked to reach that account, since GPOs only link to Sites, Domains, and OUs, never Containers. (2) Nobody could delegate scoped permissions over just that account the way Helpdesk is delegated control over <code>OU=IT</code>, since Containers don't support delegation either.</p>
</details>
</div>

<div class="ad-mission">
<span class="ad-mission__num">Mission 05</span>
<h4>Stand Up a Service Account</h4>
<p>Using the Admin Tasks tab, create a service account for a nightly backup job. Where does it go, what do you name it, and which two account settings must be set the opposite of a normal user's?</p>
<details class="ad-flag">
<summary>Reveal flag</summary>
<p><code>GTF{dedicated-ou-prefix-never-expires}</code></p>
<p>It belongs in its own dedicated OU, separate from <code>Departments</code> (for example <code>OU=ServiceAccounts</code>). It should be clearly prefixed, for example <code>svc-backup-job</code>. And unlike a person's account: <code>PasswordNeverExpires</code> should be <code>$true</code>, and <code>ChangePasswordAtLogon</code> should be <code>$false</code>, since nothing is sitting at a keyboard to change it.</p>
</details>
</div>

<div class="ad-mission ad-mission--capstone">
<span class="ad-mission__num">Mission 06 — Capstone</span>
<h4>The 2 AM Login</h4>
<p>You see a successful login from <code>alex.rivera</code> at 2:00 AM, originating from a Wealth Management workstation. Using only facts from this Home Lab tab, give two concrete reasons this is worth flagging, before you've looked at a single log entry.</p>
<details class="ad-flag">
<summary>Reveal flag</summary>
<p><code>GTF{wrong-department-wrong-hours-critical-data}</code></p>
<ul>
<li>Alex Rivera's account lives in <code>OU=IT</code>, not Wealth Management. There's no organizational reason for his account to be authenticating from a workstation in a different department entirely.</li>
<li>Wealth Management is one of GovTechFinancial's three critical departments, handling personal, financial, and estate data on high-net-worth clients, exactly the kind of data an attacker would target.</li>
<li>2 AM falls outside any reasonable business-hours pattern for that account.</li>
</ul>
<p>None of that proves compromise on its own. It's exactly the kind of pattern that turns "huh, that's odd" into "let's actually look at this," which is the whole instinct this course is built to teach.</p>
</details>
</div>

<style>
.ad-mission {
  margin: 1.5rem 0; padding: 1.25rem 1.5rem 1.4rem;
  border: 1px solid var(--pvrx-border-light); border-left: 3px solid #5546e0; border-radius: 0 10px 10px 0;
  background: var(--pvrx-surface-alt-light);
}
.ad-mission--capstone { border-left-color: #e5484d; }
.ad-mission__num { font-family: var(--font-mono, ui-monospace, monospace); font-size: 0.7rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #5546e0; }
.ad-mission--capstone .ad-mission__num { color: #e5484d; }
.ad-mission h4 { margin: 0.35rem 0 0.5rem; font-family: var(--font-display); font-size: 1.02rem; font-weight: 700; }
.ad-mission > p { margin: 0; }
.ad-flag { margin-top: 0.85rem; }
.ad-flag > summary { cursor: pointer; font-size: 0.85rem; font-weight: 650; color: #5546e0; }
.ad-flag[open] > summary { margin-bottom: 0.5rem; }
.ad-flag p, .ad-flag ul { font-size: 0.9rem; }
.ad-flag code { font-weight: 650; }
</style>
