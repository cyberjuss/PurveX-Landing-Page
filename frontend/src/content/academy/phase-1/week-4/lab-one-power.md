<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>A coworker needs to restart one service as an administrator and nothing more. Can you grant exactly that, and prove you did not quietly hand over the whole machine?</p>
</div>

**Situation:** Authorization is deciding what an account may do once it has proved who it is. The safe rule is least privilege, giving each account only what its job needs. The careless version, a rule that grants more than intended, is how one ordinary account turns into control of the whole server.

**Task:** On the Ubuntu server, write a sudo rule that lets a user restart one service and nothing else. Prove the allowed command works, prove a second command is refused, then look at a broader rule and say exactly how much more it would give away. Predict each result before you check it.

**What you need:** Your hosted lab running, and a terminal on the Ubuntu desktop. You use only built-in tools. Nothing here attacks anything, you are writing and auditing permissions the way an administrator does.

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

Open a terminal. Create an account that stands in for the coworker who needs to restart the web server.

```bash
sudo useradd -m webops
```

Right now webops can do nothing as root. You are about to grant one thing.

### Grant Exactly One Command

Sudo rules live in files under `/etc/sudoers.d`. Write one that lets webops restart nginx, and only that. The syntax names the user, the machine, who they may act as, and the exact command.

```bash
echo 'webops ALL=(root) NOPASSWD: /usr/bin/systemctl restart nginx' | sudo tee /etc/sudoers.d/webops
sudo chmod 440 /etc/sudoers.d/webops
```

Now read back what webops is allowed to do, without becoming them.

```bash
sudo -l -U webops
```

It lists the single command you granted. That is the whole of webops's power.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-4/PLACEHOLDER-sudo-list.png" alt="Terminal showing sudo -l for the webops user listing only the one permitted systemctl restart nginx command" />
<figcaption>Screenshot 1. [ADD IMAGE] One command, and nothing else.</figcaption>
</figure>
</div>

### Prove It Works and Prove It Stops

Test the allowed command as webops. It should run.

```bash
sudo -u webops sudo -n systemctl restart nginx
```

No error means it worked. Now try a different command, one you never granted.

```bash
sudo -u webops sudo -n systemctl restart ssh
```

It is refused with a message that webops may not run that command. The rule did exactly one thing and refused the rest.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-4/PLACEHOLDER-sudo-refused.png" alt="Terminal showing the allowed nginx restart succeeding and the ssh restart refused for webops" />
<figcaption>Screenshot 2. [ADD IMAGE] The granted command runs, a different one is refused.</figcaption>
</figure>
</div>

### See What a Broad Rule Would Give Away

Now look at the rule a hurried administrator often writes instead. Read it, do not apply it.

```
webops ALL=(root) NOPASSWD: /usr/bin/systemctl
```

It looks almost the same, but it names no service. That one difference lets webops run `systemctl` with any service and any action. They could stop the firewall, restart sshd, or disable the logging service auditd that recorded the last lab.

The narrow rule gave away one service. The broad rule gave away control of every service on the machine, to the same account, with the same one line. That gap is what least privilege is about.

### Clean Up

Remove the rule and the user so the next lab starts clean.

```bash
sudo rm /etc/sudoers.d/webops
sudo userdel -r webops
```

### Check Yourself

Answer from what you saw, not from what you remember reading.

<div class="ad-check" data-check="w4m-c1" data-answer="1">
<p class="ad-check__q">With webops granted only the nginx restart, what happened when you tried to restart ssh?</p>
<button type="button" class="ad-check__opt" data-i="0">It worked, since one sudo rule unlocks all of sudo</button>
<button type="button" class="ad-check__opt" data-i="1">It was refused</button>
<p class="ad-check__note">A sudo rule grants only what it names. Everything else stays denied, which is the point of listing the exact command.</p>
</div>

<div class="ad-check" data-check="w4m-c2" data-answer="2">
<p class="ad-check__q">The broad rule named "systemctl" with no service. What did it actually grant?</p>
<button type="button" class="ad-check__opt" data-i="0">Only restarting nginx</button>
<button type="button" class="ad-check__opt" data-i="1">Nothing, it is invalid</button>
<button type="button" class="ad-check__opt" data-i="2">Control of any service, including stopping security tools</button>
<p class="ad-check__note">Without a service named, systemctl can start, stop or restart anything. That includes turning off the firewall or the logging service, which is far more than one restart.</p>
</div>

<div class="ad-check" data-check="w4m-c3" data-answer="0">
<p class="ad-check__q">Why write the rule as narrowly as possible even for someone you trust?</p>
<button type="button" class="ad-check__opt" data-i="0">A stolen account can only do what the rule allows, so a narrow rule limits the damage</button>
<button type="button" class="ad-check__opt" data-i="1">Narrow rules run faster</button>
<button type="button" class="ad-check__opt" data-i="2">It is only about trust, so it does not matter</button>
<p class="ad-check__note">Least privilege is about the account, not the person. If the account is phished or stolen, the attacker gets exactly what the rule allows and no more.</p>
</div>

<div class="ad-check" data-check="w4m-c4" data-answer="1">
<p class="ad-check__q">Which command let you audit webops's privileges without logging in as them?</p>
<button type="button" class="ad-check__opt" data-i="0">cat /etc/passwd</button>
<button type="button" class="ad-check__opt" data-i="1">sudo -l -U webops</button>
<button type="button" class="ad-check__opt" data-i="2">whoami</button>
<p class="ad-check__note">sudo -l -U lists what any user is permitted to run. It is how you check a rule says what you meant, which is a real audit task.</p>
</div>

### Take It Further

You review a server and find this rule for a backup account: it may run sudo for any command in `/usr/bin` with no password.

Say whether that follows least privilege, name one thing the account could do beyond backups, and say what you would change the rule to.

### Why It Matters

Most privilege problems are not clever attacks. They are an account that was given more than it needed, found by someone who should not have had it. An administrator who writes the narrowest rule that still does the job, and who can audit what an account may do, closes the hole before anyone goes looking for it.
