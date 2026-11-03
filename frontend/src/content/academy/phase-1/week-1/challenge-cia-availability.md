<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Break Availability Without Touching the File</h3>
<p class="ad-brief__ask">Can you take a service down and prove the page itself never moved?</p>
<p>Hosted lab required, with the Ubuntu desktop open. Uses the web server already running on this box, not the ledger file.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 1 solved</span>
</div>

### Before You Start

Commit to an answer before you type anything. Nothing is marked right or wrong yet. You confirm it by doing the lab below.

<div class="ad-check ad-check--predict" data-check="w1e-p3">
<p class="ad-check__q">If a web server is stopped, is the page it served still on the disk?</p>
<button type="button" class="ad-check__opt" data-i="0">Yes, the file stays put</button>
<button type="button" class="ad-check__opt" data-i="1">No, stopping it removes the page</button>
<p class="ad-check__note">Locked in. You check with <code>ls</code> below.</p>
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

### Why It Matters

You have now broken all three properties on purpose, each one leaving a different kind of evidence behind. The next challenge in this set is naming which one failed from a ticket alone, and fixing the one you still can.
