<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Riley says she is locked out. Do you unlock the account or reset the password?</p>
</div>

### Resetting and Unlocking a Password

"I can't sign in" usually means a locked account or a forgotten password. Each has its own fix:

* **Account locked.** They know the password but mistyped it too often. Open **Properties → Account**, check **Unlock account** and Apply. The password stays the same.
* **Password forgotten.** Choose **Reset Password**, set a temporary one, and check **User must change password at next logon**.

If both, check **Unlock the user's account** in the Reset Password dialog.

<div class="ad-decision">
<div class="ad-decision__q">User calls in locked out.<br>Does she remember her password?</div>
<div class="ad-decision__branches">
<div class="ad-decision__branch ad-decision__branch--yes">
<span class="ad-decision__label">Yes</span>
<div class="ad-decision__box">
<strong>Unlock</strong>
<span>Properties → Account tab<br>Check <em>Unlock account</em></span>
</div>
</div>
<div class="ad-decision__branch ad-decision__branch--no">
<span class="ad-decision__label">No</span>
<div class="ad-decision__box ad-decision__box--accent">
<strong>Reset</strong>
<span>Right-click → Reset Password<br>Force change at next logon</span>
</div>
</div>
</div>
</div>

For Riley Kwan, locked out, the deciding question is whether she remembers her password.

Check the Account tab first. If **Account is disabled** is ticked, neither fix restores sign-in. After your change, reopen the tab and confirm it took.

<style>
.ad-decision { margin: 1.25rem 0; }
.ad-decision__q {
  max-width: 340px; margin: 0 auto 1.25rem; padding: 0.85rem 1.1rem; text-align: center;
  border: 1px solid var(--pvrx-border-light); border-radius: 10px; background: #fff;
  font-size: 0.9rem; font-weight: 650; color: var(--pvrx-text-primary-light);
  opacity: 0; animation: ad-decision-in 0.5s ease-out both;
}
.ad-decision__branches { display: flex; justify-content: center; gap: 2.5rem; flex-wrap: wrap; }
.ad-decision__branch { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; opacity: 0; animation: ad-decision-in 0.5s ease-out both; }
.ad-decision__branch--yes { animation-delay: 0.15s; }
.ad-decision__branch--no { animation-delay: 0.3s; }
.ad-decision__label {
  font-family: var(--font-mono, ui-monospace, monospace); font-size: 0.7rem; font-weight: 700;
  letter-spacing: 0.06em; text-transform: uppercase; color: var(--pvrx-text-secondary-light);
}
.ad-decision__box {
  display: flex; flex-direction: column; align-items: center; gap: 0.3rem; min-width: 190px;
  padding: 0.9rem 1.1rem; border-radius: 10px; text-align: center;
  border: 1.5px solid var(--pvrx-border-light); background: var(--pvrx-surface-alt-light);
}
.ad-decision__box strong { font-family: var(--font-display); font-size: 0.95rem; }
.ad-decision__box span { font-size: 0.8rem; color: var(--pvrx-text-secondary-light); line-height: 1.5; }
.ad-decision__box--accent { border-color: rgba(85,70,224,0.35); background: rgba(85,70,224,0.06); }
.ad-decision__box--accent strong { color: #5546e0; }
@keyframes ad-decision-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) {
  .ad-decision__q, .ad-decision__branch { animation: none; opacity: 1; }
}
</style>

```sort
prompt: Riley Kwan calls in. Which fix fits?
Unlock the account: She remembers her password but mistyped it three times
Reset and force a change: She has forgotten her password
Neither, it is disabled: The Account tab shows Account is disabled ticked
```
