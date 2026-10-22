"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, MonitorDot } from "lucide-react";
import { splitMarkdownIntoSlides } from "@/lib/markdown";
import type { LabWidget } from "@/lib/academy-content";
import { LabCarousel } from "./lab-carousel";
import { LabBrief } from "./labs/lab-brief";
import { HashVerifyLab } from "./labs/hash-verify-lab";
import { PasswordTableLab } from "./labs/password-table-lab";
import { RiskTriageLab } from "./labs/risk-triage-chat";
import { SigninLogLab } from "./labs/signin-log-lab";
import { EffectiveAccessLab } from "./labs/effective-access-lab";
import { NetworkMapLab } from "./labs/network-map-lab";
import { slugify, useAcademyProgress } from "./academy-progress";
import { LAB_STEP_EVENT, lastLabStep } from "./lab-step";
import { LAB_DONE_EVENT, SocStation } from "./soc-station";
import "./single-lab.css";

// One lab on its own page. Widget labs render their interactive widget under a
// brief; markdown labs run in the step-by-step carousel. The same pieces the
// week view used, lifted onto a page of their own.
export function SingleLab({
  slug,
  title,
  phaseSlug,
  entrySlug,
  entryTitle,
  widget,
  markdown,
  accent,
  skill,
}: {
  slug: string;
  title: string;
  phaseSlug: string;
  entrySlug: string;
  /** The week that assigns this lab, for the way back to it. */
  entryTitle?: string;
  widget?: LabWidget;
  markdown?: string | null;
  /** The lab's colour and skill, for its workstation. */
  accent?: string;
  skill?: string;
}) {
  const { recordLabDone, isLabDone } = useAcademyProgress();
  const doneBefore = isLabDone(phaseSlug, entrySlug, slugify(title));
  const [justDone, setJustDone] = useState(false);
  // The workstation scene sets the stage, so it sits above the first step only.
  const [step, setStep] = useState(0);
  useEffect(() => {
    // The lab inside has already said where it is by now; take that, then follow it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStep(lastLabStep());
    const on = (e: Event) => setStep((e as CustomEvent<{ step: number }>).detail.step);
    window.addEventListener(LAB_STEP_EVENT, on);
    return () => window.removeEventListener(LAB_STEP_EVENT, on);
  }, []);
  const done = useCallback(() => {
    recordLabDone(phaseSlug, entrySlug, slugify(title));
    setJustDone(true);
    window.dispatchEvent(new Event(LAB_DONE_EVENT));
  }, [recordLabDone, phaseSlug, entrySlug, title]);

  // Where to go once it is done: back to the week that assigned it, or the floor.
  const finish = justDone ? (
    <section className="sl-done" aria-live="polite">
      <CheckCircle2 className="sl-done__icon" aria-hidden />
      <div className="sl-done__main">
        <p className="sl-done__kicker">Lab complete</p>
        <h2>{title}</h2>
        <p>It counts toward {entryTitle ?? "its week"}. Pick up the next one, or head back to the week.</p>
      </div>
      <div className="sl-done__go">
        {entryTitle && (
          <Link href={`/range/${phaseSlug}/${entrySlug}`} className="sl-done__btn">
            <ArrowLeft aria-hidden /> {entryTitle}
          </Link>
        )}
        <Link href="/range/labs" className="sl-done__btn sl-done__btn--main">
          <MonitorDot aria-hidden /> Back to all labs
        </Link>
      </div>
    </section>
  ) : null;

  return (
    <div className="sl">
      {/* Two ways back, because there are two ways in. A lab opened from the
          rail belongs to a week the student may never have seen, and finishing
          it is what finishes that week, so the week is the more useful of the
          two and goes first. */}
      <nav className="sl__backs">
        {entryTitle && (
          <Link href={`/range/${phaseSlug}/${entrySlug}`} className="sl__back">
            <ArrowLeft aria-hidden="true" /> {entryTitle}
          </Link>
        )}
        <Link href="/range/labs" className="sl__back sl__back--alt">All labs</Link>
      </nav>

      {step === 0 && <SocStation title={title} accent={accent ?? "#5546e0"} skill={skill ?? "Lab"} />}

      {widget ? (
        <>
          <LabBrief lab={widget} title={title} ask={widget !== "risk-triage"}>
            {widget === "risk-triage" ? (
              <RiskTriageLab onDone={done} />
            ) : widget === "hash-verify" ? (
              <HashVerifyLab onDone={done} />
            ) : widget === "signin-log" ? (
              <SigninLogLab onDone={done} />
            ) : widget === "effective-access" ? (
              <EffectiveAccessLab onDone={done} />
            ) : widget === "network-map" ? (
              <NetworkMapLab onDone={done} />
            ) : (
              <PasswordTableLab onDone={done} />
            )}
          </LabBrief>
          {finish}
        </>
      ) : markdown ? (
        <>
          <h1 className="sl__title">{title}</h1>
          <LabCarousel key={slug} storageKey={slug} slides={splitMarkdownIntoSlides(markdown)} onDone={done} completeButton done={doneBefore || justDone} />
          {finish}
        </>
      ) : (
        <p className="sl__soon">This lab is still being written.</p>
      )}
    </div>
  );
}
