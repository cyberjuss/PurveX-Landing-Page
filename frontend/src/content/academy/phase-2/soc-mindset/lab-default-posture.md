<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Before you add a single rule, a firewall has already decided what to do with everything you never mentioned. Can you read that default straight from your own domain controller?</p>
</div>

**Situation:** Allowlisting and blocklisting are not about which list you keep. They are about what the system does with the traffic that is not on either list. A firewall's default action answers that question before any rule you write ever runs.

**Task:** Read your domain controller's own default outbound action, the setting that decides what happens to a connection nobody wrote a rule for.

**What you need:** Your hosted lab running, with the domain controller reachable the way every other exercise reaches it.

### Ask the Firewall What It Actually Does by Default

Open PowerShell on the domain controller.

```powershell
Get-NetFirewallProfile -Profile Domain | Select-Object Name, DefaultInboundAction, DefaultOutboundAction
```

Two different answers sit side by side here. Inbound traffic nobody asked for is blocked by default. Outbound traffic the machine itself starts is allowed by default, unless a specific rule says otherwise.

<div class="ad-mission" data-id="sm2-03" data-attempts="0">
<p><strong>Task:</strong> Run the command above. What does your domain controller's Default Outbound Action report?</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the default outbound action" placeholder="Allow or Block" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{allow}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>Allow</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Outbound is blocklisted by default: everything is permitted unless a rule specifically blocks it. Every outbound firewall rule you have seen in this course, including the ones you closed on past tickets, existed to carve an exception out of this same default.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="sm2-04" data-attempts="0">
<p><strong>Task:</strong> Inbound defaults to Block and outbound defaults to Allow on the same machine. What does that difference actually trade off? Type its letter.<br><strong>A</strong> Nothing, the two defaults are functionally identical.<br><strong>B</strong> Blocking inbound by default stops strangers from reaching in, while allowing outbound by default trusts the machine's own software not to call out to somewhere it should not.<br><strong>C</strong> Outbound is allowed by default because outbound traffic can never carry anything malicious.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what the two defaults trade off" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. Blocking inbound by default stops strangers from reaching in, while allowing outbound by default trusts the machine's own software not to call out to somewhere it should not</code></p>
</div>
<div>
<span>Why it matters</span>
<p>That trust is exactly what a beacon abuses: a scheduled task calling out to an address nobody approved still passes, because outbound traffic is allowed unless something blocks it by name. Flipping that default to an allowlist is stricter and breaks less often than people assume, which is why some environments do it anyway.</p>
</div>
</div>
</div>
</div>

### Why It Matters

A default is a decision nobody has to remember to make again. Reading it straight from the machine, instead of assuming it, is how you know what you are actually defending before the first alert ever fires.
