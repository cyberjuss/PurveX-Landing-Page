<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Predict It, Then Break Confidentiality</h3>
<p class="ad-brief__ask">Can you lock a coworker out of a file on purpose, and prove the file itself never changed?</p>
<p>Hosted lab required, with the Ubuntu desktop open.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 1 solved</span>
</div>

### Before You Start

Commit to an answer before you type anything. Being wrong here is useful, so pick one rather than skipping ahead. Nothing is marked right or wrong yet. You confirm it by doing the lab below.

<div class="ad-check ad-check--predict" data-check="w1e-p1">
<p class="ad-check__q">If you remove another user's permission to read a file, does the file change?</p>
<button type="button" class="ad-check__opt" data-i="0">Yes, its contents change</button>
<button type="button" class="ad-check__opt" data-i="1">No, only who can read it changes</button>
<p class="ad-check__note">Locked in. You prove this when you run <code>chmod</code> below.</p>
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

### Why It Matters

A share open to the wrong people is one of the most common findings in a real access review, and it is cheap to prove: one command to break it, one to confirm it, one to undo it. The next challenge in this set breaks a different property on the same file.
