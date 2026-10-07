### Broken Access Control

Access control is the enforcement half of authorization. Deciding that a particular role may read a particular record achieves nothing on its own, because something still has to apply that decision, on every request, before any data is returned. **Broken access control** is the name for what happens when the server skips that check and a user consequently reaches data or performs actions beyond their permissions. It has been the number one risk on the OWASP Top 10 since 2021, which tells you how routinely the check gets missed.

### The rule: never trust the client

The single rule underneath every fix in this section is that **nothing arriving from the browser can be trusted.** Everything it sends is under the control of whoever is using it:

- the address
- form fields
- hidden fields
- cookies
- the body of the request

This is not an exotic capability requiring special skill. Browser developer tools are sufficient, and intercepting proxies such as Burp Suite or OWASP ZAP make editing a request on its way out entirely routine.

The consequence is that the server can take nothing about identity or permission from the request itself. On every request it has to establish three things from its own records.

1. Who this session belongs to, from its own session records.
2. What role that person has, from its own records.
3. Whether that role may perform this action on this item.

This is why hiding a button is not access control, and it is worth being blunt about because the mistake is so common. Removing a link from a menu changes what one user is invited to do. It changes nothing whatsoever about what the server will do if somebody types the address directly, and an attacker is not working from your menu.

### Common forms

- **Insecure direct object reference (IDOR):** changing an ID in a request returns someone else's record. First American Financial exposed about 885 million documents this way in 2019.
- **Forced browsing:** requesting a page the user was never shown, such as `/admin`.
- **Parameter tampering:** sending a value the server should set itself, such as a role or account ID. This week's lab uses this flaw.

### Fixes

The fixes all follow from that rule:

- **Check on the server, every time.** Take identity and role from the session rather than the request, and confirm ownership of each item before returning it.
- **Deny by default.** An action stays closed unless a rule explicitly opens it for this role, so a newly added feature is safe until somebody decides otherwise rather than exposed until somebody notices.
- **Ignore fields the user should not set.** The server decides the role, the price and the account number. A value supplied for any of them is discarded, not validated.
- **Unguessable IDs help but fix nothing.** A long random ID only makes a record harder to find by guessing. A leaked link still works unless the server checks ownership when it is used.
- **Log refused requests.** A sudden run of denials from one source is frequently the earliest visible sign that somebody is testing where the boundaries are.

### Testing

A word of caution before the lab. Changing identifiers on a system you do not have written permission to test is unauthorized access, and that remains true even if you only looked, and even if the flaw was obvious. Intent is not the test here, so discovering a genuine vulnerability is not a defence either. Practise instead on the PortSwigger Web Security Academy labs, which exist for exactly this purpose, and take it as given that on the job this kind of testing requires a signed scope agreed in advance.

### When a user reports it

1. Ask them not to try any more addresses.
2. Record what they saw: the address, the time, their account and whose data appeared.
3. Do not reproduce it yourself on the live system.
4. Escalate to security immediately. Exposed client data can trigger legal notice deadlines.

### Logs

Signs of access control probing in web and application logs:

- one session requesting item numbers in sequence, such as `10450`, `10451`, `10452`
- a regular user requesting admin pages, especially with success (200) instead of refusal (403)
- a rise in refused requests (403) from one source
- a request field such as `role` or `roleid` that the normal page never sends

### Check yourself

A developer says the admin link is safe because it only appears in the menu for admins. What question do you ask them, and how would you prove the answer in the lab?
