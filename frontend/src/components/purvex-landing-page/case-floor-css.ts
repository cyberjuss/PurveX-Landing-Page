// Copy of the home page hero floor, so every tab shows the same ticket and queue.
export const FLOOR_CSS = `
.cf-floor { --cf-dark: #3d32b0; --cf-deep: #2a2280; --cf-mist: #eef0ff; --cf-line: rgba(238,240,255,.16) }
.cf-floor {
  position: relative; display: flex; flex-direction: column; justify-content: space-between;
  min-height: 560px; padding: 36px 28px 0;
  background:
    radial-gradient(90% 70% at 85% 0%, rgba(106,92,255,.5), transparent 58%),
    linear-gradient(165deg, var(--accent) 0%, var(--cf-dark) 48%, var(--cf-deep) 100%);
  border: 1px solid rgba(106,92,255,.38);
  overflow: hidden;
  animation: cf-floor-in 1s var(--ease) .18s both;
}
.cf-floor__wash {
  position: absolute; inset: auto -20% -30% 20%; height: 70%;
  background: radial-gradient(circle, rgba(106,92,255,.35), transparent 70%);
  pointer-events: none;
}
.cf-case {
  position: relative; z-index: 2; width: min(390px, 100%);
  margin: 8px auto 32px; min-height: 318px;
}
.cf-case__stack, .cf-case__stack--2 {
  position: absolute; inset: 14px 10px -10px 10px; border-radius: 4px;
  background: rgba(238,240,255,.18); border: 1px solid rgba(238,240,255,.2);
}
.cf-case__stack--2 { inset: 22px 20px -16px 20px; opacity: .55 }
.cf-ticket {
  position: relative; overflow: hidden; background: #fff;
  border-left: 4px solid var(--accent);
  box-shadow: 0 28px 56px -18px rgba(42,34,128,.72);
  animation: cf-ticket-in .7s var(--ease) both;
}
.cf-ticket__bar {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px 0; font-family: var(--font-mono);
  font-size: .62rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
  color: var(--muted);
}
.cf-ticket__bar span:first-child { color: var(--accent-deep); margin-right: auto }
.cf-ticket__bar span[data-sev],
.cf-ticket__bar span:last-child {
  padding: 3px 7px; border: 1px solid rgba(106,92,255,.22); color: var(--accent-deep);
}
.cf-ticket__bar span[data-sev="High"],
.cf-ticket__bar span[data-sev="Crit"] {
  background: var(--accent-soft); border-color: transparent;
}
.cf-ticket__sheet { padding: 14px 16px 18px }
.cf-ticket h2 {
  margin: 0; font-family: var(--font-display); font-size: 1.55rem; font-weight: 700;
  letter-spacing: -.03em; line-height: 1.15;
}
.cf-ticket__grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px 16px;
  margin: 16px 0 0; padding: 14px 0 0; border-top: 1px solid rgba(106,92,255,.14);
}
.cf-ticket__grid dt {
  margin: 0; font-family: var(--font-mono); font-size: .58rem; font-weight: 700;
  letter-spacing: .1em; text-transform: uppercase; color: var(--muted);
}
.cf-ticket__grid dd {
  margin: 4px 0 0; font-family: var(--font-mono); font-size: .78rem;
  font-weight: 650; color: var(--ink); word-break: break-word;
}
.cf-ticket__body { margin: 16px 0 0; color: var(--ink-soft); font-size: .9rem; line-height: 1.5 }
.cf-ticket__ask {
  margin: 14px 0 0; padding-top: 12px; border-top: 1px solid rgba(106,92,255,.14);
  color: var(--accent-deep); font-size: .84rem; font-weight: 600; line-height: 1.45;
}
.cf-dock {
  position: relative; z-index: 2; margin: 0 -28px;
  padding: 12px 22px 14px;
  background: rgba(42,34,128,.45); border-top: 1px solid var(--cf-line);
  backdrop-filter: blur(10px);
}
.cf-dock p {
  display: flex; align-items: center; gap: 8px; margin: 0 0 6px;
  font-family: var(--font-mono); font-size: .62rem; font-weight: 700;
  letter-spacing: .12em; text-transform: uppercase; color: var(--cf-mist);
}
.cf-dock__live {
  width: 7px; height: 7px; border-radius: 50%; background: var(--accent);
  animation: cf-pulse 1.8s ease-out infinite;
}
.cf-dock__row {
  display: grid; grid-template-columns: auto auto 1fr auto; align-items: center;
  gap: 4px 14px; padding: 9px 0;
  font-family: var(--font-mono); font-size: .68rem; color: var(--cf-mist);
  animation: cf-row .4s var(--ease) both;
}
.cf-dock__row + .cf-dock__row { border-top: 1px solid rgba(238,240,255,.1) }
.cf-dock__row strong {
  grid-column: 1 / 4; margin: 0;
  font-family: var(--font-display); font-size: .84rem; font-weight: 650;
  letter-spacing: -.02em; color: #fff;
}
.cf-dock__row em {
  grid-column: 4; justify-self: end; font-style: normal;
  font-size: .58rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
  padding: 2px 6px; border: 1px solid rgba(238,240,255,.28); color: var(--cf-mist);
}
.cf-dock__row em[data-sev="High"],
.cf-dock__row em[data-sev="Crit"] {
  border-color: rgba(238,240,255,.55); background: rgba(238,240,255,.12); color: #fff;
}
.cf-dock__row em[data-sev="Crit"] { letter-spacing: .1em }
.cf-dock__row span:nth-child(4) { color: #fff; font-weight: 700 }


@keyframes cf-floor-in { from { opacity: 0; transform: translateX(24px) } to { opacity: 1; transform: none } }
@keyframes cf-ticket-in { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: none } }
@keyframes cf-row { from { opacity: 0; transform: translateY(5px) } to { opacity: 1; transform: none } }
@keyframes cf-pulse { 0% { box-shadow: 0 0 0 0 rgba(106,92,255,.5) } 70% { box-shadow: 0 0 0 8px rgba(106,92,255,0) } 100% { box-shadow: 0 0 0 0 rgba(106,92,255,0) } }
.pg-hero--flip .cf-floor { animation-name: pg-floor-in-left }
@media (prefers-reduced-motion: reduce) {
  .cf-floor, .cf-ticket, .cf-dock__row { animation: none; opacity: 1; transform: none }
  .cf-dock__live { animation: none }
}
@media (max-width: 980px) { .cf-floor { min-height: 0; padding-top: 28px } }
`;
