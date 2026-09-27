import { ProofGallery } from "@/components/proof/proof-gallery";
import { certStatusText, SHOTS_PER_ITEM } from "@/lib/academy-proof";
import type { ProofData } from "@/lib/academy-proof-data";
import type { ProofSettings } from "@/lib/academy-proof-store";
import "./proof-public.css";

const day = (iso: string) => (iso ? new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "");

// The page employers see. Pure display, fed by /p/[slug] and by the student's own preview.
type Shot = { id: string; job: string; caption: string };

export function ProofPublicView({
  settings,
  data,
  shotSrc = (id) => `/p/${settings.slug}/shot/${id}`,
  avatarSrc = null,
  resumeHref = settings.resumePath ? `/p/${settings.slug}/resume` : null,
}: {
  settings: ProofSettings;
  data: Pick<ProofData, "items" | "skills" | "roleName" | "lastLabCheck"> & Partial<Pick<ProofData, "roleNames" | "certs">> & { shots: Shot[] };
  /** Where each screenshot loads from. The student's own preview uses blob URLs. */
  shotSrc?: (id: string) => string;
  /** The student's profile photo, when they added one. */
  avatarSrc?: string | null;
  /** Where the resume downloads from, when the student added one. */
  resumeHref?: string | null;
}) {
  const first = settings.displayName.split(" ")[0];
  const roles = data.roleNames ?? [];
  const certs = [...(data.certs ?? []), ...(settings.extraCerts ?? []).map((c) => ({ name: c.name, status: certStatusText(c) }))];
  const openTo = [
    roles.length ? `Open to ${roles.length > 1 ? `${roles.slice(0, -1).join(", ")} and ${roles.at(-1)}` : roles[0]} roles` : "",
    settings.location ?? "",
    settings.availability ?? "",
  ].filter(Boolean).join(" · ");

  const shotsFor = (job: string) => {
    if (!settings.shotsOn.includes(job)) return [];
    const list = data.shots.filter((s) => s.job === job);
    return list.length >= SHOTS_PER_ITEM ? list.slice(0, SHOTS_PER_ITEM) : [];
  };

  return (
    <main className="pp">
      <div className="pp__wrap">
        <header className={`pp-head${avatarSrc ? " pp-head--photo" : ""}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {avatarSrc && <img className="pp-avatar" src={avatarSrc} alt={settings.displayName} />}
          <div>
            <p className="pp-kicker">PurveX Academy</p>
            <h1>{settings.displayName}</h1>
            {data.roleName && <p className="pp-role">{data.roleName} candidate</p>}
            {openTo && <p className="pp-open">{openTo}</p>}
            {(settings.contactEmail || settings.linkedinUrl || resumeHref) && (
              <div className="pp-contact">
                {settings.contactEmail && (
                  <a className="pp-btn pp-btn--primary" href={`mailto:${settings.contactEmail}?subject=${encodeURIComponent(`Your PurveX portfolio`)}`}>
                    Contact {first}
                  </a>
                )}
                {settings.linkedinUrl && (
                  <a className="pp-btn" href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer">
                    LinkedIn
                  </a>
                )}
                {resumeHref && (
                  <a className="pp-btn" href={resumeHref} download>
                    Download resume
                  </a>
                )}
              </div>
            )}
            {data.lastLabCheck && <p className="pp-checked">Lab last checked {new Date(data.lastLabCheck).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>}
          </div>
        </header>

        {certs.length > 0 && (
          <section className="pp-sec">
            <h2>Certifications</h2>
            <ul className="pp-certs">
              {certs.map((c) => (
                <li key={c.name}>
                  <b>{c.name}</b>
                  <span className={c.status.startsWith("Certified") ? "is-done" : ""}>{c.status}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="pp-sec">
          <h2>Lab work</h2>
          <p className="pp-note">
            {first} ran an Active Directory domain for a simulated wealth firm. Each item was checked in {first}&rsquo;s own lab.
          </p>
          <ul className="pp-list">
            {data.items.map((it) => {
              const shots = shotsFor(it.job);
              return (
                <li key={it.job}>
                  <div>
                    <b>{it.title}</b>
                    <div className="pp-act">
                      <i>{it.actions.length > 1 ? "Actions" : "Action"}</i>
                      {it.actions.length > 1 ? (
                        <ul>
                          {it.actions.map((a) => (
                            <li key={a}>{a}</li>
                          ))}
                        </ul>
                      ) : (
                        <span>{it.actions[0]}</span>
                      )}
                    </div>
                    <ProofGallery
                      title={it.title}
                      shots={shots.map((s) => ({ src: shotSrc(s.id), caption: s.caption }))}
                    />
                  </div>
                  <em>✓ {day(it.date)}</em>
                </li>
              );
            })}
          </ul>
        </section>

        {settings.showSkills && data.skills.length > 0 && (
          <section className="pp-sec">
            <h2>Skills</h2>
            <div className="pp-skills">
              {data.skills.map((g) => (
                <div key={g.group}>
                  <h3>{g.group}</h3>
                  <ul>
                    {g.items.map((k) => (
                      <li key={k}>{k}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        <footer className="pp-foot">
          {settings.credentialId ? (
            <span>
              Credential <code>{settings.credentialId}</code> · <a href={`/verify/${settings.credentialId}`}>Verify</a>
            </span>
          ) : (
            <span />
          )}
          <span>Issued by PurveX Academy</span>
        </footer>
      </div>
    </main>
  );
}
