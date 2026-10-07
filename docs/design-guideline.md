# PurveX Range — design guideline

The system the portal actually runs on. Written from the code, not from
aspiration: every number below is a token you can grep for.

The marketing site is a separate system. Its CSS lives in
`frontend/src/components/purvex-landing-page/chrome.tsx` and shares none of
these tokens.

---

## 1. BEAUTIFUL

### Type scale

One scale, on `:root` in `frontend/src/app/globals.css`. It is on `:root`
rather than `.academy-bg` because the lab panel, the explainer and the setup
screen render under `<body>` through a portal, outside that class, and would
resolve nothing.

| token | size | used for |
| --- | --- | --- |
| `--ty-kicker` | 11.5px | mono eyebrow labels, uppercase |
| `--ty-micro` | 12.5px | the smallest readable supporting text |
| `--ty-small` | 14px | secondary rows, quiet links |
| `--ty-note` | 15px | panel body, list rows |
| `--ty-body` | 16.5px | default body |
| `--ty-lead` | 18px | lesson prose, sidebar rows |
| `--ty-h4` | 20px | a heading inside a panel |
| `--ty-h3` | 23px | section heading |
| `--ty-h2` | 28px | page section |
| `--ty-h1` | 34px | prose h1 |
| `--ty-stat` | 40px | a single number that carries a panel |
| `--ty-page` | `clamp(34px, 5vw, 52px)` | page title |
| `--ty-hero` | 76px | the one hero number |

Nothing in portal CSS hardcodes a font size. There were 604 hardcoded sizes
across two parallel scales, prose in `rem` and everything else in `px`, which
is why a lesson read at 17px beside a lab panel at 13px.

### Colour

- `--rd-accent` is the single accent. `#5546e0` light, `#9a8cff` dark.
- Ink runs `--rd-ink`, `--rd-ink-2`, `--rd-ink-3`. The third carries 11-13px
  labels all over the portal, so it is pinned at 4.59:1 on white rather than
  the 3:1 that is only enough for large text.
- Status: `--rd-good`, `--rd-warn`, `--rd-bad`, each chosen to clear 4.5:1 in
  light mode (`#0a7d55`, `#9a6508`, `#d93a3f`).
- Dark mode redefines `--pvrx-*-light` under
  `.academy-bg[data-academy-theme="dark"]`, so most of the portal re-themes
  from one block.

**On the 125 hardcoded hex values.** That number, quoted earlier as debt, turned
out to overstate the problem. Auditing them against dark mode found 477 rules
holding a literal, of which almost all are either a fallback behind a
theme-aware token (`var(--rd-ink, #0f172a)`), a theme definition block that has
to hold literals, a background rather than text, or already covered by an
explicit dark override. One rule was genuinely broken: `.ad-code > summary`
drew `#5546e0` on a surface that is `#000000` in dark mode, 3.34:1. It now uses
`--rd-accent` and reads 7.57:1.

Seventeen bare `color: #5546e0` literals moved onto `var(--rd-accent, #5546e0)`.
Light is byte-identical, since the token is exactly that value there, and dark
can no longer drift. Normalising `#fff` against `#ffffff` is cosmetic and has
not been done.

### Surfaces

The explainer card set the bar, so its decisions are tokens any floating
panel can adopt rather than one card's private styling.

| token | what it does |
| --- | --- |
| `--sf-wash-strength`, `--sf-wash-stop` | a radial wash of the accent off the top edge, so a panel is not a flat rectangle |
| `--sf-lift` | deep enough to read as floating rather than outlined. Heavier in dark. |
| `--sf-line`, `--sf-line-2` | one hairline weight across every panel |
| `--sf-mark-fill`, `--sf-mark-line` | an icon or tag drawn as a tinted square with an inset hairline |

`.sf-wash` draws the wash for anything that sets `position: relative` and
`overflow: hidden`. The lab card and the first-run briefing both carry all
four. Generous padding is the fifth decision and is not a token: 26px on a
panel, 30-34px on a modal.

**Where the wash goes.** It belongs to a surface that floats above the page,
and to at most one hero per page. The lab card, the first-run briefing, the
account menu and the explainer all float. On the home page it is on the Last
stop card alone, because if every row had one then none of them would read as
the next thing to do. Rows, list items and dashboard panels get the hairline,
the mark and the padding, and no wash.

**Marks.** Anything that labels a thing is a mark: an icon, a status tag, a
step number, a role tag. Tinted fill, inset hairline, square. The home page's
phase numbers, its Here and Locked tags and its streak counter are all marks,
as are the lab card's DC and DESKTOP tags.

Still on the old flatter styling, in rough order of how often they are seen:
the readiness dashboard, the lab gallery, the Shift and SIEM consoles, and
the lesson callouts.
can adopt. Four of them:

| token | what it does |
| --- | --- |
|  /  | a radial wash of the accent off the top edge, so a panel is not a flat rectangle |
|  | deep enough to read as floating rather than outlined. Heavier in dark. |
|  /  | one hairline weight across every panel |
|  /  | an icon or tag as a tinted square with an inset hairline |

 draws the wash for anything that sets  and
. The lab card and the first-run briefing both carry it.


- **Square corners.** Portal panels do not round. This was tried and reverted
  on the lab card.
- **No colour-strip callouts.** A flat fill with a bright bar down one side is
  the pattern to avoid. Use a hairline box and a quiet tint.
- Depth comes from a hairline `inset 0 0 0 1px` plus a tint, not from a border
  plus a shadow plus a fill.

### Measure

Prose stops at 62ch. A panel's explanatory text stops at 46-54ch. A full-width
paragraph inside a 1000px column is the failure this prevents.

---

## 2. RIGHT

- **Focus is visible.** `*:focus-visible` carries a 2px accent ring at 2px
  offset. It was `outline: none`, declared twice, with nothing in its place.
- **Contrast.** Body and label text clears 4.5:1. Icon-only controls clear 3:1.
  `text-slate-400` on white is 2.8:1 and is not used for text.
- **Tap targets.** Coarse pointers get a 44px minimum on small controls.
- **Reduced motion.** Every animation has a
  `@media (prefers-reduced-motion: reduce)` branch.
- **Storage can throw.** Private windows throw on `localStorage`. Every read is
  wrapped, and a failed read means show the thing rather than hide it.

---

## 3. SATISFYING

One motion scale, on `:root` beside the type scale, for the same portal reason.

| token | value | used for |
| --- | --- | --- |
| `--ax-ease` | `cubic-bezier(.16, 1, .3, 1)` | everything that is not a sweep |
| `--ax-dur-fast` | 160ms | hover, colour, focus |
| `--ax-dur` | 240ms | the default: open, close, move |
| `--ax-dur-slow` | 320ms | a panel or drawer travelling a long way |
| `--ax-dur-page` | 420ms | a route change |

Rules:

- 150-300ms is the band where a UI feels responsive. Below it reads twitchy,
  above it reads sluggish.
- `linear` is correct for spinners, progress bars and sweeps, where a
  decelerating curve reads as stalling. It is left alone deliberately.
- Durations above 320ms are for deliberate reveals, not micro-interactions.
  Thirteen of those remain and are intentional.
- Sequential delays for a list: 60-70ms apart, no more than four steps.

The portal had **13 distinct durations** and wrote its one signature curve
**three different ways**. 217 declarations now point at the scale.

---

## 4. PEAK

Restraint is the rule. The portal's narrative devices are:

- The lab card reads as **kit you operate**: mono throughout, machines as a
  rack listing with role tags, a labelled meter for hours.
- The explainer is **black in both themes**, sitting over a dimmed page as its
  own surface rather than pretending to belong to the current theme. One wash
  of accent behind the top so it is not a flat rectangle.
- Lessons open on a question, not a summary.

What was tried and removed, and should not come back without a reason:

- A tour that walked the page, dimming everything and moving a caret-tagged
  card from control to control.
- A flat destination rail under the header.
- Rounded corners on the lab card.
- An "On this page" rail beside the lesson.

---

## Where the rules live

| concern | file |
| --- | --- |
| type, colour, motion, portal CSS | `frontend/src/app/globals.css` |
| lesson copy, tone, paragraph shape | `frontend/src/content/academy/CONTENT_STYLE_GUIDE.md` |
| per-surface CSS | `frontend/src/components/academy/*.css` |

When generic design advice disagrees with either of those two files, those two
files win.
