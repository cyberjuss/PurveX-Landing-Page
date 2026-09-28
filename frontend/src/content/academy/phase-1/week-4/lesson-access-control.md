### Broken Access Control

Access control enforces authorization on every request. **Broken access control** means the server skips that check, so a user reaches data or actions beyond their permissions. It is the number one risk on the OWASP Top 10.

### The rule: never trust the client

Anything the browser sends can be changed: the address, form fields, hidden fields, cookies and request data. Browser developer tools can do it, and proxies such as Burp Suite or OWASP ZAP make it easy.

On every request, the server must decide:

1. Who this session belongs to, from its own session records.
2. What role that person has, from its own records.
3. Whether that role may perform this action on this item.

Hiding a button is not access control. Anyone who types the address still gets in unless the server checks.

### Common forms

- **Insecure direct object reference (IDOR):** changing an ID in a request returns someone else's record. First American Financial exposed about 885 million documents this way in 2019.
- **Forced browsing:** requesting a page the user was never shown, such as `/admin`.
- **Parameter tampering:** sending a value the server should set itself, such as a role or account ID. This week's lab uses this flaw.

### Fixes

- **Check on the server, every time.** Take identity and role from the session, and check ownership of every item requested.
- **Deny by default.** An action stays closed unless a rule opens it for this role.
- **Ignore fields the user should not set.** The server decides the role, the price and the account number.
- **Unguessable IDs help but do not fix it.** A leaked link still works unless the server checks ownership.
- **Log refused requests.** A burst of denials is often the first sign of probing.

### Testing

Changing IDs on a system without written permission to test it is unauthorized access, even if you only look. Practice on the PortSwigger Web Security Academy labs. On the job, testing needs a signed scope.

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
