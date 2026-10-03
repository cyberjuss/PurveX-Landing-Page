// A small burst of confetti for the moment a student gets something right.
// No dependency and no canvas: a handful of absolutely positioned pieces,
// animated with the Web Animations API and removed when they finish. Does
// nothing for anyone who asked for reduced motion.

const COLORS = ["#5546e0", "#2fbf71", "#f5a524", "#22b8cf", "#ff6b81", "#9b8cff"];

/** Several right answers can land in the same tick; one burst is plenty. */
let lastBurst = 0;

type Origin = { x: number; y: number };

export function confetti(origin?: Origin, pieces = 34) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const now = Date.now();
  if (now - lastBurst < 900) return;
  lastBurst = now;

  const from: Origin = origin ?? { x: window.innerWidth / 2, y: window.innerHeight * 0.38 };
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:70;overflow:hidden";
  document.body.appendChild(host);

  let running = pieces;
  const done = () => {
    running -= 1;
    if (running <= 0) host.remove();
  };

  for (let i = 0; i < pieces; i++) {
    const bit = document.createElement("i");
    const size = 5 + Math.random() * 6;
    bit.style.cssText = [
      "position:absolute",
      `left:${from.x}px`,
      `top:${from.y}px`,
      `width:${size}px`,
      `height:${size * (Math.random() < 0.35 ? 2 : 1)}px`,
      `background:${COLORS[i % COLORS.length]}`,
      Math.random() < 0.3 ? "border-radius:50%" : "",
      "will-change:transform,opacity",
    ]
      .filter(Boolean)
      .join(";");
    host.appendChild(bit);

    // Up and out, then fall past the bottom of the screen.
    const angle = (-0.5 - Math.random()) * Math.PI; // upward half
    const speed = 160 + Math.random() * 260;
    const dx = Math.cos(angle) * speed * (Math.random() < 0.5 ? -1 : 1);
    const rise = Math.sin(angle) * speed;
    const drop = window.innerHeight - from.y + 140;
    const spin = (Math.random() * 720 - 360).toFixed(0);
    const life = 1100 + Math.random() * 900;

    bit.animate(
      [
        { transform: "translate3d(0,0,0) rotate(0deg)", opacity: 1 },
        { transform: `translate3d(${dx * 0.45}px, ${rise * 0.5}px, 0) rotate(${Number(spin) * 0.4}deg)`, opacity: 1, offset: 0.3 },
        { transform: `translate3d(${dx}px, ${drop}px, 0) rotate(${spin}deg)`, opacity: 0 },
      ],
      { duration: life, easing: "cubic-bezier(.17,.67,.53,1)", fill: "forwards" },
    ).addEventListener("finish", done);
  }

  // Belt and braces: never leave pieces behind if an animation never finishes.
  window.setTimeout(() => host.remove(), 2600);
}

/** Fire from the middle of an element, which is where the eye already is. */
export function confettiFrom(el: Element | null | undefined, pieces?: number) {
  if (!el) return confetti(undefined, pieces);
  const r = el.getBoundingClientRect();
  return confetti({ x: r.left + r.width / 2, y: r.top + r.height / 2 }, pieces);
}
