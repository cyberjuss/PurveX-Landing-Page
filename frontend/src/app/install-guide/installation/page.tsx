"use client";

import { useEffect, useState } from "react";
import { Eyebrow, H1, Lede, TermBlock, P, Callout, H2 } from "@/components/purvex-landing-page/docs-content";

// Falls back to the production domain for the SSR/pre-mount render; swapped
// for the real window.location.origin once mounted -- matters while the
// custom domain isn't live yet (site is still on its *.vercel.app default),
// harmless once it is since window.location.origin is already correct.
// Same pattern as get-purvex/page.tsx.
const DEFAULT_ORIGIN = "https://purvex-llc.com";

export default function Page() {
  const [origin, setOrigin] = useState(DEFAULT_ORIGIN);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrigin(window.location.origin);
  }, []);
  const installCommand = `curl -fsSL ${origin}/install.sh | bash`;

  return (
    <>
      <Eyebrow>Get started</Eyebrow>
      <H1>Installation</H1>
      <Lede>One command. No database installation required.</Lede>

      <H2 id="install">Run the installer</H2>
      <TermBlock
        copyText={installCommand}
        lines={<>
          <span className="dc-p1">$</span> <span className="dc-cmd">{installCommand}</span><br/>
          <span className="dc-out">...</span><br/>
          <span className="dc-ok">[purvex] Web: http://127.0.0.1:1120</span><br/>
          <span className="dc-ok">[purvex] API: http://127.0.0.1:8001</span>
        </>}
      />
      <P>
        This command downloads PurveX, installs it, and starts it. Once both lines above appear, open{" "}
        <code>http://localhost:1120</code>. Keep this terminal window open; closing it stops PurveX.
      </P>

      <Callout tone="info">
        If Python 3.11+ or Node.js 20+ is missing, the installer detects it, prints the exact command for
        your OS (<code>apt</code>, <code>dnf</code>, <code>pacman</code>, or Homebrew), and asks{" "}
        <strong>Install Node.js now? [y/N]</strong> before running it. Nothing is installed without that
        confirmation. Answering no, or running the installer somewhere with no terminal to ask, leaves the
        command printed so you can run it yourself.
      </Callout>

      <Callout tone="warn">
        <strong>Back up <code>PURVEX_ENCRYPTION_KEY</code></strong>, located in the <code>.env</code> file this
        step creates. Store it somewhere safe. If you lose it, any stored SIEM credentials cannot be recovered.
      </Callout>

      <H2 id="manual">Install manually</H2>
      <P>
        To install without the script, run these commands in order. They are chained with{" "}
        <code>&amp;&amp;</code> so the sequence stops at the first failure instead of running every
        later command anyway.
      </P>
      <TermBlock
        copyText={"git clone https://github.com/cyberjuss/PurveX.git && \\\n  cd PurveX && \\\n  chmod +x scripts/purvex.sh && \\\n  ./scripts/purvex.sh --setup && \\\n  ./scripts/purvex.sh --start"}
        lines={<>
          <span className="dc-p1">$</span> <span className="dc-cmd">git clone https://github.com/cyberjuss/PurveX.git &amp;&amp; \</span><br/>
          <span className="dc-cmd">&nbsp;&nbsp;cd PurveX &amp;&amp; \</span><br/>
          <span className="dc-cmd">&nbsp;&nbsp;chmod +x scripts/purvex.sh &amp;&amp; \</span><br/>
          <span className="dc-cmd">&nbsp;&nbsp;./scripts/purvex.sh --setup &amp;&amp; \</span><br/>
          <span className="dc-cmd">&nbsp;&nbsp;./scripts/purvex.sh --start</span>
        </>}
      />
      <P>
        If a step fails (for example, <code>--setup</code> reporting a missing dependency), the
        command stops there instead of continuing on to <code>--start</code> and printing the same
        error again. Follow the guidance the failing step prints, then re-run this same block.
      </P>

      <H2 id="update">Update PurveX</H2>
      <P>
        To update, pull the latest code and rebuild. This is safe to run at any time; your existing data is
        not affected.
      </P>
      <TermBlock copyText={"git pull && \\\n  ./scripts/purvex.sh --setup && \\\n  ./scripts/purvex.sh --rebuild"} lines={<>
        <span className="dc-p1">$</span> <span className="dc-cmd">git pull &amp;&amp; \</span><br/>
        <span className="dc-cmd">&nbsp;&nbsp;./scripts/purvex.sh --setup &amp;&amp; \</span><br/>
        <span className="dc-cmd">&nbsp;&nbsp;./scripts/purvex.sh --rebuild</span>
      </>} />
      <P>To stop PurveX, press <code>Ctrl+C</code> in its terminal window.</P>
    </>
  );
}
