/** Shared marketing-page skin. Matches the home floor, case card, numbered grid, and close band. */
export const PG_CSS = `
.pg-floor, .pg-close, .pg-band {
  --hp-dark: #3d32b0; --hp-deep: #2a2280; --hp-mist: #eef0ff; --hp-line: rgba(238,240,255,.16);
}
.pg-hero {
  display: grid; grid-template-columns: minmax(0, 1fr) minmax(320px, .95fr);
  gap: 0 48px; align-items: stretch; min-height: 560px; padding: 28px 0 0;
}
.pg-hero__copy { display: flex; flex-direction: column; justify-content: center; max-width: 34rem; padding: 36px 0 48px }
.pg-hero__h1 {
  margin: 14px 0 0; font-family: var(--font-display);
  font-size: clamp(2.2rem, 4.4vw, 3.3rem); font-weight: 700;
  line-height: 1.08; letter-spacing: -.034em; color: var(--ink);
}
.pg-hero__sub { margin: 18px 0 0; color: var(--ink-soft); font-size: 1.06rem; line-height: 1.65 }
.pg-hero__actions { margin: 28px 0 0; display: flex; flex-wrap: wrap; gap: 12px }
.pg-hero__h1, .pg-hero__sub, .pg-hero__actions, .pg-hero .sp-tag {
  opacity: 0; animation: pg-rise .85s var(--ease) both;
}
.pg-hero .sp-tag { animation-delay: .05s }
.pg-hero__h1 { animation-delay: .14s }
.pg-hero__sub { animation-delay: .26s }
.pg-hero__actions { animation-delay: .38s }
.pg-wl { margin-top: 28px; display: flex; flex-direction: column; gap: 10px; max-width: 28rem }
.pg-wl__row {
  display: flex; gap: 8px; padding: 4px; background: #fff; border: 1px solid var(--border-strong);
}
.pg-wl__row input {
  flex: 1; min-width: 0; height: 46px; padding: 0 14px; border: 0; background: none;
  font-size: .92rem; color: var(--ink); outline: none;
}
.pg-wl__row input::placeholder { color: var(--muted-dim) }
.pg-wl__msg { margin: 0; font-size: .82rem }
.pg-wl__msg--success, .pg-wl__msg--exists { color: var(--green) }
.pg-wl__msg--error { color: var(--red) }
.pg-floor {
  position: relative; display: flex; flex-direction: column; justify-content: space-between;
  min-height: 520px; padding: 32px 24px 0;
  background:
    radial-gradient(90% 70% at 85% 0%, rgba(106,92,255,.5), transparent 58%),
    linear-gradient(165deg, var(--accent) 0%, var(--hp-dark) 48%, var(--hp-deep) 100%);
  border: 1px solid rgba(106,92,255,.38); overflow: hidden;
  animation: pg-floor-in 1s var(--ease) .18s both;
}
.pg-floor__wash {
  position: absolute; inset: auto -20% -30% 20%; height: 70%;
  background: radial-gradient(circle, rgba(106,92,255,.35), transparent 70%); pointer-events: none;
}
.pg-case {
  position: relative; z-index: 2; width: min(390px, 100%); margin: 8px auto 28px;
  background: #fff; border-left: 4px solid var(--accent);
  box-shadow: 0 28px 56px -18px rgba(42,34,128,.72);
  animation: pg-case-in .7s var(--ease) .3s both;
}
.pg-case header {
  display: flex; align-items: center; gap: 8px; padding: 12px 16px 0;
  font-family: var(--font-mono); font-size: .62rem; font-weight: 700;
  letter-spacing: .1em; text-transform: uppercase; color: var(--muted);
}
.pg-case header span:first-child { color: var(--accent-deep); margin-right: auto }
.pg-case header span[data-sev], .pg-case header span:last-child {
  padding: 3px 7px; border: 1px solid rgba(106,92,255,.22); color: var(--accent-deep);
}
.pg-case header span[data-sev] { background: var(--accent-soft); border-color: transparent }
.pg-case h2 {
  margin: 12px 16px 0; font-family: var(--font-display); font-size: 1.45rem;
  font-weight: 700; letter-spacing: -.03em;
}
.pg-case dl {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px 16px;
  margin: 16px 16px 0; padding: 14px 0 0; border-top: 1px solid rgba(106,92,255,.14);
}
.pg-case dt {
  margin: 0; font-family: var(--font-mono); font-size: .58rem; font-weight: 700;
  letter-spacing: .1em; text-transform: uppercase; color: var(--muted);
}
.pg-case dd { margin: 4px 0 0; font-family: var(--font-mono); font-size: .78rem; font-weight: 650 }
.pg-case > p {
  margin: 14px 16px 18px; padding-top: 12px; border-top: 1px solid rgba(106,92,255,.14);
  color: var(--accent-deep); font-size: .84rem; font-weight: 600; line-height: 1.45;
}
.pg-dock {
  position: relative; z-index: 2; margin: 0 -24px; padding: 12px 22px 14px;
  background: rgba(42,34,128,.45); border-top: 1px solid var(--hp-line); backdrop-filter: blur(10px);
}
.pg-dock p {
  display: flex; align-items: center; gap: 8px; margin: 0 0 6px;
  font-family: var(--font-mono); font-size: .62rem; font-weight: 700;
  letter-spacing: .12em; text-transform: uppercase; color: var(--hp-mist);
}
.pg-live { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); animation: pg-pulse 1.8s ease-out infinite }
.pg-dock__row {
  display: grid; grid-template-columns: 1fr auto auto auto; align-items: center; gap: 10px;
  padding: 8px 0; font-family: var(--font-mono); font-size: .68rem; color: var(--hp-mist);
}
.pg-dock__row + .pg-dock__row { border-top: 1px solid rgba(238,240,255,.1) }
.pg-dock__row strong { font-family: var(--font-display); font-size: .84rem; font-weight: 650; letter-spacing: -.02em; color: #fff }
.pg-dock__row em {
  font-style: normal; font-size: .58rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
  padding: 2px 6px; border: 1px solid rgba(238,240,255,.28);
}
.pg-dock__row em[data-sev] { background: rgba(238,240,255,.12); color: #fff }
.pg-section { padding-top: 120px; scroll-margin-top: 84px }
.pg-head { max-width: 34rem; margin: 0 0 36px }
.pg-head h2, .pg-close h2 {
  margin: 12px 0 0; font-family: var(--font-display); font-weight: 700;
  letter-spacing: -.022em; line-height: 1.15; color: var(--ink);
  font-size: clamp(1.6rem, 2.6vw, 2.1rem);
}
.pg-head p { margin: 12px 0 0; color: var(--muted); font-size: 1rem; line-height: 1.6 }
.pg-band {
  display: grid; grid-template-columns: 1fr 1.05fr; gap: 0 40px; align-items: stretch;
  margin-bottom: 28px;
}
.pg-band__copy { display: flex; flex-direction: column; justify-content: center; max-width: 30rem; padding: 8px 0 }
.pg-band__copy h2 {
  margin: 12px 0 0; font-family: var(--font-display); font-weight: 700;
  letter-spacing: -.022em; line-height: 1.15; color: var(--ink);
  font-size: clamp(1.6rem, 2.6vw, 2.1rem);
}
.pg-band__copy p { margin: 12px 0 0; color: var(--muted); font-size: 1rem; line-height: 1.6; max-width: 34ch }
.pg-floor--cut { min-height: 0; padding: 24px 20px 0 }
.pg-floor--cut .pg-case { width: min(360px, 100%); margin: 0 auto 20px }
.pg-floor--cut .pg-dock { margin: 0 -20px }
.pg-marks {
  list-style: none; margin: 0; padding: 0;
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;
}
.pg-marks--3 { grid-template-columns: repeat(3, 1fr) }
.pg-marks li {
  background: #fff; border: 1px solid var(--border-strong); border-left: 4px solid var(--accent);
  padding: 18px 18px 20px;
  box-shadow: 0 18px 40px -30px rgba(16,25,46,.3);
}
.pg-marks header {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  margin: 0 0 16px;
  font-family: var(--font-mono); font-size: .62rem; font-weight: 700;
  letter-spacing: .1em; text-transform: uppercase; color: var(--muted);
}
.pg-mark__icon {
  display: grid; place-items: center; width: 34px; height: 34px;
  background: var(--accent-soft); color: var(--accent-deep);
}
.pg-marks strong { display: block; font-size: 1.02rem; font-weight: 650; letter-spacing: -.014em }
.pg-marks p { margin: 6px 0 0; color: var(--muted); font-size: .88rem; line-height: 1.45 }
.pg-marks[data-r], .pg-band[data-r], .pg-path[data-r] { opacity: 1; transform: none; filter: none }
.pg-marks[data-r] li, .pg-path[data-r] li {
  opacity: 0; transform: translateY(16px); transition: opacity .6s var(--ease), transform .6s var(--ease);
}
.pg-marks[data-r].in li, .pg-path[data-r].in li { opacity: 1; transform: none }
.pg-marks[data-r].in li:nth-child(1), .pg-path[data-r].in li:nth-child(1) { transition-delay: .08s }
.pg-marks[data-r].in li:nth-child(2), .pg-path[data-r].in li:nth-child(2) { transition-delay: .16s }
.pg-marks[data-r].in li:nth-child(3), .pg-path[data-r].in li:nth-child(3) { transition-delay: .24s }
.pg-marks[data-r].in li:nth-child(4), .pg-path[data-r].in li:nth-child(4) { transition-delay: .32s }
.pg-path {
  list-style: none; margin: 0; padding: 0;
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 0;
  position: relative;
}
.pg-path::before {
  content: ""; position: absolute; left: 28px; right: 28px; top: 28px; height: 2px;
  background: rgba(106,92,255,.18);
}
.pg-path li { position: relative; padding: 0 22px 8px 0 }
.pg-path li + li { padding-left: 22px }
.pg-path__icon {
  position: relative; z-index: 1;
  display: grid; place-items: center; width: 56px; height: 56px; margin-bottom: 18px;
  background: var(--accent-soft); color: var(--accent-deep);
  border: 1px solid rgba(106,92,255,.22);
}
.pg-path em {
  display: block; margin-bottom: 8px;
  font-family: var(--font-mono); font-style: normal; font-size: .62rem; font-weight: 700;
  letter-spacing: .1em; text-transform: uppercase; color: var(--accent-deep);
}
.pg-path strong { display: block; font-size: 1.05rem; font-weight: 650; letter-spacing: -.014em }
.pg-path p { margin: 6px 0 0; color: var(--muted); font-size: .88rem; line-height: 1.45; max-width: 22ch }
.pg-grid {
  list-style: none; margin: 0; padding: 0;
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 0;
  border-top: 1px solid var(--border);
}
.pg-grid--3 { grid-template-columns: repeat(3, 1fr) }
.pg-grid--4 { grid-template-columns: repeat(4, 1fr) }
.pg-grid li { padding: 32px 28px 8px 0 }
.pg-grid li + li { padding-left: 28px; border-left: 1px solid var(--border) }
.pg-grid span {
  display: block; margin-bottom: 16px;
  font-family: var(--font-mono); font-size: 3.4rem; font-weight: 700; line-height: .8;
  letter-spacing: -.06em; color: rgba(85,70,224,.16);
}
.pg-grid strong { display: block; font-size: 1.05rem; font-weight: 650; letter-spacing: -.014em }
.pg-grid p { margin: 8px 0 0; color: var(--muted); font-size: .92rem; line-height: 1.55; max-width: 28ch }
.pg-grid[data-r] { opacity: 1; transform: none; filter: none }
.pg-grid[data-r] li { opacity: 0; transform: translateY(16px); transition: opacity .6s var(--ease), transform .6s var(--ease) }
.pg-grid[data-r].in li { opacity: 1; transform: none }
.pg-grid[data-r].in li:nth-child(1) { transition-delay: .08s }
.pg-grid[data-r].in li:nth-child(2) { transition-delay: .16s }
.pg-grid[data-r].in li:nth-child(3) { transition-delay: .24s }
.pg-grid[data-r].in li:nth-child(4) { transition-delay: .32s }
.pg-deck {
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
}
.pg-tile {
  display: flex; flex-direction: column; padding: 0 28px 28px;
  background: #fff; border: 1px solid var(--border-strong);
  transition: transform .4s var(--ease), box-shadow .4s var(--ease);
}
.pg-tile:hover {
  transform: translateY(-5px);
  border-color: rgba(106,92,255,.35);
  box-shadow: 0 26px 50px -26px rgba(85,70,224,.4);
}
.pg-tile__stub {
  display: flex; justify-content: space-between; align-items: center;
  margin: 0 -28px 22px; padding: 11px 28px;
  background: var(--accent-soft);
  font-family: var(--font-mono); font-size: .66rem; font-weight: 700;
  letter-spacing: .1em; text-transform: uppercase; color: var(--accent-deep);
}
.pg-tile--dark {
  background: linear-gradient(165deg, var(--accent) 0%, #3d32b0 55%, #2a2280 100%);
  border-color: rgba(106,92,255,.4); color: #eef0ff;
}
.pg-tile--dark .pg-tile__stub { background: rgba(255,255,255,.12); color: #fff }
.pg-tile h3 { margin: 0; font-family: var(--font-display); font-size: 1.35rem; font-weight: 700; letter-spacing: -.02em }
.pg-tile--dark h3 { color: #fff }
.pg-tile p { margin: 12px 0 0; color: var(--ink-soft); font-size: .94rem; line-height: 1.6 }
.pg-tile--dark p { color: #c5cce0 }
.pg-tile ul { list-style: none; margin: 20px 0 0; padding: 0; display: flex; flex-direction: column; gap: 10px }
.pg-tile li { position: relative; padding-left: 14px; font-size: .88rem; color: var(--ink) }
.pg-tile li::before { content: ""; position: absolute; left: 0; top: .55em; width: 5px; height: 5px; background: var(--accent-deep) }
.pg-tile--dark li { color: #eef0ff }
.pg-tile--dark li::before { background: #fff }
.pg-tile .sp-btn, .pg-tile .pg-tile__link { margin-top: auto }
.pg-tile__link {
  display: inline-flex; align-items: center; gap: 7px; margin-top: 22px;
  font-size: .9rem; font-weight: 650; color: var(--accent-deep); text-decoration: none;
}
.pg-tile__link--light { color: #eef0ff }
.pg-faq { border-top: 1px solid var(--border) }
.pg-faq details { border-bottom: 1px solid var(--border) }
.pg-faq summary {
  cursor: pointer; list-style: none; padding: 18px 0;
  font-weight: 650; letter-spacing: -.01em;
}
.pg-faq summary::-webkit-details-marker { display: none }
.pg-faq details p { margin: 0 0 18px; color: var(--muted); font-size: .92rem; line-height: 1.6; max-width: 52ch }
.pg-close {
  position: relative; overflow: hidden;
  display: grid; grid-template-columns: 1.15fr .85fr; gap: 36px; align-items: center;
  margin-top: 120px; padding: 48px;
  background:
    radial-gradient(70% 90% at 100% 0%, rgba(238,240,255,.16), transparent 52%),
    linear-gradient(145deg, var(--accent) 0%, var(--hp-dark) 52%, var(--hp-deep) 100%);
  color: var(--hp-mist); border: 1px solid rgba(106,92,255,.4);
}
.pg-close__copy, .pg-hold, .pg-close .hold { position: relative; z-index: 1 }
.pg-close__kicker {
  margin: 0; font-family: var(--font-mono); font-size: .7rem; font-weight: 700;
  letter-spacing: .12em; text-transform: uppercase; color: var(--hp-mist);
}
.pg-close h2 { font-size: clamp(1.8rem, 3vw, 2.4rem); color: #fff }
.pg-close__sub { margin: 12px 0 0; max-width: 28ch; color: var(--hp-mist); font-size: 1.02rem; line-height: 1.5 }
.pg-close__row { margin-top: 28px; display: flex; flex-wrap: wrap; align-items: center; gap: 18px }
.pg-close__book {
  display: inline-flex; align-items: center; gap: 8px; height: 50px; padding: 0 22px;
  background: #fff; color: var(--accent-deep); font-weight: 650; font-size: .92rem; text-decoration: none; border: 0;
  transition: transform .25s var(--ease), gap .25s var(--ease);
}
.pg-close__book:hover { transform: translateY(-2px); gap: 12px }
.pg-close__book:disabled { opacity: .7; cursor: default }
.pg-close__more { display: inline-flex; align-items: center; gap: 8px; color: var(--hp-mist); font-weight: 650; text-decoration: none }
.pg-hold {
  background: #fff; color: var(--ink); border-left: 4px solid var(--accent);
  padding: 22px 22px 20px; box-shadow: 0 28px 48px -22px rgba(16,8,64,.55);
}
.pg-hold header {
  display: flex; justify-content: space-between;
  font-family: var(--font-mono); font-size: .62rem; font-weight: 700;
  letter-spacing: .1em; text-transform: uppercase; color: var(--accent-deep);
}
.pg-hold header span:last-child { padding: 3px 7px; background: var(--accent-soft) }
.pg-hold strong { display: block; margin: 14px 0 0; font-family: var(--font-display); font-size: 1.35rem; font-weight: 700; letter-spacing: -.02em }
.pg-hold ul { list-style: none; margin: 16px 0 0; padding: 16px 0 0; border-top: 1px solid rgba(106,92,255,.14) }
.pg-hold li { position: relative; padding: 7px 0 7px 16px; font-size: .9rem; color: var(--ink-soft) }
.pg-hold li::before { content: ""; position: absolute; left: 0; top: 1em; width: 6px; height: 6px; background: var(--accent) }
@keyframes pg-rise { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: none } }
@keyframes pg-floor-in { from { opacity: 0; transform: translateX(24px) } to { opacity: 1; transform: none } }
@keyframes pg-case-in { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: none } }
@keyframes pg-pulse { 0% { box-shadow: 0 0 0 0 rgba(106,92,255,.5) } 70% { box-shadow: 0 0 0 8px rgba(106,92,255,0) } 100% { box-shadow: 0 0 0 0 rgba(106,92,255,0) } }
@media (prefers-reduced-motion: reduce) {
  .pg-hero__h1, .pg-hero__sub, .pg-hero__actions, .pg-hero .sp-tag, .pg-floor, .pg-case, .pg-grid[data-r] li, .pg-tile, .pg-marks[data-r] li, .pg-path[data-r] li {
    animation: none; opacity: 1; transform: none;
  }
  .pg-live { animation: none }
  .pg-tile:hover { transform: none }
}
@media (max-width: 980px) {
  .pg-hero { grid-template-columns: 1fr; min-height: 0; gap: 28px }
  .pg-hero__copy { padding: 20px 0 0 }
  .pg-floor { min-height: 0; padding-top: 28px }
  .pg-grid, .pg-grid--3, .pg-grid--4, .pg-marks, .pg-marks--3, .pg-path, .pg-band { grid-template-columns: 1fr }
  .pg-grid li + li { padding-left: 0; border-left: 0; border-top: 1px solid var(--border) }
  .pg-path::before { display: none }
  .pg-path li + li { padding-left: 0; padding-top: 22px }
  .pg-deck { grid-template-columns: 1fr }
  .pg-close { grid-template-columns: 1fr; gap: 22px; padding: 36px 24px }
}
@media (max-width: 680px) {
  .pg-section { padding-top: 84px }
  .pg-close { margin-top: 84px; padding: 28px 20px }
  .pg-close__book { width: 100%; justify-content: center }
  .pg-hero__actions { flex-direction: column }
  .pg-hero__actions .sp-btn, .pg-wl__row { flex-direction: column }
  .pg-hero__actions .sp-btn, .pg-wl__row .sp-btn { width: 100% }
  .pg-tile { padding: 0 20px 22px }
  .pg-tile__stub { margin: 0 -20px 18px; padding: 11px 20px }
}
`;
