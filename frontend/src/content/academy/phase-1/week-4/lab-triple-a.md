<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>What happens when an application trusts the client to say who it is, instead of verifying that on the server?</p>
</div>

**Situation:** A web application stores each user's role on the server but also accepts a role value from the browser. If the server believes whatever the browser sends, any regular user can promote themselves to admin.

**Task:** In PortSwigger's "User role can be modified in user profile" lab, sign in as a regular user and gain admin access without admin credentials. Then use the admin panel to delete the user `carlos`. Then explain the fix the server needs.

**What you need:** A free PortSwigger Web Security Academy account and Burp Suite Community Edition.

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
<p><strong>Task:</strong> The server's next release removes the <code>roleid</code> field from every API response, so the browser never sees it again. Does that close this vulnerability? Type its letter.<br><strong>A</strong> Yes. If the browser cannot read the field, it cannot send it back either.<br><strong>B</strong> No. The field was never removed from what the browser can send, only from what it happens to see, and you can still add <code>roleid</code> to a request by hand with Burp.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for whether hiding the roleid field in the response fixes the vulnerability" placeholder="A or B" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
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
<p><strong>Task:</strong> Where does a server have to check a user's role to actually close this vulnerability? Type its letter.<br><strong>A</strong> In the browser, before the request is ever sent.<br><strong>B</strong> Against its own stored record of that user's role, on the server, every time a privileged action runs.<br><strong>C</strong> Nowhere. As long as the admin panel's URL is hard to guess, it is safe.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for where the role check actually has to happen" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
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
