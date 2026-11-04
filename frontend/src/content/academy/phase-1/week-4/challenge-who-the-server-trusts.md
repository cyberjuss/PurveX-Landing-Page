<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Who the Server Actually Trusts</h3>
<p class="ad-brief__ask">What happens when an app trusts the browser to say who you are? In this challenge, you'll gain admin access without any admin credentials, and prove it.</p>
<p>This one deliberately happens outside PurveX's own lab. Reviewing a vendor's demo environment before a contract is signed is a real part of the job, and that review has to run on the vendor's own system rather than yours. To follow along, you'll need a free PortSwigger Web Security Academy account and Burp Suite Community Edition.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 2 solved</span>
</div>

### Step 1. Sign in with the account you are given

Devon Brooks, PurveX Financial's Compliance Officer, needs this vendor's client portal cleared before the contract is signed. Conveniently, its demo environment runs exactly the kind of account-role logic this lab teaches. Open the lab and sign in as `wiener` with the password `peter`. That's a regular account on purpose, so you won't see any admin features yet.

### Step 2. Watch your traffic in Burp

Next, route your browser through Burp Suite, and keep the HTTP history open for the whole exercise. That way, every request the app makes will appear there for you to inspect.

### Step 3. Rule out the obvious places

Start with the obvious places. Open My Account, and then try browsing to `/admin`. Neither one gets you in, which tells you the weakness must be somewhere less obvious. If you look at the My Account page load in Burp, you'll see it sends only your session cookie, so there's nothing there to tamper with.

### Step 4. Change your email and read the response

So try something that changes data instead. On My Account, update your email address and submit it. Then, in Burp, send that request to Repeater and read the response. You'll notice the server returns more than you asked for, including a `roleid` field set to `1`, which marks a regular user. Admins, by contrast, carry `roleid` 2.

### Step 5. Add the role to your request

Notice that the request body is JSON, and it didn't include `roleid` at all. So add the field yourself, right next to your email, and send it:

```
{"email":"wiener@normal-user.net","roleid":2}
```

If the response now shows `roleid` 2, the server has accepted a value it should never trust from the browser, and that's the vulnerability.

### Step 6. Use your new access

Now browse to `/admin` again. This time the admin panel opens, because your account carries the admin role. To solve the lab, delete the user `carlos`.

### Step 7. Explain the fix

Finally, think about how this should be fixed. Hiding the `roleid` field from the response wouldn't help, because anyone can still add it to a request by hand, exactly as you just did. Instead, the server has to ignore any role value the browser sends, and check the user's role against its own records on every privileged action.

### Check Yourself

Answer based on what you just did, rather than on what sounds plausible.

<div class="ad-mission" data-id="w4t-c1" data-attempts="0">
<span class="ad-mission__num">Ticket 01 · INC-1116 · Medium</span>
<p><strong>Vendor Review · Remediation Proposal · 10:30 AM</strong><br>The vendor's engineering team proposes a fix: remove the <code>roleid</code> field from every API response, so the browser never sees it again.</p>
<p><strong>Task:</strong> Does that close this vulnerability? Type its letter.<br><strong>A</strong> Yes. If the browser cannot read the field, it cannot send it back either.<br><strong>B</strong> No. The field was never removed from what the browser can send, only from what it happens to see, and you can still add <code>roleid</code> to a request by hand with Burp.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for whether hiding the roleid field in the response fixes the vulnerability" placeholder="A or B" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Think back to Step 5. The request body never had <code>roleid</code> in it at all until you added it yourself.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">You proved otherwise in Step 5: the request never had <code>roleid</code> in it to begin with, and adding it by hand worked anyway.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. No, you can still add roleid by hand</code></p>
</div>
<div>
<span>Why it matters</span>
<p>You proved this exact point in Step 5, where the request body never had <code>roleid</code> in it and you added it yourself anyway. Hiding a field changes what the server shows, but never what the server is willing to accept.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="w4t-c2" data-attempts="0">
<span class="ad-mission__num">Ticket 02 · INC-1117 · High</span>
<p><strong>PurveX Security Review · Vendor Recommendation · 11:15 AM</strong><br>The review has to go back to PurveX Financial's procurement team with a concrete fix the vendor must make before the contract is signed.</p>
<p><strong>Task:</strong> Where does a server have to check a user's role to actually close this vulnerability? Type its letter.<br><strong>A</strong> In the browser, before the request is ever sent.<br><strong>B</strong> Against its own stored record of that user's role, on the server, every time a privileged action runs.<br><strong>C</strong> Nowhere. As long as the admin panel's URL is hard to guess, it is safe.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for where the role check actually has to happen" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Remember that you controlled the browser's request completely with Burp, and Step 3 already showed that a hard-to-guess URL alone didn't keep anyone out.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">Anything checked only in the browser is something you just proved you can bypass entirely with Burp.</div>
<div class="ad-miss" data-guess="c">Step 3 already showed <code>/admin</code> was reachable, just not useful yet. A hard-to-guess URL is a delay, not a control.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. Against its own stored record, on the server, every time</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Anything checked in the browser is only a suggestion, not a control, because, as you just saw, you can change the request in Burp and the server will trust whatever arrives. A hard-to-guess URL isn't a control either, only a delay, and this lab's own `/admin` path proved that in Step 3.</p>
</div>
</div>
</div>
</div>
