// Sketch an SVG in: its lines draw themselves, then its solid shapes fade up.
// Uses the Web Animations API, which runs alongside an element's own CSS
// animation rather than replacing it, so a drawing that loops still loops,
// it simply arrives drawn first. Lines that already animate their dashes are
// left alone. Nothing runs with reduced motion, or where the API is missing.

type Opts = {
  /** Wait before the first stroke, in ms. */
  delay?: number;
  /** Time for one stroke to draw, in ms. */
  stroke?: number;
  /** Gap between one stroke starting and the next, in ms. */
  stagger?: number;
  /** Longest the whole sketch may take before its last stroke starts, in ms. */
  budget?: number;
};

const DRAWABLE = "path, line, polyline, polygon, circle, ellipse, rect";

export function drawOn(root: Element | null, { delay = 0, stroke = 520, stagger = 28, budget = 480 }: Opts = {}) {
  if (!root || typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const els = Array.from(root.querySelectorAll<SVGGeometryElement>(DRAWABLE));
  if (!els.length || typeof els[0].animate !== "function") return;

  const lines: SVGGeometryElement[] = [];
  const fills: SVGGeometryElement[] = [];
  for (const el of els) {
    const cs = window.getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    const stroked = cs.stroke !== "none" && parseFloat(cs.strokeWidth) > 0;
    // A line that already runs its own dash animation keeps it.
    if (stroked && cs.strokeDasharray === "none") lines.push(el);
    else if (cs.fill !== "none") fills.push(el);
  }

  const step = lines.length > 1 ? Math.min(stagger, budget / (lines.length - 1)) : 0;
  lines.forEach((el, i) => {
    el.setAttribute("pathLength", "1");
    el.style.strokeDasharray = "1";
    const anim = el.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
      duration: stroke,
      delay: delay + i * step,
      easing: "cubic-bezier(.65, 0, .35, 1)",
      fill: "backwards",
    });
    const done = () => {
      el.removeAttribute("pathLength");
      el.style.strokeDasharray = "";
    };
    anim.onfinish = done;
    anim.oncancel = done;
    // An outline that also has a fill (a duotone icon) shows its fill once
    // the stroke is mostly drawn, not before it.
    if (window.getComputedStyle(el).fill !== "none") {
      el.animate([{ fillOpacity: 0 }], { duration: 260, delay: delay + i * step + stroke * 0.6, fill: "backwards" });
    }
  });

  const fillStart = delay + Math.min(budget, lines.length * step) * 0.6;
  const fillStep = fills.length > 1 ? Math.min(30, 300 / (fills.length - 1)) : 0;
  // Only the start is given, so each shape fades up to its own opacity (a
  // faint 35% shape stays faint) instead of flashing to full and snapping back.
  fills.forEach((el, i) => {
    el.animate([{ opacity: 0 }], {
      duration: 320,
      delay: fillStart + i * fillStep,
      easing: "cubic-bezier(.16, 1, .3, 1)",
      fill: "backwards",
    });
  });
}
