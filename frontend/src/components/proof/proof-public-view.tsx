import type { ReactNode } from "react";
import { ProofGallery } from "@/components/proof/proof-gallery";
import { ProofPrintButton } from "@/components/proof/proof-print-button";
import { certStatusText, SHOTS_PER_ITEM } from "@/lib/academy-proof";
import type { ProofData } from "@/lib/academy-proof-data";
import type { ProofSettings } from "@/lib/academy-proof-store";
import "./proof-public.css";

const day = (iso: string) => (iso ? new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "");
const list = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}` : (xs[0] ?? ""));

const Icon = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    {children}
  </svg>
);
const MAIL = (
  <Icon>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </Icon>
);
const FILE = (
  <Icon>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M12 18v-6" />
    <path d="m9 15 3 3 3-3" />
  </Icon>
);
const DOWNLOAD = (
  <Icon>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="m7 10 5 5 5-5" />
    <path d="M12 15V3" />
  </Icon>
);
const SOCIAL = {
  linkedin: (
    <Icon>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </Icon>
  ),
  github: (
    <Icon>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </Icon>
  ),
  website: (
    <Icon>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </Icon>
  ),
};

// The page employers see. Pure display, fed by /p/[slug] and by the student's own preview.
type Shot = { id: string; job: string; caption: string };

export function ProofPublicView({
  settings,
  data,
  shotSrc = (id) => `/p/${settings.slug}/shot/${id}`,
  avatarSrc = null,
  resumeHref = settings.resumePath ? `/p/${settings.slug}/resume` : null,
  printable = true,
}: {
  settings: ProofSettings;
  data: Pick<ProofData, "items" | "skills" | "roleName" | "lastLabCheck"> & Partial<Pick<ProofData, "roleNames" | "certs">> & { shots: Shot[] };
  /** Where each screenshot loads from. The student's own preview uses blob URLs. */
  shotSrc?: (id: string) => string;
  /** The student's profile photo, when they added one. */
  avatarSrc?: string | null;
  /** Where the resume downloads from, when the student added one. */
  resumeHref?: string | null;
  /** Shows the Save as PDF button. Off in the student's own preview. */
  printable?: boolean;
}) {
  const first = settings.displayName.split(" ")[0];
  const roles = data.roleNames ?? [];
  const certs = [...(data.certs ?? []), ...(settings.extraCerts ?? []).map((c) => ({ name: c.name, status: certStatusText(c) }))];
  const openTo = roles.length ? `Open to ${list(roles)} roles` : "";
  const where = [settings.location ?? "", settings.availability ?? ""].filter(Boolean).join(" · ");
  const eligible = [settings.workAuth ?? "", settings.clearance ?? ""].filter(Boolean).join(" · ");
  const mailto = settings.contactEmail ? `mailto:${settings.contactEmail}?subject=${encodeURIComponent("Your PurveX portfolio")}` : null;
  const socials = [
    { key: "linkedin", href: settings.linkedinUrl, label: "LinkedIn" },
    { key: "github", href: settings.githubUrl, label: "GitHub" },
    { key: "website", href: settings.websiteUrl, label: "Website" },
  ].filter((s): s is { key: keyof typeof SOCIAL; href: string; label: string } => Boolean(s.href));
  const canReach = Boolean(mailto || resumeHref || socials.length);

  const shotsFor = (job: string) => {
    if (!settings.shotsOn.includes(job)) return [];
    const mine = data.shots.filter((s) => s.job === job);
    return mine.slice(0, SHOTS_PER_ITEM);
  };

  const actions = (
    <>
      {mailto && (
        <a className="pp-btn pp-btn--primary" href={mailto}>
          {MAIL}
          Contact {first}
        </a>
      )}
      {resumeHref && (
        <a className="pp-btn" href={resumeHref} download>
          {DOWNLOAD}
          Download resume
        </a>
      )}
    </>
  );

  return (
    <main className="pp">
      <div className="pp__wrap">
        <header className="pp-head">
          <div className="pp-id">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {avatarSrc && <img className="pp-avatar" src={avatarSrc} alt={settings.displayName} />}
            <div>
              <h1>{settings.displayName}</h1>
              {data.roleName && <p className="pp-role">{data.roleName} candidate</p>}
              {(where || settings.contactEmail) && (
                <p className="pp-open">
                  {[where, settings.contactEmail ?? ""].filter(Boolean).join(" · ")}
                </p>
              )}
              {openTo && <p className="pp-open">{openTo}</p>}
              {eligible && <p className="pp-open">{eligible}</p>}
            </div>
          </div>
          {(canReach || printable) && (
            <div className="pp-reach">
              {actions}
              {printable && <ProofPrintButton>{FILE}Save as PDF</ProofPrintButton>}
              {socials.map((s) => (
                <a key={s.key} className="pp-icon" href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`${first} on ${s.label}`} title={s.label}>
                  {SOCIAL[s.key]}
                </a>
              ))}
            </div>
          )}
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
          <h2>Hands-on experience</h2>
          <p className="pp-note">
            {first} completed this work in a live Active Directory environment modeled on a wealth-management firm. Each task was verified automatically in their own lab.
            {data.lastLabCheck && ` Last verified ${day(data.lastLabCheck)}.`}
          </p>
          <ul className="pp-jobs">
            {data.items.map((it) => {
              const shots = shotsFor(it.job);
              return (
                <li key={it.job} className={shots.length ? "has-shots" : ""}>
                  <div className="pp-job">
                    <h3>{it.title}</h3>
                    <ul className="pp-act">
                      {it.actions.map((a) => (
                        <li key={a}>{a}</li>
                      ))}
                    </ul>
                  </div>
                  <ProofGallery title={it.title} shots={shots.map((s) => ({ src: shotSrc(s.id), caption: s.caption }))} />
                </li>
              );
            })}
          </ul>
        </section>

        {settings.showSkills && data.skills.length > 0 && (
          <section className="pp-sec">
            <h2>Skills</h2>
            <dl className="pp-skills">
              {data.skills.map((g) => (
                <div key={g.group}>
                  <dt>{g.group}</dt>
                  <dd>{g.items.join(", ")}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {(mailto || resumeHref) && (
          <section className="pp-cta">
            <div>
              <h2>Interested in {first}?</h2>
              <p>
                {roles.length ? `${first} is open to ${list(roles)} roles` : `${first} is open to new roles`}
                {settings.availability ? ` and is ${settings.availability.toLowerCase()}.` : "."}
              </p>
            </div>
            <div className="pp-cta__btns">{actions}</div>
          </section>
        )}

        <footer className="pp-foot">
          <span>Issued by Range</span>
          {settings.credentialId && (
            <span>
              Credential <code>{settings.credentialId}</code> · <a href={`/verify/${settings.credentialId}`}>Verify at purvex.io/verify</a>
            </span>
          )}
        </footer>
      </div>
    </main>
  );
}
