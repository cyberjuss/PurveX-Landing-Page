<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>What happens when an application trusts the client to say who it is, instead of verifying that on the server?</p>
</div>

**Situation:** A web application stores each user's role on the server but also accepts a role value from the browser. If the server believes whatever the browser sends, any regular user can promote themselves to admin.

**Your task:** In PortSwigger's "User role can be modified in user profile" lab, sign in as a regular user, gain admin access without admin credentials, and use the admin panel to delete the user `carlos`. Then explain the fix the server needs.

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

The request body is JSON and did not include `roleid`. Add the field yourself, keep your email, and send it:

```
{"email":"wiener@normal-user.net","roleid":2}
```

If the response now shows `roleid` 2, the server accepted a value it should never trust from the browser. That is the vulnerability.

### Step 6. Use your new access

Browse to `/admin`. The admin panel now opens, because your account carries the admin role. Delete the user `carlos` to solve the lab.

### Step 7. Explain the fix

Hiding the `roleid` field from the response would not fix this, because anyone can still add it to a request by hand. The server has to ignore role values sent by the client and check the user's role from its own records on every privileged action.
