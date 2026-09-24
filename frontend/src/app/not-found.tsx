import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Same language as the marketing site and the Academy: dot grid, mono
// kicker, Space Grotesk headline, pill CTA, hairline rule.
export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(16,25,46,.11) 1.6px, transparent 1.6px)",
          backgroundSize: "26px 26px",
          maskImage: "radial-gradient(ellipse 70% 55% at 50% 0%, black, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 55% at 50% 0%, black, transparent 75%)",
        }}
      />
      <div className="relative w-full" style={{ maxWidth: 460 }}>
        <p
          className="text-[11px] font-bold uppercase text-slate-400"
          style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", letterSpacing: "0.16em" }}
        >
          <span className="text-[#5546e0]" style={{ font: "inherit", letterSpacing: "inherit" }}>404</span> &nbsp;·&nbsp; Not found
        </p>
        <h1 className="mt-4 font-display text-[2.4rem] font-semibold text-slate-900 sm:text-5xl" style={{ letterSpacing: "-0.04em", lineHeight: 1.05 }}>
          This page isn&apos;t here
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
          It may have moved, or the link is wrong. Check the URL, or head back to the start.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 border-t border-slate-900 pt-8 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#5546e0] px-6 text-sm font-semibold text-white transition hover:bg-[#4a3bd4]"
          >
            Back home <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/academy"
            className="inline-flex h-12 items-center justify-center rounded-full border border-slate-300 px-6 text-sm font-semibold text-slate-900 transition hover:border-slate-900"
          >
            Academy portal
          </Link>
        </div>
      </div>
    </div>
  );
}
