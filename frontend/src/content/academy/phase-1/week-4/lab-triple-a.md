**Lab:** PortSwigger Web Security Academy, "User role can be modified in user profile"  
**Goal:** Get admin access and delete the user "Carlos" without ever being given admin credentials.

<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>What happens when an application trusts the client to say who it is, instead of verifying that on the server?</p>
</div>

### Overview

This is PortSwigger's "user role can be modified in user profile" challenge start to finish. You find the request that leaks a role field and tamper with it. Then you confirm that the real fix is server-side enforcement not hiding the field.

The app trusts the user's browser to state its own role instead of checking on the server. If an extra field can be smuggled into a request the server simply believes it.

Your job is to prove that. Do not take the login page or the missing Admin Panel as the whole story. Watch the traffic and ask which request is leaking more state than the user needed to see.

### Step 1. Log In With the Account You Are Given

Use the provided username and password. This is a regular, non-admin user, and deliberately so.

### Step 2. Turn On Burp Suite and Watch Your Traffic

Every request your browser makes should show up in Burp's HTTP history. Keep it open for the entire exercise.

### Step 3. Try to Find the Admin Panel

Poke around. Check "My Account," try guessing `/admin`. Nothing works yet, and that is expected. The vulnerability has not been found yet, only ruled out as absent from the obvious places.

### Step 4. Look at the "My Account" Page Requests

Notice it sends only your session cookie. There is nothing to tamper with there. Not the vulnerable spot.

### Step 5. Try Changing Your Email Address

On the "My Account" page, update your email and submit. Send that request to **Repeater** in Burp so it can be inspected and replayed at will.

### Step 6. Look Closely at the Response

When that request is sent, the server responds with more than you would expect, including a `roleid` field. Notice yours is set to `1` (regular user). Admins carry `roleid = 2`.

### Step 7. Add `roleid=2` to Your Request Yourself

The original request did not include `roleid`. Try adding it manually:

```
roleid=2
```

Send it.

### Step 8. Check Whether It Worked

If the response now shows `roleid: 2`, the server has just accepted a value it should never have trusted from the client. That is the vulnerability. The application lets the client assign its own role.

### Step 9. Reload the App

The **Admin Panel** should now appear, because the account now carries admin privileges.

### Step 10. Delete the User "Carlos"

Go to the Admin Panel and delete Carlos. Lab solved.

Hiding `roleid` would not fix this. A request can still be crafted by hand. The server has to enforce the role itself on every privileged action.
