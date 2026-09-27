"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, X } from "lucide-react";
import { academyFetch } from "@/lib/academy-client";
import { SHOTS_PER_ITEM, TRACK_LABEL, type StarPart, type Track, type WorkItem } from "@/lib/academy-proof";
// Imported here, not in globals.css, so the styles always arrive with the component.
import "./proof-editor.css";

type Settings = { slug: string; displayName: string; published: boolean; showSkills: boolean; shotsOn: string[]; credentialId: string };
type Shot = { id: string; job: string; caption: string };
type Data = {
  items: WorkItem[];
  skills: { group: string; items: string[] }[];
  roleName: string | null;
  track: Track;
  settings: Settings;
  saved: boolean;
  shots: Shot[];
  blockers: string[];
};

const TRACKS: Track[] = ["soc", "help", "sys"];
const plain = (parts: StarPart[]) => parts.map((p) => p[1]).join(" ");

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// The student's own side of the Proof Profile: sharing, resume bullets,
// skills and screenshots. Employers see the public page at /p/<slug>.
export function ProofEditor() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [track, setTrack] = useState<Track>("soc");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [urls, setUrls] = useState<Record<string, string>>({});
  const urlsRef = useRef(urls);
  useEffect(() => {
    urlsRef.current = urls;
  }, [urls]);

  const fetchData = useCallback(async (): Promise<Data | string> => {
    const res = await academyFetch("/academy/api/proof");
    const body = (await res.json().catch(() => null)) as Data | { error?: string } | null;
    if (!res.ok || !body || !("items" in body)) return (body && "error" in body && body.error) || "Unable to load your profile. Try again later.";
    return body;
  }, []);

  const apply = useCallback((body: Data | string, first = false) => {
    if (typeof body === "string") {
      setError(body);
      return;
    }
    setData(body);
    setName(body.settings.displayName);
    setSlug(body.settings.slug);
    if (first) setTrack(body.track);
  }, []);

  const load = useCallback(async () => apply(await fetchData()), [apply, fetchData]);

  useEffect(() => {
    fetchData().then((b) => apply(b, true));
  }, [apply, fetchData]);

  // Screenshots need the Bearer token, so each one is fetched into a blob URL.
  useEffect(() => {
    if (!data) return;
    let stop = false;
    for (const s of data.shots) {
      if (urlsRef.current[s.id]) continue;
      academyFetch(`/academy/api/proof/shot?id=${encodeURIComponent(s.id)}`)
        .then((r) => (r.ok ? r.blob() : null))
        .then((b) => {
          if (b && !stop) setUrls((u) => ({ ...u, [s.id]: URL.createObjectURL(b) }));
        })
        .catch(() => {});
    }
    return () => {
      stop = true;
    };
  }, [data]);

  useEffect(() => () => Object.values(urlsRef.current).forEach((u) => URL.revokeObjectURL(u)), []);

  async function save(patch: Partial<Settings>, done?: string) {
    if (!data) return;
    setBusy(true);
    setNote(null);
    const res = await academyFetch("/academy/api/proof", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data.settings, displayName: name, slug, ...patch }),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    if (!res.ok) {
      setNote(body.error || "Unable to save. Try again.");
      return;
    }
    await load();
    if (done) setNote(done);
  }

  async function upload(job: string, files: FileList | null) {
    if (!data || !files?.length) return;
    const room = SHOTS_PER_ITEM - data.shots.filter((s) => s.job === job).length;
    setBusy(true);
    setNote(null);
    for (const file of Array.from(files).slice(0, Math.max(0, room))) {
      const form = new FormData();
      form.append("job", job);
      form.append("file", file);
      const res = await academyFetch("/academy/api/proof", { method: "POST", body: form });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setNote(body.error || "Unable to upload that screenshot.");
        break;
      }
    }
    setBusy(false);
    await load();
  }

  async function remove(id: string) {
    setBusy(true);
    await academyFetch(`/academy/api/proof?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    setBusy(false);
    await load();
  }

  if (error) return <p className="pf-error">{error}</p>;
  if (!data) {
    return (
      <div className="pf-loading">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  const { settings, items } = data;
  const link = `purvex.io/p/${settings.slug}`;
  const skillsText = data.skills.map((g) => `${g.group}: ${g.items.join(", ")}`).join("\n");

  return (
    <div className="pf rd">
      <header className="pf-head">
        <p className="rd-kicker">Proof profile</p>
        <h1>Show employers your lab work</h1>
        <p className="pf-lede">Every item comes from a fix your lab confirmed. Share the link on applications, your resume and LinkedIn.</p>
      </header>

      {!items.length ? (
        <section className="pf-sec">
          <h2>Nothing to show yet</h2>
          <p>Your profile fills in as the lab confirms your work. Finish a lab task in the daily drill, or a ticket in the Ticket Queue.</p>
          <Link href="/academy/drill" className="pf-btn pf-btn--primary">
            Go to the daily drill
          </Link>
        </section>
      ) : (
        <>
          <section className="pf-sec">
            <div className="pf-sec__top">
              <h2>Share your profile</h2>
              <span className={`pf-status${settings.published ? " is-on" : ""}`}>{settings.published ? "Shared" : "Not shared"}</span>
            </div>
            <div className="pf-fields">
              <label>
                <span>Name employers see</span>
                <input value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
              </label>
              <label>
                <span>Your link</span>
                <div className="pf-slug">
                  <em>purvex.io/p/</em>
                  <input value={slug} maxLength={40} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} />
                </div>
              </label>
            </div>
            {data.blockers.length > 0 && (
              <ul className="pf-blockers">
                {data.blockers.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            )}
            <div className="pf-row">
              {settings.published ? (
                <>
                  <button type="button" className="pf-btn pf-btn--primary" disabled={busy} onClick={async () => setNote((await copyText(`https://${link}`)) ? "Link copied" : "Select the link and copy it")}>
                    Copy link
                  </button>
                  <a className="pf-btn" href={`/p/${settings.slug}`} target="_blank" rel="noreferrer">
                    View as an employer
                  </a>
                  <button type="button" className="pf-btn" disabled={busy} onClick={() => save({}, "Saved")}>
                    Save changes
                  </button>
                  <button type="button" className="pf-btn pf-btn--danger" disabled={busy} onClick={() => save({ published: false }, "Sharing turned off. Your link no longer works.")}>
                    Turn off sharing
                  </button>
                </>
              ) : (
                <button type="button" className="pf-btn pf-btn--primary" disabled={busy || data.blockers.length > 0} onClick={() => save({ published: true }, "Your profile is shared.")}>
                  Share my profile
                </button>
              )}
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            {settings.published && (
              <p className="pf-hint">
                <code>{link}</code> · Credential <code>{settings.credentialId}</code>
              </p>
            )}
            {note && <p className="pf-note">{note}</p>}
          </section>

          <section className="pf-sec">
            <h2>Resume bullets</h2>
            <p>Each bullet opens with an action verb and follows STAR. Pick the role you are applying for.</p>
            <div className="pf-seg" role="group" aria-label="Role">
              {TRACKS.map((t) => (
                <button key={t} type="button" aria-pressed={track === t} onClick={() => setTrack(t)}>
                  {TRACK_LABEL[t]}
                </button>
              ))}
            </div>
            <ul className="pf-bullets">
              {items.map((it) => (
                <li key={it.job}>
                  <p>
                    {it.bullets[track].map(([k, text], i) => (
                      <span key={i} className={`pf-s pf-s--${k}`}>
                        {text}
                        {i < it.bullets[track].length - 1 ? " " : ""}
                      </span>
                    ))}
                  </p>
                  <button type="button" className="pf-btn" onClick={async () => setNote((await copyText(plain(it.bullets[track]))) ? "Bullet copied" : "Select the text and copy it")}>
                    Copy
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {data.skills.length > 0 && (
            <section className="pf-sec">
              <div className="pf-sec__top">
                <h2>Skills section</h2>
                <label className="pf-toggle">
                  <input type="checkbox" checked={settings.showSkills} disabled={busy} onChange={(e) => save({ showSkills: e.target.checked })} />
                  Show on profile
                </label>
              </div>
              <p>Keywords applicant tracking systems scan for, from work you did in the Academy.</p>
              <div className="pf-ats">
                <p>
                  {data.skills.map((g) => (
                    <span key={g.group}>
                      <b>{g.group}:</b> {g.items.join(", ")}
                      <br />
                    </span>
                  ))}
                </p>
                <button type="button" className="pf-btn" onClick={async () => setNote((await copyText(skillsText)) ? "Skills copied" : "Select the text and copy it")}>
                  Copy
                </button>
              </div>
            </section>
          )}

          <section className="pf-sec">
            <h2>Screenshots</h2>
            <p>Optional. Turn them on for any lab task, then add {SHOTS_PER_ITEM}. Employers swipe through them on that task.</p>
            <ul className="pf-shots">
              {items.map((it) => {
                const on = settings.shotsOn.includes(it.job);
                const mine = data.shots.filter((s) => s.job === it.job);
                const inputId = `pf-shot-${it.job}`;
                return (
                  <li key={it.job} className={on ? "is-on" : ""}>
                    <div className="pf-shots__head">
                      <span>
                        {it.title}
                        <small className={on ? (mine.length >= SHOTS_PER_ITEM ? "is-done" : "is-short") : ""}>
                          {on ? (mine.length >= SHOTS_PER_ITEM ? `${SHOTS_PER_ITEM} of ${SHOTS_PER_ITEM} · complete` : `${mine.length} of ${SHOTS_PER_ITEM}`) : "Off"}
                        </small>
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={on}
                        aria-label={`Screenshots for ${it.title}`}
                        className="pf-switch"
                        disabled={busy}
                        onClick={() => save({ shotsOn: on ? settings.shotsOn.filter((j) => j !== it.job) : [...settings.shotsOn, it.job] })}
                      />
                    </div>
                    {on && (
                      <div className="pf-thumbs">
                        {mine.map((s, j) => (
                          <div key={s.id} className="pf-thumb">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {urls[s.id] ? <img src={urls[s.id]} alt="" /> : <span />}
                            <button type="button" aria-label={`Remove screenshot ${j + 1}`} disabled={busy} onClick={() => remove(s.id)}>
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        {mine.length < SHOTS_PER_ITEM && (
                          <>
                            <label className="pf-add" htmlFor={inputId}>
                              + Add {SHOTS_PER_ITEM - mine.length}
                            </label>
                            <input id={inputId} type="file" accept="image/png,image/jpeg" multiple hidden onChange={(e) => upload(it.job, e.target.files).then(() => (e.target.value = ""))} />
                          </>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
