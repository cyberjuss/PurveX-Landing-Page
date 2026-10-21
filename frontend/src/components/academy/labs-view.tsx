"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, Map as MapIcon } from "lucide-react";
import type { LabMeta } from "@/lib/academy-labs";
import { LabGallery } from "./lab-gallery";
import { LabMap } from "./lab-map";

type View = "map" | "list";
const VIEW_KEY = "academy-labs-view";

// The Labs page: the labs as a line map (the default) or the plain card list.
export function LabsView({ labs }: { labs: (LabMeta & { week?: string; phase?: string })[] }) {
  const [view, setView] = useState<View>("map");
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(VIEW_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved === "list") setView("list");
    } catch {}
  }, []);
  const pick = (v: View) => {
    setView(v);
    try {
      window.localStorage.setItem(VIEW_KEY, v);
    } catch {}
  };

  const toggle = (
    <div className="lv-views">
      <div className="lv-toggle" role="group" aria-label="Labs view">
        <button type="button" aria-pressed={view === "map"} onClick={() => pick("map")}>
          <MapIcon aria-hidden /> Map
        </button>
        <button type="button" aria-pressed={view === "list"} onClick={() => pick("list")}>
          <LayoutGrid aria-hidden /> List
        </button>
      </div>
    </div>
  );

  if (view === "list") return <LabGallery labs={labs} tools={toggle} />;

  return (
    <div className="lv">
      <header className="lv__head">
        <div>
          <p className="lg__kicker">Hands-on</p>
          <h1>Your lab route</h1>
          <p className="lg__sub">Every lab is a stop on one line, with a color for each week. Work it from start to finish.</p>
        </div>
        {toggle}
      </header>
      <LabMap labs={labs} />
    </div>
  );
}
