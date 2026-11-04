<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Predict It, Then Break Confidentiality</h3>
<p class="ad-brief__ask">Can you lock a coworker out of a file on purpose, and then prove the file itself never changed?</p>
<p>Hosted lab required, with the Ubuntu desktop open.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 1 solved</span>
</div>

### Before You Start

Before you type anything, make a prediction. It's fine to get it wrong, because a wrong guess is exactly what makes the lab stick, so do pick one rather than skipping ahead. Nothing gets marked here. You'll find out whether you were right by doing the lab below.

<div class="ad-check ad-check--predict" data-check="w1e-p1">
<p class="ad-check__q">If you remove another user's permission to read a file, does the file change?</p>
<button type="button" class="ad-check__opt" data-i="0">Yes, its contents change</button>
<button type="button" class="ad-check__opt" data-i="1">No, only who can read it changes</button>
<p class="ad-check__note">Got it. You'll find out for sure when you run <code>chmod</code> below.</p>
</div>

### Set Up One File

Start by opening a terminal on the Ubuntu desktop. The commands below create a working folder and a small file that stands in for a document the business cares about.

```bash
sudo mkdir -p /srv/cia
sudo chown student:student /srv/cia
chmod 755 /srv/cia
cd /srv/cia
printf 'Q3 advisory fees: 412500\n' > ledger.txt
chmod 644 ledger.txt
```

Next, create a second account. This one plays the part of a coworker on the Wealth Management team, the team this ledger belongs to.

```bash
sudo useradd -m jamie.torres
sudo -u jamie.torres cat /srv/cia/ledger.txt
```

The second command prints the line from the file, which tells you jamie.torres can read it right now. That's the starting point you're about to change.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-1/PLACEHOLDER-cia-setup.png" alt="Terminal showing the ledger file created and read successfully by a second user" />
<figcaption>Screenshot 1. [ADD IMAGE] jamie.torres reads the file before any permission changes.</figcaption>
</figure>
</div>

### Break Confidentiality

Remember that confidentiality means only the people who should see something can see it. So let's take jamie.torres's access away and then prove it's really gone.

```bash
chmod 600 ledger.txt
ls -l ledger.txt
sudo -u jamie.torres cat /srv/cia/ledger.txt
```

This time, the last command fails with "Permission denied". Make a note of that exact message. Then read the file as yourself, to confirm it's still there and still says what it said before.

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

Answer based on what you actually saw in your terminal, not on what you remember reading.

<div class="ad-mission" data-id="w1e-c1" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1082 · Low</span>
<p><strong>Task:</strong> After <code>chmod 600</code>, had the contents of <code>ledger.txt</code> changed in any way? Type its letter.<br><strong>A</strong> Yes.<br><strong>B</strong> No.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for whether the file's contents changed" placeholder="A or B" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Look back at the two commands you ran right after <code>chmod 600</code>, one as jamie.torres and one as yourself. Only one of them could open the file at all, so what did that one show you?</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">Try running <code>cat ledger.txt</code> again as yourself. You'll see the line is exactly what you wrote with <code>printf</code>.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. No</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Permissions decide who's allowed to read a file. They never change what's inside it. So here confidentiality changed while integrity stayed exactly as it was.</p>
</div>
</div>
</div>
</div>

### Why It Matters

A file share that's open to the wrong people is one of the most common things you'll find in a real access review. As you just saw, it's also quick to prove: one command to break it, one to confirm it, and one to undo it. In the next challenge, you'll break a different property on this same file.
