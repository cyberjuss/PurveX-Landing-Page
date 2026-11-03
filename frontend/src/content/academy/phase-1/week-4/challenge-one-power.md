<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Grant Exactly One Power, Then Prove It Stops</h3>
<p class="ad-brief__ask">Priya Nair needs to restart one service, nothing more. Can you grant exactly that, and prove it?</p>
<p>Hosted lab required, with a terminal open on the Ubuntu desktop.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 4 solved</span>
</div>

### Before You Start

Commit to an answer first. Nothing is marked yet. The rules settle each one.

<div class="ad-check ad-check--predict" data-check="w4m-p1">
<p class="ad-check__q">You give a user sudo rights to exactly one command. Can they use sudo for anything else?</p>
<button type="button" class="ad-check__opt" data-i="0">Yes, one sudo rule unlocks all of sudo</button>
<button type="button" class="ad-check__opt" data-i="1">No, only the command you listed</button>
<p class="ad-check__note">Locked in. You will try a second command and watch what happens.</p>
</div>

<div class="ad-check ad-check--predict" data-check="w4m-p2">
<p class="ad-check__q">A rule grants sudo for "systemctl" with no service named. How much does that give the user?</p>
<button type="button" class="ad-check__opt" data-i="0">Only the ability to restart the one service you had in mind</button>
<button type="button" class="ad-check__opt" data-i="1">The ability to start, stop or restart any service on the machine</button>
<p class="ad-check__note">Locked in. You will compare the narrow rule against this broad one.</p>
</div>

<div class="ad-check ad-check--predict" data-check="w4m-p3">
<p class="ad-check__q">Why does least privilege matter if you trust the coworker?</p>
<button type="button" class="ad-check__opt" data-i="0">It does not, trust is enough</button>
<button type="button" class="ad-check__opt" data-i="1">If their account is ever stolen, the attacker inherits exactly what it could do</button>
<p class="ad-check__note">Locked in. The rule is not about the person, it is about what a stolen account is worth.</p>
</div>

### Make a User to Grant To

The safe rule is least privilege: give each account only what its job needs. A rule that grants more than intended is how one ordinary account turns into control of the whole server.

Open a terminal. Create an account that stands in for priya.nair, who needs to restart the web server.

```bash
sudo useradd -m priya.nair
```

Right now priya.nair can do nothing as root. You are about to grant one thing.

### Grant Exactly One Command

Sudo rules live in files under `/etc/sudoers.d`. Write one that lets priya.nair restart nginx, and only that. The syntax names the user, the machine, who they may act as, and the exact command.

```bash
echo 'priya.nair ALL=(root) NOPASSWD: /usr/bin/systemctl restart nginx' | sudo tee /etc/sudoers.d/priya.nair
sudo chmod 440 /etc/sudoers.d/priya.nair
```

Now read back what priya.nair is allowed to do, without becoming them.

```bash
sudo -l -U priya.nair
```

It lists the single command you granted. That is the whole of priya.nair's power.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-4/PLACEHOLDER-sudo-list.png" alt="Terminal showing sudo -l for the priya.nair user listing only the one permitted systemctl restart nginx command" />
<figcaption>Screenshot 1. [ADD IMAGE] One command, and nothing else.</figcaption>
</figure>
</div>

### Prove It Works and Prove It Stops

Test the allowed command as priya.nair. It should run.

```bash
sudo -u priya.nair sudo -n systemctl restart nginx
```

No error means it worked. Now try a different command, one you never granted.

```bash
sudo -u priya.nair sudo -n systemctl restart ssh
```

It is refused with a message that priya.nair may not run that command. The rule did exactly one thing and refused the rest.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-4/PLACEHOLDER-sudo-refused.png" alt="Terminal showing the allowed nginx restart succeeding and the ssh restart refused for priya.nair" />
<figcaption>Screenshot 2. [ADD IMAGE] The granted command runs, a different one is refused.</figcaption>
</figure>
</div>

### See What a Broad Rule Would Give Away

Now look at the rule a hurried administrator often writes instead. Read it, do not apply it.

```
priya.nair ALL=(root) NOPASSWD: /usr/bin/systemctl
```

It looks almost the same, but it names no service. That one difference lets priya.nair run `systemctl` with any service and any action — stop the firewall, restart sshd, interfere with the logging that recorded the last lab.

The narrow rule gave away one service. The broad rule gave away every service on the machine, and in practice root itself: anyone who can run any `systemctl` command as root can also start a service they wrote. All of that from the same one line — that gap is what least privilege is about.

### Clean Up

Remove the rule and the user so the next lab starts clean.

```bash
sudo rm /etc/sudoers.d/priya.nair
sudo userdel -r priya.nair
```

### Check Yourself

Answer from what you saw, not from what you remember reading.

<div class="ad-mission" data-id="w4m-c1" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1123 · Low</span>
<p><strong>Task:</strong> With priya.nair granted only the nginx restart, what happened when you tried to restart ssh? Type its letter.<br><strong>A</strong> It worked, since one sudo rule unlocks all of sudo.<br><strong>B</strong> It was refused.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what happened restarting ssh" placeholder="A or B" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Look at the actual terminal output from the "Prove It Works and Prove It Stops" step. The second command printed a message about priya.nair specifically.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">The command printed a refusal naming priya.nair. A sudo rule grants only the exact command it names.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. It was refused</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A sudo rule grants only what it names. Everything else stays denied, which is the point of listing the exact command.</p>
</div>
</div>
</div>
</div>

### Read What a Broad Rule Actually Grants

<div class="ad-mission" data-id="w4m-c2" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1124 · Low</span>
<p><strong>Task:</strong> The broad rule named "systemctl" with no service. What did it actually grant? Type its letter.<br><strong>A</strong> Only restarting nginx.<br><strong>B</strong> Nothing, it is invalid.<br><strong>C</strong> Control of any service, including stopping security tools.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for what the broad rule actually granted" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{c}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Compare the two rules character by character. The narrow one ends in <code>restart nginx</code>. The broad one stops right after <code>systemctl</code>.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">That is what the narrow rule granted, the one with <code>restart nginx</code> written into it. This rule stops at <code>systemctl</code> with no service named.</div>
<div class="ad-miss" data-guess="b">The rule is perfectly valid syntax. That is exactly the danger: nothing stops you from writing it, and nothing in sudo objects when you do.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>C. Control of any service, including stopping security tools</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Without a service named, systemctl can start, stop or restart anything. That includes turning off the firewall or the logging service, which is far more than one restart.</p>
</div>
</div>
</div>
</div>

### Explain Why Trust Is Not the Argument

<div class="ad-mission" data-id="w4m-c3" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1125 · Low</span>
<p><strong>Task:</strong> Why write the rule as narrowly as possible even for someone you trust? Type its letter.<br><strong>A</strong> A stolen account can only do what the rule allows, so a narrow rule limits the damage.<br><strong>B</strong> Narrow rules run faster.<br><strong>C</strong> It is only about trust, so it does not matter.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for why to write the rule narrowly even for a trusted person" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{a}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The rule does not know or care who is typing the password. It only knows the account name on the request.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="b">Both rules run instantly either way. Speed was never the reason least privilege matters.</div>
<div class="ad-miss" data-guess="c">Trust describes the person, but sudo enforces rules against the account, which anyone holding its credentials can use.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>A. A stolen account can only do what the rule allows</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Least privilege is about the account, not the person. If the account is phished or stolen, the attacker gets exactly what the rule allows and no more.</p>
</div>
</div>
</div>
</div>

### Name the Audit Command

<div class="ad-mission" data-id="w4m-c4" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1126 · Low</span>
<p><strong>Task:</strong> Which command let you audit priya.nair's privileges without logging in as them? Type its letter.<br><strong>A</strong> cat /etc/passwd.<br><strong>B</strong> sudo -l -U priya.nair.<br><strong>C</strong> whoami.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for which command audits a user's sudo privileges" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>You ran this one in "Grant Exactly One Command," right after writing the sudoers file, to confirm it did what you meant.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">That lists account names on the system, not what any one of them is allowed to run with sudo.</div>
<div class="ad-miss" data-guess="c">That only prints the name of whoever is currently logged in. It says nothing about priya.nair's permissions.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. sudo -l -U priya.nair</code></p>
</div>
<div>
<span>Why it matters</span>
<p>sudo -l -U lists what any user is permitted to run. It is how you check a rule says what you meant, which is a real audit task.</p>
</div>
</div>
</div>
</div>

### Why It Matters

One line in a sudoers file is the whole difference between "restart nginx" and "control any service on the machine." The next challenge in this set audits a real rule written the broad way.
