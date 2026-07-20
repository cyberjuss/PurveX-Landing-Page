import type { LucideIcon } from "lucide-react";
import { Scale } from "lucide-react";
import { SiteChrome } from "./chrome";

type Highlight = { icon: LucideIcon; title: string; body: string };
type Section = { title: string; paragraphs: string[] };

export default function LegalPage({
  badge,
  updated,
  title,
  intro,
  highlights,
  summaryTitle,
  summaryItems,
  contactLabel,
  contactIcon: ContactIcon,
  contactBody,
  caveatLabel,
  caveatIcon: CaveatIcon,
  caveatBody,
  sectionsHeading,
  sections,
}: {
  badge: string;
  updated: string;
  title: string;
  intro: string;
  highlights: Highlight[];
  summaryTitle: string;
  summaryItems: string[];
  contactLabel: string;
  contactIcon: LucideIcon;
  contactBody: React.ReactNode;
  caveatLabel: string;
  caveatIcon: LucideIcon;
  caveatBody: string;
  sectionsHeading: string;
  sections: Section[];
}) {
  return (
    <SiteChrome active="legal">
      {/* ═══════════ HERO ═══════════ */}
      <section className="sp-hero">
        <span className="sp-hero__badge">
          <Scale size={13} /> {badge}
        </span>
        <h1 className="sp-hero__h1">{title}</h1>
        <p className="sp-hero__sub">{intro}</p>
        <p className="sp-legal__updated">{updated}</p>
      </section>

      {/* ═══════════ HIGHLIGHTS ═══════════ */}
      <section className="sp-section sp-section--tight">
        <div className="sp-cards sp-cards--3" data-r>
          {highlights.map((h) => (
            <article key={h.title} className="sp-card">
              <div className="sp-card__icon">
                <h.icon size={20} />
              </div>
              <h3 className="sp-card__title">{h.title}</h3>
              <p className="sp-card__body">{h.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ═══════════ SUMMARY + ASIDE ═══════════ */}
      <section className="sp-section">
        <div className="sp-legal__meta" data-r>
          <div className="sp-panel sp-legal__summary">
            <span className="sp-tag">{summaryTitle}</span>
            <ul className="sp-legal__list">
              {summaryItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="sp-legal__aside">
            <div className="sp-legal__box">
              <span className="sp-legal__box-label">
                <ContactIcon size={16} /> {contactLabel}
              </span>
              <div className="sp-legal__box-body">{contactBody}</div>
            </div>
            <div className="sp-legal__box sp-legal__box--warn">
              <span className="sp-legal__box-label">
                <CaveatIcon size={16} /> {caveatLabel}
              </span>
              <p className="sp-legal__box-body">{caveatBody}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FULL TEXT ═══════════ */}
      <section className="sp-section">
        <div className="sp-head sp-head--left" data-r>
          <span className="sp-tag">Full document</span>
          <h2>{sectionsHeading}</h2>
        </div>
        <div className="sp-legal__sections" data-r>
          {sections.map((s) => (
            <div key={s.title} className="sp-legal__section">
              <h3>{s.title}</h3>
              {s.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          ))}
        </div>
      </section>

      <style>{`
.sp-legal__updated { margin: 18px auto 0; text-align: center; font-size: .78rem; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--muted-dim) }

.sp-legal__meta { display: grid; grid-template-columns: 1.15fr .85fr; gap: 24px; align-items: start }
.sp-legal__summary { margin: 0 }
.sp-legal__list { margin: 20px 0 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 14px }
.sp-legal__list li { position: relative; padding-left: 22px; color: var(--ink-soft); font-size: .96rem; line-height: 1.65 }
.sp-legal__list li::before { content: ""; position: absolute; left: 2px; top: 9px; width: 6px; height: 6px; border-radius: 50%; background: var(--accent) }

.sp-legal__aside { display: flex; flex-direction: column; gap: 20px }
.sp-legal__box { --cut: 16px; padding: 26px 28px; clip-path: polygon(var(--cut) 0, 100% 0, 100% calc(100% - var(--cut)), calc(100% - var(--cut)) 100%, 0 100%, 0 var(--cut)); border: 1px solid var(--border); background: var(--surface-alt) }
.sp-legal__box-label { display: inline-flex; align-items: center; gap: 8px; font-size: .8rem; font-weight: 650; color: var(--accent-deep) }
.sp-legal__box-body { margin: 12px 0 0; color: var(--ink-soft); font-size: .9rem; line-height: 1.65 }
.sp-legal__box-body a { color: var(--accent-deep); font-weight: 600 }
.sp-legal__box--warn { background: rgba(229,72,77,.05); border-color: rgba(229,72,77,.2) }
.sp-legal__box--warn .sp-legal__box-label { color: var(--red) }

.sp-legal__sections { display: flex; flex-direction: column }
.sp-legal__section { padding: 34px 0; border-bottom: 1px dashed var(--border-strong) }
.sp-legal__section:first-child { padding-top: 0 }
.sp-legal__section:last-child { border-bottom: none; padding-bottom: 0 }
.sp-legal__section h3 { margin: 0; font-family: var(--font-display); font-size: 1.2rem; font-weight: 650; letter-spacing: -.015em; color: var(--ink) }
.sp-legal__section p { margin: 14px 0 0; color: var(--ink-soft); font-size: .96rem; line-height: 1.75; max-width: 760px }

@media (max-width: 860px) { .sp-legal__meta { grid-template-columns: 1fr } }
      `}</style>
    </SiteChrome>
  );
}
