"use client";

import { Eyebrow, H1, Lede, H2, P, Table, TermBlock, Step, Callout } from "@/components/purvex-landing-page/docs-content";

const ENV_VARS: [string, string, string][] = [
  ["DATABASE_URL", "yes", "PostgreSQL connection string"],
  ["JWT_SECRET_KEY", "yes", "Signs session tokens"],
  ["PURVEX_ENCRYPTION_KEY", "yes", "Encrypts SIEM credentials and 2FA secrets at rest"],
  ["PURVEX_ENV", "no", "dev / staging / prod (default: dev)"],
  ["REDIS_URL", "no, locally", "Rate limiting and the background job queue"],
  ["OPENAI_API_KEY", "no", "Enables the Watchtower AI assistant"],
];

export default function Page() {
  return (
    <>
      <Eyebrow>Get started</Eyebrow>
      <H1>Installation</H1>
      <Lede>Get the code, configure the two required secrets, and start the server.</Lede>

      <H2 id="get-code">Get the code</H2>
      <Step n={1} title="One-line install">
        <P>Clones the repo (or downloads a source archive if <code>git</code> isn&apos;t installed) into a new <code>PurveX/</code> folder.</P>
        <TermBlock copyText="curl -fsSL https://purvex-llc.com/install.sh | bash" lines={<><span className="dc-p1">$</span> <span className="dc-cmd">curl -fsSL https://purvex-llc.com/install.sh | bash</span></>} />
      </Step>
      <Step n={2} title="Or do it by hand" last>
        <P>Same result, if you&apos;d rather see each step.</P>
        <TermBlock copyText={"git clone https://github.com/cyberjuss/PurveX.git\ncd PurveX"} lines={<><span className="dc-p1">$</span> <span className="dc-cmd">git clone https://github.com/cyberjuss/PurveX.git</span><br/><span className="dc-p1">$</span> <span className="dc-cmd">cd PurveX</span></>} />
      </Step>

      <H2 id="configure">Configure</H2>
      <P>Copy the example environment file, create a database, and generate the two secrets PurveX needs at boot.</P>
      <TermBlock
        copyText={'cp .env.example .env\ncreatedb purvex\npython -c "import secrets; print(secrets.token_urlsafe(32))"\npython -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"'}
        lines={<>
          <span className="dc-p1">$</span> <span className="dc-cmd">cp .env.example .env</span><br/>
          <span className="dc-p1">$</span> <span className="dc-cmd">createdb purvex</span><br/>
          <span className="dc-p1">$</span> <span className="dc-cmd">python -c &quot;import secrets; print(secrets.token_urlsafe(32))&quot;</span><br/>
          <span className="dc-out">Rf3n...  <span className="dc-hl"># JWT_SECRET_KEY</span></span><br/>
          <span className="dc-p1">$</span> <span className="dc-cmd">python -c &quot;from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())&quot;</span><br/>
          <span className="dc-out">gk8Q...  <span className="dc-hl"># PURVEX_ENCRYPTION_KEY</span></span>
        </>}
      />
      <P>Paste both values, plus your <code>DATABASE_URL</code>, into <code>.env</code>.</P>
      <Callout tone="warn">
        <strong>Save <code>PURVEX_ENCRYPTION_KEY</code> somewhere durable.</strong> It encrypts SIEM credentials and
        2FA secrets at rest. Lose it, and that data becomes permanently unrecoverable &mdash; not just re-generatable.
      </Callout>
      <P>Full reference:</P>
      <Table
        head={["Variable", "Required", "Description"]}
        rows={ENV_VARS.map(([name, req, desc]) => [<code key="n">{name}</code>, req, desc])}
      />

      <H2 id="start">Install dependencies and start</H2>
      <P>The bundled launcher handles both the Python and Node sides.</P>
      <TermBlock
        copyText={"chmod +x scripts/purvex.sh\n./scripts/purvex.sh --setup\n./scripts/purvex.sh --start"}
        lines={<>
          <span className="dc-p1">$</span> <span className="dc-cmd">chmod +x scripts/purvex.sh</span><br/>
          <span className="dc-p1">$</span> <span className="dc-cmd">./scripts/purvex.sh --setup</span><br/>
          <span className="dc-out">[purvex] Installing backend dependencies...</span><br/>
          <span className="dc-out">[purvex] Installing frontend dependencies...</span><br/>
          <span className="dc-ok">[purvex] Setup complete.</span><br/>
          <span className="dc-p1">$</span> <span className="dc-cmd">./scripts/purvex.sh --start</span><br/>
          <span className="dc-out">[purvex] Running database migrations...</span><br/>
          <span className="dc-ok">[purvex] Backend running on :8001</span><br/>
          <span className="dc-ok">[purvex] Frontend running on :1120</span>
        </>}
      />
      <P>Leave this running &mdash; it&apos;s your API and web server both. Open a new terminal for anything else.</P>

      <H2 id="update">Updating and stopping it</H2>
      <P>Pull the latest code and re-run setup &mdash; migrations apply automatically on next start:</P>
      <TermBlock copyText={"git pull\n./scripts/purvex.sh --setup\n./scripts/purvex.sh --rebuild"} lines={<>
        <span className="dc-p1">$</span> <span className="dc-cmd">git pull</span><br/>
        <span className="dc-p1">$</span> <span className="dc-cmd">./scripts/purvex.sh --setup</span><br/>
        <span className="dc-p1">$</span> <span className="dc-cmd">./scripts/purvex.sh --rebuild</span>
      </>} />
      <P>To stop, <code>Ctrl+C</code> in the terminal running <code>--start</code>. Nothing runs in the background beyond that process and its child services.</P>
    </>
  );
}
