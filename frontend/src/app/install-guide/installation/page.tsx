"use client";

import { Eyebrow, H1, Lede, H2, P, TermBlock, Callout } from "@/components/purvex-landing-page/docs-content";

export default function Page() {
  return (
    <>
      <Eyebrow>Get started</Eyebrow>
      <H1>Installation</H1>
      <Lede>One command. No database to install.</Lede>

      <H2 id="install">Run this</H2>
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
        Downloads PurveX, installs it, and starts it. Once you see both lines above, open{" "}
        <code>http://localhost:1120</code>. Keep this terminal window open &mdash; closing it stops PurveX.
      </P>

      <Callout tone="warn">
        <strong>Back up <code>PURVEX_ENCRYPTION_KEY</code></strong> (in the <code>.env</code> file this just
        created) somewhere safe. Lose it, and any stored SIEM credentials or 2FA codes can&apos;t be recovered.
      </Callout>

      <H2 id="manual">Prefer to run it by hand?</H2>
      <TermBlock
        copyText={"git clone https://github.com/cyberjuss/PurveX.git\ncd PurveX\nchmod +x scripts/purvex.sh\n./scripts/purvex.sh --setup\n./scripts/purvex.sh --start"}
        lines={<>
          <span className="dc-p1">$</span> <span className="dc-cmd">git clone https://github.com/cyberjuss/PurveX.git</span><br/>
          <span className="dc-p1">$</span> <span className="dc-cmd">cd PurveX</span><br/>
          <span className="dc-p1">$</span> <span className="dc-cmd">chmod +x scripts/purvex.sh</span><br/>
          <span className="dc-p1">$</span> <span className="dc-cmd">./scripts/purvex.sh --setup</span><br/>
          <span className="dc-p1">$</span> <span className="dc-cmd">./scripts/purvex.sh --start</span>
        </>}
      />

      <H2 id="update">Updating</H2>
      <TermBlock copyText={"git pull\n./scripts/purvex.sh --setup\n./scripts/purvex.sh --rebuild"} lines={<>
        <span className="dc-p1">$</span> <span className="dc-cmd">git pull</span><br/>
        <span className="dc-p1">$</span> <span className="dc-cmd">./scripts/purvex.sh --setup</span><br/>
        <span className="dc-p1">$</span> <span className="dc-cmd">./scripts/purvex.sh --rebuild</span>
      </>} />
    </>
  );
}
