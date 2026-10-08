<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>Confidentiality, integrity and availability are three separate properties. Can you break each one on purpose and prove which one you broke?</p>
</div>

**Situation:** Most people meet the CIA triad as three words on a slide and never see any of them fail. A property you have never watched break is a property you cannot recognise in a ticket.

**Task:** Work on one file on your Ubuntu server. Break confidentiality, then integrity, then availability, and prove each failure with a command rather than an opinion. Write down what you expect before each step.

**What you need:** Your hosted lab running, and the Ubuntu desktop open. Nothing is installed for this lab. Every command below ships with the system.

### Before You Start

Commit to an answer before you type anything. Being wrong here is useful, so pick one rather than skipping ahead. Nothing is marked right or wrong yet. You confirm each by doing the lab.

<div class="ad-check ad-check--predict" data-check="w1e-p1">
<p class="ad-check__q">If you remove another user's permission to read a file, does the file change?</p>
<button type="button" class="ad-check__opt" data-i="0">Yes, its contents change</button>
<button type="button" class="ad-check__opt" data-i="1">No, only who can read it changes</button>
<p class="ad-check__note">Locked in. You prove this when you run <code>chmod</code> below.</p>
</div>

<div class="ad-check ad-check--predict" data-check="w1e-p2">
<p class="ad-check__q">If you change one character inside a file, how much of its SHA-256 hash changes?</p>
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

Now make a second account, so there is somebody to keep the file from.

```bash
sudo useradd -m dana
sudo -u dana cat /srv/cia/ledger.txt
```

The second command prints the line. Dana can read the file, which is the state you are about to change.

<div class="ad-shots">
<figure class="ad-shot">
<img src="/academy/week-1/PLACEHOLDER-cia-setup.png" alt="Terminal showing the ledger file created and read successfully by a second user" />
<figcaption>Screenshot 1. [ADD IMAGE] Dana reads the file before any permission changes.</figcaption>
</figure>
</div>

### Break Confidentiality

Confidentiality means only the people who should see something can see it. Take Dana's access away and prove it is gone.

```bash
chmod 600 ledger.txt
ls -l ledger.txt
sudo -u dana cat /srv/cia/ledger.txt
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

Now change one number inside the file and check the baseline again.

```bash
sed -i 's/412500/999999/' ledger.txt
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

<div class="ad-check" data-check="w1e-c1" data-answer="1">
<p class="ad-check__q">After <code>chmod 600</code>, had the contents of <code>ledger.txt</code> changed in any way?</p>
<button type="button" class="ad-check__opt" data-i="0">Yes</button>
<button type="button" class="ad-check__opt" data-i="1">No</button>
<p class="ad-check__note">Permissions decide who may read a file, never what it holds. Confidentiality failed while integrity stayed intact.</p>
</div>

<div class="ad-check" data-check="w1e-c2" data-answer="2">
<p class="ad-check__q">You changed one digit out of twenty-four characters. Roughly how much of the SHA-256 hash changed?</p>
<button type="button" class="ad-check__opt" data-i="0">About one character</button>
<button type="button" class="ad-check__opt" data-i="1">About a quarter</button>
<button type="button" class="ad-check__opt" data-i="2">Almost all of it</button>
<p class="ad-check__note">A hash has no partial match. One changed character scrambles the whole digest, which is what lets it flag any change at all.</p>
</div>

<div class="ad-check" data-check="w1e-c3" data-answer="0">
<p class="ad-check__q">While nginx was stopped, was <code>index.html</code> still on the disk?</p>
<button type="button" class="ad-check__opt" data-i="0">Yes</button>
<button type="button" class="ad-check__opt" data-i="1">No</button>
<p class="ad-check__note">Availability failed while the file sat untouched. The page was there the whole time, just not being served.</p>
</div>

<div class="ad-check" data-check="w1e-c4" data-answer="0">
<p class="ad-check__q">A client opens the portal and sees another client's statement. Which property failed?</p>
<button type="button" class="ad-check__opt" data-i="0">Confidentiality</button>
<button type="button" class="ad-check__opt" data-i="1">Integrity</button>
<button type="button" class="ad-check__opt" data-i="2">Availability</button>
<p class="ad-check__note">The data is correct and available. It just reached the wrong person, which is a confidentiality failure.</p>
</div>

### Take It Further

A ransomware attack encrypts a company's file share and the attacker keeps a copy of the files.

Name every part of the triad that failed, and say which one the company notices first. Then say which one costs the most if the attacker publishes what they took.

### Why It Matters

Tickets rarely say which property failed. They say a report is wrong, a share will not open or a client saw another client's statement. Naming the property is what turns a vague complaint into the right fix, and the wrong name sends the work to the wrong team.
