**Lab:** PortSwigger Web Security Academy, "User role can be modified in user profile"  
 **Goal:** Get admin access and delete the user "Carlos" without ever being given admin credentials.

---

<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>What happens when an application trusts the client to say who it is, instead of verifying that on the server?</p>
</div>

### Overview

This lab walks through PortSwigger's "user role can be modified in user profile" challenge end to end: finding the request that leaks a role field, tampering with it, and confirming that the real fix is always server-side enforcement, never hiding the field.

---

### The Simple Idea

This app trusts the user's browser to state its own role, instead of checking on the server. If an extra field can be smuggled into a request, the server simply believes it.

---

### Step-by-Step

**1\. Log in with the account you are given**
 Use the provided username and password. This is a regular, non-admin user, and deliberately so.

**2\. Turn on Burp Suite and watch your traffic**
 Every request your browser makes should show up in Burp's HTTP history. Keep it open for the entire exercise.

**3\. Try to find the admin panel**
 Poke around. Check "My Account," try guessing `/admin`. Nothing works yet, and that is expected. The vulnerability has not been found yet, only ruled out as absent from the obvious places.

**4\. Look at the "My Account" page requests**
 Notice it sends only your session cookie. There is nothing to tamper with there. Not the vulnerable spot.

**5\. Try changing your email address**
 On the "My Account" page, update your email and submit. Send that request to **Repeater** in Burp so it can be inspected and replayed at will.

**6\. Look closely at the response**
 When that request is sent, the server responds with more than you would expect, including a `roleid` field. Notice yours is set to `1` (regular user). Admins carry `roleid = 2`.

**7\. Add `roleid=2` to your request yourself**
 The original request did not include `roleid`. Try adding it manually:

roleid=2

Send it.

**8\. Check whether it worked**
 If the response now shows `roleid: 2`, the server has just accepted a value it should never have trusted from the client. That is the vulnerability: the application lets the client assign its own role.

**9\. Reload the app**
 The **Admin Panel** should now appear, because the account now carries admin privileges.

**10\. Delete the user "Carlos"**
 Go to the Admin Panel and delete Carlos. Lab solved.

