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
      <Lede>One command. PostgreSQL is installed and configured for you.</Lede>

      <H2 id="install">Run the installer</H2>
      <TermBlock
        copyText={installCommand}
        lines={<>
          <span className="dc-p1">$</span> <span className="dc-cmd">{installCommand}</span><br/>
          <span className="dc-out">...</span><br/>
          <span className="dc-out">Enter password: </span><br/>
          <span className="dc-out">...</span><br/>
          <span className="dc-out">Start PurveX now? [y/N] </span><span className="dc-cmd">y</span><br/>
          <span className="dc-out">...</span><br/>
          <span className="dc-ok">[purvex] Web: http://127.0.0.1:1120</span><br/>
          <span className="dc-ok">[purvex] API: http://127.0.0.1:8001</span>
        </>}
      />
      <P>
        This downloads PurveX, installs it — including PostgreSQL, prompting only for a database password
        — and asks if you want to start it. Say yes and once you see it running, open{" "}
        <code>http://localhost:1120</code>. Keep this terminal window open; closing it stops PurveX.
      </P>

      <Callout tone="info">
        Missing Python, Node.js, or PostgreSQL? The installer detects it, shows the install command for your
        OS, and offers to run it for you.
      </Callout>

      <Callout tone="warn">
        <strong>Back up <code>PURVEX_ENCRYPTION_KEY</code></strong>, located in the <code>.env</code> file this
        step creates. If you lose it, any stored SIEM credentials cannot be recovered.
      </Callout>

      <H2 id="manual">Install manually</H2>
      <TermBlock
        copyText={"git clone https://github.com/cyberjuss/PurveX.git && \\\n  cd PurveX && \\\n  chmod +x scripts/purvex.sh && \\\n  ./scripts/purvex.sh --setup"}
        lines={<>
          <span className="dc-p1">$</span> <span className="dc-cmd">git clone https://github.com/cyberjuss/PurveX.git &amp;&amp; \</span><br/>
          <span className="dc-cmd">&nbsp;&nbsp;cd PurveX &amp;&amp; \</span><br/>
          <span className="dc-cmd">&nbsp;&nbsp;chmod +x scripts/purvex.sh &amp;&amp; \</span><br/>
          <span className="dc-cmd">&nbsp;&nbsp;./scripts/purvex.sh --setup</span>
        </>}
      />
      <P><code>--setup</code> installs dependencies and PostgreSQL, then asks if you want to start PurveX now.</P>

      <H2 id="update">Update PurveX</H2>
      <P>
        To update, pull the latest code and rebuild. This is safe to run at any time; your existing data is
        not affected.
      </P>
      <TermBlock copyText={"git pull && ./scripts/purvex.sh --setup"} lines={<>
        <span className="dc-p1">$</span> <span className="dc-cmd">git pull &amp;&amp; ./scripts/purvex.sh --setup</span>
      </>} />
      <P>
        This also re-applies any new database migrations. When asked whether to start PurveX, answer{" "}
        <code>n</code> — you still need to rebuild the frontend first:
      </P>
      <TermBlock copyText={"./scripts/purvex.sh --rebuild && ./scripts/purvex.sh --start"} lines={<>
        <span className="dc-p1">$</span> <span className="dc-cmd">./scripts/purvex.sh --rebuild &amp;&amp; ./scripts/purvex.sh --start</span>
      </>} />
      <P>To stop PurveX, press <code>Ctrl+C</code> in its terminal window.</P>
    </>
  );
}
