<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>What the Firewall Does With What You Never Mentioned</h3>
<p class="ad-brief__ask">Every firewall has already decided what to do with traffic you never mentioned. Can you read that default?</p>
<p>Hosted lab required, with the domain controller reachable.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 3 solved</span>
</div>

### Ask the Firewall What It Actually Does by Default

Alex Rivera wants the domain controller's own default written down for the audit file, rather than assumed. To read it, open PowerShell on the domain controller.

```powershell
Get-NetFirewallProfile -Profile Domain | Select-Object Name, DefaultInboundAction, DefaultOutboundAction
```

Notice that two different answers sit side by side here. Inbound traffic that nobody asked for is blocked by default, while outbound traffic that the machine itself starts is allowed by default, unless a specific rule says otherwise.

<div class="ad-mission" data-id="sm2-03" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1131 · Low</span>
<p><strong>Task:</strong> Run the command above. What does your domain controller's Default Outbound Action report?</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the default outbound action" placeholder="Allow or Block" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{allow}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Read the DefaultOutboundAction column in the PowerShell output, not DefaultInboundAction, because the two are deliberately different.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="block">That describes the inbound default on this machine, not outbound. Read the DefaultOutboundAction column specifically.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>Allow</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Outbound traffic follows a blocklist model by default: everything is allowed unless a rule specifically blocks it. In fact, every outbound firewall rule you've seen in this course, including the ones you closed on past tickets, existed to carve an exception out of this same default.</p>
</div>
</div>
</div>
</div>

### Trace a Consequence

<div class="ad-mission" data-id="sm2-06" data-attempts="0">
<span class="ad-mission__num">Ticket 02 · INC-1132 · Medium</span>
<p><strong>Detection Engineering · Design Question · 3:00 PM</strong><br>Later this phase you will find a scheduled task quietly reaching out to an address nobody approved, and nothing stops it.</p>
<p><strong>Task:</strong> If this machine's outbound default were Block instead of Allow, would that traffic have left the machine at all, without someone first writing an explicit rule to permit it? Type its letter.<br><strong>A</strong> No, it would be blocked by default, the same way unsolicited inbound traffic already is.<br><strong>B</strong> Yes, outbound traffic always reaches its destination no matter what the default says.<br><strong>C</strong> It depends only on the task's own permissions, not the firewall at all.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for whether a Block-by-default outbound posture would have stopped the beacon" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{a}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>You've just read this machine's actual outbound default, so apply the same logic you used in the previous question, only with the opposite setting.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="b">The default you just read is exactly what decides whether unapproved outbound traffic leaves at all. It is not automatic.</div>
<div class="ad-miss" data-guess="c">A task's own permissions govern what it can do on the machine, not whether its network traffic is allowed to leave. The firewall default decides that.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>A. No, it would be blocked by the same default inbound traffic already gets</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Nothing about the task's own permissions decides whether its traffic leaves the machine. The firewall's default does. So an outbound allowlist would have stopped it cold, without anyone writing a rule specifically against it, simply by trusting nothing it hadn't already approved.</p>
</div>
</div>
</div>
</div>

### Name the Trade-Off

<div class="ad-mission ad-mission--capstone" data-id="sm2-04" data-attempts="0">
<span class="ad-mission__num">Ticket 03 · INC-1133 · Medium</span>
<p><strong>Security Architecture Review · Policy Question · 3:30 PM</strong><br>Alex Rivera is presenting your audit finding to the architecture review board, and needs you to explain, in plain terms, why the domain controller trusts outbound traffic by default while it refuses inbound traffic by default.</p>
<p><strong>Task:</strong> What does that difference actually trade off? Type its letter.<br><strong>A</strong> Nothing, the two defaults are functionally identical.<br><strong>B</strong> Blocking inbound by default stops strangers from reaching in, while allowing outbound by default trusts the machine's own software not to call out to somewhere it should not.<br><strong>C</strong> Outbound is allowed by default because outbound traffic can never carry anything malicious.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what the two defaults trade off" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>You've just reasoned through exactly this with the beacon: a Block default would have stopped it. That's the cost of trusting outbound traffic by default.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">You just read the two settings directly from the machine: Block for inbound, Allow for outbound. They are not the same value.</div>
<div class="ad-miss" data-guess="c">The scheduled task's beacon was outbound traffic, and it was not harmless. Outbound traffic can carry exactly the kind of thing that question was about.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. Blocking inbound by default stops strangers from reaching in, while allowing outbound by default trusts the machine's own software not to call out to somewhere it should not</code></p>
</div>
<div>
<span>Why it matters</span>
<p>That trust is exactly what a beacon abuses. A scheduled task calling out to an address nobody approved still gets through, because outbound traffic is allowed unless something blocks it by name. Flipping that default to an allowlist is stricter, but it breaks things less often than people assume, which is why some environments do it anyway.</p>
</div>
</div>
</div>
</div>

### Why It Matters

A default is a decision that nobody has to remember to make again, so it quietly shapes everything that follows. Reading it straight from the machine, rather than assuming it, is how you know what you're actually defending before the first alert ever fires.
