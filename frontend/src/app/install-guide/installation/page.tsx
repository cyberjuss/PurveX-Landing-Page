"use client";

import { Eyebrow, H1, Lede, TermBlock, P, Callout, H2 } from "@/components/purvex-landing-page/docs-content";

export default function Page() {
  return (
    <>
      <Eyebrow>Get started</Eyebrow>
      <H1>Installation</H1>
      <Lede>One command. No database installation required.</Lede>

      <H2 id="install">Run the installer</H2>
      <TermBlock
        copyText="curl -fsSL https://purvex-llc.com/install.sh | bash"
        lines={<>
          <span className="dc-p1">$</span> <span className="dc-cmd">curl -fsSL https://purvex-llc.com/install.sh | bash</span><br/>
          <span className="dc-out">...</span><br/>
          <span className="dc-ok">[purvex] Backend running on :8001</span><br/>
          <span className="dc-ok">[purvex] Frontend running on :1120</span>
        </>}
      />
      <P>
        This command downloads PurveX, installs it, and starts it. Once both lines above appear, open{" "}
        <code>http://localhost:1120</code>. Keep this terminal window open; closing it stops PurveX.
      </P>

      <Callout tone="warn">
        <strong>Back up <code>PURVEX_ENCRYPTION_KEY</code></strong>, located in the <code>.env</code> file this
        step creates. Store it somewhere safe. If you lose it, any stored SIEM credentials cannot be recovered.
      </Callout>

      <H2 id="manual">Install manually</H2>
      <P>To install without the script, run these commands in order:</P>
      <TermBlock
        copyText={"git clone https://github.com/cyberjuss/PurveX.git\ncd PurveX\nchmod +x scripts/purvex.sh\n./scripts/purvex.sh --setup\n./scripts/purvex.sh --start"}
        lines={<>
          <span className="dc-p1">$</span> <span className="dc-cmd">git clone https://github.com/cyberjuss/PurveX.git</span>  <span className="dc-hl"># get the code</span><br/>
          <span className="dc-p1">$</span> <span className="dc-cmd">cd PurveX</span><br/>
          <span className="dc-p1">$</span> <span className="dc-cmd">chmod +x scripts/purvex.sh</span>  <span className="dc-hl"># make the launcher runnable</span><br/>
          <span className="dc-p1">$</span> <span className="dc-cmd">./scripts/purvex.sh --setup</span>  <span className="dc-hl"># install dependencies, generate secrets</span><br/>
          <span className="dc-p1">$</span> <span className="dc-cmd">./scripts/purvex.sh --start</span>  <span className="dc-hl"># start the API and the web app</span>
        </>}
      />

      <H2 id="update">Update PurveX</H2>
      <P>
        To update, pull the latest code and rebuild. This is safe to run at any time; your existing data is
        not affected.
      </P>
      <TermBlock copyText={"git pull\n./scripts/purvex.sh --setup\n./scripts/purvex.sh --rebuild"} lines={<>
        <span className="dc-p1">$</span> <span className="dc-cmd">git pull</span><br/>
        <span className="dc-p1">$</span> <span className="dc-cmd">./scripts/purvex.sh --setup</span><br/>
        <span className="dc-p1">$</span> <span className="dc-cmd">./scripts/purvex.sh --rebuild</span>
      </>} />
      <P>To stop PurveX, press <code>Ctrl+C</code> in its terminal window.</P>
    </>
  );
}
