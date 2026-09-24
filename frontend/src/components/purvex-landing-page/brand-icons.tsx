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

export const IconBook = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M3.5 5h7.5v14H3.5zM13 5h7.5v14H13z" />
    <Node cx={16.75} cy={9.5} r={1.4} />
  </Glyph>
);

export const IconHeadset = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M4.5 13v-1.5a7.5 7.5 0 0115 0V13" />
    <rect x="3.5" y="13" width="3.5" height="5" />
    <rect x="17" y="13" width="3.5" height="5" />
    <path d="M18.7 18c0 1.8-2.2 3-5.2 3" />
    <Node cx={12.5} cy={21} r={1.4} />
  </Glyph>
);

export const IconKey = (p: IconProps) => (
  <Glyph {...p}>
    <circle cx="8" cy="12" r="4" />
    <path d="M12 12h9M18 12v3.2M21 12v2.2" />
    <Node cx={8} cy={12} r={1.3} />
  </Glyph>
);

export const IconAudit = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M5.5 4.5h13v17h-13zM9 4.5V3h6v1.5" />
    <path d="M8.5 10h7M8.5 13.5h4" />
    <path d="M9 18l1.8 1.8 4-4" stroke="var(--accent)" />
  </Glyph>
);

export const IconLifebuoy = (p: IconProps) => (
  <Glyph {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="3.4" />
    <path d="M6 6l3.6 3.6M18 6l-3.6 3.6M6 18l3.6-3.6M18 18l-3.6-3.6" />
    <Node cx={12} cy={12} r={1.2} />
  </Glyph>
);

export const IconChecks = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M3 12.5l4 4 6-8" />
    <path d="M11 16.5l1 1 8-9.5" stroke="var(--accent)" />
  </Glyph>
);

export const IconCompass = (p: IconProps) => (
  <Glyph {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M15.8 8.2l-2.2 5.4-5.4 2.2 2.2-5.4z" />
    <Node cx={12} cy={12} r={1.2} />
  </Glyph>
);

export const IconMic = (p: IconProps) => (
  <Glyph {...p}>
    <rect x="9" y="3" width="6" height="11" />
    <path d="M5.5 11.5a6.5 6.5 0 0013 0M12 18v3M9 21h6" />
    <Node cx={12} cy={8.5} r={1.4} />
  </Glyph>
);

export const IconGraduate = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M2.5 9L12 4.5 21.5 9 12 13.5z" />
    <path d="M6 11.3V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.7" />
    <Node cx={12} cy={9} r={1.3} />
  </Glyph>
);

export const IconCampus = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M3 20.5h18M5 20.5V10l7-5 7 5v10.5M9.5 20.5v-5h5v5" />
    <Node cx={12} cy={10.5} r={1.5} />
  </Glyph>
);

export const IconCivic = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M3 9.5L12 4.5l9 5zM5.5 11v7M10 11v7M14 11v7M18.5 11v7M3.5 20.5h17" />
    <Node cx={12} cy={7.6} r={1.2} />
  </Glyph>
);

export const IconBriefcase = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M3 7.5h18v12H3zM9 7.5V5h6v2.5M3 13h18" />
    <Node cx={12} cy={13} r={1.6} />
  </Glyph>
);

export type BrandIcon = (p: IconProps) => ReactNode;
