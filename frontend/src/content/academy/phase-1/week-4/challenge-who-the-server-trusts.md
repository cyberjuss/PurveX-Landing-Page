<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Who the Server Actually Trusts</h3>
<p class="ad-brief__ask">What happens when an application trusts the client to say who it is, instead of verifying that on the server?</p>
<p>PurveX Financial is reviewing a vendor's client portal before signing a contract, and the vendor's own demo environment runs the same account-role logic PortSwigger built this lab to teach. A web application stores each user's role on the server but also accepts a role value from the browser. If the server believes whatever the browser sends, any regular user can promote themselves to admin. In PortSwigger's "User role can be modified in user profile" lab, sign in as a regular user and gain admin access without admin credentials, then use the admin panel to delete the user <code>carlos</code>.</p>
<p>You need a free PortSwigger Web Security Academy account and Burp Suite Community Edition. Each step takes a short answer, and the hint unlocks after two misses.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 2 solved</span>
</div>

### Step 1. Sign in with the account you are given

Open the lab and sign in as `wiener` with the password `peter`. This is a regular account on purpose, so it cannot see any admin features yet.

### Step 2. Watch your traffic in Burp

Route your browser through Burp Suite and keep the HTTP history open for the whole exercise. Every request the app makes should appear there.

### Step 3. Rule out the obvious places

Open My Account and try browsing to `/admin`. Neither gets you in, which tells you the weakness is somewhere less obvious. The My Account page load sends only your session cookie, so there is nothing in it to tamper with.

### Step 4. Change your email and read the response

On My Account, update your email address and submit it. In Burp, send that request to Repeater and read the response. The server returns more than you asked for, including a `roleid` field set to `1` for a regular user. Admins carry `roleid` 2.

### Step 5. Add the role to your request

The request body is JSON and did not include `roleid`. Add the field yourself next to your email and send it:

```
{"email":"wiener@normal-user.net","roleid":2}
```

If the response now shows `roleid` 2, the server accepted a value it should never trust from the browser. That is the vulnerability.

### Step 6. Use your new access

Browse to `/admin`. The admin panel now opens, because your account carries the admin role. Delete the user `carlos` to solve the lab.

### Step 7. Explain the fix

Hiding the `roleid` field from the response would not fix this, because anyone can still add it to a request by hand. The server has to ignore role values sent by the client and check the user's role from its own records on every privileged action.

### Check Yourself

Answer from what you just did, not from what sounds plausible.

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
<p>Think back to Step 5. The request body never had <code>roleid</code> in it at all before you added it yourself.</p>
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
<p>You just proved this exact point in Step 5: the request body never had <code>roleid</code> in it either, and you added it yourself. Hiding a field changes what the server shows, never what the server is willing to accept.</p>
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
<p>You controlled the browser's request completely with Burp, and Step 3 already showed that a hard-to-guess URL alone did not keep anyone out.</p>
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
<p>Anything checked in the browser is a suggestion, not a control. You just controlled Burp directly and the server still trusted whatever showed up. A hard-to-guess URL is not a control either, only a delay, and this lab's own `/admin` path proved that in Step 3.</p>
</div>
</div>
</div>
</div>
