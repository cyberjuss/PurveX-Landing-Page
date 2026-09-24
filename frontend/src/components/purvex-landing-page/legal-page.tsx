import { SiteChrome } from "./chrome";

type Section = { title: string; paragraphs: string[] };

export default function LegalPage({
  badge,
  updated,
  title,
  intro,
  note,
  summaryTitle,
  summaryItems,
  sectionsHeading,
  sections,
}: {
  badge: string;
  updated: string;
  title: string;
  intro: string;
  note: string;
  summaryTitle: string;
  summaryItems: string[];
  sectionsHeading: string;
  sections: Section[];
}) {
  return (
    <SiteChrome active="legal">
      <div className="sp-legal">
        <div className="sp-legal__head">
          <span className="sp-legal__badge">{badge}</span>
          <h1>{title}</h1>
          <p className="sp-legal__updated">{updated}</p>
          <p className="sp-legal__intro">{intro}</p>
          <p className="sp-legal__note">{note}</p>
        </div>

        <div className="sp-legal__summary">
          <h2>{summaryTitle}</h2>
          <ul>
            {summaryItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="sp-legal__body">
          <h2>{sectionsHeading}</h2>
          {sections.map((s) => (
            <div key={s.title} className="sp-legal__section">
              <h3>{s.title}</h3>
              {s.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          ))}
        </div>
      </div>

      <style>{`
.sp-legal { max-width: 720px; margin: 0 auto; padding: 132px 24px 96px }
.sp-legal__badge { display: inline-block; padding: 5px 10px; border: 1px solid var(--accent-deep); font-family: var(--font-mono); font-size: .64rem; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--accent-deep) }
.sp-legal__head h1 { margin: 12px 0 0; font-family: var(--font-display); font-size: clamp(2rem, 4vw, 2.9rem); font-weight: 600; line-height: 1.06; letter-spacing: -.04em; color: var(--ink) }
.sp-legal__updated { margin: 16px 0 0; font-family: var(--font-mono); font-size: .64rem; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--muted-dim) }
.sp-legal__intro { margin: 22px 0 0; font-size: 1.02rem; line-height: 1.7; color: var(--ink-soft) }
.sp-legal__note { margin: 14px 0 0; font-size: .88rem; font-style: italic; line-height: 1.6; color: var(--muted) }

.sp-legal__summary { margin-top: 56px; padding: 28px 0; border-top: 1px solid var(--ink); border-bottom: 1px solid var(--border) }
.sp-legal__summary h2 { margin: 0; font-family: var(--font-mono); font-size: .68rem; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--ink) }
.sp-legal__summary ul { margin: 18px 0 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 12px }
.sp-legal__summary li { position: relative; padding-left: 20px; font-size: .95rem; line-height: 1.6; color: var(--ink-soft) }
.sp-legal__summary li::before { content: ""; position: absolute; left: 2px; top: 8px; width: 6px; height: 6px; background: var(--accent-deep) }

.sp-legal__body { margin-top: 56px }
.sp-legal__body > h2 { margin: 0 0 8px; font-family: var(--font-mono); font-size: .68rem; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--ink) }
.sp-legal__section { padding: 30px 0; border-bottom: 1px solid var(--border) }
.sp-legal__section:last-child { border-bottom: none; padding-bottom: 0 }
.sp-legal__section h3 { margin: 0; font-family: var(--font-display); font-size: 1.25rem; font-weight: 600; letter-spacing: -.03em; color: var(--ink) }
.sp-legal__section p { margin: 12px 0 0; color: var(--ink-soft); font-size: .96rem; line-height: 1.75 }

@media (max-width: 680px) { .sp-legal { padding: 72px 20px 72px } }
      `}</style>
    </SiteChrome>
  );
}
