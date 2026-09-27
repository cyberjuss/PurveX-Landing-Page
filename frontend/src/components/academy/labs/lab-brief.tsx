"use client";

import { Clock, MessageCircle } from "lucide-react";
import { ROLES } from "@/lib/academy-certs";
import type { LabWidget } from "@/lib/academy-content";
import { LAB_BRIEFS, labObjective } from "@/lib/academy-lab-briefs";
import { useOptionalCoach } from "../coach-context";
import "./lab-kit.css";

export const LOST_ASK = "I'm lost on this step. Give me a hint, not the answer.";

/** Above each browser lab: the real problem, today's situation, and the student's objective for their role. */
export function LabBrief({ lab, title }: { lab: LabWidget; title: string }) {
  const coach = useOptionalCoach();
  const brief = LAB_BRIEFS[lab];
  const goal = labObjective(lab, coach?.profile?.roles);
  const role = goal.role ? ROLES.find((r) => r.id === goal.role)?.short : null;
  return (
    <header className="lb">
      <h3>{title}</h3>
      <dl>
        <div>
          <dt>The real problem</dt>
          <dd>{brief.problem}</dd>
        </div>
        <div>
          <dt>Today at PurveX</dt>
          <dd>{brief.today}</dd>
        </div>
        <div className="lb__goal">
          <dt>Your objective{role ? ` · ${role}` : ""}</dt>
          <dd>{goal.text}</dd>
        </div>
      </dl>
      <div className="lb__foot">
        <span>
          <Clock aria-hidden="true" /> About {brief.minutes} min{brief.tools.length ? ` · ${brief.tools.join(", ")}` : ""}
        </span>
        {coach?.enabled && (
          <button type="button" className="lk-mini" onClick={() => coach.ask(LOST_ASK)}>
            <MessageCircle aria-hidden="true" /> Lost? Ask Coach
          </button>
        )}
      </div>
    </header>
  );
}
