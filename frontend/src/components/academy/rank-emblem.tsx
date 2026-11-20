import type { Rank } from "@/lib/academy-badges";

// The rank as a shield, the badge a student wears next to their name. Each
// rank has its own mark and colour, and reaching Ready adds a gold rim and a
// check, so the one badge says both where they are and that they made the bar.

const MARK: Record<string, { text: string; fill: string }> = {
  trainee: { text: "T", fill: "#5b6170" },
  "help-desk": { text: "HD", fill: "#5546e0" },
  "junior-soc": { text: "SOC", fill: "#0e7f76" },
  "soc-tier-2": { text: "T2", fill: "#1f5fae" },
  "incident-responder": { text: "IR", fill: "#b23a48" },
};

export function RankEmblem({ rank, ready = false, size = 28 }: { rank: Pick<Rank, "id" | "title">; ready?: boolean; size?: number }) {
  const mark = MARK[rank.id] ?? MARK.trainee;
  const label = `${rank.title}${ready ? ", Ready" : ""}`;
  return (
    <svg
      className={`rank-emblem${ready ? " is-ready" : ""}`}
      width={size}
      height={size * 1.12}
      viewBox="0 0 40 45"
      role="img"
      aria-label={label}
    >
      <title>{label}</title>
      <path
        d="M20 2 L37 8 V22 C37 33 29.5 40 20 43 C10.5 40 3 33 3 22 V8 Z"
        fill={mark.fill}
        stroke={ready ? "#e0b43c" : "rgba(255,255,255,0.18)"}
        strokeWidth={ready ? 3 : 1.5}
        strokeLinejoin="round"
      />
      <text
        x="20"
        y={ready ? 23 : 26}
        textAnchor="middle"
        fontSize={mark.text.length > 2 ? 10 : 12}
        fontWeight={700}
        fill="#fff"
        style={{ fontFamily: "var(--font-mono, ui-monospace, monospace)", letterSpacing: "0.04em" }}
      >
        {mark.text}
      </text>
      {ready && <path d="M14.5 30.5 L18.5 34 L26 27" fill="none" stroke="#e0b43c" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}
