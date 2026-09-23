<div class="academy-question">
<span class="academy-question__tag">Essential Question</span>
<p>The script won't run. Is that a real problem, or one of the three things everyone hits first?</p>
</div>

### If the Script Won't Run

Three errors account for almost every "it won't run" report. They're easy to fix once you know which one you're looking at.

<div class="ad-trouble">
<div class="ad-trouble__item">
<span class="ad-trouble__label">Not running as Administrator</span>
<img src="/academy/lab-scripts/run-as-admin-error.png" alt="PowerShell error: the script cannot be run because it contains a &quot;#requires&quot; statement for running as Administrator" class="ad-trouble__img" />
<p>Close this window. Open the Start menu, search PowerShell, right-click it, and choose <strong>Run as Administrator</strong>. Then <code>cd</code> back to your Downloads folder and run the script again.</p>
</div>

<div class="ad-trouble__item">
<span class="ad-trouble__label">File is blocked (downloaded from the internet)</span>
<p>Windows flags files downloaded through a browser. Unblock it before running:</p>
<div class="ad-code">
<div class="ad-code__bar">
<span class="ad-code__label">PowerShell</span>
<button type="button" class="ad-code__copy" onclick="const code=this.closest('.ad-code').querySelector('code').innerText; navigator.clipboard.writeText(code); const b=this; b.textContent='Copied'; setTimeout(()=>{b.textContent='Copy';},1500);">Copy</button>
</div>
<pre><code>Unblock-File -Path .\Build-Environment.ps1</code></pre>
</div>
</div>

<div class="ad-trouble__item">
<span class="ad-trouble__label">Running scripts is disabled on this system</span>
<p>PowerShell blocks unsigned scripts by default. This allows them for your own user account only:</p>
<div class="ad-code">
<div class="ad-code__bar">
<span class="ad-code__label">PowerShell</span>
<button type="button" class="ad-code__copy" onclick="const code=this.closest('.ad-code').querySelector('code').innerText; navigator.clipboard.writeText(code); const b=this; b.textContent='Copied'; setTimeout(()=>{b.textContent='Copy';},1500);">Copy</button>
</div>
<pre><code>Set-ExecutionPolicy -Scope CurrentUser RemoteSigned</code></pre>
</div>
</div>
</div>

Run into all three in the same session, in that order: elevate first, unblock the file, then relax the execution policy. Each is a one-time fix per machine.

<div class="academy-thinklike">
<span class="academy-thinklike__tag">Think Like an Analyst</span>
<p>None of these three are security incidents, they're Windows defaults doing exactly what they're supposed to do. Knowing "blocked on purpose" from "actually wrong" is a judgment call you'll make constantly once you're investigating this environment instead of building it.</p>
</div>
