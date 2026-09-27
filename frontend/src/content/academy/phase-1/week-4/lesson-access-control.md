### Broken Access Control

Picture a client portal where PurveX clients sign in and view their statements. A client calls the desk, a little uneasy. They opened their March statement, noticed the address ended in `?statement=10452`, changed it to `10453` out of curiosity, and saw another client's name and balances.

The sign-in worked perfectly. The client proved who they were. The portal simply never asked whether this person was allowed to see statement 10453. That missing question is **broken access control**, the number one risk on the OWASP Top 10.

<div class="academy-analogy">
<span class="academy-analogy__tag">Think of it like a hotel</span>
<ul>
<li>The front desk checks your ID once, at check-in. That is authentication.</li>
<li>Your key card should open your room and nobody else's. That is authorization.</li>
<li>A hotel where any card opens any door, as long as you know the room number, has broken access control.</li>
</ul>
</div>

### The rule: never trust the client

Everything the browser sends can be changed by the person using it: the address, form fields, hidden fields, cookies and the data behind the page. Changing them needs no hacking tools. Browser developer tools can do it, and proxies such as Burp Suite (used in this week's lab) or OWASP ZAP (free and open source) make it easy.

So the server has to decide, on every request, three things:

1. Who is this session? Take it from the server's own session record, not from anything the browser says.
2. What role does that person have? Again from the server's records.
3. Is this person allowed this action, on this exact item?

Hiding a button is not access control. If the admin page is simply missing from a regular user's menu, anyone who types the address still gets in unless the server checks.

### The three forms you will see most

**Changing an ID.** The request names an item by its number, and the server returns it without checking who owns it. The formal name is **insecure direct object reference (IDOR)**. In 2019, First American Financial exposed about 885 million documents, including bank statements, Social Security numbers and mortgage records, this way. Changing the document number in the address showed someone else's file.

**Going straight to the page.** A regular user requests `/admin` or another page they were never shown, and the server serves it. This is called **forced browsing**.

**Setting your own permissions.** The server accepts a value it should decide itself, such as a role or an account ID, because the browser included it in a request. This week's lab is exactly this. The app sends back a `roleid` field when you update your email, and it accepts one when you send it, even though a user should never set their own role.

### What a fix looks like

- **Check on the server, every time.** Take the user's identity and role from the server's session, and check ownership for every item requested.
- **Deny by default.** A page or action is closed unless a rule opens it for this role.
- **Ignore fields the user should not set.** The server decides the role, the price and the account number. Values the client sends for those are dropped.
- **Unguessable IDs help, but are not the fix.** A random ID is harder to stumble on than `10453`, but a leaked link still works unless the server checks ownership.
- **Log refused requests.** A burst of denied requests is often the first sign of someone probing.

### Only test what you are allowed to test

Changing IDs on a system you do not have written permission to test is unauthorized access, even if you only look. The PortSwigger Web Security Academy labs are built for practice, and that is where you do it. On the job, testing belongs to people with a signed scope.

### On the help desk: when a user reports it

The client in the opening call just reported a data exposure. Handle it as one:

1. Thank them and ask them not to try any more addresses.
2. Record exactly what they saw: the address, the time, the account they were signed in as, and whose data appeared. A screenshot helps.
3. Do not try to reproduce it yourself on the live portal.
4. Escalate to security immediately. Client financial data seen by the wrong person can trigger legal notice duties, and the clock starts when the company learns of it.

### In the SOC: what the logs show

Web server and application logs record every request. Signs of access control probing:

- One session requesting many item numbers in sequence, such as statement `10450`, `10451`, `10452`, and so on.
- A regular user's session requesting admin pages, especially if the server answered with success (status 200) instead of refusal (403).
- A sudden rise in refused requests (403) from one source.
- A request that includes a field like `role` or `roleid` that the normal page never sends.

### Check yourself

A developer says the admin link is safe because it only appears in the menu for admins. What question do you ask them, and how would you prove the answer in the lab?
