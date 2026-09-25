/** Shared marketing-page skin. Matches the home floor, case card, numbered grid, and close band. */
export const PG_CSS = `
.pg-floor, .pg-close, .pg-band, .pg-dark {
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
  opacity: 1; animation: none;
}
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
  position: relative; display: flex; flex-direction: column; justify-content: flex-start;
  min-height: 0; padding: 36px 0 0;
  background: transparent; border: 0; overflow: visible; animation: none;
}
.pg-floor__wash { display: none }
.pg-case {
  position: relative; z-index: 2; width: min(390px, 100%); margin: 8px auto 28px;
  background: #fff; border: 1px solid rgba(85,70,224,.18); border-left: 4px solid var(--accent);
  clip-path: polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 0 100%);
  box-shadow: 0 28px 56px -18px rgba(42,34,128,.28);
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
  position: relative; z-index: 2; margin: 10px 0 0; padding: 12px 0 0;
  background: none; border-top: 1px solid var(--border); backdrop-filter: none;
}
.pg-dock p {
  display: flex; align-items: center; gap: 8px; margin: 0 0 6px;
  font-family: var(--font-mono); font-size: .68rem; font-weight: 650;
  letter-spacing: .02em; text-transform: none; color: var(--muted);
}
.pg-live { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); animation: pg-pulse 1.8s ease-out infinite }
.pg-dock__row {
  display: grid; grid-template-columns: 1fr auto auto auto; align-items: center; gap: 10px;
  padding: 8px 0; font-family: var(--font-mono); font-size: .68rem; color: var(--ink-soft);
}
.pg-dock__row + .pg-dock__row { border-top: 1px solid var(--border) }
.pg-dock__row strong { font-family: var(--font-display); font-size: .84rem; font-weight: 650; letter-spacing: -.02em; color: var(--ink) }
.pg-dock__row em {
  font-style: normal; font-size: .58rem; font-weight: 700; letter-spacing: .04em;
  padding: 2px 6px; border: 1px solid rgba(85,70,224,.22); color: var(--accent-deep);
}
.pg-dock__row em[data-sev] { background: var(--accent-soft); color: var(--accent-deep); border-color: transparent }
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
  display: flex; flex-direction: column; padding: 0 28px 28px; border-radius: 0;
  clip-path: polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 0 100%);
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
  background: #fff; border-color: var(--border-strong); color: var(--ink);
  border-left: 4px solid var(--accent);
}
.pg-tile--dark .pg-tile__stub { background: var(--accent-soft); color: var(--accent-deep) }
.pg-tile h3 { margin: 0; font-family: var(--font-display); font-size: 1.35rem; font-weight: 700; letter-spacing: -.02em }
.pg-tile--dark h3 { color: var(--ink) }
.pg-tile p { margin: 12px 0 0; color: var(--ink-soft); font-size: .94rem; line-height: 1.6 }
.pg-tile--dark p { color: var(--ink-soft) }
.pg-tile ul { list-style: none; margin: 20px 0 0; padding: 0; display: flex; flex-direction: column; gap: 10px }
.pg-tile li { position: relative; padding-left: 14px; font-size: .88rem; color: var(--ink) }
.pg-tile li::before { content: ""; position: absolute; left: 0; top: .55em; width: 5px; height: 5px; background: var(--accent-deep) }
.pg-tile--dark li { color: var(--ink) }
.pg-tile--dark li::before { background: var(--accent) }
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
  position: relative; overflow: visible;
  display: grid; grid-template-columns: 1.15fr .85fr; gap: 36px; align-items: center;
  margin-top: 88px; padding: 72px 0 0;
  background: none; color: var(--ink); border: 0; border-top: 1px solid var(--border);
}
.pg-close__copy, .pg-hold, .pg-close .hold { position: relative; z-index: 1 }
.pg-close__kicker {
  margin: 0; font-family: var(--font-mono); font-size: .7rem; font-weight: 700;
  letter-spacing: .04em; text-transform: none; color: var(--accent-deep);
}
.pg-close h2 { font-size: clamp(1.8rem, 3vw, 2.4rem); color: var(--ink) }
.pg-close__sub { margin: 12px 0 0; max-width: 36ch; color: var(--ink-soft); font-size: 1.02rem; line-height: 1.5 }
.pg-close__row { margin-top: 28px; display: flex; flex-wrap: wrap; align-items: center; gap: 18px }
.pg-close__book {
  display: inline-flex; align-items: center; gap: 8px; height: 50px; padding: 0 22px;
  background: #fff; color: var(--accent-deep); font-weight: 650; font-size: .92rem; text-decoration: none; border: 0;
  transition: transform .25s var(--ease), gap .25s var(--ease);
}
.pg-close__book:hover { transform: translateY(-2px); gap: 12px }
.pg-close__book:disabled { opacity: .7; cursor: default }
.pg-close__more { display: inline-flex; align-items: center; gap: 8px; color: var(--accent-deep); font-weight: 650; text-decoration: none }
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
  .pg-close { grid-template-columns: 1fr; gap: 22px; padding: 48px 0 0 }
}
@media (max-width: 680px) {
  .pg-section { padding-top: 84px }
  .pg-close { margin-top: 64px; padding: 40px 0 0 }
  .pg-close__book { width: 100%; justify-content: center }
  .pg-hero__actions { flex-direction: column }
  .pg-hero__actions .sp-btn, .pg-wl__row { flex-direction: column }
  .pg-hero__actions .sp-btn, .pg-wl__row .sp-btn { width: 100% }
  .pg-tile { padding: 0 20px 22px }
  .pg-tile__stub { margin: 0 -20px 18px; padding: 11px 20px }
}

/* ── Premium layer: icon tiles, depth, motion. Shared by every marketing page. ── */
.pg-ico {
  display: grid; place-items: center; flex: none; width: 46px; height: 46px; border-radius: 0;
  background: linear-gradient(145deg, #fff, #ebe8ff); border: 1px solid rgba(106,92,255,.22); color: var(--accent-deep);
  box-shadow: inset 0 1px 0 #fff, 0 12px 22px -12px rgba(85,70,224,.6);
  transition: transform .4s var(--ease), background .3s var(--ease), color .3s var(--ease), box-shadow .3s var(--ease);
}
.pg-ico svg { transition: transform .4s var(--ease) }
.pg-hero--flip { grid-template-columns: minmax(320px, .95fr) minmax(0, 1fr) }
.pg-hero--flip .pg-floor { order: -1; animation-name: pg-floor-in-left }
.pg-floor .pg-case { animation: pg-case-in .7s var(--ease) .3s both, pg-float 7s ease-in-out 1.2s infinite }
.pg-dock__row { animation: pg-rise .6s var(--ease) both }
.pg-dock__row:nth-child(2) { animation-delay: .7s }
.pg-dock__row:nth-child(3) { animation-delay: .9s }

.pg-facts { list-style: none; margin: 30px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 12px }
.pg-facts li {
  min-width: 108px; padding: 14px 18px; border-radius: 0; background: #fff; border: 1px solid var(--border-strong);
  box-shadow: 0 18px 30px -24px rgba(42,34,128,.5);
}
.pg-facts strong { display: block; font-family: var(--font-display); font-size: 1.7rem; font-weight: 700; letter-spacing: -.04em; color: var(--accent-deep) }
.pg-facts span { display: block; margin-top: 2px; font-size: .74rem; color: var(--muted) }

.pg-bars { list-style: none; margin: 16px 16px 0; padding: 14px 0 0; border-top: 1px solid rgba(106,92,255,.14); display: grid; gap: 11px }
.pg-bars li { display: grid; grid-template-columns: 1fr auto; gap: 5px 10px; font-size: .78rem; color: var(--ink-soft) }
.pg-bars b { font-family: var(--font-mono); font-size: .72rem; color: var(--ink) }
.pg-bars i { grid-column: 1 / -1; position: relative; height: 6px; border-radius: 999px; background: var(--accent-soft); overflow: hidden }
.pg-bars i::after {
  content: ""; position: absolute; inset: 0 auto 0 0; width: var(--w); border-radius: 999px; transform-origin: left;
  background: linear-gradient(90deg, #8b7fff, var(--accent)); animation: pg-fill 1.1s var(--ease) .8s both;
}
.pg-score { display: flex; align-items: flex-end; gap: 10px; margin: 12px 16px 0 }
.pg-score strong { font-family: var(--font-display); font-size: 2.6rem; font-weight: 700; line-height: .9; letter-spacing: -.05em }
.pg-score small { font-size: .9rem; color: var(--muted); font-weight: 600 }
.pg-score em { margin: 0 0 4px auto; font-style: normal; padding: 3px 9px; border-radius: 999px; background: #fff3dc; color: #a86a08; font-family: var(--font-mono); font-size: .58rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase }

.pg-grid--icons li { position: relative }
.pg-grid--icons li > span { position: absolute; top: 24px; right: 22px; margin: 0; font-size: 3.4rem; transition: color .4s var(--ease), transform .4s var(--ease) }
.pg-grid--icons li > .pg-ico { margin-bottom: 20px }
.pg-grid--icons li:hover > .pg-ico { transform: none; background: var(--accent-soft); color: var(--accent-deep) }
.pg-grid--icons li:hover > span { color: rgba(85,70,224,.3); transform: translateY(-3px) }

.pg-rows { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--border-strong) }
.pg-rows > li {
  display: grid; grid-template-columns: auto 1fr; gap: 22px; align-items: center; padding: 22px 0;
  border-bottom: 1px solid var(--border); border-radius: 0;
  transition: background .35s var(--ease), padding .35s var(--ease);
}
.pg-rows > li:hover { background: linear-gradient(90deg, var(--accent-soft), transparent 75%); padding-left: 16px }
.pg-rows > li:hover .pg-ico { transform: none; background: var(--accent-soft); color: var(--accent-deep) }
.pg-rows h3 { margin: 0; font-family: var(--font-display); font-size: 1.12rem; font-weight: 700; letter-spacing: -.02em; color: var(--ink) }
.pg-rows p { margin: 6px 0 0; color: var(--ink-soft); font-size: .92rem; line-height: 1.55 }
.pg-chips { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px }
.pg-chips li { padding: 7px 13px; border-radius: 999px; background: #fff; border: 1px solid rgba(106,92,255,.2); font-size: .8rem; font-weight: 550; color: var(--accent-deep); box-shadow: 0 8px 14px -12px rgba(85,70,224,.5) }

.pg-split { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center }
.pg-split .pg-head { margin-bottom: 0 }
.pg-proof { border-radius: 0; clip-path: polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 0 100%); background: #fff; border: 1px solid var(--border-strong); overflow: hidden; box-shadow: 0 40px 70px -38px rgba(42,34,128,.6) }
.pg-proof header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: var(--accent-soft); font-family: var(--font-mono); font-size: .68rem; font-weight: 700; letter-spacing: .08em; color: var(--accent-deep) }
.pg-proof header span, .pg-proof header em { display: inline-flex; align-items: center; gap: 8px }
.pg-proof header em { font-style: normal; text-transform: uppercase; letter-spacing: .1em }
.pg-proof header em i { width: 7px; height: 7px; border-radius: 50%; background: #1fa971; animation: pg-pulse 1.8s ease-out infinite }
.pg-proof ul { list-style: none; margin: 0; padding: 6px 20px }
.pg-proof li { display: flex; align-items: center; gap: 12px; padding: 14px 0; font-size: .9rem; border-bottom: 1px solid var(--border); animation: pg-rise .6s var(--ease) both }
.pg-proof li:nth-child(2) { animation-delay: .1s } .pg-proof li:nth-child(3) { animation-delay: .2s } .pg-proof li:nth-child(4) { animation-delay: .3s }
.pg-proof li:last-child { border-bottom: 0 }
.pg-proof li > span { flex: none; display: grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; background: #e3f6ee; color: #12805a; font-weight: 700; font-size: .78rem }
.pg-proof li[data-ok="false"] > span { background: #fdeaea; color: #c23030 }

.pg-dark {
  position: relative; overflow: visible; padding: 72px 0 0; margin-top: 88px; border-radius: 0; color: var(--ink);
  background: none; border: 0; border-top: 1px solid var(--border); box-shadow: none;
}
.pg-dark::before { display: none }
.pg-dark > * { position: relative; z-index: 1 }
.pg-dark__kicker { display: inline-flex; align-items: center; gap: 10px; padding: 0; border: 0; background: none; font-family: var(--font-mono); font-size: .72rem; font-weight: 650; letter-spacing: .02em; text-transform: none; color: var(--accent-deep) }
.pg-dark h2 { margin: 18px 0 0; font-family: var(--font-display); font-weight: 700; letter-spacing: -.028em; line-height: 1.1; font-size: clamp(1.9rem, 3.4vw, 2.7rem); color: var(--ink); max-width: 20ch }
.pg-dark__lead { margin: 14px 0 0; max-width: 46ch; font-size: 1.04rem; line-height: 1.65; color: var(--ink-soft) }
.pg-modes { list-style: none; margin: 34px 0 0; padding: 0; display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px }
.pg-modes li {
  padding: 20px; border-radius: 0; background: #fff; border: 1px solid var(--border-strong);
  clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%);
}
.pg-modes li:hover { border-color: rgba(85,70,224,.4) }
.pg-modes .pg-ico { width: 40px; height: 40px; border-radius: 0; background: var(--accent-soft); border-color: rgba(85,70,224,.22); color: var(--accent-deep); box-shadow: none }
.pg-modes strong { display: block; margin-top: 16px; font-family: var(--font-display); font-size: 1.05rem; font-weight: 700; color: var(--ink) }
.pg-modes p { margin: 6px 0 0; font-size: .85rem; line-height: 1.55; color: var(--ink-soft) }

.pg-phases { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px }
.pg-phases > li { padding: 26px; border-radius: 0; clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%); background: #fff; border: 1px solid var(--border-strong); box-shadow: 0 26px 46px -34px rgba(42,34,128,.55); transition: transform .35s var(--ease), box-shadow .35s var(--ease) }
.pg-phases > li:hover { transform: translateY(-5px); box-shadow: 0 34px 54px -30px rgba(85,70,224,.55) }
.pg-phases header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px }
.pg-phases header span { padding: 5px 12px; border-radius: 999px; background: var(--accent); color: #fff; font-family: var(--font-mono); font-size: .62rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase }
.pg-phases h3 { margin: 0; font-family: var(--font-display); font-size: 1.2rem; font-weight: 700; letter-spacing: -.02em; line-height: 1.25 }
.pg-phases ul { list-style: none; margin: 16px 0 0; padding: 0; display: grid; gap: 4px }
.pg-phases ul li { display: flex; align-items: flex-start; gap: 10px; padding: 9px 0; border-top: 1px solid var(--border); font-size: .86rem; line-height: 1.4; color: var(--ink) }
.pg-phases ul li::before { content: ""; flex: none; width: 9px; height: 9px; margin-top: .35em; border-radius: 50%; background: var(--accent) }
.pg-phases ul li.is-soon { color: var(--muted-dim) }
.pg-phases ul li.is-soon::before { background: none; border: 2px solid rgba(106,92,255,.4) }
.pg-phases footer { margin-top: 14px; font-family: var(--font-mono); font-size: .64rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--muted-dim) }

.pg-report { padding: 26px; border-radius: 0; clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%); background: #fff; border: 1px solid var(--border-strong); box-shadow: 0 40px 70px -38px rgba(42,34,128,.6) }
.pg-report > header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; font-family: var(--font-mono); font-size: .64rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--muted) }
.pg-report .pg-bars { margin: 0; padding: 0; border: 0; gap: 18px }
.pg-report .pg-bars li { font-size: .9rem; color: var(--ink) }
.pg-levels { list-style: none; margin: 22px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 10px }
.pg-levels li { display: inline-flex; align-items: center; gap: 8px; padding: 7px 13px; border-radius: 999px; background: #fff; border: 1px solid var(--border-strong); font-size: .8rem; font-weight: 600 }
.pg-levels li span { color: var(--muted); font-weight: 500 }
.pg-levels i { width: 9px; height: 9px; border-radius: 50%; background: #e5484d }
.pg-levels li:nth-child(2) i { background: #e8a13a } .pg-levels li:nth-child(3) i { background: #22a06b }

.pg-cta-row { margin-top: 28px }
@keyframes pg-float { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-7px) } }
@keyframes pg-fill { from { transform: scaleX(0) } to { transform: none } }
@keyframes pg-floor-in-left { from { opacity: 0; transform: translateX(-24px) } to { opacity: 1; transform: none } }
@media (prefers-reduced-motion: reduce) {
  .pg-floor .pg-case, .pg-dock__row, .pg-proof li, .pg-bars i::after, .pg-proof header em i { animation: none }
  .pg-ico, .pg-rows > li, .pg-modes li, .pg-phases > li { transition: none }
}
@media (max-width: 1100px) { .pg-modes { grid-template-columns: 1fr 1fr } }
@media (max-width: 980px) {
  .pg-hero--flip { grid-template-columns: 1fr }
  .pg-hero--flip .pg-floor { order: 0 }
  .pg-split, .pg-phases { grid-template-columns: 1fr }
  .pg-split { gap: 32px }
  .pg-rows > li { grid-template-columns: auto 1fr; gap: 14px 16px }
  .pg-rows .pg-chips { grid-column: 1 / -1 }
  .pg-dark { padding: 48px 0 0 }
}
@media (max-width: 680px) {
  .pg-modes { grid-template-columns: 1fr }
  .pg-dark { padding: 40px 0 0; border-radius: 0 }
  .pg-facts li { flex: 1; min-width: 0 }
}

/* ── Readability and polish ── */
html { scroll-behavior: smooth }
.pg-head h2, .pg-dark h2, .pg-close h2 { text-wrap: balance }
.pg-head p, .pg-hero__sub, .pg-dark__lead { text-wrap: pretty }
.pg-bullets { list-style: none; margin: 18px 0 0; padding: 0; display: grid; gap: 10px }
.pg-bullets li {
  position: relative; padding-left: 22px; font-size: .95rem; line-height: 1.55; color: var(--ink-soft);
}
.pg-bullets li::before {
  content: ""; position: absolute; left: 0; top: .5em; width: 8px; height: 8px; border-radius: 50%;
  background: var(--accent); box-shadow: 0 0 0 4px rgba(106,92,255,.14);
}
.pg-hero .pg-bullets { margin-top: 22px }
.pg-hero .pg-bullets li { font-size: 1rem; color: var(--ink) }
/* Bullets inside a grid card: reset the grid's own li rules. */
.pg-grid .pg-bullets li, .pg-grid[data-r] .pg-bullets li { padding: 0 0 0 22px; border: 0; opacity: 1; transform: none; transition: none }
.pg-grid .pg-bullets li + li { padding-left: 22px; border: 0 }
.pg-grid--icons p { max-width: 34ch }
.pg-more {
  display: inline-flex; align-items: center; gap: 8px; margin-top: 24px; font-size: .92rem; font-weight: 650;
  color: var(--accent-deep); text-decoration: none; transition: gap .25s var(--ease);
}
.pg-more:hover { gap: 13px }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto } }

/* ── Operations: a four-stage flow and a numbered timeline ── */
.ox-flow[data-r], .ox-steps[data-r] { opacity: 1; transform: none; filter: none }
.ox-flow { list-style: none; margin: 8px 0 0; padding: 0; display: grid; grid-template-columns: repeat(4, 1fr); position: relative }
.ox-flow::before {
  content: ""; position: absolute; top: 36px; left: 12.5%; right: 12.5%; height: 2px;
  background: linear-gradient(90deg, var(--accent), rgba(106,92,255,.2)); transform-origin: left;
}
.ox-flow[data-r]::before { transform: scaleX(0); transition: transform 1.4s var(--ease) .2s }
.ox-flow[data-r].in::before { transform: none }
.ox-flow li { position: relative; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 0 16px }
.ox-flow .pg-ico { width: 72px; height: 72px; border-radius: 24px; margin-bottom: 20px; background: #fff; z-index: 1 }
.ox-flow li:hover .pg-ico { transform: none; background: var(--accent-soft); color: var(--accent-deep) }
.ox-flow li > span { font-family: var(--font-mono); font-size: .68rem; font-weight: 700; letter-spacing: .1em; color: var(--accent-deep) }
.ox-flow strong { margin-top: 8px; font-family: var(--font-display); font-size: 1.12rem; font-weight: 700; letter-spacing: -.02em }
.ox-flow p { margin: 8px 0 0; max-width: 24ch; color: var(--ink-soft); font-size: .92rem; line-height: 1.6 }
.ox-flow[data-r] li { opacity: 0; transform: translateY(16px); transition: opacity .6s var(--ease), transform .6s var(--ease) }
.ox-flow[data-r].in li { opacity: 1; transform: none }
.ox-flow[data-r].in li:nth-child(2) { transition-delay: .15s } .ox-flow[data-r].in li:nth-child(3) { transition-delay: .3s } .ox-flow[data-r].in li:nth-child(4) { transition-delay: .45s }
.ox-split { display: grid; grid-template-columns: .8fr 1.2fr; gap: 64px; align-items: start }
.ox-split .pg-head { margin-bottom: 0; position: sticky; top: 110px }
.ox-steps { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--border-strong) }
.ox-steps > li {
  display: grid; grid-template-columns: 6.5rem 1fr auto; gap: 24px; align-items: center; padding: 30px 0;
  border-bottom: 1px solid var(--border); transition: background .35s var(--ease), padding .35s var(--ease);
}
.ox-steps > li:hover { background: linear-gradient(90deg, var(--accent-soft), transparent 75%); padding-left: 16px }
.ox-steps__n { font-family: var(--font-display); font-size: clamp(3rem, 6vw, 4.4rem); font-weight: 700; line-height: .9; letter-spacing: -.06em; color: rgba(85,70,224,.16); transition: color .35s var(--ease) }
.ox-steps > li:hover .ox-steps__n { color: var(--accent) }
.ox-steps h3 { margin: 0; font-family: var(--font-display); font-size: 1.4rem; font-weight: 700; letter-spacing: -.025em }
.ox-steps p { margin: 6px 0 0; color: var(--ink-soft); font-size: .95rem; line-height: 1.6 }
.ox-steps > li:hover .pg-ico { transform: none; background: var(--accent-soft); color: var(--accent-deep) }
@media (prefers-reduced-motion: reduce) {
  .ox-flow[data-r]::before { transform: none; transition: none }
  .ox-flow[data-r] li { opacity: 1; transform: none; transition: none }
}
@media (max-width: 980px) {
  .ox-split { grid-template-columns: 1fr; gap: 32px }
  .ox-split .pg-head { position: static }
}
@media (max-width: 760px) {
  .ox-flow { grid-template-columns: 1fr; gap: 26px }
  .ox-flow::before { top: 36px; bottom: 36px; left: 35px; right: auto; width: 2px; height: auto }
  .ox-flow li { flex-direction: row; flex-wrap: wrap; text-align: left; align-items: center; gap: 2px 18px; padding: 0 }
  .ox-flow .pg-ico { margin: 0 }
  .ox-flow strong, .ox-flow p { flex-basis: calc(100% - 90px); margin: 0 0 0 auto }
  .ox-flow li > span { display: none }
  .ox-steps > li { grid-template-columns: 4.5rem 1fr; gap: 14px }
  .ox-steps .pg-ico { display: none }
}

/* ── About: an overlap diagram, a ruled list, and large link rows ── */
.ab-venn[data-r], .ab-rows[data-r], .ab-links[data-r] { opacity: 1; transform: none; filter: none }
.ab-split { display: grid; grid-template-columns: 1.05fr 1fr; gap: 64px; align-items: center }
.ab-split .pg-head { margin-bottom: 8px }
.ab-venn svg { display: block; width: 100%; height: auto; overflow: visible }
.ab-c { transform-box: fill-box; transform-origin: center }
.ab-c--a { fill: url(#ab-a); stroke: rgba(106,92,255,.45); stroke-width: 1.5 }
.ab-c--b { fill: rgba(16,25,46,.04); stroke: rgba(16,25,46,.28); stroke-width: 1.5 }
.ab-lens { fill: rgba(106,92,255,.28) }
.ab-t1 { font-family: var(--font-display); font-size: 21px; font-weight: 700; letter-spacing: -.02em; fill: var(--ink) }
.ab-t2 { font-family: var(--font-mono); font-size: 11px; letter-spacing: .08em; text-transform: uppercase; fill: var(--muted) }
.ab-t3 { font-family: var(--font-mono); font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; fill: var(--accent-deep) }
.ab-core circle { fill: var(--accent); stroke: #fff; stroke-width: 3 }
.ab-venn[data-r] .ab-c--a { opacity: 0; transform: translateX(-34px) scale(.92); transition: opacity .9s var(--ease), transform 1.1s var(--ease) }
.ab-venn[data-r] .ab-c--b { opacity: 0; transform: translateX(34px) scale(.92); transition: opacity .9s var(--ease) .1s, transform 1.1s var(--ease) .1s }
.ab-venn[data-r] .ab-lens, .ab-venn[data-r] .ab-core, .ab-venn[data-r] .ab-label { opacity: 0; transition: opacity .8s var(--ease) 1s }
.ab-venn[data-r].in .ab-c { opacity: 1; transform: none }
.ab-venn[data-r].in .ab-lens, .ab-venn[data-r].in .ab-core, .ab-venn[data-r].in .ab-label { opacity: 1 }
.ab-rows { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--border-strong) }
.ab-rows li { display: grid; grid-template-columns: auto 1fr; gap: 20px; align-items: center; padding: 22px 0; border-bottom: 1px solid var(--border); transition: background .35s var(--ease), padding .35s var(--ease) }
.ab-rows li:hover { background: linear-gradient(90deg, var(--accent-soft), transparent 75%); padding-left: 14px }
.ab-rows li:hover .pg-ico { transform: none; background: var(--accent-soft); color: var(--accent-deep) }
.ab-rows h3 { margin: 0; font-family: var(--font-display); font-size: 1.12rem; font-weight: 700; letter-spacing: -.02em }
.ab-rows p { margin: 5px 0 0; color: var(--ink-soft); font-size: .93rem; line-height: 1.6 }
.ab-links { display: grid; border-top: 1px solid var(--border-strong) }
.ab-links a {
  position: relative; display: grid; grid-template-columns: 11rem 1fr auto; grid-template-rows: auto auto; gap: 6px 32px; align-items: center;
  padding: 38px 0; border-bottom: 1px solid var(--border); text-decoration: none; color: inherit; overflow: hidden;
  transition: padding .4s var(--ease), background .4s var(--ease);
}
.ab-links a:hover { padding-left: 22px; background: linear-gradient(90deg, var(--accent-soft), transparent 70%) }
.ab-links span { grid-row: span 2; font-family: var(--font-mono); font-size: .68rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--accent-deep) }
.ab-links strong { font-family: var(--font-display); font-size: clamp(1.7rem, 3.4vw, 2.6rem); font-weight: 700; letter-spacing: -.035em; line-height: 1.1; color: var(--ink) }
.ab-links p { grid-column: 2; margin: 0; max-width: 52ch; color: var(--ink-soft); font-size: .96rem; line-height: 1.6 }
.ab-links i { grid-column: 3; grid-row: span 2; display: grid; place-items: center; width: 52px; height: 52px; border: 1px solid rgba(106,92,255,.4); color: var(--accent-deep); transition: transform .4s var(--ease), background .3s var(--ease), color .3s var(--ease) }
.ab-links a:hover i { transform: translateX(6px); background: var(--accent); color: #fff; border-color: var(--accent) }
@media (prefers-reduced-motion: reduce) {
  .ab-venn[data-r] .ab-c, .ab-venn[data-r] .ab-lens, .ab-venn[data-r] .ab-core, .ab-venn[data-r] .ab-label { opacity: 1; transform: none; transition: none }
}
@media (max-width: 980px) { .ab-split { grid-template-columns: 1fr; gap: 36px } }
@media (max-width: 680px) {
  .ab-links a { grid-template-columns: 1fr auto; padding: 28px 0 }
  .ab-links span { grid-row: auto; grid-column: 1 / -1 }
  .ab-links p { grid-column: 1 }
  .ab-links i { grid-column: 2; grid-row: 2 / span 2; width: 44px; height: 44px }
}

/* ── Vertical rhythm ── */
.pg-section { padding-top: 150px }
.pg-head { margin-bottom: 60px }
.pg-head h2 + p, .pg-head .sp-tag + h2 { margin-top: 16px }
.pg-close { margin-top: 88px; padding: 72px 0 0 }
.pg-dark { padding: 72px 0 0 }
.pg-rows > li, .ab-rows li { padding-top: 26px; padding-bottom: 26px }
.ab-links a { padding: 46px 0 }
.ox-flow { margin-top: 16px }
.ox-steps > li { padding: 34px 0 }
@media (max-width: 980px) { .pg-dark { padding: 48px 0 0 } }
@media (max-width: 680px) {
  .pg-section { padding-top: 96px }
  .pg-head { margin-bottom: 40px }
  .pg-close { margin-top: 64px; padding: 40px 0 0 }
  .pg-dark { padding: 40px 0 0 }
}

.ab-statement[data-r] { opacity: 1; transform: none; filter: none }
.ab-statement { max-width: 62rem }
.ab-statement h2 { margin: 20px 0 0; font-family: var(--font-display); font-size: clamp(2.2rem, 5.4vw, 4.2rem); font-weight: 700; letter-spacing: -.05em; line-height: 1.04; color: var(--ink); text-wrap: balance }
.ab-statement mark { background: linear-gradient(transparent 64%, rgba(106,92,255,.28) 64%); color: inherit; padding: 0 3px }
.ab-statement p { margin: 28px 0 0; max-width: 50ch; color: var(--ink-soft); font-size: 1.08rem; line-height: 1.7; text-wrap: pretty }

.ox-flow--3 { grid-template-columns: repeat(3, 1fr) }
.ox-flow--3::before { left: 16.66%; right: 16.66% }
@media (max-width: 760px) { .ox-flow--3 { grid-template-columns: 1fr } .ox-flow--3::before { left: 35px; right: auto } }
`;
