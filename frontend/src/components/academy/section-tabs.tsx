"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Flag, FlaskConical, Wrench } from "lucide-react";
import { Markdown, splitMarkdownIntoSlides } from "@/lib/markdown";
import { CHALLENGE_PATHS, MISSION_CATALOG } from "@/lib/academy-missions";
import { QuizBlock } from "./quiz";
import { LabCarousel } from "./lab-carousel";
import { MissionPager } from "./mission-pager";
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

function indexForHash(hash: string, items: Item[]): number {
  const raw = decodeURIComponent(hash.replace(/^#/, "")).toLowerCase();
  if (!raw) return 0;
  const mission = MISSION_CATALOG[raw];
  const want = mission ? CHALLENGE_PATHS[mission.challenge].tab : raw;
  const i = items.findIndex((it) => slugify(it.label) === want);
  return i >= 0 ? i : 0;
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
  labs,
  challenges,
  troubleshooting,
  prevWeek,
  nextWeek,
}: {
  phaseSlug: string;
  entrySlug: string;
  sections: TabSection[];
  quiz?: Quiz;
  labs?: TabSection[];
  challenges?: TabSection[];
  troubleshooting?: TabSection[];
  prevWeek?: WeekLink | null;
  nextWeek?: WeekLink | null;
}) {
  const numberedItems: Item[] = [
    ...sections.map((s): Item => ({ kind: "section", label: s.label, markdown: s.markdown })),
    ...(quiz ? [{ kind: "quiz", label: "Quiz" } as Item] : []),
  ];
  const labItems: Item[] = (labs ?? []).map((l) => ({ kind: "lab", label: l.label, markdown: l.markdown, widget: l.widget }));
  const challengeItems: Item[] = (challenges ?? []).map((c) => ({ kind: "challenge", label: c.label, markdown: c.markdown }));
  const troubleshootingItems: Item[] = (troubleshooting ?? []).map((t) => ({ kind: "troubleshooting", label: t.label, markdown: t.markdown }));
  const items = [...numberedItems, ...labItems, ...challengeItems, ...troubleshootingItems];

  const router = useRouter();
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [quizFoot, setQuizFoot] = useState<HTMLElement | null>(null);
  const [labFoot, setLabFoot] = useState<HTMLElement | null>(null);
  const [challengeFoot, setChallengeFoot] = useState<HTMLElement | null>(null);
  const current = items[active];
  const { setPlace } = useCoach();
  const { recordLabDone } = useAcademyProgress();
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
  function goTo(i: number) {
    setDir(i >= active ? 1 : -1);
    setActive(i);
    // Keep the tab in the URL so a refresh or shared link reopens it.
    const { pathname, search } = window.location;
    window.history.replaceState(window.history.state, "", i === 0 ? pathname + search : `${pathname}${search}#${slugify(items[i].label)}`);
  }

  const prevTrail: TrailLink | null = prevItem
    ? { label: prevItem.label, go: () => goTo(active - 1) }
    : prevWeek
      ? { label: prevWeek.label, go: () => router.push(prevWeek.href) }
      : null;
  const nextTrail: TrailLink | null = nextItem
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
  useEffect(() => {
    if (skipScroll.current) {
      skipScroll.current = false;
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelector(".ax-entryhead")?.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
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
      <QuizBlock quiz={quiz!} actionHost={quizFoot} prevBeyond={prevTrail} nextBeyond={nextTrail} />
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
        <MissionPager
          key={current.label}
          prevSection={prevTrail}
          nextSection={nextTrail}
          actionHost={current.kind === "challenge" ? challengeFoot : undefined}
        >
          <Markdown content={current.markdown} />
        </MissionPager>
      </>
    );

  return (
    <div className="ax-lesson">
      {/* One horizontal strip instead of a column of its own. The course rail
          already occupies the left of the screen, so a second vertical list
          beside it left the lesson reading in two thirds of the width. */}
      <div className="ax-lesshead">
        <nav className="ax-lesstabs" role="tablist" aria-label="Sections">
        {items.map((item, i) => (
          <button
            key={item.label}
            type="button"
            role="tab"
            aria-selected={active === i}
            onClick={() => goTo(i)}
            className={`ax-lesstab ${active === i ? "ax-lesstab--on" : ""}`}
          >
            {item.kind === "lab" ? (
              <FlaskConical className="h-3.5 w-3.5 shrink-0" aria-hidden />
            ) : item.kind === "challenge" ? (
              <Flag className="h-3.5 w-3.5 shrink-0" aria-hidden />
            ) : item.kind === "troubleshooting" ? (
              <Wrench className="h-3.5 w-3.5 shrink-0" aria-hidden />
            ) : (
              <i aria-hidden>{pad(i + 1)}</i>
            )}
            <span>{item.label}</span>
          </button>
        ))}
        </nav>
      </div>

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
        ) : (
          <TrailDock
            prev={prevTrail ? { go: prevTrail.go } : null}
            next={nextTrail ? { go: nextTrail.go } : null}
            center={<span className="ax-panel__count">{`${pad(active + 1)} / ${pad(items.length)}`}</span>}
          />
        )}
      </div>
    </div>
  );
}
