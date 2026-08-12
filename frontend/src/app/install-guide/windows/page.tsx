"use client";

import { Eyebrow, H1, Lede, H2, P, TermBlock } from "@/components/purvex-landing-page/docs-content";

export default function Page() {
  return (
    <>
      <Eyebrow>Get started</Eyebrow>
      <H1>Windows without Git Bash</H1>
      <Lede>
        The one-line installer and the <code>purvex.sh</code> launcher require a Unix-style shell, which plain
        PowerShell does not provide. If Git Bash or WSL is not installed, start the two halves of the
        application manually using the commands below.
      </Lede>

      <H2>1. Start the backend</H2>
      <TermBlock copyText={"cd backend\r\npython -m venv venv\r\nvenv\\Scripts\\activate\r\npip install -r ..\\requirements.txt\r\nuvicorn app.main:app --port 8001"} lines={<>
        <span className="dc-p1">&gt;</span> <span className="dc-cmd">cd backend</span><br/>
        <span className="dc-p1">&gt;</span> <span className="dc-cmd">python -m venv venv</span><br/>
        <span className="dc-p1">&gt;</span> <span className="dc-cmd">venv\Scripts\activate</span><br/>
        <span className="dc-p1">&gt;</span> <span className="dc-cmd">pip install -r ..\requirements.txt</span><br/>
        <span className="dc-p1">&gt;</span> <span className="dc-cmd">uvicorn app.main:app --port 8001</span>
      </>} />

      <H2>2. Start the frontend in a second window</H2>
      <P>Open a new PowerShell window, leave the backend window running, and start the web app:</P>
      <TermBlock copyText={"cd frontend\r\nnpm install\r\nnpm run dev"} lines={<>
        <span className="dc-p1">&gt;</span> <span className="dc-cmd">cd frontend</span><br/>
        <span className="dc-p1">&gt;</span> <span className="dc-cmd">npm install</span><br/>
        <span className="dc-p1">&gt;</span> <span className="dc-cmd">npm run dev</span>
      </>} />

      <H2>Stop PurveX</H2>
      <P>Press <code>Ctrl+C</code> in each window to stop that process. No other process runs in the background beyond those two.</P>
    </>
  );
}
