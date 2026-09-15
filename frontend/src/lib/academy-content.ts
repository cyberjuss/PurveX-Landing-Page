import "server-only";
import fs from "fs";
import path from "path";

const CONTENT_ROOT = path.join(process.cwd(), "src/content/academy");

export function loadLesson(relativePath: string): string | null {
  try {
    return fs.readFileSync(path.join(CONTENT_ROOT, relativePath), "utf-8");
  } catch {
    return null;
  }
}

export interface ContentSection {
  label: string;
  file: string;
}

export interface WeekDef {
  slug: string;
  title: string;
  summary: string;
  sections: ContentSection[];
}

export interface HomeLabDef {
  slug: string;
  title: string;
  summary: string;
  sections: ContentSection[];
}

// Only Phase 1 has real lesson content right now -- Phase 2 and 3's week
// folders in the source Drive are empty placeholders, same as this site
// reflects them (see their own page.tsx, not this manifest).
export const phase1Weeks: WeekDef[] = [
  {
    slug: "week-1",
    title: "Week 1 — CIA Triad",
    summary: "Confidentiality, integrity, availability, and how risk/threat/vulnerability fit together.",
    sections: [
      { label: "Lesson", file: "phase-1/week-1/lesson.md" },
      { label: "Resources", file: "phase-1/week-1/resources.md" },
    ],
  },
  {
    slug: "week-2",
    title: "Week 2 — Encryption & Hashing",
    summary: "Symmetric vs. asymmetric encryption, hashing, and where each one actually gets used.",
    sections: [],
  },
  {
    slug: "week-3",
    title: "Week 3 — Networking",
    summary: "TCP/IP, ports, protocols, TLS, and two hands-on Wireshark labs.",
    sections: [
      { label: "Lesson", file: "phase-1/week-3/lesson.md" },
      { label: "Lab: Wireshark Basics", file: "phase-1/week-3/lab-wireshark.md" },
      { label: "Lab: Network Forensics — Hidden Tear Ransomware", file: "phase-1/week-3/lab-forensics.md" },
      { label: "Resources", file: "phase-1/week-3/resources.md" },
    ],
  },
  {
    slug: "week-4",
    title: "Week 4 — Authentication, Authorization, Access Control",
    summary: "Broken access control, walked through end to end on a live target.",
    sections: [
      { label: "Lab: Broken Access Control (PortSwigger)", file: "phase-1/week-4/lab-triple-a.md" },
      { label: "Resources", file: "phase-1/week-4/resources.md" },
    ],
  },
];

export const phase1HomeLab: HomeLabDef = {
  slug: "home-lab-active-directory",
  title: "Home Lab — Active Directory",
  summary: "GovTech Financial: a fictional enterprise environment used for investigation and detection labs.",
  sections: [
    { label: "Infrastructure Overview", file: "phase-1/home-lab-ad/infrastructure-overview.md" },
  ],
};

export function findWeek(slug: string): WeekDef | undefined {
  return phase1Weeks.find((w) => w.slug === slug);
}
