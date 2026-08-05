"use client";

import { Eyebrow, H1, Lede, H2, P, TermBlock } from "@/components/purvex-landing-page/docs-content";

export default function Page() {
  return (
    <>
      <Eyebrow>Get started</Eyebrow>
      <H1>Windows, without Git Bash</H1>
      <Lede>The bundled launcher script needs a POSIX shell. On plain PowerShell, start each half manually instead.</Lede>

      <H2>Backend</H2>
      <TermBlock copyText={"cd backend\r\npython -m venv venv\r\nvenv\\Scripts\\activate\r\npip install -r ..\\requirements.txt\r\nuvicorn app.main:app --port 8001"} lines={<>
        <span className="dc-p1">&gt;</span> <span className="dc-cmd">cd backend</span><br/>
        <span className="dc-p1">&gt;</span> <span className="dc-cmd">python -m venv venv</span><br/>
        <span className="dc-p1">&gt;</span> <span className="dc-cmd">venv\Scripts\activate</span><br/>
        <span className="dc-p1">&gt;</span> <span className="dc-cmd">pip install -r ..\requirements.txt</span><br/>
        <span className="dc-p1">&gt;</span> <span className="dc-cmd">uvicorn app.main:app --port 8001</span>
      </>} />

      <H2>Frontend (new window)</H2>
      <TermBlock copyText={"cd frontend\r\nnpm install\r\nnpm run dev"} lines={<>
        <span className="dc-p1">&gt;</span> <span className="dc-cmd">cd frontend</span><br/>
        <span className="dc-p1">&gt;</span> <span className="dc-cmd">npm install</span><br/>
        <span className="dc-p1">&gt;</span> <span className="dc-cmd">npm run dev</span>
      </>} />

      <H2>Stopping it</H2>
      <P>Stop each process with <code>Ctrl+C</code> in its own window. Nothing runs in the background beyond those two processes.</P>
    </>
  );
}
