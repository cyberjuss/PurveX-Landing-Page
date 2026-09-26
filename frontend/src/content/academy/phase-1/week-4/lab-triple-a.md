**Lab:** PortSwigger Web Security Academy, "User role can be modified in user profile"  
**Goal:** Get admin access and delete the user "Carlos" without ever being given admin credentials.

<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>What happens when an application trusts the client to say who it is, instead of verifying that on the server?</p>
</div>

### Overview

This lab walks through PortSwigger's "user role can be modified in user profile" challenge from start to finish. You find the request that leaks a role field and tamper with it.

Then you confirm that the real fix is enforcement on the server, not hiding the field.

The app lets the user's browser state its own role instead of checking it on the server. If an extra field is smuggled into a request, the server simply believes it.

Your job is to prove that. The login page and the missing Admin Panel are not the whole story. Watch the traffic and ask which request reveals more than the user needed to see.

### Step 1. Log In With the Account You Are Given

Use the username and password the lab provides. The account is a regular, non-admin user on purpose.

### Step 2. Turn On Burp Suite and Watch Your Traffic

Every request your browser makes should show up in Burp's HTTP history. Keep it open for the entire exercise.

### Step 3. Try to Find the Admin Panel

Poke around. Check "My Account" and try guessing `/admin`. Nothing works yet, and that is expected. You have not found the vulnerability, but you have ruled out the obvious places.

### Step 4. Look at the "My Account" Page Requests

Notice that this request sends only your session cookie. There is nothing to tamper with, so this is not the vulnerable spot.

### Step 5. Try Changing Your Email Address

On the "My Account" page, update your email and submit. Send that request to **Repeater** in Burp so you can inspect and replay it.

### Step 6. Look Closely at the Response

When you send that request, the server responds with more than you would expect, including a `roleid` field. Yours is set to `1`, a regular user. Admins carry `roleid = 2`.

### Step 7. Add `roleid=2` to Your Request Yourself

The original request did not include `roleid`. Try adding it manually:

```
roleid=2
```

Send it.

### Step 8. Check Whether It Worked

If the response now shows `roleid: 2`, the server just accepted a value it should never trust from the client. That is the vulnerability: the application lets the client assign its own role.

### Step 9. Reload the App

The **Admin Panel** should now appear, because the account now carries admin privileges.

### Step 10. Delete the User "Carlos"

Go to the Admin Panel and delete Carlos. Lab solved.

Hiding `roleid` would not fix this, because anyone can still craft a request by hand. The server has to enforce the role itself on every privileged action.
