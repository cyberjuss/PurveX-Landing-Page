<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>The Weekend Incident Report</h3>
<p class="ad-brief__ask">Three things went wrong at PurveX Financial over the weekend. Can you find each one in the firm's environment, name which part of the CIA triad it broke, and put it right?</p>
<p>It's Monday, 8:15 AM. Three tickets landed before you'd finished your coffee: Wealth Management client data turned up somewhere it shouldn't be, Finance thinks a file of wire approvals was changed, and nobody in the firm can open a file share. All three are waiting in your lab, so work them on your domain controller.</p>
</div>

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 5 solved</span>
</div>

<div class="ad-mission" data-id="w1-01" data-attempts="0">
<span class="ad-mission__num">Ticket 01 · Warm-up · Confidentiality · High · INC-1090</span>
<h4>Close the Exposed Client Export</h4>
<p><strong>Sam Whitfield · Wealth Management · 8:15 AM</strong><br>Someone in Operations just messaged me asking why our client list is in their share. Those are our clients' account numbers and balances. Can you find it and get it back where it belongs?</p>
<p><strong>Task:</strong> Find the Wealth Management client export in the Operations share and move it into the Wealth Management share. Then report how many client records were exposed.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Close the Exposed Client Export" placeholder="a number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{12}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>The lab's department shares live under <code>C:\PurveX\Shares</code>. Look in Operations for a file that plainly belongs to another department, and count the client rows, not the header.</p>
<ul>
<li>Open File Explorer and go to <code>C:\PurveX\Shares\Operations</code>.</li>
<li>Open the client export and count the rows that hold a client.</li>
<li>Move the file, don't copy it, into <code>C:\PurveX\Shares\WealthManagement</code>.</li>
</ul>
<p>In PowerShell:</p>
<ul>
<li><code>(Import-Csv C:\PurveX\Shares\Operations\WM_Client_Export.csv).Count</code></li>
<li><code>Move-Item C:\PurveX\Shares\Operations\WM_Client_Export.csv C:\PurveX\Shares\WealthManagement\</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="13">That count includes the header line, which names the columns rather than a client. Count the client rows only.</div>
<div class="ad-miss" data-guess="#">Count the rows that each hold one client, below the header.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{12}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Nothing was deleted and nothing was changed, yet twelve clients' account numbers and balances were readable by a whole department with no reason to see them. That's a confidentiality failure, and the harm happened the moment anyone opened the file, which is why moving it now limits the damage but can't undo it.</p>
</div>
<div>
<span>What to do</span>
<p>Move the file to the share that only Wealth Management can read, then find out who opened it while it was exposed. Client data at a financial firm usually means a report to Compliance, even when the reader was a colleague.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="w1-04" data-attempts="0" data-hands-on="false">
<span class="ad-mission__num">Ticket 02 · Warm-up · Vulnerabilities and Threats · INC-1090</span>
<h4>Weakness or Threat?</h4>
<p><strong>Alex Rivera · IT · 8:24 AM</strong><br>I'm writing up the client export for Compliance. Which of these describes it correctly?<br><strong>A</strong> The vulnerability is the Operations staff, and the threat is the client file.<br><strong>B</strong> The vulnerability is client data stored where Operations can read it, and the threat is anyone using an Operations account, a curious colleague or an attacker who has stolen one.<br><strong>C</strong> The vulnerability is the CSV file format, and the threat is Wealth Management.</p>
<p><strong>Task:</strong> Select the correct description and enter its letter.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Weakness or Threat?" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A vulnerability is a weakness in a system or process. A threat is something or someone that could take advantage of it.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">People aren't the weakness here, and a file can't act on its own. Ask which part is the flaw and which part could exploit it.</div>
<div class="ad-miss" data-guess="c">The file format did nothing wrong, and Wealth Management owns the data. Look for the flaw in where the data was stored.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{b}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Getting the two apart tells you what you can actually fix, since you can't remove every curious colleague or stolen password, but you can remove the weakness by keeping client data where only its own department can reach it.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="w1-03" data-attempts="0">
<span class="ad-mission__num">Ticket 03 · Apply it · Availability · High · INC-1090</span>
<h4>Bring the File Shares Back</h4>
<p><strong>Priya Nair · IT · 8:31 AM</strong><br>The phones haven't stopped. Nobody on the fourth floor, the office network at 10.250.40.0/24, can open a file share this morning, whatever department they're in. The files are all still there on the server. The only thing that happened this weekend was a maintenance window.</p>
<p><strong>Task:</strong> Find the firewall rule the weekend's maintenance left behind on the domain controller and switch it off. Then report the port it was blocking.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Bring the File Shares Back" placeholder="a port number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{445}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>File shares on Windows use SMB. Look for an inbound rule that blocks rather than allows, with a name that sounds like maintenance. Its Scope tab shows which network it blocks.</p>
<ul>
<li>Open Windows Defender Firewall with Advanced Security with Win+R and <code>wf.msc</code>.</li>
<li>Open Inbound Rules, sort by Action, and look at the rules that Block.</li>
<li>Open the maintenance rule, read its port on the Protocols and Ports tab, then right-click it and choose Disable Rule.</li>
</ul>
<p>In PowerShell:</p>
<ul>
<li><code>Get-NetFirewallRule -Direction Inbound -Action Block | Select-Object DisplayName, Enabled</code></li>
<li><code>Get-NetFirewallRule -DisplayName "PurveX Maint*" | Get-NetFirewallPortFilter</code></li>
<li><code>Disable-NetFirewallRule -DisplayName "PurveX Maint - Block File Sharing"</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="3389">That's Remote Desktop, which is still working. File shares use a different port.</div>
<div class="ad-miss" data-guess="139|137|138">That's the older NetBIOS route. Read the port the maintenance rule blocks.</div>
<div class="ad-miss" data-guess="#">Open the maintenance rule's Protocols and Ports tab and read its local port.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{445}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Every file was still intact and still private. The work just stopped, because one forgotten rule blocked SMB on port 445 for a whole floor of the firm. That's an availability failure, and its cost is every hour that every department couldn't reach its own files.</p>
</div>
<div>
<span>What to do</span>
<p>Disable the rule, confirm a share opens, and add a step to the maintenance checklist that removes temporary rules before the window closes. A change that's never undone is one of the most common ways availability fails.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="w1-02" data-attempts="0">
<span class="ad-mission__num">Ticket 04 · Apply it · Integrity · Critical · INC-1090</span>
<h4>Catch the Altered Wire</h4>
<p><strong>Jordan Ellis · Finance · 8:40 AM</strong><br>I approved November's wires on Friday and saved the file's SHA-256 hash next to it, like always. This morning the file looks fine to me, but I'd like it verified before the wires go out at noon. Can you check it against what I signed off?</p>
<p><strong>Task:</strong> Prove whether <code>Wire_Approvals_Nov.csv</code> in the Finance share still matches the hash Jordan saved. If it doesn't, compare it with the approved copy in <code>C:\PurveX\Archive</code>, restore the approved version, and report the Wire ID that was altered.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Catch the Altered Wire" placeholder="a Wire ID" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{WR-2203}" data-accept="2203">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A hash changes completely if even one character in the file changes, so a mismatch proves the file was altered. Comparing it line by line with the approved copy shows you where.</p>
<ul>
<li>In PowerShell, run <code>Get-FileHash C:\PurveX\Shares\Finance\Wire_Approvals_Nov.csv</code> and compare the Hash value it prints with the one saved in <code>Wire_Approvals_Nov.sha256</code> (open that file in Notepad to read it). A mismatch proves the file changed.</li>
<li>Run <code>Compare-Object (Get-Content C:\PurveX\Archive\Wire_Approvals_Nov.csv) (Get-Content C:\PurveX\Shares\Finance\Wire_Approvals_Nov.csv)</code>. It prints the one line that differs between the two files. The Wire ID is the first value on that line.</li>
<li>Run <code>Copy-Item C:\PurveX\Archive\Wire_Approvals_Nov.csv C:\PurveX\Shares\Finance\ -Force</code> to restore the approved version, then hash the Finance file again to confirm it now matches.</li>
</ul>
<p>In PowerShell, the same three steps in a row:</p>
<ul>
<li><code>(Get-FileHash C:\PurveX\Shares\Finance\Wire_Approvals_Nov.csv).Hash; Get-Content C:\PurveX\Shares\Finance\Wire_Approvals_Nov.sha256</code></li>
<li><code>Compare-Object (Get-Content C:\PurveX\Archive\Wire_Approvals_Nov.csv) (Get-Content C:\PurveX\Shares\Finance\Wire_Approvals_Nov.csv)</code></li>
<li><code>Copy-Item C:\PurveX\Archive\Wire_Approvals_Nov.csv C:\PurveX\Shares\Finance\ -Force</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="contoso-data-feeds|contoso">That's the beneficiary on the altered line. Report its Wire ID, the first value on that line.</div>
<div class="ad-miss" data-guess="wr-2201|wr-2202|wr-2204|2201|2202|2204">That wire matches the approved copy. Compare the two files again and find the line that differs.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{WR-2203}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>WR-2203's account number was swapped, so at noon $9,800 would have gone to an account nobody approved. The file still opened, still looked tidy and still said Jordan approved it. That's an integrity failure, and only the hash Jordan saved on Friday could prove it.</p>
</div>
<div>
<span>What to do</span>
<p>Restore the approved copy, confirm the hash matches again, and hold the noon release until Finance confirms every wire with the beneficiary by phone. Then work out who could write to the Finance share over the weekend.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="w1-05" data-attempts="0" data-hands-on="false">
<span class="ad-mission__num">Ticket 05 · Stretch · Risk · Report to the CISO · INC-1090</span>
<h4>Rank the Weekend</h4>
<p><strong>CISO · 9:30 AM</strong><br>Looking back at 8:15, when all three tickets were open at once, which one should have been escalated first?<br><strong>A</strong> The client export, because client data was exposed.<br><strong>B</strong> The altered wire, because $9,800 was due to leave the firm at noon to an account nobody approved, and a sent wire is hard to get back.<br><strong>C</strong> The blocked file shares, because they affected the most people.</p>
<p><strong>Task:</strong> Select the ticket with the highest risk at 8:15 and enter its letter.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Rank the Weekend" placeholder="A, B, or C" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{b}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>Score each one as likelihood times impact. Ask how certain the harm was, how soon it would land, and whether it could be undone afterwards.</p>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="a">The exposure was serious, but the harm had mostly already happened by 8:15 and stayed inside the firm. Ask which harm was still about to happen and couldn't be reversed.</div>
<div class="ad-miss" data-guess="c">The outage hit the most people, but every file was intact and work resumes the moment the rule is off. Ask which harm couldn't be undone.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{b}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>The altered wire carried the most certain, soonest, and hardest-to-reverse harm of the three, so escalate it to Finance leadership first and work the rest alongside it.</p>
</div>
</div>
</div>
</div>
