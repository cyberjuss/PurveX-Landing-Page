// Cartoon people for the slides whose topic is a person doing something: the
// analyst at the desk, the attacker, the help desk call, the phished user,
// the insider, the presenter and the investigator. Flat shapes, no outlines,
// so they read on the light and the dark stage alike. Animated by the lkc-
// classes in lesson-deck.css.

export const CARTOON_NAMES = ["analyst", "attacker", "helpdesk", "phished", "insider", "presenter", "detective"] as const;
export type Cartoon = (typeof CARTOON_NAMES)[number];

const SKIN = { light: "#ffd9b3", tan: "#e0a872", brown: "#b07445", deep: "#7a4a2a" };
const HAIR = { dark: "#2b2233", brown: "#6b4226", auburn: "#a0482a", black: "#151018" };
const INK = "#1e1b2e";

// Origin of a rotation, in the drawing's own units.
const pivot = (x: number, y: number) => ({ transformOrigin: `${x}px ${y}px` });

function Face({
  x,
  y,
  skin,
  hair,
  long,
  look = 0,
  mouth = "smile",
}: {
  x: number;
  y: number;
  skin: string;
  hair: string;
  long?: boolean;
  look?: number;
  mouth?: "smile" | "o" | "flat";
}) {
  return (
    <g>
      {long && <path d={`M${x - 18} ${y - 2} q-2 28 6 34 h24 q8 -6 6 -34 z`} fill={hair} />}
      <circle cx={x} cy={y} r="16" fill={skin} />
      <path d={`M${x - 16} ${y - 2} a16 16 0 0 1 32 0 q-8 -9 -16 -7 q-8 -2 -16 7 z`} fill={hair} />
      <g className="lkc-eyes">
        <ellipse cx={x - 6 + look} cy={y + 1} rx="2" ry="2.6" fill={INK} />
        <ellipse cx={x + 6 + look} cy={y + 1} rx="2" ry="2.6" fill={INK} />
      </g>
      <circle cx={x - 10} cy={y + 7} r="2.6" fill="#f08a8a" opacity="0.45" />
      <circle cx={x + 10} cy={y + 7} r="2.6" fill="#f08a8a" opacity="0.45" />
      {mouth === "o" ? (
        <ellipse cx={x + look / 2} cy={y + 9} rx="2.6" ry="3.2" fill={INK} />
      ) : (
        <path
          d={mouth === "flat" ? `M${x - 4} ${y + 9} h8` : `M${x - 5} ${y + 8} q5 4 10 0`}
          stroke={INK}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      )}
    </g>
  );
}

/** Shoulders and chest, from the neck down to `bottom`. */
function Torso({ x, y, shirt, bottom }: { x: number; y: number; shirt: string; bottom: number }) {
  return <path d={`M${x - 24} ${bottom} V${y + 40} q0 -22 24 -22 q24 0 24 22 V${bottom} z`} fill={shirt} />;
}

function Arm({ d, shirt, hand, skin, className, style }: { d: string; shirt: string; hand: [number, number]; skin: string; className?: string; style?: React.CSSProperties }) {
  return (
    <g className={className} style={style}>
      <path d={d} stroke={shirt} strokeWidth="9" strokeLinecap="round" fill="none" />
      <circle cx={hand[0]} cy={hand[1]} r="5.5" fill={skin} />
    </g>
  );
}

export function CartoonArt({ scene }: { scene: Cartoon }) {
  switch (scene) {
    case "analyst":
      return (
        <>
          <rect className="lkc-desk" x="14" y="146" width="176" height="8" rx="3" />
          <g>
            <rect className="lkc-screen" x="98" y="54" width="86" height="60" rx="5" />
            <rect className="lkc-scr-line" x="108" y="66" width="40" height="5" rx="2.5" />
            <rect className="lkc-scr-line" x="108" y="78" width="58" height="5" rx="2.5" />
            <rect className="lkc-scr-line" x="108" y="90" width="30" height="5" rx="2.5" />
            <rect className="lkc-desk" x="137" y="114" width="8" height="32" />
            <g className="lkc-alert">
              <circle cx="172" cy="62" r="11" />
              <path d="M172 56 v7 M172 67 v1" />
            </g>
          </g>
          <g className="lkc-lean" style={pivot(60, 140)}>
            <Torso x={60} y={86} shirt="#7c6cf0" bottom={146} />
            <Face x={60} y={86} skin={SKIN.tan} hair={HAIR.dark} look={2} />
          </g>
          <rect className="lkc-key" x="92" y="138" width="44" height="6" rx="2" />
          <Arm className="lkc-type" style={pivot(78, 116)} d="M78 116 L100 136" shirt="#6a5ae0" hand={[100, 136]} skin={SKIN.tan} />
          <Arm className="lkc-type lkc-type--b" style={pivot(44, 116)} d="M44 116 Q60 136 86 138" shirt="#6a5ae0" hand={[86, 138]} skin={SKIN.tan} />
        </>
      );

    case "attacker":
      return (
        <>
          <path d="M34 178 q0 -52 56 -56 q56 4 56 56 z" fill="#2e2a40" />
          <path d="M52 104 q0 -54 38 -54 q38 0 38 54 q0 8 -8 10 h-60 q-8 -2 -8 -10 z" fill="#2e2a40" />
          <ellipse cx="90" cy="98" rx="21" ry="23" fill="#120f1c" />
          <g className="lkc-glow">
            <ellipse cx="82" cy="96" rx="3.2" ry="2.2" fill="#4ade80" />
            <ellipse cx="98" cy="96" rx="3.2" ry="2.2" fill="#4ade80" />
          </g>
          <rect x="58" y="132" width="76" height="44" rx="4" fill="#64748b" />
          <circle cx="96" cy="154" r="7" fill="#475569" />
          <path d="M50 176 h92 l6 8 h-104 z" fill="#475569" />
          {[
            ["</>", 70, 0],
            ["01", 98, 0.7],
            ["{ }", 124, 1.4],
          ].map(([t, x, d]) => (
            <text key={t as string} className="lkc-rise" x={x as number} y="126" style={{ animationDelay: `${d}s` }}>
              {t as string}
            </text>
          ))}
        </>
      );

    case "helpdesk":
      return (
        <>
          <rect className="lkc-desk" x="14" y="158" width="176" height="8" rx="3" />
          <Torso x={66} y={96} shirt="#0ea5e9" bottom={158} />
          <Face x={66} y={96} skin={SKIN.brown} hair={HAIR.black} long look={2} />
          <path d="M49 94 a17 17 0 0 1 34 0" stroke={INK} strokeWidth="3.5" fill="none" />
          <rect x="46" y="90" width="7" height="12" rx="3" fill={INK} />
          <path d="M50 102 q0 12 14 12" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="64" cy="114" r="3" fill={INK} />
          <Arm className="lkc-wave" style={pivot(84, 124)} d="M84 124 L104 104" shirt="#0284c7" hand={[104, 104]} skin={SKIN.brown} />
          <g className="lkc-bubble">
            <rect x="112" y="34" width="76" height="50" rx="14" className="lkc-bubble-box" />
            <path d="M124 82 l-10 14 l20 -12 z" className="lkc-bubble-box" />
            <text className="lkc-q" x="150" y="68" textAnchor="middle">?</text>
            <path className="lkc-a" d="M136 60 l9 9 l18 -18" />
          </g>
        </>
      );

    case "phished":
      return (
        <>
          <rect className="lkc-desk" x="14" y="160" width="176" height="8" rx="3" />
          <Torso x={58} y={100} shirt="#f59e0b" bottom={160} />
          <Face x={58} y={100} skin={SKIN.light} hair={HAIR.auburn} look={3} mouth="o" />
          <rect className="lkc-screen" x="96" y="112" width="58" height="40" rx="4" />
          <path d="M104 120 h42 v24 h-42 z M104 120 l21 14 l21 -14" fill="none" stroke="#fde68a" strokeWidth="2.5" strokeLinejoin="round" />
          <rect className="lkc-desk" x="118" y="152" width="12" height="8" />
          <g className="lkc-dangle" style={pivot(170, 6)}>
            <path className="lkc-line" d="M170 6 V72" />
            <path className="lkc-line" d="M170 72 v8 a6 6 0 0 1 -12 0" />
            <rect x="150" y="86" width="40" height="28" rx="3" fill="#f43f5e" />
            <path d="M150 88 l20 14 l20 -14" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" />
          </g>
          <g className="lkc-alert" style={{ animationDelay: "0.6s" }}>
            <circle cx="40" cy="62" r="11" />
            <path d="M40 56 v7 M40 67 v1" />
          </g>
        </>
      );

    case "insider":
      return (
        <>
          <rect className="lkc-door" x="150" y="36" width="40" height="132" rx="2" />
          <rect className="lkc-desk" x="10" y="168" width="184" height="5" rx="2" />
          <g className="lkc-walk">
            <path className="lkc-leg" style={pivot(70, 140)} d="M70 140 L66 168" stroke="#334155" strokeWidth="9" strokeLinecap="round" />
            <path className="lkc-leg lkc-leg--b" style={pivot(84, 140)} d="M84 140 L88 168" stroke="#334155" strokeWidth="9" strokeLinecap="round" />
            <rect x="54" y="92" width="46" height="52" rx="14" fill="#14b8a6" />
            <Face x={77} y={74} skin={SKIN.deep} hair={HAIR.dark} look={-4} mouth="flat" />
            <path d={`M64 64 l8 3 M90 64 l-8 3`} stroke={INK} strokeWidth="2" strokeLinecap="round" />
            <rect x="92" y="104" width="32" height="26" rx="2" fill="#f59e0b" />
            <rect x="103" y="113" width="10" height="9" rx="1.5" fill={INK} />
            <path d="M105 113 v-3 a3 3 0 0 1 6 0 v3" stroke={INK} strokeWidth="2" fill="none" />
            <circle cx="94" cy="118" r="5.5" fill={SKIN.deep} />
          </g>
        </>
      );

    case "presenter":
      return (
        <>
          <rect className="lkc-board" x="86" y="30" width="106" height="84" rx="4" />
          {[
            [100, 24],
            [122, 40],
            [144, 32],
            [166, 54],
          ].map(([x, h], i) => (
            <rect
              key={x}
              className="lkc-bar"
              x={x}
              y={104 - h}
              width="14"
              height={h}
              rx="2"
              style={{ animationDelay: `${0.3 + i * 0.35}s`, fill: ["#7c6cf0", "#0ea5e9", "#10b981", "#f59e0b"][i] }}
            />
          ))}
          <rect className="lkc-desk" x="132" y="114" width="6" height="56" />
          <Torso x={50} y={98} shirt="#10b981" bottom={176} />
          <Face x={50} y={98} skin={SKIN.light} hair={HAIR.brown} long look={3} />
          <g className="lkc-point" style={pivot(68, 128)}>
            <path d="M68 128 L90 108" stroke="#059669" strokeWidth="9" strokeLinecap="round" />
            <path className="lkc-line" d="M92 106 L124 76" />
            <circle cx="90" cy="108" r="5.5" fill={SKIN.light} />
          </g>
        </>
      );

    case "detective":
      return (
        <>
          {[
            [146, 156, 0],
            [162, 142, 0.5],
            [178, 156, 1],
          ].map(([x, y, d]) => (
            <ellipse key={x} className="lkc-clue" cx={x} cy={y} rx="5" ry="8" style={{ animationDelay: `${d}s` }} />
          ))}
          <Torso x={64} y={100} shirt="#b08d57" bottom={180} />
          <path d="M64 124 v56" stroke="#8a6a3e" strokeWidth="3" />
          <Face x={64} y={100} skin={SKIN.tan} hair={HAIR.brown} look={4} mouth="flat" />
          <ellipse cx="64" cy="86" rx="26" ry="5" fill="#5b4632" />
          <path d="M48 86 q2 -20 16 -20 q14 0 16 20 z" fill="#5b4632" />
          <rect x="48" y="80" width="32" height="4" fill="#2b2233" />
          <g className="lkc-sweep" style={pivot(84, 126)}>
            <path d="M84 126 L104 128" stroke="#9a7a48" strokeWidth="9" strokeLinecap="round" />
            <path className="lkc-line lkc-line--thick" d="M106 126 L116 116" />
            <circle className="lkc-lens" cx="128" cy="104" r="17" />
            <circle cx="104" cy="128" r="5.5" fill={SKIN.tan} />
          </g>
        </>
      );
  }
}
