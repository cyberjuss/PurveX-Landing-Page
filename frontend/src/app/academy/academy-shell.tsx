"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, GraduationCap, Home, Loader2, Menu, Moon, Sun, X } from "lucide-react";
import type { PhaseDef } from "@/lib/academy-content";
import { AcademyAccountProvider, AcademyProfileMenu, type AcademyStudent } from "@/components/academy/academy-account";
import { AcademyProgressProvider } from "@/components/academy/academy-progress";
import { AcademySidebar } from "@/components/academy/academy-sidebar";
import { AcademySignIn } from "@/components/academy/academy-sign-in";
import { AcademyWelcome, takeAcademyWelcome } from "@/components/academy/academy-welcome";
import { CoachProvider } from "@/components/academy/coach-context";
import { PurvexCoach } from "@/components/academy/purvex-coach";
import {
  academyFetch,
  downloadLinkedBuildScript,
  LINKED_SCRIPT_PATH,
  READINESS_PATH,
  RESULTS_CHANGED_EVENT,
  RESULTS_OWNER_KEY,
  RESULTS_UPDATED_EVENT,
} from "@/lib/academy-client";
import { LAB_GATED_MISSIONS } from "@/lib/academy-missions";
import { clearResults, loadResults, saveResults, scorecardHtml, summarize, type MissionResult, type Results } from "@/lib/academy-score";
import { signOut } from "@/lib/portal-auth";
import { supabase } from "@/lib/supabase";

type Student = AcademyStudent;

export function AcademyShell({ phases, children }: { phases: PhaseDef[]; children: React.ReactNode }) {
  const pathname = usePathname();
  // The course sidebar is itself a "pick a phase, then a week" nav -- on the
  // course overview page, that's exactly what the phase cards in the main
  // content already are. Showing it there duplicated the one thing that
  // page does. It reappears everywhere else, once you're actually inside a
  // phase or a lesson, where it's a real jump-around tool rather than a
  // second copy of the page you're looking at.
  const isReadiness = pathname === READINESS_PATH;
  const isDrill = pathname === "/academy/drill";
  const showSidebar = pathname !== "/academy" && !isReadiness && !isDrill;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  // undefined while the stored Supabase session is still being read.
  const [student, setStudent] = useState<Student | null | undefined>(supabase ? undefined : null);
  const [hello, setHello] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    const toStudent = (
      u: { id: string; email?: string | null; user_metadata?: Record<string, unknown> } | null | undefined
    ): Student | null => {
      if (!u) return null;
      const meta = u.user_metadata ?? {};
      const name = [meta.full_name, meta.name, meta.given_name].find((v) => typeof v === "string" && v.trim()) as
        | string
        | undefined;
      return { id: u.id, email: u.email ?? null, name: name?.trim() ?? null };
    };
    supabase.auth.getSession().then(({ data }) => setStudent(toStudent(data.session?.user)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setStudent((prev) => {
        const next = toStudent(session?.user);
        return prev?.id === next?.id && prev?.email === next?.email && prev?.name === next?.name ? prev : next;
      });
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // Local results belong to one account. A different student on this
  // browser starts clean; then the account's saved results are pulled from
  // the server, or local results are pushed up if the server has none.
  const studentId = student?.id;
  useEffect(() => {
    if (!studentId) return;
    if (takeAcademyWelcome()) setHello(true);
  }, [studentId]);
  useEffect(() => {
    if (!studentId) return;
    try {
      const owner = window.localStorage.getItem(RESULTS_OWNER_KEY);
      if (owner && owner !== studentId) clearResults();
      window.localStorage.setItem(RESULTS_OWNER_KEY, studentId);
    } catch {}
    let cancelled = false;
    academyFetch("/academy/api/progress")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        const server: Results = data.results || {};
        if (Object.keys(server).length > 0) {
          saveResults(server);
          window.dispatchEvent(new Event(RESULTS_CHANGED_EVENT));
        } else {
          const local = loadResults();
          if (Object.keys(local).length > 0) {
            academyFetch("/academy/api/progress", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ results: local }),
            }).catch(() => {});
          }
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  async function handleSignOut() {
    clearResults();
    try {
      window.localStorage.removeItem(RESULTS_OWNER_KEY);
    } catch {}
    await signOut().catch(() => {});
    setStudent(null);
  }

  // Dark mode is scoped to the academy on purpose. The class-based .dark on
  // <html> leaks to the light-only marketing site, so this uses its own
  // attribute on the academy root and its own storage key.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("academy-theme");
      if (stored === "dark" || stored === "light") setTheme(stored);
      else if (window.matchMedia("(prefers-color-scheme: dark)").matches) setTheme("dark");
    } catch {}
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = theme === "dark" ? "#000000" : "";
    document.documentElement.dataset.academyTheme = theme;
    document.querySelector(".ad-hint-card")?.setAttribute("data-academy-theme", theme);
    return () => {
      document.body.style.backgroundColor = "";
      delete document.documentElement.dataset.academyTheme;
    };
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem("academy-theme", next);
      } catch {}
      return next;
    });
  }

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
      const text = `${solved} / ${total} solved`;
      if (label.textContent !== text) label.textContent = text;
    };

    // Readiness score: every answer is stored by mission id, then the
    // scorecard is redrawn from what is stored.
    const renderScore = () => {
      const el = document.querySelector<HTMLElement>("#ad-scorecard");
      if (!el) return;
      const html = scorecardHtml(summarize(loadResults()));
      if (el.dataset.sig !== html) {
        el.innerHTML = html;
        el.dataset.sig = html;
      }
    };

    const syncProgress = (all: Results) => {
      academyFetch("/academy/api/progress", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results: all }),
      }).catch(() => {});
    };

    const recordResult = (wrap: Element, patch: Partial<MissionResult>) => {
      const id = wrap.getAttribute("data-id");
      if (!id) return;
      const all = loadResults();
      const base: MissionResult = all[id] ?? { solved: false, wrong: 0, hint: false };
      const next: MissionResult = { ...base, ...patch, at: new Date().toISOString() };
      if (next.solved || !next.flagged) delete next.flagged;
      all[id] = next;
      saveResults(all);
      syncProgress(all);
      renderScore();
      window.dispatchEvent(new Event(RESULTS_UPDATED_EVENT));
    };

    // Lesson content is re-rendered when you switch tabs, so a mission comes
    // back blank. Put back what was stored for it.
    const restoreMission = (wrap: HTMLElement) => {
      wrap.setAttribute("data-restored", "1");
      const id = wrap.getAttribute("data-id");
      const r = id ? loadResults()[id] : undefined;
      if (!r) {
        labelHintButton(wrap, false);
        return;
      }
      wrap.setAttribute("data-attempts", String(Math.min(r.wrong, 3)));
      if (r.labOk) wrap.classList.add("ad-mission--labok");
      const input = wrap.querySelector<HTMLInputElement>(".ad-guess__input");
      const submit = wrap.querySelector<HTMLButtonElement>(".ad-guess__submit");
      const feedback = wrap.querySelector<HTMLElement>(".ad-guess__feedback");
      const reveal = wrap.querySelector<HTMLElement>(".ad-flag");
      labelHintButton(wrap, false);
      if (r.solved) {
        if (input) input.disabled = true;
        if (submit) submit.disabled = true;
        if (feedback) {
          feedback.textContent = "Completed earlier.";
          feedback.className = "ad-guess__feedback ad-guess__feedback--ok";
        }
        reveal?.classList.add("ad-flag--shown");
        wrap.classList.add("ad-mission--solved");
      } else if (r.wrong >= 3) {
        if (feedback) {
          feedback.textContent = "Not quite, three tries used. Here's the flag.";
          feedback.className = "ad-guess__feedback ad-guess__feedback--err";
        }
        reveal?.classList.add("ad-flag--shown");
      }
    };

    // Some tickets need a real change. Ask the server whether the student's lab
    // shows it. No lab connected, or a failed request, never traps a student.
    const labGate = async (
      id: string
    ): Promise<{
      gated: boolean;
      passed?: boolean;
      noLab?: boolean;
      noTicketObjects?: boolean;
      results?: { label: string; ok: boolean }[];
    } | null> => {
      try {
        const res = await academyFetch("/academy/api/mission-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        return res.ok ? await res.json() : null;
      } catch {
        return null;
      }
    };

    const checkFlag = async (btn: HTMLButtonElement) => {
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

      const missionId = wrap.getAttribute("data-id") || "";
      if (!wrap.classList.contains("ad-mission--labok") && LAB_GATED_MISSIONS.includes(missionId)) {
        btn.disabled = true;
        feedback.textContent = "Checking your lab…";
        feedback.className = "ad-guess__feedback";
        const gate = await labGate(missionId);
        btn.disabled = false;
        if (!gate) {
          feedback.textContent = "Could not check your lab. Try submit again. This does not use an attempt.";
          feedback.className = "ad-guess__feedback ad-guess__feedback--err";
          return;
        }
        if (gate.noLab) {
          feedback.textContent = "No lab is connected. Connect it from Build This Lab, then make the change. This does not use an attempt.";
          feedback.className = "ad-guess__feedback ad-guess__feedback--err";
          return;
        }
        if (gate.noTicketObjects) {
          feedback.textContent = "This lab was built without -IncludeCTF. Remove it and build again with -IncludeCTF. This does not use an attempt.";
          feedback.className = "ad-guess__feedback ad-guess__feedback--err";
          return;
        }
        if (!gate.passed) {
          const missing = (gate.results ?? []).filter((r) => !r.ok).map((r) => r.label).join("; ");
          feedback.textContent = missing
            ? `Your lab does not show this change yet: ${missing}. Make the change, then wait about 1 minute for the lab to report. This does not use an attempt.`
            : "Your lab does not show this change yet. Make it, then wait for the lab to report. This does not use an attempt.";
          feedback.className = "ad-guess__feedback ad-guess__feedback--err";
          return;
        }
        wrap.classList.add("ad-mission--labok");
      }

      const accepts = [answer, ...(btn.dataset.accept || "").split("|")].map(normalize).filter(Boolean);
      if (accepts.includes(guess)) {
        feedback.textContent = "Correct — nice work.";
        feedback.className = "ad-guess__feedback ad-guess__feedback--ok";
        reveal.classList.add("ad-flag--shown");
        input.disabled = true;
        btn.disabled = true;
        wrap.classList.add("ad-mission--solved");
        recordResult(wrap, { solved: true, flagged: false, wrong: parseInt(wrap.getAttribute("data-attempts") || "0", 10) });
        updateProgress();
        return;
      }

      const attempts = parseInt(wrap.getAttribute("data-attempts") || "0", 10) + 1;
      wrap.setAttribute("data-attempts", String(attempts));
      recordResult(wrap, { wrong: attempts });
      labelHintButton(wrap, wrap.querySelector(".ad-hint__text")?.classList.contains("ad-hint__text--shown") ?? false);
      feedback.className = "ad-guess__feedback ad-guess__feedback--err";
      if (attempts >= 3) {
        feedback.textContent = "Not quite, three tries used. Here's the flag.";
        reveal.classList.add("ad-flag--shown");
      } else {
        const left = 3 - attempts;
        const hintNote = attempts === 2 ? " Your hint is now unlocked." : "";
        feedback.textContent = `Not quite. ${left} attempt${left === 1 ? "" : "s"} left before the flag unlocks.${hintNote}`;
      }
    };

    const hintUnlocked = (wrap: Element) => parseInt(wrap.getAttribute("data-attempts") || "0", 10) >= 2;

    let openHintId: string | null = null;

    const hintTop = () => {
      const header = document.querySelector(".academy-bg > header");
      return header instanceof HTMLElement ? Math.round(header.getBoundingClientRect().bottom) : 64;
    };

    const missionById = (id: string | null) =>
      id ? document.querySelector<HTMLElement>(`.ad-mission[data-id="${CSS.escape(id)}"]`) : null;

    const academyTheme = () =>
      document.querySelector(".academy-bg")?.getAttribute("data-academy-theme") ||
      document.documentElement.dataset.academyTheme ||
      "light";

    const ensureHintCard = () => {
      let root = document.querySelector<HTMLElement>(".ad-hint-card");
      if (root) {
        root.dataset.academyTheme = academyTheme();
        return root;
      }
      root = document.createElement("div");
      root.className = "ad-hint-card";
      root.dataset.open = "false";
      root.dataset.academyTheme = academyTheme();
      root.innerHTML =
        '<button type="button" class="ad-hint-card__scrim" aria-label="Close hint"></button>' +
        '<aside class="ad-hint-card__panel" role="dialog" aria-label="Hint">' +
        '<div class="ad-hint-card__head"><span>Hint</span><button type="button" class="ad-hint-card__close">Close</button></div>' +
        '<p class="ad-hint-card__kicker"></p>' +
        '<div class="ad-hint-card__body"></div>' +
        "</aside>";
      document.body.appendChild(root);
      return root;
    };

    const labelHintButton = (wrap: Element, open: boolean) => {
      const btn = wrap.querySelector<HTMLButtonElement>(".ad-hint__btn");
      if (!btn) return;
      const unlocked = hintUnlocked(wrap);
      btn.disabled = !unlocked;
      btn.setAttribute("aria-expanded", unlocked && open ? "true" : "false");
      btn.textContent = !unlocked ? "Hint locked" : open ? "Hide hint" : "Hint";
    };

    const closeHintCard = () => {
      document.querySelector(".ad-hint-card")?.setAttribute("data-open", "false");
      const wrap = missionById(openHintId);
      openHintId = null;
      if (wrap) labelHintButton(wrap, false);
    };

    const openHintCard = (wrap: Element) => {
      const id = wrap.getAttribute("data-id");
      if (openHintId && openHintId !== id) {
        const prev = missionById(openHintId);
        if (prev) labelHintButton(prev, false);
      }
      const src = wrap.querySelector<HTMLElement>(".ad-hint__text");
      const root = ensureHintCard();
      root.style.setProperty("--ad-hint-top", `${hintTop()}px`);
      const kicker = root.querySelector(".ad-hint-card__kicker");
      const body = root.querySelector(".ad-hint-card__body");
      if (kicker) kicker.textContent = wrap.querySelector("h4")?.textContent?.trim() || "Hint";
      if (body) body.innerHTML = src?.innerHTML ?? "";
      root.dataset.open = "true";
      openHintId = id;
      labelHintButton(wrap, true);
    };

    // Hint unlocks after two wrong tries, then slides in as a card from the
    // right. Toggle closes it. Opening once still records hint-used.
    const toggleHint = (btn: HTMLButtonElement) => {
      const wrap = btn.closest(".ad-mission");
      const id = wrap?.getAttribute("data-id");
      if (!wrap || !id || !hintUnlocked(wrap)) return;
      if (openHintId === id) {
        closeHintCard();
        return;
      }
      recordResult(wrap, { hint: true });
      openHintCard(wrap);
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
      const scriptLink = target.closest<HTMLAnchorElement>("a[href]");
      if (scriptLink && new URL(scriptLink.href).pathname === LINKED_SCRIPT_PATH) {
        e.preventDefault();
        downloadLinkedBuildScript().catch(() => {
          window.location.href = scriptLink.href;
        });
        return;
      }
      const submitBtn = target.closest<HTMLButtonElement>(".ad-guess__submit");
      if (submitBtn) return checkFlag(submitBtn);
      if (target.closest(".ad-score__reset")) {
        clearResults();
        academyFetch("/academy/api/progress", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ results: {} }),
        })
          .catch(() => {})
          .finally(() => window.location.reload());
        return;
      }
      if (target.closest(".ad-hint-card__close") || target.closest(".ad-hint-card__scrim")) {
        return closeHintCard();
      }
      const hintBtn = target.closest<HTMLButtonElement>(".ad-hint__btn");
      if (hintBtn) return toggleHint(hintBtn);
      const copyBtn = target.closest<HTMLButtonElement>(".ad-code__copy");
      if (copyBtn) return copyCode(copyBtn);
    };

    // Enter in the answer field submits, same as clicking the button next
    // to it -- .click() still dispatches a real, bubbling click event, so
    // it's caught by the same delegated onClick above.
    const onKeydown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.key === "Escape" && openHintId) {
        e.preventDefault();
        closeHintCard();
        return;
      }
      if (e.key !== "Enter" || !target.matches(".ad-guess__input")) return;
      e.preventDefault();
      target.closest(".ad-guess")?.querySelector<HTMLButtonElement>(".ad-guess__submit")?.click();
    };

    let frame = 0;
    const sync = () => {
      frame = 0;
      document.querySelectorAll<HTMLElement>(".ad-mission[data-id]:not([data-restored])").forEach(restoreMission);
      if (openHintId) {
        const live = missionById(openHintId);
        if (live) labelHintButton(live, true);
        else closeHintCard();
      }
      renderScore();
      updateProgress();
    };
    const observer = new MutationObserver(() => {
      if (!frame) frame = window.requestAnimationFrame(sync);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKeydown);
    sync();

    // Results were replaced from the server: re-apply them to missions that
    // were already restored from the older local copy.
    const onResultsChanged = () => {
      document.querySelectorAll(".ad-mission[data-restored]").forEach((el) => el.removeAttribute("data-restored"));
      sync();
    };
    window.addEventListener(RESULTS_CHANGED_EVENT, onResultsChanged);

    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKeydown);
      window.removeEventListener(RESULTS_CHANGED_EVENT, onResultsChanged);
      document.querySelector(".ad-hint-card")?.remove();
    };
  }, []);

  if (student === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (student === null) {
    return <AcademySignIn configured={Boolean(supabase)} />;
  }

  return (
    <AcademyProgressProvider phases={phases}>
      <AcademyAccountProvider student={student}>
      <CoachProvider>
      <div className="academy-bg min-h-screen" data-academy-theme={theme}>
        <header
          className={`sticky top-0 z-40 overflow-visible border-b bg-white transition-shadow ${
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
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                title={theme === "dark" ? "Light mode" : "Dark mode"}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--pvrx-border-light)] bg-white text-slate-500 transition hover:border-[rgba(106,92,255,0.35)] hover:text-[#5546e0]"
              >
                {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
              </button>
              <Link
                href="/"
                aria-label="PurveX home"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--pvrx-border-light)] bg-white text-slate-500 transition hover:border-[rgba(106,92,255,0.35)] hover:text-[#5546e0]"
              >
                <Home className="h-[18px] w-[18px]" />
              </Link>
              <AcademyProfileMenu onSignOut={handleSignOut} />
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
            <div className={`mx-auto ${isReadiness || isDrill ? "max-w-6xl" : "max-w-4xl"}`}>{children}</div>
          </main>
        </div>
        <PurvexCoach />
        {hello && <AcademyWelcome student={student} onDone={() => setHello(false)} />}
      </div>
      </CoachProvider>
      </AcademyAccountProvider>
    </AcademyProgressProvider>
  );
}
