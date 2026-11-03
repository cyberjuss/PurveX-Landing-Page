<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>Read What the Ports Tell You, Then Isolate One Conversation</h3>
<p class="ad-brief__ask">Can you say which port a repeat capture would change, and pull one connection out of the noise on command?</p>
<p>Hosted lab required, with your Wireshark capture from the challenge above still open.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 2 solved</span>
</div>

### Read What Stays the Same

Look at the LDAP conversation's TCP handshake again. The source port, the one on the Ubuntu box, is a high, random-looking number. The destination port, the one on the domain controller, is 389 every single time.

<div class="ad-mission" data-id="w3e-c5" data-attempts="0">
<span class="ad-mission__num">Hands-on · INC-1105 · Low</span>
<p><strong>Task:</strong> If you captured this same LDAP query again a minute later, which port would you expect to change, and which would stay fixed? Type its letter.<br><strong>A</strong> Both ports stay exactly the same on every connection.<br><strong>B</strong> The source port changes each time, a fresh one picked for the new connection. The destination port stays 389, the LDAP service's own fixed address.<br><strong>C</strong> The destination port changes each time, and the source port stays fixed.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for which port changes and which stays fixed" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Think about how a reply finds its way back to the right connection, versus how a client finds the LDAP service on the domain controller in the first place.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">Every new connection gets a fresh source port, picked by the client, so it cannot stay the same on every run.</div>
<div class="ad-miss" data-guess="c">The domain controller's LDAP service listens on the same fixed port every time, 389. The source port is the one that changes.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. Source changes, destination stays fixed</code></p>
</div>
<div>
<span>Why it matters</span>
<p>A client picks a fresh, random source port for every new connection so replies can find their way back to the right one. A server listens on the same fixed port every time, because that is the address its service is known by. That difference is why filtering a capture by destination port finds every LDAP query a machine ever made, while filtering by source port finds only one single connection.</p>
</div>
</div>
</div>
</div>

### Isolate One Conversation

<div class="ad-mission ad-mission--capstone" data-id="w3e-c4" data-attempts="0">
<span class="ad-mission__num">Ticket 05 · INC-1106 · Medium</span>
<p><strong>SOC Lead · Investigation Technique · 1:00 PM</strong><br>A PurveX Financial investigation needs one connection's whole exchange read start to finish, without the surrounding noise of everything else on the wire.</p>
<p><strong>Task:</strong> Which Wireshark move does that? Type its letter.<br><strong>A</strong> Opening the Bytes pane.<br><strong>B</strong> Right-click a packet, Follow, TCP Stream.<br><strong>C</strong> Scrolling the Packet List faster.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for the Wireshark move that reads a full conversation" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>You used this exact move on the LDAP connection in the challenge above to pull one conversation out of the noise.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">The Bytes pane shows raw data for one packet at a time. It does not reassemble a whole conversation.</div>
<div class="ad-miss" data-guess="c">Scrolling faster still shows every unrelated packet mixed in. It does not isolate one connection.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>B. Right-click a packet, Follow, TCP Stream</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Follow TCP Stream reassembles a single conversation into one readable window and sets a filter to just that connection. It is the first move when one exchange matters.</p>
</div>
</div>
</div>
</div>

### Why It Matters

Ports tell you which side is the client and which is the server, and Follow TCP Stream turns a wall of packets into one readable exchange. The next challenge in this set is about a capture you cannot take from here at all.
