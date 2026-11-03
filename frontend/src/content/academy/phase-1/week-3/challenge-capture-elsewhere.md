<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Know Where You'd Have to Capture Instead</h3>
<p class="ad-brief__ask">Your manager wants a conversation your own capture was never part of. Can you say why it's missing, and where you'd actually have to stand to see it?</p>
<p>Hosted lab required. Builds on the two Wireshark challenges above.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 1 solved</span>
</div>

### Take It Further

You capture from the Ubuntu box and see its conversation with the domain controller clearly. Your manager asks you to also capture what the domain controller says to a third server during a backup job.

<div class="ad-mission ad-mission--capstone" data-id="w3e-c6" data-attempts="0">
<span class="ad-mission__num">Ticket 06 · INC-1158 · Medium</span>
<p><strong>SOC Lead · Investigation Technique · 1:15 PM</strong><br>The manager wants the backup conversation captured by end of day.</p>
<p><strong>Task:</strong> Say why the Ubuntu capture cannot show that conversation, and where you would have to capture instead. Type its letter.<br><strong>A</strong> The Ubuntu capture can show it too, since Wireshark on any machine sees all traffic on the whole network.<br><strong>B</strong> It cannot. The Ubuntu capture only sees traffic this machine sends or receives, and the domain controller's conversation with the backup server never touches Ubuntu's network card at all. You would have to capture on the domain controller itself, or on the third server.<br><strong>C</strong> It cannot, but leaving the Ubuntu capture running long enough would eventually pick it up anyway.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for why the Ubuntu capture cannot show the backup conversation" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>You already proved this once in this lab: a capture on one machine's network card only sees what that machine sends or receives, nothing on a switched network between two other hosts.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">You proved the opposite in the challenge above: a switched network only shows a machine its own traffic, never a conversation between two other hosts.</div>
<div class="ad-miss" data-guess="c">No amount of waiting puts traffic on a wire your own machine was never part of. A switched network does not broadcast every conversation to every card.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. Capture on the domain controller or the third server</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A capture only ever shows what the capturing machine sends or receives. The domain controller's traffic to the backup server never touches Ubuntu's card, so no filter fixes this — only capturing from a machine that was actually part of the conversation does.</p>
</div>
</div>
</div>
</div>

### Why It Matters

Knowing where to capture is as important as knowing how to read the result. A capture taken in the wrong place is empty of the very traffic you were sent to find, and plenty of investigations stall on exactly that. The habit of capturing a conversation you understand, from a machine that is part of it, is where the skill starts.
