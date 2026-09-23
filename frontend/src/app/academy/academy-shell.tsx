"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookMarked, ChevronLeft, GraduationCap, Home, Menu, X } from "lucide-react";
import type { PhaseDef } from "@/lib/academy-content";
import { AcademyProgressProvider } from "@/components/academy/academy-progress";
import { AcademySidebar } from "@/components/academy/academy-sidebar";

export function AcademyShell({ phases, children }: { phases: PhaseDef[]; children: React.ReactNode }) {
  const pathname = usePathname();
  // The course sidebar is itself a "pick a phase, then a week" nav -- on the
  // course overview page, that's exactly what the phase cards in the main
  // content already are. Showing it there duplicated the one thing that
  // page does. It reappears everywhere else, once you're actually inside a
  // phase or a lesson, where it's a real jump-around tool rather than a
  // second copy of the page you're looking at.
  const showSidebar = pathname !== "/academy";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // CTF-style flag checker for challenge lessons (e.g. Operation Day One),
  // plus the copy-to-clipboard buttons on downloadable scripts. Those
  // lessons are markdown rendered through dangerouslySetInnerHTML, so a
  // <script> tag inside them would never execute -- the browser silently
  // ignores scripts inserted that way. This used to work around that with
  // a plain onclick="" attribute on each button, calling a function
  // defined here on window. That's exactly what the production CSP's
  // "script-src-attr 'none'" exists to block (inline event-handler
  // attributes are a classic XSS vector), so every onclick in that
  // markdown was silently a no-op in production while looking fine in
  // dev, where the CSP is relaxed. Delegated listeners attached here
  // achieve the same thing without any inline handler in the HTML: one
  // click/keydown listener on the document, matched by class name.
  // Attempt count and solved state still live on the mission's own
  // data-* attributes -- there's no server, so "state" is just the DOM.
  useEffect(() => {
    const updateProgress = () => {
      const bar = document.querySelector<HTMLElement>("#ad-progress-bar");
      const label = document.querySelector<HTMLElement>("#ad-progress-label");
      if (!bar || !label) return;
      const missions = document.querySelectorAll(".ad-mission");
      const solved = document.querySelectorAll(".ad-mission--solved").length;
      const total = missions.length;
      bar.style.width = total ? `${(solved / total) * 100}%` : "0%";
      label.textContent = `${solved} / ${total} solved`;
    };

    const checkFlag = (btn: HTMLButtonElement) => {
      const answer = btn.dataset.answer;
      const wrap = btn.closest(".ad-mission");
      if (!answer || !wrap) return;
      const input = wrap.querySelector<HTMLInputElement>(".ad-guess__input");
      const feedback = wrap.querySelector<HTMLElement>(".ad-guess__feedback");
      const reveal = wrap.querySelector<HTMLElement>(".ad-flag");
      if (!input || !feedback || !reveal) return;
      // Accepts the answer with or without its "gtf{...}" wrapper, and
      // treats spaces the same as dashes -- a correct answer shouldn't fail
      // over formatting when the question never asked for exact syntax.
      const normalize = (s: string) => s.trim().toLowerCase().replace(/^gtf\{|\}$/g, "").replace(/[\s.]+/g, "-");
      const guess = normalize(input.value);

      if (!guess) {
        feedback.textContent = "Enter an answer first. Blank submissions do not use an attempt.";
        feedback.className = "ad-guess__feedback ad-guess__feedback--err";
        input.focus();
        return;
      }

      if (guess === normalize(answer)) {
        feedback.textContent = "Correct — nice work.";
        feedback.className = "ad-guess__feedback ad-guess__feedback--ok";
        reveal.classList.add("ad-flag--shown");
        input.disabled = true;
        btn.disabled = true;
        wrap.classList.add("ad-mission--solved");
        updateProgress();
        return;
      }

      const attempts = parseInt(wrap.getAttribute("data-attempts") || "0", 10) + 1;
      wrap.setAttribute("data-attempts", String(attempts));
      feedback.className = "ad-guess__feedback ad-guess__feedback--err";
      if (attempts >= 3) {
        feedback.textContent = "Not quite, three tries used. Here's the flag.";
        reveal.classList.add("ad-flag--shown");
      } else {
        const left = 3 - attempts;
        feedback.textContent = `Not quite. ${left} attempt${left === 1 ? "" : "s"} left before the flag unlocks.`;
      }
    };

    // A mission gets exactly one hint, separate from its three guesses --
    // asking for a nudge shouldn't cost you an attempt at the real answer.
    const showHint = (btn: HTMLButtonElement) => {
      const wrap = btn.closest(".ad-mission");
      const hint = wrap?.querySelector<HTMLElement>(".ad-hint__text");
      if (!hint) return;
      hint.classList.add("ad-hint__text--shown");
      btn.textContent = "Hint used";
      btn.disabled = true;
    };

    const copyCode = (btn: HTMLButtonElement) => {
      const code = btn.closest(".ad-code")?.querySelector("code")?.innerText;
      if (!code) return;
      navigator.clipboard.writeText(code);
      const original = btn.textContent;
      btn.textContent = "Copied";
      setTimeout(() => {
        btn.textContent = original || "Copy";
      }, 1500);
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const submitBtn = target.closest<HTMLButtonElement>(".ad-guess__submit");
      if (submitBtn) return checkFlag(submitBtn);
      const hintBtn = target.closest<HTMLButtonElement>(".ad-hint__btn");
      if (hintBtn) return showHint(hintBtn);
      const copyBtn = target.closest<HTMLButtonElement>(".ad-code__copy");
      if (copyBtn) return copyCode(copyBtn);
    };

    // Enter in the answer field submits, same as clicking the button next
    // to it -- .click() still dispatches a real, bubbling click event, so
    // it's caught by the same delegated onClick above.
    const onKeydown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.key !== "Enter" || !target.matches(".ad-guess__input")) return;
      e.preventDefault();
      target.closest(".ad-guess")?.querySelector<HTMLButtonElement>(".ad-guess__submit")?.click();
    };

    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKeydown);
    updateProgress();

    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKeydown);
    };
  }, []);

  return (
    <AcademyProgressProvider phases={phases}>
      <div className="academy-bg min-h-screen">
        <header
          className={`sticky top-0 z-40 border-b bg-white transition-shadow ${
            scrolled ? "border-[var(--pvrx-border-light)] shadow-[0_1px_0_rgba(16,25,46,0.03),0_8px_24px_-16px_rgba(16,25,46,0.12)]" : "border-[var(--pvrx-border-light)]"
          }`}
        >
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              {showSidebar && (
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--pvrx-border-light)] text-slate-600 transition hover:bg-slate-50 lg:hidden"
                  aria-label="Open course menu"
                >
                  <Menu className="h-[18px] w-[18px]" />
                </button>
              )}
              <Link href="/academy" className="flex items-center gap-2.5 font-display text-base font-semibold tracking-tight text-slate-900">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#5546e0] text-white">
                  <GraduationCap className="h-[18px] w-[18px]" />
                </span>
                <span className="hidden sm:inline">
                  Think Like a SOC Analyst
                  <span className="ml-2 font-mono text-xs font-normal text-slate-400">101</span>
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/academy/reference"
                className="flex h-9 items-center gap-1.5 rounded-md border border-[var(--pvrx-border-light)] bg-white px-3 text-sm font-medium text-slate-600 transition hover:border-[rgba(106,92,255,0.35)] hover:text-[#5546e0]"
              >
                <BookMarked className="h-4 w-4" /> Reference
              </Link>
              <Link
                href="/"
                aria-label="PurveX home"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--pvrx-border-light)] bg-white text-slate-500 transition hover:border-[rgba(106,92,255,0.35)] hover:text-[#5546e0]"
              >
                <Home className="h-[18px] w-[18px]" />
              </Link>
            </div>
          </div>
        </header>

        <div className="mx-auto flex max-w-7xl">
          {/* Desktop sidebar -- always mounted, width-animated to 0 rather
              than conditionally rendered, so going from the home page (no
              sidebar) into a phase reads as a slide-open instead of an
              instant layout jump. Same width transition the manual
              collapse toggle already uses, just driven by route too. */}
          <aside
            aria-hidden={!showSidebar}
            className={`hidden shrink-0 overflow-hidden bg-white transition-[width] duration-300 ease-[cubic-bezier(.16,1,.3,1)] lg:sticky lg:top-[65px] lg:block lg:h-[calc(100vh-65px)] ${
              showSidebar ? "border-r border-[var(--pvrx-border-light)]" : "border-r-0"
            } ${!showSidebar ? "lg:w-0" : collapsed ? "lg:w-12" : "lg:w-72"}`}
          >
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              aria-expanded={!collapsed}
              tabIndex={showSidebar ? 0 : -1}
              title={collapsed ? "Expand course menu" : "Collapse course menu"}
              className="flex h-11 w-full items-center justify-center border-b border-[var(--pvrx-border-light)] text-slate-400 transition hover:bg-slate-50 hover:text-[#5546e0]"
            >
              <ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
            </button>
            <div className={`h-[calc(100%-45px)] transition-opacity duration-200 ${collapsed ? "pointer-events-none opacity-0" : "opacity-100"}`}>
              <AcademySidebar phases={phases} />
            </div>
          </aside>

          {/* Mobile drawer */}
          {showSidebar && sidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-slate-900/30" onClick={() => setSidebarOpen(false)} />
              <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-[var(--pvrx-border-light)] px-5 py-4">
                  <span className="font-display text-sm font-semibold text-slate-900">Course menu</span>
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                    aria-label="Close course menu"
                  >
                    <X className="h-[18px] w-[18px]" />
                  </button>
                </div>
                <div className="h-[calc(100%-57px)]">
                  <AcademySidebar phases={phases} onNavigate={() => setSidebarOpen(false)} />
                </div>
              </div>
            </div>
          )}

          <main className="min-w-0 flex-1 px-4 py-10 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-3xl">{children}</div>
          </main>
        </div>
      </div>
    </AcademyProgressProvider>
  );
}
