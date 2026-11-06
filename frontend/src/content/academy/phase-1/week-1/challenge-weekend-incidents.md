<div class="ad-brief">
<p class="rd-kicker">Briefing</p>
<h3>The Weekend Incident Report</h3>
<p class="ad-brief__ask">Three things went wrong at PurveX Financial over the weekend. Can you find each one in the firm's environment, name which part of the CIA triad it broke, and put it right?</p>
<p>It's Monday, 8:15 AM. Three tickets landed before you'd finished your coffee: Wealth Management client data turned up somewhere it shouldn't be, Finance thinks a file of wire approvals was changed, and nobody in the firm can open a file share. All three are real and waiting in your lab.</p>
<p>First, set up the weekend. On your domain controller, open PowerShell as an administrator and run the block below once. It plants the three incidents and won't plant them again if you run it twice.</p>
</div>

```powershell
& {
  $root = "C:\PurveX"
  $mark = "$root\Archive\week1-staged.txt"
  if (Test-Path $mark) { "The weekend's incidents are already set up."; return }
  New-Item -ItemType Directory -Force -Path "$root\Shares\Operations", "$root\Shares\Finance", "$root\Shares\WealthManagement", "$root\Archive" | Out-Null
  $clients = @("ClientID,Name,Advisor,AccountNumber,Balance") + (1..12 | ForEach-Object { "C-20{0:D2},SAMPLE Client {0},jamie.torres,TEST-ACCT-{1},{2}.00" -f $_, (4400 + $_), (25000 * $_) })
  Set-Content -Path "$root\Shares\Operations\WM_Client_Export.csv" -Value $clients -Encoding ascii
  $wires = @(
    "WireID,Beneficiary,Account,Amount,ApprovedBy",
    "WR-2201,LedgerLine,TEST-BANK-0101,18450.00,devon.brooks",
    "WR-2202,Northwind Office Supply,TEST-BANK-0102,2310.75,devon.brooks",
    "WR-2203,Contoso Data Feeds,TEST-BANK-0103,9800.00,devon.brooks",
    "WR-2204,Fabrikam Payroll,TEST-BANK-0104,41200.00,devon.brooks"
  )
  Set-Content -Path "$root\Archive\Wire_Approvals_Nov.csv" -Value $wires -Encoding ascii
  (Get-FileHash "$root\Archive\Wire_Approvals_Nov.csv" -Algorithm SHA256).Hash | Set-Content -Path "$root\Shares\Finance\Wire_Approvals_Nov.sha256" -Encoding ascii
  $wires[3] = $wires[3].Replace("TEST-BANK-0103", "TEST-BANK-77140103")
  Set-Content -Path "$root\Shares\Finance\Wire_Approvals_Nov.csv" -Value $wires -Encoding ascii
  New-NetFirewallRule -DisplayName "PurveX Maint - Block File Sharing" -Group "PurveX Lab" -Direction Inbound -Protocol TCP -LocalPort 445 -Action Block | Out-Null
  Set-Content -Path $mark -Value (Get-Date -Format o)
  "Done. Three incidents are waiting for you."
}
```

<div class="ad-progress">
<div class="ad-progress__track"><div id="ad-progress-bar" class="ad-progress__bar"></div></div>
<span id="ad-progress-label" class="ad-progress__label">0 / 5 solved</span>
</div>

<div class="ad-mission" data-id="w1-01" data-attempts="0">
<span class="ad-mission__num">Ticket 01 · Confidentiality · High</span>
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
<ol>
<li>Open File Explorer and go to <code>C:\PurveX\Shares\Operations</code>.</li>
<li>Open the client export and count the rows that hold a client.</li>
<li>Move the file, don't copy it, into <code>C:\PurveX\Shares\WealthManagement</code>.</li>
</ol>
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

<div class="ad-mission" data-id="w1-02" data-attempts="0">
<span class="ad-mission__num">Ticket 02 · Integrity · Critical</span>
<h4>Catch the Altered Wire</h4>
<p><strong>Devon Brooks · Finance · 8:22 AM</strong><br>I approved November's wires on Friday and saved the file's SHA-256 hash next to it, like always. This morning the file looks fine to me, but something about it feels off. The wires go out at noon. Can you check it against what I signed off?</p>
<p><strong>Task:</strong> Prove whether <code>Wire_Approvals_Nov.csv</code> in the Finance share still matches the hash Devon saved. If it doesn't, compare it with the approved copy in <code>C:\PurveX\Archive</code>, restore the approved version, and report the Wire ID that was altered.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Catch the Altered Wire" placeholder="a Wire ID" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{WR-2203}" data-accept="2203">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>A hash changes completely if even one character in the file changes, so a mismatch proves the file was altered. Comparing it line by line with the approved copy shows you where.</p>
<ol>
<li>Hash the Finance file and compare it with the value in <code>Wire_Approvals_Nov.sha256</code>.</li>
<li>Compare the Finance file with <code>C:\PurveX\Archive\Wire_Approvals_Nov.csv</code> and find the line that differs.</li>
<li>Copy the approved version back over the Finance file, then hash it again to confirm it matches.</li>
</ol>
<p>In PowerShell:</p>
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
<p>WR-2203's account number was swapped, so at noon $9,800 would have gone to an account nobody approved. The file still opened, still looked tidy and still said Devon approved it. That's an integrity failure, and only the hash Devon saved on Friday could prove it.</p>
</div>
<div>
<span>What to do</span>
<p>Restore the approved copy, confirm the hash matches again, and hold the noon release until Finance confirms every wire with the beneficiary by phone. Then work out who could write to the Finance share over the weekend.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="w1-03" data-attempts="0">
<span class="ad-mission__num">Ticket 03 · Availability · High</span>
<h4>Bring the File Shares Back</h4>
<p><strong>Priya Nair · IT · 8:31 AM</strong><br>The phones haven't stopped. Nobody, in any department, can open a file share this morning. The files are all still there on the server. The only thing that happened this weekend was a maintenance window.</p>
<p><strong>Task:</strong> Find the firewall rule the weekend's maintenance left behind on the domain controller and switch it off. Then report the port it was blocking.</p>
<div class="ad-guess">
<input type="text" class="ad-guess__input" aria-label="Answer for Bring the File Shares Back" placeholder="a port number" autocomplete="off" autocapitalize="off" spellcheck="false">
<button type="button" class="ad-guess__submit" data-answer="gtf{445}">Submit</button>
<button type="button" class="ad-hint__btn">Hint</button>
</div>
<div class="ad-hint__text">
<p>File shares on Windows use SMB. Look for an inbound rule that blocks rather than allows, with a name that sounds like maintenance.</p>
<ol>
<li>Open Windows Defender Firewall with Advanced Security with Win+R and <code>wf.msc</code>.</li>
<li>Open Inbound Rules, sort by Action, and look at the rules that Block.</li>
<li>Open the maintenance rule, read its port on the Protocols and Ports tab, then right-click it and choose Disable Rule.</li>
</ol>
<p>In PowerShell:</p>
<ul>
<li><code>Get-NetFirewallRule -Direction Inbound -Action Block | Select-Object DisplayName, Enabled</code></li>
<li><code>Get-NetFirewallRule -DisplayName "PurveX Maint*" | Get-NetFirewallPortFilter</code></li>
<li><code>Disable-NetFirewallRule -DisplayName "PurveX Maint - Block File Sharing"</code></li>
</ul>
</div>
<p class="ad-guess__feedback"></p>
<div class="ad-miss" data-guess="3389">That's Remote Desktop, which is still working. File shares use a different port.</div>
<div class="ad-miss" data-guess="139|137|138">That's the older NetBIOS route. Read the port the maintenance rule actually blocks.</div>
<div class="ad-miss" data-guess="#">Open the maintenance rule's Protocols and Ports tab and read its local port.</div>
<div class="ad-flag">
<div class="ad-break">
<div>
<span>Answer</span>
<p class="ad-flag__code"><code>GTF{445}</code></p>
</div>
<div>
<span>Why it matters</span>
<p>Every file was still intact and still private. The work just stopped, because one forgotten rule blocked SMB on port 445 for the whole firm. That's an availability failure, and its cost is every hour that every department couldn't reach its own files.</p>
</div>
<div>
<span>What to do</span>
<p>Disable the rule, confirm a share opens, and add a step to the maintenance checklist that removes temporary rules before the window closes. A change that's never undone is one of the most common ways availability fails.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission" data-id="w1-04" data-attempts="0">
<span class="ad-mission__num">Ticket 04 · Vulnerabilities and Threats</span>
<h4>Weakness or Threat?</h4>
<p><strong>Alex Rivera · IT · 9:10 AM</strong><br>I'm writing up the client export for Compliance. Which of these describes it correctly?<br><strong>A</strong> The vulnerability is the Operations staff, and the threat is the client file.<br><strong>B</strong> The vulnerability is client data stored where Operations can read it, and the threat is anyone using an Operations account, a curious colleague or an attacker who has stolen one.<br><strong>C</strong> The vulnerability is the CSV file format, and the threat is Wealth Management.</p>
<p><strong>Task:</strong> Choose the correct description and type its letter.</p>
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
<p>Getting the two apart tells you what you can actually fix. You can't remove every curious colleague or every stolen password, but you can remove the weakness by keeping client data where only its own department can reach it.</p>
</div>
<div>
<span>What to do</span>
<p>Write the finding in the order the lessons gave you: the vulnerability, the threat that could use it, the CIA property that failed, and the impact. Then whoever reads it can act without redoing your work.</p>
</div>
</div>
</div>
</div>

<div class="ad-mission ad-mission--capstone" data-id="w1-05" data-attempts="0">
<span class="ad-mission__num">Ticket 05 · Risk · Report to the CISO</span>
<h4>Rank the Weekend</h4>
<p><strong>CISO · 9:30 AM</strong><br>Looking back at 8:15, when all three tickets were open at once, which one should have been escalated first?<br><strong>A</strong> The client export, because client data was exposed.<br><strong>B</strong> The altered wire, because $9,800 was due to leave the firm at noon to an account nobody approved, and a sent wire is hard to get back.<br><strong>C</strong> The blocked file shares, because they affected the most people.</p>
<p><strong>Task:</strong> Choose the ticket with the highest risk at 8:15 and type its letter.</p>
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
<p>The altered wire was almost certain to cause harm, the harm was due in under four hours, and money sent to the wrong account is very hard to recover. The loudest ticket, the outage, carried the least lasting damage. Risk is about likelihood and impact, not about how many phones are ringing.</p>
</div>
<div>
<span>What to do</span>
<p>Escalate the wire to Finance leadership first, then handle the client export with Compliance, while IT clears the outage alongside. Write down why you ranked them that way, so the order can be defended later.</p>
</div>
</div>
</div>
</div>
