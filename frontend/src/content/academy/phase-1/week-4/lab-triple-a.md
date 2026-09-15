**Lab:** PortSwigger Web Security Academy — "User role can be modified in user profile"  
 **Goal:** Get admin access and delete the user "Carlos" — without ever being given admin credentials.

---

### **Essential Question**

What happens when an application trusts the client to say who it is, instead of verifying that on the server?

### **Overview**

This lab walks through PortSwigger's "user role can be modified in user profile" challenge end to end: finding the request that leaks a role field, tampering with it, and confirming that the real fix is always server-side enforcement, never hiding the field.

---

### **The Simple Idea**

This app trusts the user's browser to say what role they are, instead of checking on the server. If we can sneak an extra field into a request, the server just believes us.

---

### **Step-by-Step**

**1\. Log in with the account you're given**  
 Use the provided username/password. This is just a regular, non-admin user.

**2\. Turn on Burp Suite and watch your traffic**  
 Every request your browser makes should show up in Burp's HTTP history. Keep it open the whole time.

**3\. Try to find the admin panel**  
 Poke around — check "My Account," try guessing `/admin` — nothing works yet. That's expected. We haven't found the vulnerability.

**4\. Look at the "My Account" page requests**  
 Notice it only sends your session cookie — nothing you can tamper with there. Not the vulnerable spot.

**5\. Try changing your email address**  
 On the "My Account" page, update your email and hit submit. Send that request to **Repeater** in Burp so you can inspect and replay it.

**6\. Look closely at the response**  
 When you send that request, the server sends back more than you'd expect — including a `roleid` field. Notice yours is set to `1` (regular user). Admins are `roleid = 2`.

**7\. Add `roleid=2` to your request yourself**  
 The original request didn't include `roleid` — but try adding it manually:

roleid=2

Send it.

**8\. Check if it worked**  
 If the response now shows `roleid: 2`, the server accepted a value it should never have trusted from you. That's the vulnerability — the app lets the client set its own role.

**9\. Reload the app**  
 You should now see the **Admin Panel** appear, because your account now has admin privileges.

**10\. Delete the user "Carlos"**  
 Go to the Admin Panel and delete Carlos. Lab solved.

