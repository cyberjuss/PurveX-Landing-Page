"use client";

import { Eyebrow, H1, Lede, H2, P, Table, TermBlock, Step, Callout } from "@/components/purvex-landing-page/docs-content";

const ENV_VARS: [string, string, string][] = [
  ["JWT_SECRET_KEY", "auto-generated", "Keeps sign-in sessions secure"],
  ["PURVEX_ENCRYPTION_KEY", "auto-generated", "Encrypts SIEM credentials and two-factor authentication (2FA) codes at rest"],
  ["DATABASE_URL", "no", "Unset by default (uses local SQLite). Set this if you want PostgreSQL instead."],
  ["PURVEX_ENV", "no", "dev / staging / prod (default: dev)"],
  ["REDIS_URL", "no, locally", "Powers rate limiting and the background job queue"],
  ["OPENAI_API_KEY", "no", "Turns on the Watchtower AI assistant"],
];

export default function Page() {
  return (
    <>
      <Eyebrow>Get started</Eyebrow>
      <H1>Installation</H1>
      <Lede>Get the code, then run one command. Two minutes end to end &mdash; no database to install, no secrets to generate by hand.</Lede>

      <H2 id="get-code">Get the code</H2>
      <Step n={1} title="One-line install">
        <P>Downloads PurveX into a new <code>PurveX/</code> folder on your machine. It uses <code>git</code> if you have it, and falls back to a plain download if you don&apos;t &mdash; either way, this is all you need to run.</P>
        <TermBlock copyText="curl -fsSL https://purvex-llc.com/install.sh | bash" lines={<><span className="dc-p1">$</span> <span className="dc-cmd">curl -fsSL https://purvex-llc.com/install.sh | bash</span></>} />
      </Step>
      <Step n={2} title="Prefer to see each step yourself?" last>
        <P>This does exactly the same thing, just spelled out:</P>
        <TermBlock copyText={"git clone https://github.com/cyberjuss/PurveX.git\ncd PurveX"} lines={<><span className="dc-p1">$</span> <span className="dc-cmd">git clone https://github.com/cyberjuss/PurveX.git</span><br/><span className="dc-p1">$</span> <span className="dc-cmd">cd PurveX</span></>} />
      </Step>

      <H2 id="start">Install and start it up</H2>
      <P>
        One script does the rest: installs everything, creates <code>.env</code> and generates the two secrets
        PurveX needs to keep your data secure, and starts both halves of the app. There&apos;s no database to
        install first &mdash; it stores everything in a local file until you tell it otherwise.
      </P>
      <TermBlock
        copyText={"chmod +x scripts/purvex.sh\n./scripts/purvex.sh --setup\n./scripts/purvex.sh --start"}
        lines={<>
          <span className="dc-p1">$</span> <span className="dc-cmd">chmod +x scripts/purvex.sh</span><br/>
          <span className="dc-p1">$</span> <span className="dc-cmd">./scripts/purvex.sh --setup</span><br/>
          <span className="dc-out">[purvex] Created .env</span><br/>
          <span className="dc-out">[purvex] Generated JWT_SECRET_KEY</span><br/>
          <span className="dc-out">[purvex] Generated PURVEX_ENCRYPTION_KEY</span><br/>
          <span className="dc-out">[purvex] Installing backend dependencies...</span><br/>
          <span className="dc-out">[purvex] Installing frontend dependencies...</span><br/>
          <span className="dc-ok">[purvex] Setup complete.</span><br/>
          <span className="dc-p1">$</span> <span className="dc-cmd">./scripts/purvex.sh --start</span><br/>
          <span className="dc-out">[purvex] Running database migrations...</span><br/>
          <span className="dc-ok">[purvex] Backend running on :8001</span><br/>
          <span className="dc-ok">[purvex] Frontend running on :1120</span>
        </>}
      />
      <P>Leave this terminal window open &mdash; it&apos;s running both the server and the web app. Open a new terminal window for anything else you need to do.</P>
      <Callout tone="warn">
        <strong>Back up <code>PURVEX_ENCRYPTION_KEY</code></strong> (the value <code>--setup</code> just generated
        into <code>.env</code>) somewhere safe, like a password manager. It&apos;s what protects SIEM credentials and
        2FA codes at rest &mdash; lose it, and that data can&apos;t be recovered. You can&apos;t just generate a new
        one and pick up where you left off.
      </Callout>

      <H2 id="whats-happening">What those two commands actually do</H2>
      <P>Nothing here is hidden from you &mdash; this is the short version of everything the script just did:</P>
      <ul className="dc-list">
        <li><strong>Checks your machine is ready</strong> &mdash; confirms Python and Node.js are installed before touching anything else.</li>
        <li><strong>Creates <code>.env</code> and fills in two secret values</strong> &mdash; random strings, generated on your machine, that only your machine ever sees. One keeps sign-ins secure, the other protects stored credentials.</li>
        <li><strong>Installs the app&apos;s dependencies</strong> &mdash; everything PurveX itself needs to run, downloaded into this folder only.</li>
        <li><strong>Sets up storage</strong> &mdash; a single local file, not a separate database server, unless you choose to add one later.</li>
        <li><strong>Starts two processes</strong> &mdash; the server doing the work, and the web app you open in your browser.</li>
      </ul>
      <P>That&apos;s the whole thing. No step talks to anything outside this machine.</P>

      <H2 id="configure">Going further (optional)</H2>
      <P>
        Nothing below is required to get running &mdash; <code>--setup</code> already handled the two values PurveX
        actually needs. This is here for when you want more: PostgreSQL instead of the default local file, outbound
        email, or the AI assistant. Add whichever of these you want to <code>.env</code> and restart.
      </P>
      <Table
        head={["Variable", "Required", "Description"]}
        rows={ENV_VARS.map(([name, req, desc]) => [<code key="n">{name}</code>, req, desc])}
      />

      <H2 id="update">Updating or stopping it later</H2>
      <P>To pick up the latest version, pull the new code and re-run setup &mdash; any database changes apply automatically the next time it starts:</P>
      <TermBlock copyText={"git pull\n./scripts/purvex.sh --setup\n./scripts/purvex.sh --rebuild"} lines={<>
        <span className="dc-p1">$</span> <span className="dc-cmd">git pull</span><br/>
        <span className="dc-p1">$</span> <span className="dc-cmd">./scripts/purvex.sh --setup</span><br/>
        <span className="dc-p1">$</span> <span className="dc-cmd">./scripts/purvex.sh --rebuild</span>
      </>} />
      <P>To stop PurveX, press <code>Ctrl+C</code> in the terminal window running <code>--start</code>. Nothing keeps running in the background beyond that.</P>
    </>
  );
}
