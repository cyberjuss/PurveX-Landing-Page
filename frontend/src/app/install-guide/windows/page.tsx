"use client";

import { Eyebrow, H1, Lede, H2, P, TermBlock } from "@/components/purvex-landing-page/docs-content";

export default function Page() {
  return (
    <>
      <Eyebrow>Get started</Eyebrow>
      <H1>Windows, without Git Bash</H1>
      <Lede>
        The one-line installer and <code>purvex.sh</code> launcher need a Unix-style shell, which plain PowerShell
        isn&apos;t. If you don&apos;t have Git Bash or WSL installed, no problem &mdash; just start the two halves
        of the app yourself with the commands below.
      </Lede>

      <H2>1. Start the backend</H2>
      <TermBlock copyText={"cd backend\r\npython -m venv venv\r\nvenv\\Scripts\\activate\r\npip install -r ..\\requirements.txt\r\nuvicorn app.main:app --port 8001"} lines={<>
        <span className="dc-p1">&gt;</span> <span className="dc-cmd">cd backend</span><br/>
        <span className="dc-p1">&gt;</span> <span className="dc-cmd">python -m venv venv</span><br/>
        <span className="dc-p1">&gt;</span> <span className="dc-cmd">venv\Scripts\activate</span><br/>
        <span className="dc-p1">&gt;</span> <span className="dc-cmd">pip install -r ..\requirements.txt</span><br/>
        <span className="dc-p1">&gt;</span> <span className="dc-cmd">uvicorn app.main:app --port 8001</span>
      </>} />

      <H2>2. Start the frontend, in a second window</H2>
      <P>Open a new PowerShell window &mdash; leave the backend one running &mdash; and start the web app:</P>
      <TermBlock copyText={"cd frontend\r\nnpm install\r\nnpm run dev"} lines={<>
        <span className="dc-p1">&gt;</span> <span className="dc-cmd">cd frontend</span><br/>
        <span className="dc-p1">&gt;</span> <span className="dc-cmd">npm install</span><br/>
        <span className="dc-p1">&gt;</span> <span className="dc-cmd">npm run dev</span>
      </>} />

      <H2>Stopping it</H2>
      <P>Press <code>Ctrl+C</code> in each window to stop that process. Nothing else runs in the background beyond those two.</P>
    </>
  );
}
