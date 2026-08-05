"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, ShieldCheck, Clock, Server } from "lucide-react";
import { SiteChrome } from "./chrome";

/* ─────────────────────────────────────────────────────────
   PurveX — Install Guide
   Full self-hosted walkthrough: clone through first test.
   Content sourced from README.md, docs/beta-install-runbook.md,
   and the real /setup + /login page copy -- not invented.
   ───────────────────────────────────────────────────────── */

function TermBlock({ lines, copyText }: { lines: React.ReactNode; copyText: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="gd-term">
      <div className="gd-term__bar">
        <span className="gd-term__dot" style={{ background: "#f2777a" }} />
        <span className="gd-term__dot" style={{ background: "#f4c059" }} />
        <span className="gd-term__dot" style={{ background: "#5ec269" }} />
        <span className="gd-term__title">bash</span>
        <button
          type="button"
          className="gd-term__copy"
          aria-label="Copy command"
          onClick={() => {
            navigator.clipboard?.writeText(copyText).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            });
          }}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
        </button>
      </div>
      <div className="gd-term__body">{lines}</div>
    </div>
  );
}

function Step({ n, title, children, last }: { n: React.ReactNode; title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className="gd-step">
      <div className="gd-step__rail">
        <div className="gd-step__num">{n}</div>
        {!last && <div className="gd-step__line" />}
      </div>
      <div className="gd-step__body">
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  );
}

const ENV_VARS: [string, string, string][] = [
  ["DATABASE_URL", "yes", "PostgreSQL connection string"],
  ["JWT_SECRET_KEY", "yes", "Signs session tokens"],
  ["PURVEX_ENCRYPTION_KEY", "yes", "Encrypts SIEM credentials and 2FA secrets at rest"],
  ["PURVEX_ENV", "no", "dev / staging / prod (default: dev)"],
  ["REDIS_URL", "no locally", "Rate limiting and the background job queue"],
  ["OPENAI_API_KEY", "no", "Enables the Watchtower AI assistant"],
];

const FAQ: [string, string][] = [
  ["Is PurveX a replacement for my SIEM?", "No. PurveX reads from your SIEM; it doesn't replace it. You still need Splunk, Elastic, Sentinel, or similar for PurveX to be useful."],
  ["Is it safe to run against production?", "Atomic Red Team tests are scoped and reversible by design, and PurveX adds its own Testing Policy layer on top -- PROD runs are restricted to admins, inside configured maintenance windows, with irreversible atomics blocked outright."],
  ["Does the AI assistant send data to third parties?", "Only if you configure it with an external provider (OpenAI, DeepSeek). Leave OPENAI_API_KEY blank and it disables cleanly -- nothing is sent anywhere."],
  ["Can one instance serve multiple teams or clients?", "Yes -- PurveX is multi-tenant. Organizations are isolated from each other, and a user can hold different roles across different organizations."],
];

const TROUBLESHOOTING: [string, string][] = [
  ["Login succeeds but bounces back to /login", "A cookie isn't being set. On plain localhost this shouldn't happen; behind a reverse proxy it means TLS isn't terminating correctly -- Secure cookies are set but never sent over plain HTTP."],
  ["A test runs forever, never completes", "The background worker isn't running, or Redis is unreachable. Check the arq worker's own log output for the specific error."],
  ["“Agent never comes online” after registering a runner", "Confirm outbound connectivity from the endpoint back to the PurveX API, and that the registration token hasn't expired -- tokens are single-use and short-lived. On Windows, run the installer as administrator."],
  ["/setup keeps redirecting back after creating the admin", "Confirm the browser actually accepted the session cookie (same origin; HTTPS if you've set secure cookies). Clear cookies for the site and try /login directly."],
  ["Atomic catalog never installs", "Check the server's outbound access to GitHub. If you're air-gapped, pre-stage the archive at the path set in PURVEX_ATOMIC_DATA_DIR instead."],
  ["SIEM “test connection” passes but events never arrive", "A marker-pattern mismatch -- confirm the SIEM-side filter matches the connector's configured log_marker_pattern."],
];

export default function InstallGuidePage() {
  return (
    <SiteChrome active="platform">
      <section className="sp-section gd-hero" data-r>
        <span className="sp-tag">Install guide</span>
        <h1>Get PurveX running on your own infrastructure</h1>
        <p className="gd-hero__lede">
          PurveX connects to your SIEM, runs Atomic Red Team tests against your environment, and tells you whether
          your detections actually fired &mdash; with evidence. This is the full self-hosted walkthrough: clone,
          configure, start, create the admin account, and run your first validation.
        </p>
        <div className="gd-hero__meta">
          <span><Clock size={14} /> About 10 minutes</span>
          <span><Server size={14} /> Self-hosted, single machine</span>
          <span><ShieldCheck size={14} /> Nothing leaves your perimeter</span>
        </div>
        <nav className="gd-jump">
          {[
            ["#prereqs", "Prerequisites"], ["#get-code", "Get the code"], ["#configure", "Configure"],
            ["#start", "Start it"], ["#admin", "Create admin"], ["#checklist", "First-run checklist"],
            ["#windows", "Windows path"], ["#update", "Updating"], ["#data", "Data handling"],
            ["#faq", "FAQ"], ["#troubleshooting", "Troubleshooting"],
          ].map(([href, label]) => (
            <a key={href} href={href}>{label}</a>
          ))}
        </nav>
      </section>

      <section className="sp-section sp-section--tight gd-body" data-r id="prereqs">
        <h2 className="gd-h2">0. Prerequisites</h2>
        <p className="gd-p">The install script checks these too, but it&apos;s faster to fix gaps up front.</p>
        <div className="gd-table-wrap">
          <table className="gd-table">
            <thead><tr><th>Tool</th><th>Version</th><th>Check</th></tr></thead>
            <tbody>
              <tr><td>Python</td><td>3.11+</td><td><code>python --version</code></td></tr>
              <tr><td>Node.js</td><td>20+</td><td><code>node --version</code></td></tr>
              <tr><td>npm</td><td>9+</td><td><code>npm --version</code></td></tr>
              <tr><td>PostgreSQL</td><td>14+</td><td><code>psql --version</code></td></tr>
              <tr><td>Git</td><td>optional</td><td><code>git --version</code></td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="sp-section sp-section--tight gd-body" data-r id="get-code">
        <h2 className="gd-h2">1. Get the code</h2>
        <div className="gd-steps">
          <Step n={1} title="One-line install">
            <p className="gd-p">Clones the repo (or downloads a source archive if <code>git</code> isn&apos;t installed) into a new <code>PurveX/</code> folder.</p>
            <TermBlock copyText="curl -fsSL https://purvex-llc.com/install.sh | bash" lines={<><span className="gd-p1">$</span> <span className="gd-cmd">curl -fsSL https://purvex-llc.com/install.sh | bash</span></>} />
          </Step>
          <Step n={2} title="Or do it by hand" last>
            <p className="gd-p">Same result, if you&apos;d rather see each step.</p>
            <TermBlock copyText={"git clone https://github.com/cyberjuss/PurveX.git\ncd PurveX"} lines={<><span className="gd-p1">$</span> <span className="gd-cmd">git clone https://github.com/cyberjuss/PurveX.git</span><br/><span className="gd-p1">$</span> <span className="gd-cmd">cd PurveX</span></>} />
          </Step>
        </div>
      </section>

      <section className="sp-section sp-section--tight gd-body" data-r id="configure">
        <h2 className="gd-h2">2. Configure</h2>
        <p className="gd-p">Copy the example environment file, create a database, and generate the two secrets PurveX needs at boot.</p>
        <TermBlock
          copyText={'cp .env.example .env\ncreatedb purvex\npython -c "import secrets; print(secrets.token_urlsafe(32))"\npython -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"'}
          lines={<>
            <span className="gd-p1">$</span> <span className="gd-cmd">cp .env.example .env</span><br/>
            <span className="gd-p1">$</span> <span className="gd-cmd">createdb purvex</span><br/>
            <span className="gd-p1">$</span> <span className="gd-cmd">python -c &quot;import secrets; print(secrets.token_urlsafe(32))&quot;</span><br/>
            <span className="gd-out">Rf3n...  <span className="gd-hl"># JWT_SECRET_KEY</span></span><br/>
            <span className="gd-p1">$</span> <span className="gd-cmd">python -c &quot;from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())&quot;</span><br/>
            <span className="gd-out">gk8Q...  <span className="gd-hl"># PURVEX_ENCRYPTION_KEY</span></span>
          </>}
        />
        <p className="gd-p">Paste both values, plus your <code>DATABASE_URL</code>, into <code>.env</code>.</p>
        <div className="gd-callout gd-callout--warn">
          <strong>Save <code>PURVEX_ENCRYPTION_KEY</code> somewhere durable.</strong> It encrypts SIEM credentials
          and 2FA secrets at rest. Lose it, and that data becomes permanently unrecoverable &mdash; not just
          re-generatable.
        </div>
        <p className="gd-p" style={{ marginTop: 20 }}>Full reference:</p>
        <div className="gd-table-wrap">
          <table className="gd-table">
            <thead><tr><th>Variable</th><th>Required</th><th>Description</th></tr></thead>
            <tbody>
              {ENV_VARS.map(([name, req, desc]) => (
                <tr key={name}><td><code>{name}</code></td><td>{req}</td><td>{desc}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="sp-section sp-section--tight gd-body" data-r id="start">
        <h2 className="gd-h2">3. Install dependencies and start</h2>
        <p className="gd-p">The bundled launcher handles both the Python and Node sides.</p>
        <TermBlock
          copyText={"chmod +x scripts/purvex.sh\n./scripts/purvex.sh --setup\n./scripts/purvex.sh --start"}
          lines={<>
            <span className="gd-p1">$</span> <span className="gd-cmd">chmod +x scripts/purvex.sh</span><br/>
            <span className="gd-p1">$</span> <span className="gd-cmd">./scripts/purvex.sh --setup</span><br/>
            <span className="gd-out">[purvex] Installing backend dependencies...</span><br/>
            <span className="gd-out">[purvex] Installing frontend dependencies...</span><br/>
            <span className="gd-ok">[purvex] Setup complete.</span><br/>
            <span className="gd-p1">$</span> <span className="gd-cmd">./scripts/purvex.sh --start</span><br/>
            <span className="gd-out">[purvex] Running database migrations...</span><br/>
            <span className="gd-ok">[purvex] Backend running on :8001</span><br/>
            <span className="gd-ok">[purvex] Frontend running on :1120</span>
          </>}
        />
        <p className="gd-p">Leave this running &mdash; it&apos;s your API and web server both. Open a new terminal for anything else.</p>
      </section>

      <section className="sp-section sp-section--tight gd-body" data-r id="admin">
        <h2 className="gd-h2">4. Create the admin account, then log in</h2>
        <p className="gd-p">
          Visit <code>http://localhost:1120</code>. A fresh install has no admin yet, so it takes you straight to
          first-run setup &mdash; no separate signup form. Set a username, optional email, and a password (12+
          characters, upper, lower, and a number), then sign in with what you just set.
        </p>
      </section>

      <section className="sp-section sp-section--tight gd-body" data-r id="checklist">
        <h2 className="gd-h2">5. Work through the first-run checklist</h2>
        <p className="gd-p">The dashboard tracks five steps. They&apos;re advisory, not gates &mdash; you can explore the app before finishing them &mdash; but running a real test needs all five done.</p>
        <div className="gd-steps">
          <Step n="a" title="Connect your SIEM"><p className="gd-p"><strong>Settings &rarr; SIEM</strong>. Splunk, Elastic, or Sentinel. PurveX pulls only what&apos;s needed to confirm a test fired &mdash; see <a href="#data">what it never collects</a> below.</p></Step>
          <Step n="b" title="Install the Atomic Red Team catalog"><p className="gd-p"><strong>Tests &rarr; Explore Coverage</strong> &rarr; any technique &rarr; Install catalog. One-time download, cached after.</p></Step>
          <Step n="c" title="Register a test runner">
            <p className="gd-p"><strong>Settings &rarr; Agents</strong>. A lab or sandbox machine PurveX will SSH into to execute tests &mdash; never a production host. You&apos;ll need its SSH host-key fingerprint, captured from a trusted path:</p>
            <TermBlock copyText="ssh-keyscan -p 22 <runner-host> | ssh-keygen -lf - -E sha256" lines={<><span className="gd-p1">$</span> <span className="gd-cmd">ssh-keyscan -p 22 &lt;runner-host&gt; | ssh-keygen -lf - -E sha256</span></>} />
            <p className="gd-p">Enroll the printed <code>SHA256:...</code> value in the runner config. PurveX refuses to execute anything against a runner without one &mdash; it&apos;s the pinned-host-key check that stops SSH man-in-the-middle.</p>
          </Step>
          <Step n="d" title="Import or author a detection"><p className="gd-p"><strong>Detections</strong>. Sync from your connected SIEM, or write one manually and map it to a MITRE technique.</p></Step>
          <Step n="e" title="Run your first validation test" last><p className="gd-p"><strong>Tests &rarr; Run Test</strong>. Watch the dashboard for a scored result with evidence.</p></Step>
        </div>
      </section>

      <section className="sp-section sp-section--tight gd-body" data-r id="windows">
        <h2 className="gd-h2">6. Windows, without Git Bash</h2>
        <p className="gd-p">The launcher script needs a POSIX shell. On plain PowerShell, start each half manually instead.</p>
        <div className="gd-grid2">
          <div>
            <p className="gd-label">Backend</p>
            <TermBlock copyText={"cd backend\r\npython -m venv venv\r\nvenv\\Scripts\\activate\r\npip install -r ..\\requirements.txt\r\nuvicorn app.main:app --port 8001"} lines={<>
              <span className="gd-p1">&gt;</span> <span className="gd-cmd">cd backend</span><br/>
              <span className="gd-p1">&gt;</span> <span className="gd-cmd">python -m venv venv</span><br/>
              <span className="gd-p1">&gt;</span> <span className="gd-cmd">venv\Scripts\activate</span><br/>
              <span className="gd-p1">&gt;</span> <span className="gd-cmd">pip install -r ..\requirements.txt</span><br/>
              <span className="gd-p1">&gt;</span> <span className="gd-cmd">uvicorn app.main:app --port 8001</span>
            </>} />
          </div>
          <div>
            <p className="gd-label">Frontend (new window)</p>
            <TermBlock copyText={"cd frontend\r\nnpm install\r\nnpm run dev"} lines={<>
              <span className="gd-p1">&gt;</span> <span className="gd-cmd">cd frontend</span><br/>
              <span className="gd-p1">&gt;</span> <span className="gd-cmd">npm install</span><br/>
              <span className="gd-p1">&gt;</span> <span className="gd-cmd">npm run dev</span>
            </>} />
          </div>
        </div>
      </section>

      <section className="sp-section sp-section--tight gd-body" data-r id="update">
        <h2 className="gd-h2">7. Updating and stopping it</h2>
        <p className="gd-p">Pull the latest code and re-run setup &mdash; migrations apply automatically on next start:</p>
        <TermBlock copyText={"git pull\n./scripts/purvex.sh --setup\n./scripts/purvex.sh --rebuild"} lines={<>
          <span className="gd-p1">$</span> <span className="gd-cmd">git pull</span><br/>
          <span className="gd-p1">$</span> <span className="gd-cmd">./scripts/purvex.sh --setup</span><br/>
          <span className="gd-p1">$</span> <span className="gd-cmd">./scripts/purvex.sh --rebuild</span>
        </>} />
        <p className="gd-p">To stop, <code>Ctrl+C</code> in the terminal running <code>--start</code>. Nothing runs in the background beyond that process and its child services.</p>
      </section>

      <section className="sp-section sp-section--tight gd-body" data-r id="data">
        <h2 className="gd-h2">8. What PurveX does and doesn&apos;t collect</h2>
        <p className="gd-p">PurveX validates detections &mdash; it does not mirror or store your SIEM data.</p>
        <ul className="gd-list">
          <li>Pulls only the minimum needed to confirm whether a test triggered an alert</li>
          <li>Uses scoped queries with minimal permissions</li>
          <li>Defaults to deep-linking back to your SIEM for full event details</li>
        </ul>
        <p className="gd-p" style={{ marginTop: 14 }}>Never collected: raw event logs or payloads, PII or customer data, case notes or IR artifacts.</p>
      </section>

      <section className="sp-section sp-section--tight gd-body" data-r id="faq">
        <h2 className="gd-h2">FAQ</h2>
        <div className="gd-faq">
          {FAQ.map(([q, a]) => (
            <div className="gd-faq__item" key={q}>
              <p className="gd-faq__q">{q}</p>
              <p className="gd-faq__a">{a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="sp-section sp-section--tight gd-body" data-r id="troubleshooting">
        <h2 className="gd-h2">Troubleshooting</h2>
        <div className="gd-table-wrap">
          <table className="gd-table gd-table--trouble">
            <thead><tr><th>Symptom</th><th>First check</th></tr></thead>
            <tbody>
              {TROUBLESHOOTING.map(([symptom, fix]) => (
                <tr key={symptom}><td>{symptom}</td><td>{fix}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="sp-section sp-section--tight gd-body gd-next" data-r>
        <h2 className="gd-h2">Next steps</h2>
        <div className="gd-next__links">
          <Link className="gd-next__card" href="https://github.com/cyberjuss/PurveX#readme">
            <span className="t">Full README &rarr;</span>
            <span className="d">Architecture, complete env var list, SIEM integration details.</span>
          </Link>
          <Link className="gd-next__card" href="https://calendly.com/purvex-llc/30min">
            <span className="t">Talk to the team &rarr;</span>
            <span className="d">Stuck on something this guide doesn&apos;t cover.</span>
          </Link>
        </div>
      </section>

      <style>{GUIDE_CSS}</style>
    </SiteChrome>
  );
}

const GUIDE_CSS = `
.gd-hero { padding-top: 96px; max-width: 760px; margin: 0 auto; }
.gd-hero h1 { margin: 14px 0 0; font-family: var(--font-display); font-size: clamp(1.9rem, 4vw, 2.6rem); font-weight: 700; line-height: 1.15; letter-spacing: -.02em; color: var(--ink) }
.gd-hero__lede { margin: 16px 0 0; max-width: 62ch; color: var(--muted); font-size: 1.02rem; line-height: 1.7 }
.gd-hero__meta { display: flex; flex-wrap: wrap; gap: 8px 20px; margin-top: 18px }
.gd-hero__meta span { display: inline-flex; align-items: center; gap: 6px; font-size: .84rem; color: var(--muted-dim) }
.gd-jump { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border) }
.gd-jump a { font-size: .78rem; font-weight: 600; color: var(--muted); text-decoration: none; padding: 5px 11px; border-radius: 999px; border: 1px solid var(--border); transition: color .15s, border-color .15s, background .15s }
.gd-jump a:hover { color: var(--accent-deep); border-color: var(--accent); background: var(--accent-soft) }

.gd-body { max-width: 760px; margin: 0 auto; padding-top: 56px !important; padding-bottom: 0; border-top: 1px solid var(--border) }
.gd-h2 { font-family: var(--font-display); font-size: 1.35rem; font-weight: 700; letter-spacing: -.01em; color: var(--ink); margin: 0 0 16px }
.gd-p { font-size: .92rem; line-height: 1.7; color: var(--ink-soft); margin: 0 0 12px }
.gd-p code, .gd-list code { font-family: var(--font-mono); font-size: .82em; background: var(--surface-alt); border: 1px solid var(--border); border-radius: 4px; padding: 1px 5px; color: var(--ink) }
.gd-list { margin: 0; padding-left: 20px; color: var(--muted); font-size: .92rem; line-height: 1.8 }

.gd-steps { display: flex; flex-direction: column }
.gd-step { display: flex; gap: 14px }
.gd-step__rail { display: flex; flex-direction: column; align-items: center; flex-shrink: 0 }
.gd-step__num { width: 26px; height: 26px; border-radius: 50%; background: var(--accent-deep); color: #fff; display: flex; align-items: center; justify-content: center; font-family: var(--font-mono); font-size: .74rem; font-weight: 700 }
.gd-step__line { flex: 1; width: 1px; background: var(--border-strong); margin: 4px 0 }
.gd-step__body { flex: 1; padding-bottom: 24px }
.gd-step__body h3 { margin: 0 0 8px; font-size: .98rem; font-weight: 700; color: var(--ink) }

.gd-term { border-radius: 10px; overflow: hidden; border: 1px solid var(--border-strong); box-shadow: 0 16px 36px -24px rgba(16,25,46,.32); margin: 10px 0 12px }
.gd-term__bar { display: flex; align-items: center; gap: 6px; background: #171b26; padding: 8px 12px }
.gd-term__dot { width: 9px; height: 9px; border-radius: 50% }
.gd-term__title { margin-left: 6px; font-family: var(--font-mono); font-size: .68rem; color: #7c869c }
.gd-term__copy { margin-left: auto; background: none; border: 1px solid rgba(255,255,255,.1); border-radius: 6px; color: #8892a6; padding: 3px 6px; cursor: pointer; display: flex; align-items: center }
.gd-term__copy:hover { border-color: rgba(255,255,255,.2); color: #fff }
.gd-term__body { background: #0d1117; padding: 13px 15px; font-family: var(--font-mono); font-size: .78rem; line-height: 1.85; overflow-x: auto }
.gd-p1 { color: #565f76; user-select: none }
.gd-cmd { color: #e6e9f2 }
.gd-out { color: #7c869c }
.gd-hl { color: #a599ff }
.gd-ok { color: #4ade80 }

.gd-callout { border-radius: 10px; padding: 12px 14px; font-size: .85rem; line-height: 1.65; margin: 4px 0 16px }
.gd-callout--warn { background: #fffbeb; color: var(--ink-soft) }
.gd-callout strong { color: var(--ink) }
.gd-callout code { font-family: var(--font-mono); font-size: .85em; background: rgba(0,0,0,.05); border-radius: 4px; padding: 1px 5px }

.gd-table-wrap { overflow-x: auto; margin: 4px 0 8px }
.gd-table { width: 100%; border-collapse: collapse; font-size: .85rem }
.gd-table th { text-align: left; font-size: .68rem; text-transform: uppercase; letter-spacing: .05em; color: var(--muted-dim); font-weight: 700; padding: 0 12px 8px 0; border-bottom: 1px solid var(--border-strong) }
.gd-table td { padding: 10px 12px 10px 0; border-bottom: 1px solid var(--border); color: var(--ink-soft); vertical-align: top; line-height: 1.55 }
.gd-table code { font-family: var(--font-mono); font-size: .78rem; background: var(--surface-alt); border: 1px solid var(--border); border-radius: 4px; padding: 1px 5px }
.gd-table--trouble td:first-child { color: var(--ink); font-weight: 600; width: 34% }

.gd-label { font-size: .68rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--muted-dim); margin: 0 0 6px }
.gd-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px }
@media (max-width: 640px) { .gd-grid2 { grid-template-columns: 1fr } }

.gd-faq { display: flex; flex-direction: column }
.gd-faq__item { padding: 16px 0; border-bottom: 1px solid var(--border) }
.gd-faq__item:last-child { border-bottom: none }
.gd-faq__q { margin: 0 0 6px; font-weight: 700; font-size: .92rem; color: var(--ink) }
.gd-faq__a { margin: 0; font-size: .88rem; line-height: 1.65; color: var(--muted) }

.gd-next { padding-bottom: 100px !important }
.gd-next__links { display: grid; grid-template-columns: 1fr 1fr; gap: 12px }
@media (max-width: 640px) { .gd-next__links { grid-template-columns: 1fr } }
.gd-next__card { display: flex; flex-direction: column; gap: 4px; border: 1px solid var(--border); border-radius: 12px; padding: 16px 18px; text-decoration: none; transition: border-color .15s, transform .15s }
.gd-next__card:hover { border-color: var(--accent); transform: translateY(-1px) }
.gd-next__card .t { font-size: .9rem; font-weight: 700; color: var(--ink) }
.gd-next__card .d { font-size: .78rem; color: var(--muted) }
`;
