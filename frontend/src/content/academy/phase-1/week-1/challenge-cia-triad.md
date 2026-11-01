<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Which Property Actually Failed?</h3>
<p class="ad-brief__ask">Confidentiality, integrity and availability are three separate properties. Can you break each one on purpose, on a real machine, and prove which one you broke?</p>
<p>Most people meet the CIA triad as three words on a slide and never see any of them fail. A property you have never watched break is a property you cannot recognize in a PurveX Financial ticket. Work on one file on your Ubuntu server. Break confidentiality, then integrity, then availability, and prove each failure with a command rather than an opinion.</p>
<p>Your hosted lab needs to be running, with the Ubuntu desktop open. Nothing is installed for this lab; every command ships with the system. Each step takes a short answer, and the hint unlocks after two misses.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 5 solved</span>
</div>

### Before You Start

Commit to an answer before you type anything. Being wrong here is useful, so pick one rather than skipping ahead. Nothing is marked right or wrong yet. You confirm each by doing the lab.

<div class="ad-check ad-check--predict" data-check="w1e-p1">
<p class="ad-check__q">If you remove another user's permission to read a file, does the file change?</p>
<button type="button" class="ad-check__opt" data-i="0">Yes, its contents change</button>
<button type="button" class="ad-check__opt" data-i="1">No, only who can read it changes</button>
<p class="ad-check__note">Locked in. You prove this when you run <code>chmod</code> below.</p>
</div>

<div class="ad-check ad-check--predict" data-check="w1e-p2">
<p class="ad-check__q">If you change one character inside a file, how many characters of its SHA-256 hash change?</p>
<button type="button" class="ad-check__opt" data-i="0">Only the part for that character</button>
<button type="button" class="ad-check__opt" data-i="1">Roughly half of it</button>
<button type="button" class="ad-check__opt" data-i="2">Almost all of it</button>
<p class="ad-check__note">Locked in. You compare the two hashes in the Integrity step.</p>
</div>

<div class="ad-check ad-check--predict" data-check="w1e-p3">
<p class="ad-check__q">If a web server is stopped, is the page it served still on the disk?</p>
<button type="button" class="ad-check__opt" data-i="0">Yes, the file stays put</button>
<button type="button" class="ad-check__opt" data-i="1">No, stopping it removes the page</button>
<p class="ad-check__note">Locked in. You check with <code>ls</code> in the Availability step.</p>
</div>

### Set Up One File

Open a terminal on the Ubuntu desktop. These commands make a working folder and a file that stands in for a document the business cares about.

```bash
sudo mkdir -p /srv/cia
sudo chown student:student /srv/cia
chmod 755 /srv/cia
cd /srv/cia
printf 'Q3 advisory fees: 412500\n' > ledger.txt
chmod 644 ledger.txt
```

Now make a second account, standing in for a coworker on the Wealth Management team this ledger belongs to.

```bash
sudo useradd -m jamie.torres
sudo -u jamie.torres cat /srv/cia/ledger.txt
```

The second command prints the line. jamie.torres can read the file, which is the state you are about to change.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-1/PLACEHOLDER-cia-setup.png" alt="Terminal showing the ledger file created and read successfully by a second user" />
<figcaption>Screenshot 1. [ADD IMAGE] jamie.torres reads the file before any permission changes.</figcaption>
</figure>
</div>

### Break Confidentiality

Confidentiality means only the people who should see something can see it. Take jamie.torres's access away and prove it is gone.

```bash
chmod 600 ledger.txt
ls -l ledger.txt
sudo -u jamie.torres cat /srv/cia/ledger.txt
```

The last command fails with "Permission denied". Record the exact message. Then read the file yourself to confirm it is still there and still correct.

```bash
cat ledger.txt
```

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-1/PLACEHOLDER-cia-confidentiality.png" alt="Terminal showing Permission denied for the second user after chmod 600" />
<figcaption>Screenshot 2. [ADD IMAGE] The read is refused, and the owner still reads it fine.</figcaption>
</figure>
</div>

### Break Integrity

Integrity means the data is what it is supposed to be. Record a baseline first, because integrity can only be proved against something.

```bash
sha256sum ledger.txt > baseline.txt
cat baseline.txt
```

Now change one digit inside the file and check the baseline again.

```bash
sed -i 's/412500/412501/' ledger.txt
sha256sum -c baseline.txt
```

The check reports FAILED. Compare the new hash against the one in `baseline.txt` and note how much of it is different.

```bash
sha256sum ledger.txt
```

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-1/PLACEHOLDER-cia-integrity.png" alt="Terminal showing sha256sum check reporting FAILED after one character changed" />
<figcaption>Screenshot 3. [ADD IMAGE] One digit changed, and the check fails.</figcaption>
</figure>
</div>

### Break Availability

Availability means the thing is there when it is needed. Your server already runs a web server, so use that.

```bash
curl -I http://localhost
sudo systemctl stop nginx
curl -I http://localhost
```

The first request returns a status line. The second fails to connect. Confirm the page itself never moved.

```bash
ls -l /var/www/html/index.html
sudo systemctl start nginx
curl -I http://localhost
```

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-1/PLACEHOLDER-cia-availability.png" alt="Terminal showing a successful request, a failed request after stopping nginx, and the file still present on disk" />
<figcaption>Screenshot 4. [ADD IMAGE] The service is down while the file sits untouched on disk.</figcaption>
</figure>
</div>

### Check Yourself

Answer from what you saw, not from what you remember reading.

<div class="ad-mission" data-id="w1e-c1" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1082 · Low</span>
<p><strong>Task:</strong> After <code>chmod 600</code>, had the contents of <code>ledger.txt</code> changed in any way? Type its letter.<br><strong>A</strong> Yes.<br><strong>B</strong> No.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for whether the file's contents changed" placeholder="A or B" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Look at the two commands you ran right after <code>chmod 600</code>: one as jamie.torres, one as yourself. Only one of them could even open the file.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">Run <code>cat ledger.txt</code> again as yourself. The line is exactly what you wrote with <code>printf</code>.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. No</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Permissions decide who may read a file, never what it holds. Confidentiality failed while integrity stayed intact.</p>
</div>
</div>
</div>
</div>

### Read the Avalanche Effect

<div class="ad-mission" data-id="w1e-c2" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1083 · Low</span>
<p><strong>Task:</strong> You changed one digit out of twenty-four characters. Roughly how many characters of the SHA-256 hash changed? Type its letter.<br><strong>A</strong> About one character.<br><strong>B</strong> About a quarter.<br><strong>C</strong> Almost all of it.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for how much of the hash changed" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{c}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Put the two lines <code>sha256sum ledger.txt</code> printed, before and after the <code>sed</code> command, side by side and compare them character by character.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a|b">Compare the full 64-character hash from before the edit against the one after. This is not a partial match, even for a one-digit change.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>C. Almost all of it</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A hash has no partial match. One changed character scrambles the whole digest, which is what lets it flag any change at all.</p>
</div>
</div>
</div>
</div>

### Confirm Availability Failed Alone

<div class="ad-mission" data-id="w1e-c3" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1084 · Low</span>
<p><strong>Task:</strong> While nginx was stopped, was <code>index.html</code> still on the disk? Type its letter.<br><strong>A</strong> Yes.<br><strong>B</strong> No.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for whether the file was still on disk" placeholder="A or B" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{a}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>You ran <code>ls -l /var/www/html/index.html</code> while the service was down. Read what that command actually reported.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="b">The <code>ls -l</code> command you ran while nginx was stopped still listed the file. Stopping a service does not delete anything.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>A. Yes</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Availability failed while the file sat untouched. The page was there the whole time, just not being served.</p>
</div>
</div>
</div>
</div>

### Name the Property That Failed

<div class="ad-mission" data-id="w1e-c4" data-attempts="0">
<span class="ad-mission__num">Ticket 03 · INC-1085 · Medium</span>
<p><strong>Client Support · Escalation · 9:15 AM</strong><br>Advisor sam.whitfield's client Avery calls in: the statement on their portal dashboard shows client Blake's account balance instead of their own. The numbers on it are correct for someone, just not for Avery.</p>
<p><strong>Task:</strong> Which property failed? Type its letter.<br><strong>A</strong> Confidentiality.<br><strong>B</strong> Integrity.<br><strong>C</strong> Availability.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for which property failed" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{a}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The number on screen is correct and the portal is up. Nothing about the data itself is wrong; it only reached a person it should not have.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="b">The balance itself is accurate for whoever it actually belongs to. Nothing was altered; it just reached the wrong client.</div>
<div class="ad-miss" data-guess="c">The portal is up and serving data just fine. The failure is about who can see what, not whether the service responds.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>A. Confidentiality</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The data is correct and available. It just reached the wrong person, which is a confidentiality failure.</p>
</div>
</div>
</div>
</div>

### Combine Two Failures at Once

<div class="ad-mission ad-mission--capstone" data-id="w1e-c5" data-attempts="0">
<span class="ad-mission__num">Ticket 04 · INC-1086 · Critical</span>
<p><strong>SOC Lead · Incident Review · 2:00 PM</strong><br>A ransomware attack encrypts PurveX Financial's file share overnight, and the forensic review finds the attacker also copied everything out before encrypting it.</p>
<p><strong>Task:</strong> Which properties failed, and which one costs the most if the attacker publishes what they took? Type its letter.<br><strong>A</strong> Only availability failed. The published copy does not change that.<br><strong>B</strong> Both availability and confidentiality failed. Encryption blocks access right now, but a published copy of client data is the harder loss to undo.<br><strong>C</strong> Only confidentiality failed, since the files still exist somewhere.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for which properties failed in a ransomware attack with data theft" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Two separate things happened here: the files got locked, and a copy left the building before that. Name what each one breaks on its own.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">Encryption is not the only thing that happened. A copy also left the building before the files were locked.</div>
<div class="ad-miss" data-guess="c">The share being encrypted is a real failure too, the same one you caused with <code>systemctl stop nginx</code> earlier, just harder to undo this time.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. Both availability and confidentiality failed</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Encryption is an availability failure you can usually recover from with a clean backup. A stolen copy already in an attacker's hands is a confidentiality failure a backup cannot undo, which is why modern ransomware steals data before it encrypts anything at all.</p>
</div>
</div>
</div>
</div>

### Take It Further

The company restores the ransomware-hit share from a clean backup made the night before the attack.

Say which of the three properties that restore actually fixes, and which one it cannot touch no matter how recent the backup is.

### Why It Matters

Tickets rarely say which property failed. They say a report is wrong, a share will not open or a client saw another client's statement. Naming the property is what turns a vague complaint into the right fix, and the wrong name sends the work to the wrong team.
