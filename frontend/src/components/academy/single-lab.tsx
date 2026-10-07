"use client";

import { useCallback } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Markdown, splitMarkdownIntoSlides } from "@/lib/markdown";
import type { LabWidget } from "@/lib/academy-content";
import { LabCarousel } from "./lab-carousel";
import { LabBrief } from "./labs/lab-brief";
import { HashVerifyLab } from "./labs/hash-verify-lab";
import { PasswordTableLab } from "./labs/password-table-lab";
import { RiskTriageLab } from "./labs/risk-triage-chat";
import { SigninLogLab } from "./labs/signin-log-lab";
import { EffectiveAccessLab } from "./labs/effective-access-lab";
import { slugify, useAcademyProgress } from "./academy-progress";
import "./single-lab.css";

// One lab on its own page. Widget labs render their interactive widget under a
// brief; markdown labs run in the step-by-step carousel. The same pieces the
// week view used, lifted onto a page of their own.
export function SingleLab({
  slug,
  title,
  phaseSlug,
  entrySlug,
  widget,
  markdown,
}: {
  slug: string;
  title: string;
  phaseSlug: string;
  entrySlug: string;
  widget?: LabWidget;
  markdown?: string | null;
}) {
  const { recordLabDone } = useAcademyProgress();
  const done = useCallback(() => recordLabDone(phaseSlug, entrySlug, slugify(title)), [recordLabDone, phaseSlug, entrySlug, title]);

  return (
    <div className="sl">
      <Link href="/range/labs" className="sl__back"><ArrowLeft aria-hidden="true" /> All labs</Link>

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
            ) : (
              <PasswordTableLab onDone={done} />
            )}
          </LabBrief>
        </>
      ) : markdown ? (
        <>
          <h1 className="sl__title">{title}</h1>
          <LabCarousel key={slug} storageKey={slug} slides={splitMarkdownIntoSlides(markdown)} onDone={done} />
        </>
      ) : (
        <p className="sl__soon">This lab is still being written.</p>
      )}
    </div>
  );
}
