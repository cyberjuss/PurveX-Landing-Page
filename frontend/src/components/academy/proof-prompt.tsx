"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { academyFetch } from "@/lib/academy-client";
import { PROOF_PROMPT_EVENT, SHOTS_PER_ITEM } from "@/lib/academy-proof";
import "./proof-prompt.css";

type Ask = { job: string; from: string; title: string; count: number };

// After a correct answer the lab confirmed (a Ticket Queue ticket, a daily
// drill lab task, or a weekly CTF fix), offers an optional screenshot for
// that task on the student's Proof Profile. Skip closes it.
export function ProofPrompt() {
  const [ask, setAsk] = useState<Ask | null>(null);
  const [saved, setSaved] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const onAsk = async (e: Event) => {
      const { job, from } = (e as CustomEvent<{ job: string; from: string }>).detail ?? {};
      if (!job) return;
      const res = await academyFetch("/academy/api/proof").catch(() => null);
      const data = res?.ok ? ((await res.json()) as { items: { job: string; title: string }[]; shots: { job: string }[] }) : null;
      const item = data?.items.find((i) => i.job === job);
      if (!data || !item) return;
      const count = data.shots.filter((s) => s.job === job).length;
      if (count >= SHOTS_PER_ITEM) return;
      setSaved(null);
      setError(null);
      setAsk({ job, from, title: item.title, count });
    };
    window.addEventListener(PROOF_PROMPT_EVENT, onAsk);
    return () => window.removeEventListener(PROOF_PROMPT_EVENT, onAsk);
  }, []);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (ask && !d.open) d.showModal();
    if (!ask && d.open) d.close();
  }, [ask]);

  const upload = useCallback(
    async (files: File[]) => {
      if (!ask || !files.length) return;
      setBusy(true);
      setError(null);
      let count = ask.count;
      for (const file of files.slice(0, SHOTS_PER_ITEM - count)) {
        const form = new FormData();
        form.append("job", ask.job);
        form.append("file", file);
        const res = await academyFetch("/academy/api/proof", { method: "POST", body: form });
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          setError(body.error || "Unable to save that screenshot.");
          break;
        }
        count += 1;
      }
      setBusy(false);
      if (count > ask.count) setSaved(count);
    },
    [ask]
  );

  // Win + Shift + S, then Ctrl + V while the pop-up is open.
  useEffect(() => {
    if (!ask || saved !== null) return;
    const onPaste = (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.files ?? []).filter((f) => /^image\/(png|jpeg)$/.test(f.type));
      if (!files.length) return;
      e.preventDefault();
      void upload(files);
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [ask, saved, upload]);

  const close = () => setAsk(null);

  return (
    <dialog ref={dialog} className="pq" aria-labelledby="pq-title" onClose={close}>
      {ask && saved === null && (
        <div className="pq__body">
          <span className="pq__ok">✓ Correct · {ask.from}</span>
          <h2 id="pq-title">Add a screenshot to your portfolio?</h2>
          <p>
            This counts toward <b>{ask.title}</b> in your portfolio. If the console is still open, a screenshot shows employers the work. It&rsquo;s optional.
          </p>
          <div className="pq__actions">
            <label className="pq__btn pq__btn--primary" htmlFor="pq-file">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload screenshot"}
            </label>
            <input
              id="pq-file"
              type="file"
              accept="image/png,image/jpeg"
              multiple
              hidden
              disabled={busy}
              onChange={(e) => void upload(Array.from(e.target.files ?? [])).then(() => (e.target.value = ""))}
            />
            <button type="button" className="pq__btn" onClick={close} disabled={busy}>
              Skip
            </button>
          </div>
          <p className="pq__tip">
            Or press <kbd>Win</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd>, then <kbd>Ctrl</kbd> + <kbd>V</kbd> here.
          </p>
          {error && <p className="pq__error">{error}</p>}
        </div>
      )}
      {ask && saved !== null && (
        <div className="pq__body">
          <span className="pq__ok">✓ Saved to your portfolio</span>
          <h2 id="pq-title">{ask.title}</h2>
          <p>
            {saved >= SHOTS_PER_ITEM
              ? `${SHOTS_PER_ITEM} of ${SHOTS_PER_ITEM} screenshots. That is the most a task can have.`
              : `${saved} of ${SHOTS_PER_ITEM} screenshots on this task. Employers see them on your portfolio.`}
          </p>
          <div className="pq__actions">
            <button type="button" className="pq__btn pq__btn--primary" onClick={close}>
              Continue
            </button>
            <Link href="/academy/portfolio" className="pq__btn" onClick={close}>
              See your portfolio
            </Link>
          </div>
        </div>
      )}
    </dialog>
  );
}
