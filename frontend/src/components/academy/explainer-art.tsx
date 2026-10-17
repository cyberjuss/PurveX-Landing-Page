// Concept explainers: each one shows the mechanism a lesson teaches rather
// than decorating it. A leak leaves the original where it was, a lie changes
// a number nobody notices, a lockout stops work with nothing stolen. Each
// plays as a short loop with a caption, so a student who watches it once
// has seen the idea happen. Animated by the lkx- classes in lesson-deck.css.

export const EXPLAINER_NAMES = ["leak", "lie", "lockout", "riskmix", "avalanche", "salt", "wrongkey", "mfa"] as const;
export type Explainer = (typeof EXPLAINER_NAMES)[number];

const d = (s: number) => ({ animationDelay: `${s}s` });

function Doc({ x, y, className }: { x: number; y: number; className?: string }) {
  return (
    <g className={className}>
      <path className="lkx-doc" d={`M${x} ${y} h34 l12 12 v50 h-46 z`} />
      <path className="lkx-fold" d={`M${x + 34} ${y} v12 h12`} />
      {[20, 30, 40, 50].map((dy, i) => (
        <rect key={dy} className="lkx-docline" x={x + 7} y={y + dy} width={i % 2 ? 22 : 32} height="4" rx="2" />
      ))}
    </g>
  );
}

function Hood({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path d={`M${x - 22} ${y + 48} q0 -30 22 -32 q22 2 22 32 z`} fill="#2e2a40" />
      <path d={`M${x - 15} ${y + 8} q0 -24 15 -24 q15 0 15 24 q0 4 -4 5 h-22 q-4 -1 -4 -5 z`} fill="#2e2a40" />
      <ellipse cx={x} cy={y + 5} rx="9" ry="10" fill="#120f1c" />
      <ellipse className="lkx-glare" cx={x - 4} cy={y + 4} rx="1.8" ry="1.3" fill="#f87171" />
      <ellipse className="lkx-glare" cx={x + 4} cy={y + 4} rx="1.8" ry="1.3" fill="#f87171" />
    </g>
  );
}

function Caption({ children }: { children: string }) {
  return (
    <text className="lkx-cap" x="100" y="194" textAnchor="middle">
      {children}
    </text>
  );
}

export function ExplainerArt({ scene }: { scene: Explainer }) {
  switch (scene) {
    // Confidentiality fails as a leak: a copy leaves, the original stays.
    case "leak":
      return (
        <>
          <rect className="lkx-vault" x="14" y="44" width="76" height="100" rx="4" />
          <Doc x={28} y={62} />
          <g className="lkx-ok-badge">
            <circle cx="80" cy="54" r="9" />
            <path d="M75 54 l3.5 3.5 l6 -7" />
          </g>
          <Doc x={28} y={62} className="lkx-copy" />
          <Hood x={162} y={86} />
          <Caption>The original never moved.</Caption>
        </>
      );

    // Integrity fails as a lie: the figure changes, nothing looks wrong, the hash disagrees.
    case "lie":
      return (
        <>
          <rect className="lkx-card" x="30" y="26" width="140" height="72" rx="4" />
          <text className="lkx-small" x="44" y="46">PAYROLL FIGURE</text>
          <text className="lkx-big lkx-before" x="44" y="80">$500</text>
          <text className="lkx-big lkx-after" x="44" y="80">$5,000</text>
          <rect className="lkx-tag lkx-tag--ok" x="30" y="114" width="140" height="26" rx="13" />
          <text className="lkx-tagtext lkx-before" x="100" y="131" textAnchor="middle">hash 15aebe14… ✓</text>
          <rect className="lkx-tag lkx-tag--bad lkx-after" x="30" y="114" width="140" height="26" rx="13" />
          <text className="lkx-tagtext lkx-after" x="100" y="131" textAnchor="middle">hash 9268d0f3… ✗</text>
          <Caption>It still looks normal.</Caption>
        </>
      );

    // Availability fails as a lockout: everyone bounces off, nothing is taken.
    case "lockout":
      return (
        <>
          <rect className="lkx-vault" x="122" y="46" width="62" height="98" rx="4" />
          {[64, 88, 112].map((y, i) => (
            <circle key={y} className="lkx-healthy" cx="138" cy={y} r="4" style={d(i * 0.3)} />
          ))}
          <g className="lkx-padlock">
            <path d="M146 92 v-8 a8 8 0 0 1 16 0 v8" />
            <rect x="141" y="92" width="26" height="20" rx="3" />
          </g>
          {[0, 1, 2].map((i) => (
            <g key={i} className="lkx-user" style={d(i * 0.7)}>
              <circle cx="22" cy={68 + i * 30} r="7" />
              <path d={`M12 ${88 + i * 30} q0 -12 10 -12 q10 0 10 12 z`} />
              <text className="lkx-q" x="36" y={64 + i * 30}>?</text>
            </g>
          ))}
          <Caption>Nothing stolen. Work stopped.</Caption>
        </>
      );

    // Risk needs both: a weakness alone, a threat alone, then the two together.
    case "riskmix":
      return (
        <>
          <path className="lkx-arc lkx-arc--good" d="M54 120 A46 46 0 0 1 77 80.2" />
          <path className="lkx-arc lkx-arc--warn" d="M80 78.6 A46 46 0 0 1 120 78.6" />
          <path className="lkx-arc lkx-arc--bad" d="M123 80.2 A46 46 0 0 1 146 120" />
          <g className="lkx-needle">
            <path d="M100 120 L100 84" />
            <circle cx="100" cy="120" r="6" />
          </g>
          <g className="lkx-weak">
            <rect className="lkx-wall" x="14" y="132" width="52" height="38" rx="2" />
            <path className="lkx-crackline" d="M40 134 l-6 12 l8 8 l-5 14" />
            <text className="lkx-small" x="40" y="186" textAnchor="middle">weakness</text>
          </g>
          <g className="lkx-threat">
            <Hood x={160} y={124} />
            <text className="lkx-small" x="160" y="186" textAnchor="middle">threat</text>
          </g>
          <text className="lkx-riskword" x="100" y="146" textAnchor="middle">RISK</text>
        </>
      );

    // One letter changes and the whole hash changes.
    case "avalanche":
      return (
        <>
          <rect className="lkx-input" x="10" y="38" width="58" height="26" rx="4" />
          <text className="lkx-mono" x="39" y="56" textAnchor="middle">hello</text>
          <rect className="lkx-input lkx-row2" x="10" y="118" width="58" height="26" rx="4" />
          <text className="lkx-mono lkx-row2" x="39" y="136" textAnchor="middle">
            hell<tspan className="lkx-diff">O</tspan>
          </text>
          <rect className="lkx-machine" x="80" y="68" width="40" height="46" rx="4" />
          <text className="lkx-small lkx-small--inv" x="100" y="95" textAnchor="middle">SHA</text>
          <path className="lkx-flow" d="M68 51 Q80 51 86 70" />
          <path className="lkx-flow lkx-row2" d="M68 131 Q80 131 86 112" />
          <path className="lkx-flow" d="M120 80 Q130 51 134 51" />
          <path className="lkx-flow lkx-row2" d="M120 102 Q130 131 134 131" />
          <rect className="lkx-out" x="134" y="38" width="60" height="26" rx="4" />
          <text className="lkx-mono lkx-mono--sm" x="164" y="56" textAnchor="middle">2cf24d…</text>
          <rect className="lkx-out lkx-out--b lkx-row2" x="134" y="118" width="60" height="26" rx="4" />
          <text className="lkx-mono lkx-mono--sm lkx-row2" x="164" y="136" textAnchor="middle">04a6f5…</text>
          <Caption>One letter. A different hash.</Caption>
        </>
      );

    // Same password, different salt, different stored value.
    case "salt":
      return (
        <>
          {[
            [36, "N4tQ2x", "lkx-salt--a", "YkiZ5p…"],
            [116, "x9Lp7k", "lkx-salt--b", "UpRKpz…"],
          ].map(([y, salt, cls, out], i) => (
            <g key={salt as string}>
              <rect className="lkx-input" x="8" y={y as number} width="70" height="26" rx="4" />
              <text className="lkx-mono lkx-mono--sm" x="43" y={(y as number) + 17} textAnchor="middle">Harbor2026</text>
              <g className={`lkx-saltchip ${cls}`} style={d(0.5 + i * 0.6)}>
                <rect x="84" y={(y as number) + 1} width="38" height="24" rx="12" />
                <text className="lkx-mono lkx-mono--sm lkx-mono--inv" x="103" y={(y as number) + 17} textAnchor="middle">
                  {salt as string}
                </text>
              </g>
              <rect className={`lkx-out lkx-hashout ${i ? "lkx-out--b" : ""}`} x="128" y={y as number} width="66" height="26" rx="4" style={d(1.4 + i * 0.6)} />
              <text className="lkx-mono lkx-mono--sm lkx-hashout" x="161" y={(y as number) + 17} textAnchor="middle" style={d(1.4 + i * 0.6)}>
                {out as string}
              </text>
            </g>
          ))}
          <text className="lkx-small" x="43" y="90" textAnchor="middle">same password</text>
          <Caption>Different salt. Different hash.</Caption>
        </>
      );

    // The right key opens it exactly; one tooth off and it fails outright.
    case "wrongkey":
      return (
        <>
          <g className="lkx-box">
            <rect className="lkx-vault" x="98" y="62" width="88" height="66" rx="4" />
            <text className="lkx-mono lkx-mono--sm lkx-cipher" x="142" y="100" textAnchor="middle">U2FsdGVk…</text>
            <text className="lkx-mono lkx-mono--sm lkx-plain" x="142" y="100" textAnchor="middle">Fee schedule v3</text>
          </g>
          <g className="lkx-key lkx-key--good">
            <circle cx="22" cy="80" r="10" />
            <path d="M32 80 H76 M62 80 v9 M70 80 v6" />
          </g>
          <g className="lkx-key lkx-key--bad">
            <circle cx="22" cy="110" r="10" />
            <path d="M32 110 H76 M58 110 v9 M70 110 v6" />
          </g>
          <path className="lkx-x" d="M132 142 l20 20 M152 142 l-20 20" />
          <Caption>Close is not enough.</Caption>
        </>
      );

    // The password is stolen; the second factor still says no.
    case "mfa":
      return (
        <>
          <rect className="lkx-vault" x="132" y="58" width="52" height="96" rx="3" />
          <g className="lkx-shield">
            <path d="M158 86 l14 5 v12 c0 10 -7 16 -14 19 c-7 -3 -14 -9 -14 -19 v-12 z" />
          </g>
          <g className="lkx-approach">
            <Hood x={40} y={100} />
            <rect className="lkx-pwcard" x="56" y="122" width="34" height="16" rx="3" />
            <text className="lkx-mono lkx-mono--sm lkx-mono--inv" x="73" y="134" textAnchor="middle">••••</text>
          </g>
          <g className="lkx-phone">
            <rect x="92" y="14" width="44" height="66" rx="7" />
            <text className="lkx-small lkx-small--inv" x="114" y="36" textAnchor="middle">Sign in?</text>
            <circle className="lkx-deny" cx="114" cy="58" r="10" />
            <path className="lkx-denyx" d="M109 53 l10 10 M119 53 l-10 10" />
          </g>
          <Caption>Password stolen. Still locked out.</Caption>
        </>
      );
  }
}
