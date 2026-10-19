"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, MonitorDot } from "lucide-react";
import type { LabMeta } from "@/lib/academy-labs";
import { LabGallery } from "./lab-gallery";
import { SocFloor } from "./soc-floor";

const VIEW_KEY = "academy-labs-view";

// The Labs page: the SOC floor by default, with the plain card list one click
// away for anyone who would rather search. The choice is remembered.
export function LabsView({ labs }: { labs: LabMeta[] }) {
  const [view, setView] = useState<"floor" | "list">("floor");
  useEffect(() => {
    try {
      // Storage is browser-only, so the saved choice arrives after the first paint.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (window.localStorage.getItem(VIEW_KEY) === "list") setView("list");
    } catch {}
  }, []);
  const pick = (v: "floor" | "list") => {
    setView(v);
    try {
      window.localStorage.setItem(VIEW_KEY, v);
    } catch {}
  };

  const toggle = (
    <div className="lv-toggle" role="group" aria-label="Labs view">
      <button type="button" aria-pressed={view === "floor"} onClick={() => pick("floor")}>
        <MonitorDot aria-hidden /> SOC floor
      </button>
      <button type="button" aria-pressed={view === "list"} onClick={() => pick("list")}>
        <LayoutGrid aria-hidden /> List
      </button>
    </div>
  );

  return view === "list" ? (
    <>
      {toggle}
      <LabGallery labs={labs} />
    </>
  ) : (
    <div className="lv">
      <header className="lv__head">
        <div>
          <p className="lg__kicker">Hands-on</p>
          <h1>The SOC floor</h1>
          <p className="lg__sub">Every lab is a workstation. Pick one, sit down, and work the task on its screens.</p>
        </div>
        {toggle}
      </header>
      <SocFloor labs={labs} />
    </div>
  );
}
