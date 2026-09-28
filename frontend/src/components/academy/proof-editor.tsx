"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, X } from "lucide-react";
import { academyFetch } from "@/lib/academy-client";
import { AVAILABILITY, CERT_STATUS_LABEL, CLEARANCE, WORK_AUTH, CERT_SUGGESTIONS, certStatusText, openTasks, SHOTS_PER_ITEM, TRACK_LABEL, type ExtraCert, type StarPart, type Track, type WorkItem } from "@/lib/academy-proof";
import { useAcademyGoals } from "@/components/academy/academy-account";
import { ProofPublicView } from "@/components/proof/proof-public-view";
// Imported here, not in globals.css, so the styles always arrive with the component.
import "./proof-editor.css";

const withScheme = (url: string) => (url ? (/^https?:\/\//i.test(url) ? url : `https://${url}`) : null);

type Settings = {
  slug: string;
  displayName: string;
  published: boolean;
  showSkills: boolean;
  shotsOn: string[];
  avatarPath?: string | null;
  resumePath?: string | null;
  contactEmail?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  websiteUrl?: string | null;
  location?: string | null;
  availability?: string | null;
  workAuth?: string | null;
  clearance?: string | null;
  extraCerts?: ExtraCert[];
  credentialId: string;
};
type Shot = { id: string; job: string; caption: string };
type Data = {
  items: WorkItem[];
  skills: { group: string; items: string[] }[];
  roleName: string | null;
  roleNames: string[];
  certs: { name: string; status: string }[];
  lastLabCheck: string | null;
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

// The student's side of their portfolio: sharing, resume bullets, skills and
// screenshots, plus a preview of the page employers see at /p/<slug>.
export function ProofEditor() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ text: string; bad: boolean } | null>(null);
  const [view, setView] = useState<"edit" | "employer">("edit");
  const say = (text: string, bad = false) => setNote({ text, bad });
  useEffect(() => {
    if (!note) return;
    const t = window.setTimeout(() => setNote(null), note.bad ? 7000 : 3500);
    return () => window.clearTimeout(t);
  }, [note]);
  const [track, setTrack] = useState<Track>("soc");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [avatar, setAvatar] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [contact, setContact] = useState({ contactEmail: "", linkedinUrl: "", githubUrl: "", websiteUrl: "", location: "", availability: "", workAuth: "", clearance: "" });
  const { editGoals } = useAcademyGoals();
  const [certDraft, setCertDraft] = useState<ExtraCert>({ name: "", status: "earned", date: "" });
  const urlsRef = useRef(urls);
  useEffect(() => {
    urlsRef.current = urls;
  }, [urls]);

  const fetchData = useCallback(async (): Promise<Data | string> => {
    const res = await academyFetch("/academy/api/proof");
    const body = (await res.json().catch(() => null)) as Data | { error?: string } | null;
    if (!res.ok || !body || !("items" in body)) return (body && "error" in body && body.error) || "Unable to load your portfolio. Try again later.";
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
    setContact({
      contactEmail: body.settings.contactEmail ?? "",
      linkedinUrl: body.settings.linkedinUrl ?? "",
      githubUrl: body.settings.githubUrl ?? "",
      websiteUrl: body.settings.websiteUrl ?? "",
      location: body.settings.location ?? "",
      availability: body.settings.availability ?? "",
      workAuth: body.settings.workAuth ?? "",
      clearance: body.settings.clearance ?? "",
    });
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

  const avatarPath = data?.settings.avatarPath ?? null;
  useEffect(() => {
    let url: string | null = null;
    let stop = false;
    if (avatarPath) {
      academyFetch("/academy/api/proof/shot?avatar=1")
        .then((r) => (r.ok ? r.blob() : null))
        .then((b) => {
          if (!b || stop) return;
          url = URL.createObjectURL(b);
          setAvatar(url);
        })
        .catch(() => {});
    }
    return () => {
      stop = true;
      if (url) URL.revokeObjectURL(url);
      setAvatar(null);
    };
  }, [avatarPath]);

  const resumePath = data?.settings.resumePath ?? null;
  useEffect(() => {
    let url: string | null = null;
    let stop = false;
    if (resumePath) {
      academyFetch("/academy/api/proof/shot?resume=1")
        .then((r) => (r.ok ? r.blob() : null))
        .then((b) => {
          if (!b || stop) return;
          url = URL.createObjectURL(b);
          setResumeUrl(url);
        })
        .catch(() => {});
    }
    return () => {
      stop = true;
      if (url) URL.revokeObjectURL(url);
      setResumeUrl(null);
    };
  }, [resumePath]);

  async function save(patch: Partial<Settings>, done?: string) {
    if (!data) return;
    setBusy(true);
    setNote(null);
    const res = await academyFetch("/academy/api/proof", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data.settings, displayName: name, slug, ...contact, ...patch }),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    if (!res.ok) {
      say(body.error || "Unable to save. Try again.", true);
      return;
    }
    await load();
    if (done) say(done);
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
        say(body.error || "Unable to upload that screenshot.", true);
        break;
      }
    }
    setBusy(false);
    await load();
  }

  async function uploadFile(kind: "avatar" | "resume", files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    const what = kind === "avatar" ? "photo" : "resume";
    setBusy(true);
    const form = new FormData();
    form.append("kind", kind);
    form.append("file", file);
    const res = await academyFetch("/academy/api/proof", { method: "POST", body: form });
    setBusy(false);
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      say(body.error || `Unable to save your ${what}.`, true);
      return;
    }
    await load();
    say(kind === "avatar" ? "Photo saved" : "Resume saved");
  }

  async function removeFile(kind: "avatar" | "resume") {
    setBusy(true);
    const res = await academyFetch(`/academy/api/proof?${kind}=1`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) say(`Unable to remove your ${kind === "avatar" ? "photo" : "resume"}. Try again.`, true);
    await load();
  }

  async function remove(id: string) {
    setBusy(true);
    const res = await academyFetch(`/academy/api/proof?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) say("Unable to remove that screenshot. Try again.", true);
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
  const todo = openTasks(items.map((i) => i.job));
  const todoSection = todo.length > 0 && (
    <section className="pf-sec">
      <h2>Tasks you can still add</h2>
      <p>Each one joins your portfolio once your lab confirms it. Your lab must be connected, with the lab light green.</p>
      <ul className="pf-todo">
        {todo.map((t) => (
          <li key={t.job}>
            <span>
              {t.title}
              <small>{t.where}</small>
            </span>
            <Link href={t.href} className="pf-btn">
              Do it
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );

  return (
    <div className="pf rd">
      <header className="pf-head">
        <p className="rd-kicker">Portfolio</p>
        <h1>Show employers your lab work</h1>
        <p className="pf-lede">Every item comes from a fix your lab confirmed. Share the link on applications, your resume and LinkedIn.</p>
      </header>

      {items.length > 0 && (
        <div className="pf-views" role="tablist" aria-label="View">
          <button type="button" role="tab" aria-selected={view === "edit"} onClick={() => setView("edit")}>
            Portfolio
          </button>
          <button type="button" role="tab" aria-selected={view === "employer"} onClick={() => setView("employer")}>
            Employer
          </button>
        </div>
      )}

      {items.length > 0 && view === "employer" ? (
        <section className="pf-preview">
          {settings.published && (
            <div className="pf-preview__bar">
              <a className="pf-btn" href={`/p/${settings.slug}`} target="_blank" rel="noreferrer">
                View as an employer
              </a>
            </div>
          )}
          <ProofPublicView
            settings={{
              ...settings,
              displayName: name || settings.displayName,
              slug: slug || settings.slug,
              contactEmail: contact.contactEmail || null,
              linkedinUrl: withScheme(contact.linkedinUrl),
              githubUrl: withScheme(contact.githubUrl),
              websiteUrl: withScheme(contact.websiteUrl),
              location: contact.location || null,
              availability: contact.availability || null,
              workAuth: contact.workAuth || null,
              clearance: contact.clearance || null,
              updatedAt: "",
            }}
            data={{ items, skills: data.skills, roleName: data.roleName, roleNames: data.roleNames, certs: data.certs, lastLabCheck: data.lastLabCheck, shots: data.shots }}
            shotSrc={(id) => urls[id] ?? ""}
            printable={false}
            avatarSrc={avatar}
            resumeHref={resumeUrl}
          />
        </section>
      ) : !items.length ? (
        <>
          <section className="pf-sec">
            <h2>Nothing to show yet</h2>
            <p>Your portfolio fills in as the lab confirms your work. Pick a task below. Your lab must be connected, with the lab light green.</p>
          </section>
          {todoSection}
        </>
      ) : (
        <>
          <section className="pf-sec">
            <h2>Share your portfolio</h2>
            <div className="pf-share">
              <div className="pf-vis">
                <div>
                  <b>{settings.published ? "Public" : "Private"}</b>
                  <small>
                    {settings.published
                      ? "Anyone with your link or QR code can see your portfolio, and your credential shows as valid."
                      : "Only you can see your portfolio. Your link shows nothing and your credential shows as not active."}
                  </small>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.published}
                  aria-label="Make my portfolio public"
                  className="pf-switch"
                  disabled={busy || (!settings.published && data.blockers.length > 0)}
                  onClick={() => save({ published: !settings.published }, settings.published ? "Your portfolio is private. Your link no longer works." : "Your portfolio is public.")}
                />
              </div>
              {!settings.published && data.blockers.length > 0 && (
                <div className="pf-blockers">
                  <b>Before you can make it public:</b>
                  <ul>
                    {data.blockers.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="pf-share__link">
                <div className="pf-slug">
                  <em>purvex.io/p/</em>
                  <input value={slug} maxLength={40} aria-label="Your link" onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} />
                  {slug !== settings.slug ? (
                    <button type="button" className="pf-slug__copy" disabled={busy || !slug} onClick={() => save({}, "Link saved")}>
                      Save
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="pf-slug__copy"
                      onClick={async () => say((await copyText(`https://${link}`)) ? (settings.published ? "Link copied" : "Link copied. It works once your portfolio is public.") : "Select the link and copy it")}
                    >
                      Copy
                    </button>
                  )}
                </div>
                <a
                  className="pf-btn"
                  href={`/p/${settings.slug}/qr`}
                  download={`purvex-portfolio-${settings.slug}.png`}
                  title="A QR code that opens your portfolio from a phone camera"
                  onClick={() => say(settings.published ? "QR code downloaded" : "QR code downloaded. It opens your portfolio once you make it public.")}
                >
                  Download QR code
                </a>
              </div>
            </div>
          </section>

          <section className="pf-sec">
            <h2>Your details</h2>
            <p>Shown on your portfolio so an employer can reach you. Leave anything blank to hide it.</p>
            <div className="pf-photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {avatar ? <img src={avatar} alt="Your profile photo" /> : <span aria-hidden="true">{(name || "?").trim().charAt(0).toUpperCase()}</span>}
              <div>
                <b>Profile photo</b>
                <small>Optional. A clear headshot, PNG or JPEG under 4 MB.</small>
                <div className="pf-photo__actions">
                  <label className="pf-btn" htmlFor="pf-photo-file">
                    {settings.avatarPath ? "Change photo" : "Upload photo"}
                  </label>
                  <input id="pf-photo-file" type="file" accept="image/png,image/jpeg" hidden disabled={busy} onChange={(e) => uploadFile("avatar", e.target.files).then(() => (e.target.value = ""))} />
                  {settings.avatarPath && (
                    <button type="button" className="pf-btn" disabled={busy} onClick={() => removeFile("avatar")}>
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="pf-fields">
              <label>
                <span>Name employers see</span>
                <input value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
              </label>
              <label>
                <span>Email for employers</span>
                <input type="email" value={contact.contactEmail} maxLength={120} placeholder="name@example.com" onChange={(e) => setContact({ ...contact, contactEmail: e.target.value })} />
              </label>
              <label>
                <span>LinkedIn profile</span>
                <input value={contact.linkedinUrl} maxLength={200} placeholder="linkedin.com/in/your-name" onChange={(e) => setContact({ ...contact, linkedinUrl: e.target.value })} />
              </label>
              <label>
                <span>GitHub profile</span>
                <input value={contact.githubUrl} maxLength={200} placeholder="github.com/your-name" onChange={(e) => setContact({ ...contact, githubUrl: e.target.value })} />
              </label>
              <label>
                <span>Website or blog</span>
                <input value={contact.websiteUrl} maxLength={200} placeholder="yourname.com" onChange={(e) => setContact({ ...contact, websiteUrl: e.target.value })} />
              </label>
              <label>
                <span>Where you can work</span>
                <input value={contact.location} maxLength={60} placeholder="Remote or Dallas, TX" onChange={(e) => setContact({ ...contact, location: e.target.value })} />
              </label>
              <label>
                <span>When you can start</span>
                <select value={contact.availability} onChange={(e) => setContact({ ...contact, availability: e.target.value })}>
                  <option value="">Do not show</option>
                  {AVAILABILITY.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Work authorization</span>
                <select value={contact.workAuth} onChange={(e) => setContact({ ...contact, workAuth: e.target.value })}>
                  <option value="">Do not show</option>
                  {WORK_AUTH.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Security clearance</span>
                <select value={contact.clearance} onChange={(e) => setContact({ ...contact, clearance: e.target.value })}>
                  <option value="">Do not show</option>
                  {CLEARANCE.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="pf-file">
              <div>
                <b>Resume</b>
                <small>{settings.resumePath ? "Employers can download it from your portfolio." : "Optional. A PDF under 4 MB."}</small>
              </div>
              <div className="pf-row">
                {resumeUrl && (
                  <a className="pf-btn" href={resumeUrl} target="_blank" rel="noreferrer">
                    View
                  </a>
                )}
                <label className="pf-btn" htmlFor="pf-resume-file">
                  {settings.resumePath ? "Replace PDF" : "Upload PDF"}
                </label>
                <input id="pf-resume-file" type="file" accept="application/pdf" hidden disabled={busy} onChange={(e) => uploadFile("resume", e.target.files).then(() => (e.target.value = ""))} />
                {settings.resumePath && (
                  <button type="button" className="pf-btn" disabled={busy} onClick={() => removeFile("resume")}>
                    Remove
                  </button>
                )}
              </div>
            </div>
            <div className="pf-certs">
              <div className="pf-certs__head">
                <div>
                  <b>Certifications</b>
                  <small>Security+ and CySA+ come from your Goals. Add any others here.</small>
                </div>
                <button type="button" className="pf-btn" onClick={editGoals}>
                  Update in Goals
                </button>
              </div>
              {(data.certs.length > 0 || (settings.extraCerts ?? []).length > 0) && (
                <ul>
                  {data.certs.map((c) => (
                    <li key={c.name}>
                      <span>{c.name}</span>
                      <em>{c.status}</em>
                      <small>From Goals</small>
                    </li>
                  ))}
                  {(settings.extraCerts ?? []).map((c, i) => (
                    <li key={`${c.name}-${i}`}>
                      <span>{c.name}</span>
                      <em>{certStatusText(c)}</em>
                      <button
                        type="button"
                        className="pf-link"
                        disabled={busy}
                        onClick={() => save({ extraCerts: (settings.extraCerts ?? []).filter((_, j) => j !== i) }, "Certification removed")}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="pf-certs__add">
                <input
                  list="pf-cert-suggestions"
                  value={certDraft.name}
                  maxLength={80}
                  placeholder="Add a certification, e.g. CompTIA A+"
                  aria-label="Certification name"
                  onChange={(e) => setCertDraft({ ...certDraft, name: e.target.value })}
                />
                <datalist id="pf-cert-suggestions">
                  {CERT_SUGGESTIONS.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
                <select aria-label="Status" value={certDraft.status} onChange={(e) => setCertDraft({ ...certDraft, status: e.target.value as ExtraCert["status"] })}>
                  {(Object.keys(CERT_STATUS_LABEL) as ExtraCert["status"][]).map((k) => (
                    <option key={k} value={k}>
                      {CERT_STATUS_LABEL[k]}
                    </option>
                  ))}
                </select>
                {certDraft.status !== "studying" && (
                  <input
                    type="date"
                    aria-label={certDraft.status === "earned" ? "Date earned" : "Exam date"}
                    value={certDraft.date ?? ""}
                    onChange={(e) => setCertDraft({ ...certDraft, date: e.target.value })}
                  />
                )}
                <button
                  type="button"
                  className="pf-btn"
                  disabled={busy || !certDraft.name.trim() || (settings.extraCerts ?? []).length >= 12}
                  onClick={async () => {
                    const next: ExtraCert = { name: certDraft.name.trim(), status: certDraft.status, ...(certDraft.date && certDraft.status !== "studying" ? { date: certDraft.date } : {}) };
                    await save({ extraCerts: [...(settings.extraCerts ?? []), next] }, "Certification added");
                    setCertDraft({ name: "", status: "earned", date: "" });
                  }}
                >
                  Add
                </button>
              </div>
            </div>
            <div className="pf-row">
              <button type="button" className="pf-btn pf-btn--primary" disabled={busy} onClick={() => save({}, "Saved")}>
                Save details
              </button>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
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
                  <button type="button" className="pf-btn" onClick={async () => say((await copyText(plain(it.bullets[track]))) ? "Bullet copied" : "Select the text and copy it")}>
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
              <p>Keywords applicant tracking systems scan for, from work you did in PurveX Range.</p>
              <div className="pf-ats">
                <p>
                  {data.skills.map((g) => (
                    <span key={g.group}>
                      <b>{g.group}:</b> {g.items.join(", ")}
                      <br />
                    </span>
                  ))}
                </p>
                <button type="button" className="pf-btn" onClick={async () => say((await copyText(skillsText)) ? "Skills copied" : "Select the text and copy it")}>
                  Copy
                </button>
              </div>
            </section>
          )}

          <section className="pf-sec">
            <h2>Screenshots</h2>
            <p>Optional. Turn them on for any lab task and add up to {SHOTS_PER_ITEM}. Employers click through them on that task.</p>
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
                        <small className={on && mine.length ? "is-done" : ""}>
                          {on ? (mine.length ? `${mine.length} of ${SHOTS_PER_ITEM} screenshot${mine.length === 1 ? "" : "s"}` : "On · add a screenshot") : "Off"}
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
                              + Add
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
          {todoSection}
        </>
      )}
      {note && (
        <p className={`pf-toast${note.bad ? " is-bad" : ""}`} role={note.bad ? "alert" : "status"}>
          {note.text}
        </p>
      )}
    </div>
  );
}
