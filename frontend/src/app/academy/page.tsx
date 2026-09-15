import Link from "next/link";
import { ArrowRight, BookOpen, Radar, Siren } from "lucide-react";

const phases = [
  {
    href: "/academy/phase-1",
    icon: BookOpen,
    tag: "Phase 1",
    title: "Fundamentals",
    body: "CIA triad, networking, encryption & hashing, authentication and access control.",
    status: "available" as const,
  },
  {
    href: "/academy/phase-2",
    icon: Radar,
    tag: "Phase 2",
    title: "Threat Detection & Log Analysis",
    body: "Malware, log analysis, SIEM fundamentals, and detection engineering.",
    status: "available" as const,
  },
  {
    href: "/academy/phase-3",
    icon: Siren,
    tag: "Phase 3",
    title: "Incident Response",
    body: "Triage, investigation, containment, and writing it up.",
    status: "coming-soon" as const,
  },
];

export default function AcademyHomePage() {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#5546e0]">Course overview</p>
      <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        Think Like a SOC Analyst 101
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
        A hands-on path from security fundamentals to incident response, built around real logs, real
        tools, and real labs.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {phases.map((phase) => (
          <Link
            key={phase.href}
            href={phase.href}
            className="group flex items-start gap-4 rounded-2xl border border-[var(--pvrx-border-light)] bg-white p-5 transition hover:border-slate-300 hover:shadow-[0_18px_48px_-30px_rgba(15,23,42,0.25)]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[rgba(106,92,255,0.1)] text-[#5546e0]">
              <phase.icon className="h-5 w-5" />
            </span>
            <span className="flex-1">
              <span className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#5546e0]">{phase.tag}</span>
                {phase.status === "coming-soon" && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Coming soon
                  </span>
                )}
              </span>
              <span className="mt-1 block font-display text-base font-semibold text-slate-900">{phase.title}</span>
              <span className="mt-1 block text-sm text-slate-500">{phase.body}</span>
            </span>
            <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#5546e0]" />
          </Link>
        ))}
      </div>
    </div>
  );
}
