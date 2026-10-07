"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgeCheck, BookMarked, FlaskConical, Gauge, Home, Target } from "lucide-react";

/* One flat row of the places a student can go, in the same spot on every
   portal page. Before this, the sidebar was the only nav and it is hidden on
   the course home, so Labs and Reference had no route in from there -- and
   Readiness and Portfolio had no route in at all beyond a score tile and the
   account dropdown. Deliberately flat: no nesting, no dropdowns, six items.
   The label on each one is the kicker the destination page already prints, so
   a click never lands on a page calling itself something else. */
const PLACES = [
  { href: "/range", label: "Home", Icon: Home },
  { href: "/range/drill", label: "Drills", Icon: Target },
  { href: "/range/labs", label: "Labs", Icon: FlaskConical },
  { href: "/range/reference", label: "Reference", Icon: BookMarked },
  { href: "/range/readiness", label: "Readiness", Icon: Gauge },
  { href: "/range/portfolio", label: "Portfolio", Icon: BadgeCheck },
] as const;

export function RangePlaces() {
  const pathname = usePathname();
  // Home only matches exactly -- every other portal path would light it up.
  // The rest match their subtree, so a single lab keeps Labs marked.
  const isHere = (href: string) =>
    href === "/range" ? pathname === "/range" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="ax-places" aria-label="Range">
      <ul className="ax-places__list">
        {PLACES.map(({ href, label, Icon }) => {
          const here = isHere(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`ax-places__link${here ? " ax-places__link--on" : ""}`}
                aria-current={here ? "page" : undefined}
              >
                <Icon className="ax-places__icon" aria-hidden />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
