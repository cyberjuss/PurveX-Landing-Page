import type { ReactNode } from "react";

/* PurveX icon family. One grid (24), one stroke (1.6, square ends), and a
   single accent node in each glyph, so the set reads as one system. */

type IconProps = { size?: number; className?: string };

function Glyph({ size = 22, className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const Node = ({ cx, cy, r = 1.7 }: { cx: number; cy: number; r?: number }) => (
  <circle cx={cx} cy={cy} r={r} fill="var(--accent)" stroke="none" />
);

export const IconChain = (p: IconProps) => (
  <Glyph {...p}>
    <rect x="2.5" y="9" width="5" height="6" />
    <rect x="16.5" y="9" width="5" height="6" />
    <path d="M7.5 12h2.5M14 12h2.5" />
    <Node cx={12} cy={12} r={1.3} />
  </Glyph>
);

export const IconCoverage = (p: IconProps) => (
  <Glyph {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" />
    <path d="M9.2 3.5v17M14.8 3.5v17M3.5 9.2h17M3.5 14.8h17" />
    <rect x="9.2" y="9.2" width="5.6" height="5.6" fill="var(--accent)" stroke="none" />
  </Glyph>
);

export const IconEvidence = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M6 3h9l4 4v14H6z" />
    <path d="M15 3v4h4" />
    <path d="M9 14l2.2 2.2L15.5 12" stroke="var(--accent)" />
  </Glyph>
);

export const IconSchedule = (p: IconProps) => (
  <Glyph {...p}>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l3 2" />
    <Node cx={12} cy={3.2} r={1.4} />
  </Glyph>
);

export const IconSignal = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M2.5 12h4l2.5-6 4 12 2.5-6h6" />
    <Node cx={21.5} cy={12} />
  </Glyph>
);

export const IconTune = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />
    <Node cx={8} cy={7} r={2} />
    <Node cx={15.5} cy={12} r={2} />
    <Node cx={10} cy={17} r={2} />
  </Glyph>
);

export const IconValidate = (p: IconProps) => (
  <Glyph {...p}>
    <circle cx="12" cy="12" r="7" />
    <path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4" />
    <Node cx={12} cy={12} r={2} />
  </Glyph>
);

export const IconLog = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M3.5 6h17M3.5 10.5h10M3.5 15h13M3.5 19.5h7" />
    <Node cx={19} cy={19.5} />
  </Glyph>
);

export const IconShield = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6z" />
    <Node cx={12} cy={11.5} r={1.8} />
  </Glyph>
);

export const IconIdentity = (p: IconProps) => (
  <Glyph {...p}>
    <circle cx="10" cy="8" r="3.5" />
    <path d="M3.5 20.5c0-4 2.8-6.5 6.5-6.5s6.5 2.5 6.5 6.5" />
    <Node cx={19.5} cy={6} />
    <path d="M18.4 7.4L21 10" />
  </Glyph>
);

export type BrandIcon = (p: IconProps) => ReactNode;
