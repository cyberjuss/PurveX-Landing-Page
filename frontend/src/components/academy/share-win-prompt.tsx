"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { academyFetch } from "@/lib/academy-client";
import "./proof-prompt.css";

// After a student's first finished challenge, the answer route says so (only
// when they have not opted in to #wins posts yet). This asks whether to share
// it. Yes turns on the opt-in from Goals and posts this win. It shares the
// screenshot prompt's look, and waits for that prompt to close first, since
// the same answer can raise both.

export const SHARE_WIN_EVENT = "academy:share-win";
type Ask = { challenge: string; title: string };

export function askToShareWin(ask: Ask) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SHARE_WIN_EVENT, { detail: ask }));
}

const INVITE = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL;

export function ShareWinPrompt() {
  const [ask, setAsk] = useState<Ask | null>(null);
  const [state, setState] = useState<"ask" | "busy" | "posted" | "error">("ask");
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    const onAsk = (e: Event) => {
      const detail = (e as CustomEvent<Ask>).detail;
      if (!detail?.challenge) return;
      // Let another open dialog (the screenshot prompt) finish first.
      const show = () => {
        if (document.querySelector("dialog[open]")) return false;
        setState("ask");
        setAsk(detail);
        return true;
      };
      if (!show()) {
        clearInterval(timer);
        let tries = 0;
        timer = setInterval(() => {
          if (show() || ++tries > 600) clearInterval(timer);
        }, 500);
      }
    };
    window.addEventListener(SHARE_WIN_EVENT, onAsk);
    return () => {
      window.removeEventListener(SHARE_WIN_EVENT, onAsk);
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (ask && !d.open) d.showModal();
    if (!ask && d.open) d.close();
  }, [ask]);

  async function share() {
    if (!ask) return;
    setState("busy");
    const res = await academyFetch("/academy/api/share-win", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challenge: ask.challenge }),
    }).catch(() => null);
    const body = res?.ok ? ((await res.json()) as { posted?: boolean }) : null;
    setState(body?.posted ? "posted" : "error");
  }

  const close = () => setAsk(null);

  return (
    <dialog ref={dialog} className="pq" aria-labelledby="sw-title" onClose={close}>
      {ask && state !== "posted" && (
        <div className="pq__body">
          <span className="pq__ok">🎉 Challenge complete · {ask.title}</span>
          <h2 id="sw-title">Share it in #wins?</h2>
          <p>
            Post one line in the Range Discord with your first name and <b>{ask.title}</b>. Nothing else about you or your answers is shared. Your
            next wins will post too, and you can turn that off in Goals.
          </p>
          <div className="pq__actions">
            <button type="button" className="pq__btn pq__btn--primary" onClick={() => void share()} disabled={state === "busy"}>
              {state === "busy" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Share it"}
            </button>
            <button type="button" className="pq__btn" onClick={close} disabled={state === "busy"}>
              Not now
            </button>
          </div>
          {state === "error" && <p className="pq__error">That didn&rsquo;t post. Try again in a minute.</p>}
        </div>
      )}
      {ask && state === "posted" && (
        <div className="pq__body">
          <span className="pq__ok">✓ Posted to #wins</span>
          <h2 id="sw-title">{ask.title}</h2>
          <p>Your win is in the Range Discord. Your next wins will post there too.</p>
          <div className="pq__actions">
            <button type="button" className="pq__btn pq__btn--primary" onClick={close}>
              Continue
            </button>
            {INVITE && (
              <a href={INVITE} target="_blank" rel="noreferrer" className="pq__btn" onClick={close}>
                Open the Discord
              </a>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}
