<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Can you resolve real-looking Active Directory tickets by checking the baseline instead of guessing from the request?</p>
</div>

### Ticket Queue: Active Directory Triage

Run `Build-Environment.ps1 -IncludeCTF` if you want these tickets planted directly into your lab. The script adds optional challenge objects and descriptions without changing the clean baseline missions.

Treat each mission like a small help desk or SOC ticket. Your job is to find the account, computer, group, or OU that proves the answer, then enter the short resolution code.

<div class="ad-answer-guide">
<span class="ad-answer-guide__label">Answer format</span>
<p>Type the finding, not a full sentence. Spaces and dashes both work, and the full flag wrapper works too. Example: <code>all-employees</code> or <code>GTF{all-employees}</code>.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 7 solved</span>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Ticket 01 - Easy</span>
<h4>New Hire Announcements</h4>
<p>Jamie Torres in Wealth Management says she is not receiving firm-wide announcements. Her department membership looks right. Which non-department group is she missing?</p>
<div class="ad-ticket-meta"><span>User</span><code>jamie.torres</code><span>Expected action</span><code>Group membership check</code></div>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">Compare Jamie to the other normal users after running the CTF data switch. Look for a group that spans the company, not Wealth Management.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="resolution code" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{all-employees}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<p><code>GTF{all-employees}</code></p>
<p>Jamie already belongs to <code>Wealth Management Users</code>. The gap is the firm-wide <code>All Employees</code> group. This is a clean access request, not an incident.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Ticket 02 - Easy</span>
<h4>Locked Out, Not Forgotten</h4>
<p>Riley Kwan calls after repeated failed attempts. She says she remembers her password now. What should the help desk do?</p>
<div class="ad-ticket-meta"><span>User</span><code>riley.kwan</code><span>Expected action</span><code>Account recovery decision</code></div>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">If the user remembers the password, do not replace it. Clear the lockout condition.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="resolution code" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{unlock-account}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<p><code>GTF{unlock-account}</code></p>
<p>Unlock the account. A password reset is for a forgotten password; it should not be the reflexive answer to every login problem.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Ticket 03 - Medium</span>
<h4>Mirror the Peer, Not the Job Title</h4>
<p>Casey Reed is a new Help Desk Technician. The onboarding ticket says to mirror Priya Nair's actual access. Which group should Casey receive?</p>
<div class="ad-ticket-meta"><span>User</span><code>casey.reed</code><span>Peer</span><code>priya.nair</code></div>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">Priya's title says Help Desk, but her Member Of tab is the source of truth.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="resolution code" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{it-users}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<p><code>GTF{it-users}</code></p>
<p>Priya Nair is only in <code>IT Users</code>. The <code>Helpdesk</code> access-level group exists, but title alone is not authorization.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Ticket 04 - Medium</span>
<h4>Nightly Backup Identity</h4>
<p>Find the account used for the nightly backup job. Which OU proves it was built as a service account instead of a normal person?</p>
<div class="ad-ticket-meta"><span>Account</span><code>svc-backup-job</code><span>Expected check</span><code>Object location</code></div>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">Service accounts should not sit inside a department's Users OU.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="resolution code" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{serviceaccounts}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<p><code>GTF{serviceaccounts}</code></p>
<p>The account belongs in <code>OU=ServiceAccounts</code>. Its description also explains the expected use: nightly backup on <code>IT-WKS01</code> between 01:00 and 03:00.</p>
</div>
</div>

<div class="ad-mission" data-attempts="0">
<span class="ad-mission__num">Ticket 05 - Hard</span>
<h4>The Transfer That Did Not Move</h4>
<p>HR says Taylor Osei transferred to Compliance. The account description mentions the transfer, but policy follows OU placement. Where does the account still live?</p>
<div class="ad-ticket-meta"><span>User</span><code>taylor.osei</code><span>Expected check</span><code>Distinguished Name</code></div>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">Find Taylor, open the object properties, and check the full Distinguished Name or the left-side OU tree.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="resolution code" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{operations-ou}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<p><code>GTF{operations-ou}</code></p>
<p>Taylor still lives under <code>OU=Users,OU=Operations,OU=Departments</code>. A title or description update does not move the object, so old department policy can remain in effect.</p>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-attempts="0">
<span class="ad-mission__num">Ticket 06 - Hard</span>
<h4>2 AM From the Wrong Workstation</h4>
<p>An alert says <code>alex.rivera</code> successfully authenticated at 2:00 AM from <code>WM-WKS07</code>. What is the first baseline mismatch?</p>
<div class="ad-ticket-meta"><span>User</span><code>alex.rivera</code><span>Computer</span><code>WM-WKS07</code></div>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">Do not start with the timestamp. Compare Alex's OU to the workstation's department.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="resolution code" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{wrong-department}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<p><code>GTF{wrong-department}</code></p>
<p>Alex belongs to IT, while <code>WM-WKS07</code> is a Wealth Management workstation. The department mismatch is enough to escalate before you even argue about the hour.</p>
</div>
</div>

<div class="ad-mission ad-mission--bonus" data-attempts="0">
<span class="ad-mission__num">Bonus - Hard</span>
<h4>Dormant Asset Sweep</h4>
<p>The optional CTF data includes an Operations workstation marked for a dormant-asset review. Which computer object should you investigate?</p>
<div class="ad-ticket-meta"><span>Scope</span><code>Operations Workstations</code><span>Expected check</span><code>Description</code></div>
<div class="ad-hint"><button type="button" class="ad-hint__btn">Get a hint</button><p class="ad-hint__text">Search computer objects for descriptions containing <code>CTF-TICKET-201</code>.</p></div>
<div class="ad-guess">
<input type="text" class="ad-guess__input" placeholder="resolution code" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{ops-wks03}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<p><code>GTF{ops-wks03}</code></p>
<p><code>OPS-WKS03</code> is the workstation object marked for dormant-asset review. In real environments, stale machines are risk because nobody is watching them closely.</p>
</div>
</div>

<style>
.ad-answer-guide {
  display: grid; gap: 0.35rem; margin: 1rem 0 1.35rem; padding: 0.85rem 1rem;
  border: 1px solid rgba(85,70,224,0.22); border-left: 3px solid #5546e0; border-radius: 10px;
  background: rgba(85,70,224,0.055);
}
.ad-answer-guide__label {
  font-family: var(--font-mono, ui-monospace, monospace); font-size: 0.68rem; font-weight: 700;
  letter-spacing: 0.06em; text-transform: uppercase; color: #5546e0;
}
.ad-answer-guide p { margin: 0; font-size: 0.9rem; color: var(--pvrx-text-secondary-light); }
.ad-progress { display: flex; align-items: center; gap: 0.85rem; margin: 1.25rem 0 1.75rem; }
.ad-progress__track { flex: 1; height: 8px; border-radius: 999px; background: var(--pvrx-border-light); overflow: hidden; }
.ad-progress__bar { height: 100%; width: 0%; border-radius: 999px; background: linear-gradient(90deg, #6a5cff, #5546e0); transition: width 0.4s ease; }
.ad-progress__label { flex-shrink: 0; font-family: var(--font-mono, ui-monospace, monospace); font-size: 0.78rem; font-weight: 700; color: #5546e0; }
.academy-prose { counter-reset: mission; }
.ad-mission {
  position: relative; margin: 1.75rem 0; padding: 1.25rem 1.5rem 1.4rem;
  border: 1px solid var(--pvrx-border-light); border-left: 3px solid #5546e0; border-radius: 14px;
  background: var(--pvrx-surface-alt-light);
  box-shadow: 0 1px 2px rgba(16,25,46,0.05), 0 18px 40px -28px rgba(16,25,46,0.22);
  transition: border-color 0.3s ease, background 0.3s ease, box-shadow 0.25s ease, transform 0.25s ease;
}
.ad-mission:hover { box-shadow: 0 1px 2px rgba(16,25,46,0.06), 0 24px 48px -26px rgba(16,25,46,0.3); transform: translateY(-2px); }
.ad-mission::before {
  counter-increment: mission; content: counter(mission); position: absolute; top: -15px; left: -15px;
  display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 999px;
  background: linear-gradient(135deg, #6a5cff, #5546e0); color: #fff; font-family: var(--font-display);
  font-size: 0.95rem; font-weight: 700; box-shadow: 0 4px 12px -2px rgba(85,70,224,0.45), 0 0 0 3px #fff;
}
.ad-mission--capstone { border-left-color: #e5484d; }
.ad-mission--capstone::before { background: linear-gradient(135deg, #f0656a, #e5484d); box-shadow: 0 4px 12px -2px rgba(229,72,77,0.45), 0 0 0 3px #fff; }
.ad-mission--bonus { border-left-color: #b7791f; }
.ad-mission--bonus::before { background: linear-gradient(135deg, #f59e0b, #b7791f); box-shadow: 0 4px 12px -2px rgba(183,121,31,0.35), 0 0 0 3px #fff; }
.ad-mission--solved { border-left-color: #16a34a; background: rgba(22,163,74,0.05); }
.ad-mission--solved::before { content: "\2713"; background: linear-gradient(135deg, #22c55e, #16a34a); box-shadow: 0 4px 12px -2px rgba(22,163,74,0.45), 0 0 0 3px #fff; }
.ad-mission__num { font-family: var(--font-mono, ui-monospace, monospace); font-size: 0.7rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #5546e0; }
.ad-mission--capstone .ad-mission__num { color: #e5484d; }
.ad-mission--bonus .ad-mission__num { color: #b7791f; }
.ad-mission--solved .ad-mission__num { color: #16a34a; }
.ad-mission--solved .ad-mission__num::after { content: " \2713 Solved"; }
.ad-mission h4 { margin: 0.35rem 0 0.5rem; font-family: var(--font-display); font-size: 1.02rem; font-weight: 700; }
.ad-mission > p { margin: 0; }
.ad-ticket-meta {
  display: grid; grid-template-columns: max-content minmax(0,1fr); gap: 0.35rem 0.65rem;
  margin-top: 0.85rem; padding: 0.65rem 0.75rem; border: 1px solid var(--pvrx-border-light);
  border-radius: 8px; background: #fff;
}
.ad-ticket-meta span { font-family: var(--font-mono, ui-monospace, monospace); font-size: 0.68rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--pvrx-text-secondary-light); }
.ad-ticket-meta code { width: fit-content; }
.ad-hint { margin-top: 0.75rem; }
.ad-hint__btn {
  font-size: 0.78rem; font-weight: 650; color: #5546e0; background: none;
  border: 1px dashed rgba(85,70,224,0.4); border-radius: 999px; padding: 0.3rem 0.75rem; cursor: pointer;
}
.ad-hint__btn:hover { background: rgba(85,70,224,0.08); }
.ad-hint__btn:disabled { color: var(--pvrx-text-secondary-light); border-color: var(--pvrx-border-light); cursor: default; }
.ad-hint__text { display: none; margin: 0.5rem 0 0; font-size: 0.85rem; color: var(--pvrx-text-secondary-light); font-style: italic; }
.ad-hint__text--shown { display: block; }
.ad-guess { display: flex; gap: 0.5rem; margin-top: 0.9rem; flex-wrap: wrap; }
.ad-guess__input {
  flex: 1; min-width: 180px; padding: 0.5rem 0.7rem; border-radius: 8px;
  border: 1px solid var(--pvrx-border-light); font-family: var(--font-mono, ui-monospace, monospace); font-size: 0.85rem;
  background: #fff; color: var(--pvrx-text-primary-light);
}
.ad-guess__input:focus { outline: none; border-color: #5546e0; box-shadow: 0 0 0 3px rgba(85,70,224,0.12); }
.ad-guess__input:disabled { background: var(--pvrx-surface-alt-light); color: var(--pvrx-text-secondary-light); }
.ad-guess__submit {
  font-size: 0.85rem; font-weight: 650; color: #fff; background: #5546e0; border: none; border-radius: 8px;
  padding: 0.5rem 1.1rem; cursor: pointer;
}
.ad-guess__submit:hover { background: #4636c4; }
.ad-guess__submit:disabled { background: var(--pvrx-border-light); cursor: default; }
.ad-guess__feedback { margin: 0.55rem 0 0; font-size: 0.85rem; font-weight: 600; min-height: 1.2em; }
.ad-guess__feedback--ok { color: #16a34a; }
.ad-guess__feedback--err { color: #e5484d; }
.ad-flag { display: none; margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed var(--pvrx-border-light); }
.ad-flag--shown { display: block; }
.ad-flag p { font-size: 0.9rem; }
.ad-flag code { font-weight: 650; }
</style>
