### Broken Access Control

If authorization is the decision, access control is the enforcement. Deciding that a role may read a record achieves nothing on its own, because something still has to apply that decision on every request before any data goes back. **Broken access control** is what we call it when the server skips that check, letting a user reach data or take actions beyond their permissions. It has been the number one risk on the OWASP Top 10 since 2021, which tells you how often that check gets missed.

### The rule: never trust the client

Every fix in this section rests on one rule: **nothing arriving from the browser can be trusted.** Everything the browser sends is under the control of whoever is using it:

- the address
- form fields
- hidden fields
- cookies
- the body of the request

Changing those values takes no special skill. The developer tools built into every browser are enough, and proxies such as Burp Suite or OWASP ZAP make editing a request routine. So the server can't take identity or permission from the request itself. On every request, it has to establish three things from its own records:

1. Who this session belongs to.
2. What role that person has.
3. Whether that role may perform this action on this item.

That's also why hiding a button is not access control, and the mistake is common enough to say plainly. Removing a link from a menu changes what a user is invited to do, but it changes nothing about what the server will do if someone types the address directly.

### Common forms

Broken access control tends to show up in three recognizable forms:

- **Insecure direct object reference (IDOR):** changing an ID in a request returns someone else's record. First American Financial exposed about 885 million documents this way in 2019. This week's challenge ends with this flaw.
- **Forced browsing:** requesting a page the user was never shown, such as `/admin`.
- **Parameter tampering:** sending a value the server should set itself, such as a role or account ID.

```sort
prompt: Three reports came in about the client portal. Name the flaw behind each.
level: 3
IDOR: Changing /statements?id=10451 to 10452 shows another client's statement
Forced browsing: A regular user types /admin and the admin page loads
Parameter tampering: The sign-up form sends role=admin and the server accepts it
```

### Fixes

Every one of the fixes follows from that same rule of never trusting the client:

- **Check on the server, every time.** Take identity and role from the session rather than the request, and confirm ownership of each item before returning it.
- **Deny by default.** An action stays closed unless a rule opens it for this role. A new feature is then safe until somebody decides otherwise, rather than exposed until somebody notices.
- **Ignore fields the user should not set.** The server decides the role, the price and the account number. A value supplied for any of them is discarded, not validated.
- **Unguessable IDs help but fix nothing.** A long random ID only makes a record harder to find by guessing. A leaked link still works unless the server checks ownership when it is used.
- **Log refused requests.** A sudden run of denials from one source is often the first visible sign that somebody is testing the boundaries.

### Testing

Before you try this yourself, a word of caution. Changing identifiers on a system you don't have written permission to test counts as unauthorized access, even if you only looked and even if the flaw was obvious. Good intentions aren't a defense, and finding a real vulnerability doesn't make the access authorized. Practice on the PortSwigger Web Security Academy labs instead, which exist for this purpose. On the job, this kind of testing always needs a signed scope, agreed in advance.

### When a user reports it

Sometimes the flaw finds you, when a user reports seeing someone else's data. When that happens:

1. Ask them not to try any more addresses.
2. Record what they saw: the address, the time, their account and whose data appeared.
3. Do not reproduce it yourself on the live system.
4. Escalate to security immediately. Exposed client data can trigger legal notice deadlines.

### Logs

In web and application logs, these are the signs that someone is probing access control:

- one session requesting item numbers in sequence, such as `10450`, `10451`, `10452`
- a regular user requesting admin pages, especially with success (200) instead of refusal (403)
- a rise in refused requests (403) from one source
- a request field such as `role` or `roleid` that the normal page never sends

### Check yourself

Here's one to think through before the challenge. A developer tells you the admin link is safe because it only appears in the menu for admins. What question would you ask them, and how would you prove the answer?

<details class="lk-answer">
<summary>Compare your answer</summary>

Ask whether the server checks the user's role when the admin page is requested directly, not just whether the menu hides the link. To prove it, on a test system you're authorized to test, sign in as an ordinary user and type the admin address straight into the browser. The server should refuse with a 403. If the page loads, hiding the link was the only thing protecting it.

</details>
