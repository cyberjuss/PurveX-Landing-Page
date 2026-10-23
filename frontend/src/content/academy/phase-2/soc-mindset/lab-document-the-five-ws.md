<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>A vague alert says a sign-in failed. Can you turn that into the kind of documented account a Tier 2 analyst can actually act on, using only what the event itself records?</p>
</div>

**Situation:** The 5 W's turn a vague alert into a documented account: who, what, when, where, and why. The fastest way to learn what each one actually answers is to generate a real failed sign-in yourself and read the event it leaves behind, instead of reading about one in a slide.

**Task:** On your domain controller, fail a sign-in against your own account on purpose, with a real authentication call instead of a guess, and read what the event recorded.

**What you need:** Your hosted lab running, with the domain controller reachable the way every other exercise reaches it.

### Make a Real Event

Open PowerShell on the domain controller and run this, with your own account name in place of `your-account`.

```powershell
Add-Type -AssemblyName System.DirectoryServices.AccountManagement
$ctx = New-Object System.DirectoryServices.AccountManagement.PrincipalContext([System.DirectoryServices.AccountManagement.ContextType]::Domain)
$ctx.ValidateCredentials("your-account", "DefinitelyWrongPassword1")
```

This is a real authentication attempt against the domain controller, the same call Windows itself makes when you type a password. A wrong password here writes a real 4625 to the Security log, not a simulated one.

### Read What the Event Actually Answers

Open Event Viewer and find the 4625 you just generated. Every field on it answers one of the 5 W's. The Account Name answers who. The time stamp answers when. The Status and Sub Status fields answer why, by naming the exact reason the sign-in failed.

<div class="ad-mission" data-id="sm2-01" data-attempts="0">
<p><strong>Task:</strong> Open the 4625 you just generated. What Sub Status code does it record for a wrong password on a real account?</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the sub status code" placeholder="Sub status code" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{0xc000006a}" data-accept="c000006a">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>0xC000006A</code></p>
</div>
<div>
<span>Why it matters</span>
<p>That code means the account is real and the password was wrong. A sign-in attempt against an account that does not exist at all logs a different code, 0xC0000064, which is why the Sub Status is worth more than the word "failed" alone.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="sm2-02" data-attempts="0">
<p><strong>Task:</strong> The Sub Status field names the exact reason the sign-in failed. Which of the 5 W's does that field actually answer? Type its letter.<br><strong>A</strong> Who<br><strong>B</strong> When<br><strong>C</strong> Why</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for which W the sub status field answers" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{c}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>C. Why</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Account Name is who, the time stamp is when, Sub Status is why. A documented account that is missing even one of the 5 W's leaves the next analyst to go find it themselves, which is exactly the handoff this framework exists to prevent.</p>
</div>
</div>
</div>
</div>

### Why It Matters

A vague alert and a documented account can describe the exact same failed sign-in. The difference is whether the next person who reads it has to go find the who, when, and why themselves, or whether you already did.
