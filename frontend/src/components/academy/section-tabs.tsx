"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Flag, FlaskConical, Wrench } from "lucide-react";
import { Markdown, splitMarkdownIntoSlides } from "@/lib/markdown";
import { CHALLENGE_PATHS, MISSION_CATALOG } from "@/lib/academy-missions";
import { QuizBlock } from "./quiz";
import { LabCarousel } from "./lab-carousel";
import { MissionPager } from "./mission-pager";
import { ResourcesView } from "./resources-view";
import { DECK_PROGRESS_EVENT, LessonDeck } from "./lesson-deck";
import { isDeckable } from "@/lib/lesson-deck";
import { weekScenes } from "./slide-art";
import { TrailDock, type TrailLink } from "./trail-dock";
import { labSpot, useCoach } from "./coach-context";
import { HostedLabSetupNote } from "./hosted-lab-button";

// Home Lab tabs about building your own server. A hosted student skips them.
const HOSTED_SETUP_TABS = new Set(["Set Up the Lab", "Install the Domain", "Build the Environment", "Check the Build"]);
import { academyFetch } from "@/lib/academy-client";
import { slugify, useAcademyProgress } from "./academy-progress";
import type { Quiz } from "@/content/academy/quizzes";
import type { LabWidget } from "@/lib/academy-content";
import { HashVerifyLab } from "./labs/hash-verify-lab";
import { LabBrief } from "./labs/lab-brief";
import { PasswordTableLab } from "./labs/password-table-lab";
import { RiskTriageLab } from "./labs/risk-triage-chat";
import { SigninLogLab } from "./labs/signin-log-lab";
import { EffectiveAccessLab } from "./labs/effective-access-lab";

type WeekLink = { label: string; href: string };

interface TabSection {
  label: string;
  markdown: string;
  widget?: LabWidget;
}

type Item =
  | { kind: "section"; label: string; markdown: string }
  | { kind: "quiz"; label: string }
  | { kind: "lab"; label: string; markdown: string; widget?: LabWidget }
  | { kind: "challenge"; label: string; markdown: string }
  | { kind: "troubleshooting"; label: string; markdown: string };

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** The ids a section's ## and ### headings get when rendered, as the markdown renderer spells them. */
function headingIds(markdown: string): string[] {
  return [...markdown.matchAll(/^#{2,3}\s+(.+)$/gm)].map((m) => slugify(m[1].replace(/\*\*/g, "")));
}

function indexForHash(hash: string, items: Item[]): number {
  const raw = decodeURIComponent(hash.replace(/^#/, "")).toLowerCase();
  if (!raw) return 0;
  const mission = MISSION_CATALOG[raw];
  const want = mission ? CHALLENGE_PATHS[mission.challenge].tab : raw;
  const i = items.findIndex((it) => slugify(it.label) === want);
  if (i >= 0) return i;
  // A link to a heading inside a tab: open the tab that holds it.
  const h = items.findIndex((it) => "markdown" in it && headingIds(it.markdown).includes(raw));
  return h >= 0 ? h : 0;
}

// A lab used to render as its own always-visible card below this panel --
// present on the page no matter which section you were actually reading.
// Folding it into the same switcher means it only takes up room once you
// pick it, same as every other section. Numbered items (sections + the
// quiz) count toward the "05/08" progress line; labs sit below a divider,
// icon-marked instead of numbered, since picking up a lab isn't the same
// kind of step as reading the next section.
export function SectionTabs({
  phaseSlug,
  entrySlug,
  sections,
  quiz,
  weekLabs,
  challenges,
  troubleshooting,
  prevWeek,
  nextWeek,
  essentialQuestion,
}: {
  phaseSlug: string;
  entrySlug: string;
  sections: TabSection[];
  quiz?: Quiz;
  /** The week's labs, as links. They are pages of their own now, not tabs. */
  weekLabs?: { slug: string; title: string }[];
  challenges?: TabSection[];
  troubleshooting?: TabSection[];
  prevWeek?: WeekLink | null;
  nextWeek?: WeekLink | null;
  /** The week's essential question. It opens the first section's slides. */
  essentialQuestion?: string | null;
}) {
  const numberedItems: Item[] = [
    ...sections.map((s): Item => ({ kind: "section", label: s.label, markdown: s.markdown })),
    ...(quiz ? [{ kind: "quiz", label: "Quiz" } as Item] : []),
  ];
  const challengeItems: Item[] = (challenges ?? []).map((c) => ({ kind: "challenge", label: c.label, markdown: c.markdown }));
  const troubleshootingItems: Item[] = (troubleshooting ?? []).map((t) => ({ kind: "troubleshooting", label: t.label, markdown: t.markdown }));
  const items = [...numberedItems, ...challengeItems, ...troubleshootingItems];

  const router = useRouter();
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [quizFoot, setQuizFoot] = useState<HTMLElement | null>(null);
  const [labFoot, setLabFoot] = useState<HTMLElement | null>(null);
  const [challengeFoot, setChallengeFoot] = useState<HTMLElement | null>(null);
  // Set only by Previous, so stepping back out of a section lands on the last
  // slide of the one before it. Clicking a tab still opens at the first.
  const [fromNext, setFromNext] = useState(false);
  const current = items[active];
  // Reading sections show as slides. Challenges page their own tickets, and
  // a resources list reads better as one list than split across slides.
  const asDeck = current.kind === "section" && current.label !== "Resources" && isDeckable(current.markdown);
  // How far into the current deck the reader is (0 to 1), for the active
  // tab's underline, and which sections they have read to the end, for the
  // ticks. Finished sections are remembered per week in this browser.
  const doneKey = `academy-tabs-done:${phaseSlug}/${entrySlug}`;
  const [fill, setFill] = useState(0);
  const [done, setDone] = useState<Set<string>>(() => new Set());
  useEffect(() => {
    try {
      setDone(new Set(JSON.parse(window.localStorage.getItem(doneKey) || "[]") as string[]));
    } catch {}
  }, [doneKey]);
  useEffect(() => {
    const onProgress = (e: Event) => {
      const { label, index, total } = (e as CustomEvent<{ label: string; index: number; total: number }>).detail;
      setFill(total > 1 ? (index + 1) / total : 1);
      if (index < total - 1) return;
      setDone((prev) => {
        if (prev.has(label)) return prev;
        const next = new Set(prev).add(label);
        try {
          window.localStorage.setItem(doneKey, JSON.stringify([...next]));
        } catch {}
        return next;
      });
    };
    window.addEventListener(DECK_PROGRESS_EVENT, onProgress);
    return () => window.removeEventListener(DECK_PROGRESS_EVENT, onProgress);
  }, [doneKey]);

  // Drawings for every slide tab in the week, chosen in tab order with one
  // memory, so a picture shown in one tab does not come back in the next.
  const deckTabs = useMemo(() => sections.filter((s) => s.label !== "Resources" && isDeckable(s.markdown)), [sections]);
  const scenesByTab = useMemo(() => weekScenes(deckTabs), [deckTabs]);
  const tabScenes = asDeck ? scenesByTab[deckTabs.findIndex((s) => s.label === current.label)] : undefined;
  const { setPlace } = useCoach();
  const { recordLabDone, isLabDone, setLastStop } = useAcademyProgress();
  const labSlug = current.kind === "lab" ? slugify(current.label) : "";
  const labDone = useCallback(() => {
    if (labSlug) recordLabDone(phaseSlug, entrySlug, labSlug);
  }, [recordLabDone, phaseSlug, entrySlug, labSlug]);
  const labWidget = current.kind === "lab" ? current.widget : undefined;
  useEffect(() => {
    const kind = current.kind === "lab" || current.kind === "challenge" ? current.kind : null;
    setPlace(kind ? { kind, title: current.label, ...(labWidget ? { lab: labWidget } : {}) } : null);
    return () => setPlace(null);
  }, [current.kind, current.label, labWidget, setPlace]);
  // The same tab, told to the progress store, so the home page's last stop
  // is the tab and not just the page it was on. The account hears about it
  // below; this is so it is right before the next reload too.
  useEffect(() => {
    setLastStop(phaseSlug, entrySlug, current.label);
  }, [phaseSlug, entrySlug, current.label, setLastStop]);

  // Report the open tab, and the lab step when they switch away (often to
  // their own AI assistant), so Coach and MCP clients know where they are.
  useEffect(() => {
    const report = (keepalive: boolean) => {
      const place = { phase: phaseSlug, entry: entrySlug, tab: current.label, kind: current.kind, lab: labWidget, at: labWidget ? labSpot() : undefined };
      academyFetch("/academy/api/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ place }),
        keepalive,
      }).catch(() => {});
    };
    const settle = window.setTimeout(() => report(false), 1500);
    // Blur and hide often fire together. One report is enough.
    let last = 0;
    const leave = () => {
      if (Date.now() - last < 1000) return;
      last = Date.now();
      report(true);
    };
    const onHide = () => {
      if (document.visibilityState === "hidden") leave();
    };
    window.addEventListener("blur", leave);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.clearTimeout(settle);
      window.removeEventListener("blur", leave);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [phaseSlug, entrySlug, current.kind, current.label, labWidget]);
  const prevItem = active > 0 ? items[active - 1] : null;
  const nextItem = active < items.length - 1 ? items[active + 1] : null;
  // One underline that slides to the tab you pick, rather than one tab's line
  // switching off as another's switches on. Placed straight on the element, so
  // a resize or a late font load re-measures without a render.
  const tabsRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const nav = tabsRef.current;
    const bar = barRef.current;
    if (!nav || !bar) return;
    const place = () => {
      const tab = nav.querySelectorAll<HTMLElement>('[role="tab"]')[active];
      if (!tab) return;
      // Measured from the boxes rather than offsetLeft/offsetWidth, which round
      // to whole pixels and left the line a pixel short of the tab's own.
      const t = tab.getBoundingClientRect();
      const n = nav.getBoundingClientRect();
      bar.style.transform = `translateX(${t.left - n.left + nav.scrollLeft + 10}px)`;
      bar.style.width = `${Math.max(0, t.width - 20)}px`;
      // The first placement lands without sliding in from the left edge.
      if (!bar.dataset.ready) requestAnimationFrame(() => (bar.dataset.ready = "1"));
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(nav);
    return () => ro.disconnect();
  }, [active, items.length]);

  // Ten sections do not fit across a laptop, so the strip scrolls. Nothing said
  // so: the last tabs sat past the right edge with no hint and no way to reach
  // them without a horizontal wheel. The arrows appear on whichever side still
  // has tabs, and the one you are on is pulled into view when it changes.
  const [edges, setEdges] = useState({ start: false, end: false });
  const measure = useCallback(() => {
    const nav = tabsRef.current;
    if (!nav) return;
    const max = nav.scrollWidth - nav.clientWidth;
    setEdges({ start: nav.scrollLeft > 1, end: nav.scrollLeft < max - 1 });
  }, []);
  useEffect(() => {
    const nav = tabsRef.current;
    if (!nav) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(nav);
    nav.addEventListener("scroll", measure, { passive: true });
    return () => {
      ro.disconnect();
      nav.removeEventListener("scroll", measure);
    };
  }, [measure, items.length]);

  // Only the strip moves. scrollIntoView would take the page with it, and this
  // strip is sticky, so the lesson would jump under the reader's eyes.
  useEffect(() => {
    const nav = tabsRef.current;
    const tab = nav?.querySelectorAll<HTMLElement>('[role="tab"]')[active];
    if (!nav || !tab) return;
    const pad = 24;
    const left = tab.offsetLeft - pad;
    const right = tab.offsetLeft + tab.offsetWidth + pad - nav.clientWidth;
    const to = nav.scrollLeft > left ? left : nav.scrollLeft < right ? right : null;
    if (to === null) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    nav.scrollTo({ left: Math.max(0, to), behavior: reduce ? "auto" : "smooth" });
  }, [active]);

  const roll = (dir: 1 | -1) => {
    const nav = tabsRef.current;
    if (!nav) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    nav.scrollBy({ left: dir * Math.max(160, nav.clientWidth * 0.7), behavior: reduce ? "auto" : "smooth" });
  };

  function goTo(i: number, atEnd = false) {
    setFromNext(atEnd);
    setDir(i >= active ? 1 : -1);
    setActive(i);
    // Keep the tab in the URL so a refresh or shared link reopens it.
    const { pathname, search } = window.location;
    window.history.replaceState(window.history.state, "", i === 0 ? pathname + search : `${pathname}${search}#${slugify(items[i].label)}`);
  }

  const prevTrail: TrailLink | null = prevItem
    ? { label: prevItem.label, go: () => goTo(active - 1, true) }
    : prevWeek
      ? { label: prevWeek.label, go: () => router.push(prevWeek.href) }
      : null;
  // The quiz is the last tab now that labs have pages of their own, so the
  // forward control pointed at the next week and walked a student straight
  // past the labs that finish this one. While any of them is unfinished, the
  // first of them is what "next" means.
  const labAfterQuiz =
    current.kind === "quiz"
      ? (weekLabs ?? []).find((l) => !isLabDone(phaseSlug, entrySlug, slugify(l.title))) ?? null
      : null;
  const nextTrail: TrailLink | null = labAfterQuiz
    ? { label: labAfterQuiz.title, go: () => router.push(`/range/labs/${labAfterQuiz.slug}`) }
    : nextItem
      ? { label: nextItem.label, go: () => goTo(active + 1) }
      : nextWeek
        ? { label: nextWeek.label, go: () => router.push(nextWeek.href) }
        : null;
  useEffect(() => {
    const apply = () => setActive(indexForHash(window.location.hash, items));
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
    // items is rebuilt each render from the same labels; hash is the trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (prevWeek) router.prefetch(prevWeek.href);
    if (nextWeek) router.prefetch(nextWeek.href);
  }, [prevWeek, nextWeek, router]);

  const skipScroll = useRef(true);
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (skipScroll.current) {
      skipScroll.current = false;
      return;
    }
    const head = document.querySelector(".ax-entryhead");
    if (!head) return;
    // Already in view: nothing to do. A short way up glides; a long way up
    // jumps, because a smooth scroll across a long lesson takes most of a
    // second and reads as the new section being slow to arrive.
    const top = head.getBoundingClientRect().top;
    if (top >= 0 && top < window.innerHeight * 0.5) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const far = Math.abs(top) > window.innerHeight;
    head.scrollIntoView({ block: "start", behavior: reduce || far ? "auto" : "smooth" });
  }, [active]);

  useEffect(() => {
    const id = window.location.hash.replace(/^#/, "");
    if (!MISSION_CATALOG[id]) return;
    const jump = () => {
      document
        .querySelector<HTMLElement>(`.ad-mission[data-id="${CSS.escape(id)}"]`)
        ?.scrollIntoView({ block: "start", behavior: "smooth" });
    };
    const t = window.setTimeout(jump, 60);
    return () => window.clearTimeout(t);
  }, [active]);

  const panel =
    current.kind === "quiz" ? (
      <QuizBlock quiz={quiz!} actionHost={quizFoot} nextBeyond={nextTrail} weekLabs={weekLabs} />
    ) : current.kind === "lab" && current.widget ? (
      <div>
        <LabBrief lab={current.widget} title={current.label.replace(/^Lab:\s*/, "")} ask={current.widget !== "risk-triage"}>
          {current.widget === "risk-triage" ? (
            <RiskTriageLab onDone={labDone} />
          ) : current.widget === "hash-verify" ? (
            <HashVerifyLab onDone={labDone} />
          ) : current.widget === "signin-log" ? (
            <SigninLogLab onDone={labDone} />
          ) : current.widget === "effective-access" ? (
            <EffectiveAccessLab onDone={labDone} />
          ) : (
            <PasswordTableLab onDone={labDone} />
          )}
        </LabBrief>
      </div>
    ) : current.kind === "lab" ? (
      <div>
        {/* Keyed on the label so switching labs remounts this instead of
            reusing the instance -- otherwise it kept whatever step index
            you were on in the previous lab instead of starting over at
            Overview. */}
        <LabCarousel
          key={current.label}
          storageKey={current.label}
          slides={splitMarkdownIntoSlides(current.markdown)}
          actionHost={labFoot}
          prevBeyond={prevTrail}
          nextBeyond={nextTrail}
          onDone={labDone}
        />
      </div>
    ) : (
      <>
        {current.kind === "section" && HOSTED_SETUP_TABS.has(current.label) && <HostedLabSetupNote />}
        {asDeck ? (
          <LessonDeck
            weekScenes={tabScenes}
            question={active === 0 ? essentialQuestion ?? undefined : undefined}
            weekPath={active === 0 ? sections.slice(1).map((s) => s.label).filter((l) => l !== "Resources") : undefined}
            key={current.label}
            label={current.label}
            markdown={current.markdown}
            storageKey={current.label}
            startAtEnd={fromNext}
            prevBeyond={prevTrail}
            nextBeyond={nextTrail}
          />
        ) : (
        <MissionPager
          key={current.label}
          prevSection={prevTrail}
          nextSection={nextTrail}
          actionHost={current.kind === "challenge" ? challengeFoot : undefined}
        >
          {current.kind === "section" && current.label === "Resources" ? (
            <ResourcesView markdown={current.markdown} fallback={<Markdown content={current.markdown} />} />
          ) : (
            <Markdown content={current.markdown} />
          )}
        </MissionPager>
        )}
      </>
    );

  return (
    <div className="ax-lesson">
      {/* One horizontal strip instead of a column of its own. The course rail
          already occupies the left of the screen, so a second vertical list
          beside it left the lesson reading in two thirds of the width. */}
      <div className={`ax-lesshead${edges.start ? " has-start" : ""}${edges.end ? " has-end" : ""}`}>
        {edges.start && (
          <button type="button" className="ax-lessroll ax-lessroll--start" aria-label="Earlier sections" onClick={() => roll(-1)}>
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
        )}
        {edges.end && (
          <button type="button" className="ax-lessroll ax-lessroll--end" aria-label="Later sections" onClick={() => roll(1)}>
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        )}
        <nav ref={tabsRef} className="ax-lesstabs" role="tablist" aria-label="Sections">
        <span
          ref={barRef}
          className="ax-lesstabs__bar"
          aria-hidden
          style={{ ["--fill" as string]: current.kind === "section" && asDeck ? fill : 1 }}
        />
        {items.map((item, i) => (
          <button
            key={item.label}
            type="button"
            role="tab"
            aria-selected={active === i}
            onClick={() => goTo(i)}
            className={`ax-lesstab ${active === i ? "ax-lesstab--on" : ""}${done.has(item.label) ? " is-done" : ""}`}
            aria-label={done.has(item.label) ? `${item.label}, finished` : undefined}
          >
            {item.kind === "lab" ? (
              <FlaskConical className="h-3.5 w-3.5 shrink-0" aria-hidden />
            ) : item.kind === "challenge" ? (
              <Flag className="h-3.5 w-3.5 shrink-0" aria-hidden />
            ) : item.kind === "troubleshooting" ? (
              <Wrench className="h-3.5 w-3.5 shrink-0" aria-hidden />
            ) : (
              <i aria-hidden>{done.has(item.label) && active !== i ? <Check strokeWidth={3} /> : pad(i + 1)}</i>
            )}
            <span>{item.label}</span>
          </button>
        ))}
        </nav>
      </div>

      <div className="ax-lessbody" ref={bodyRef}>
      <div className="ax-panel">
        <div className="overflow-hidden py-2 sm:py-4">
          <div key={current.label} className={dir === 1 ? "ax-enter-fwd" : "ax-enter-back"}>
            {panel}
          </div>
        </div>

        {/* Lets you read straight through a lesson without dropping back to
            the sidebar after every section -- and, once it reaches the labs,
            the same control that was previously only reachable by clicking
            a sidebar link. */}
        {current.kind === "quiz" ? (
          <div ref={setQuizFoot} />
        ) : current.kind === "lab" && !current.widget ? (
          <div ref={setLabFoot} />
        ) : current.kind === "challenge" ? (
          <div ref={setChallengeFoot} />
        ) : asDeck ? null : (
          <TrailDock
            prev={prevTrail ? { go: prevTrail.go } : null}
            next={nextTrail ? { go: nextTrail.go } : null}
            center={<span className="ax-panel__count">{`${pad(active + 1)} / ${pad(items.length)}`}</span>}
          />
        )}
      </div>
      </div>
    </div>
  );
}
