"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Box, LayoutGrid, Map as MapIcon } from "lucide-react";
import "./soc-floor.css";
import "./soc-world.css";
import type { LabMeta } from "@/lib/academy-labs";
import { LabGallery } from "./lab-gallery";
import { SocGuide } from "./soc-guide";
import { SocPlan } from "./soc-world";
import { useSocFloor, type SocLab } from "./use-soc-floor";
import { canWebGL } from "./soc-office-3d-check";

// The 3D office is the heaviest thing on the site, so it loads only here and
// only when it is shown.
const SocOffice3D = dynamic(() => import("./soc-office-3d").then((m) => m.SocOffice3D), {
  ssr: false,
  loading: () => <div className="sw sw--loading">Opening the floor…</div>,
});

type View = "3d" | "plan" | "list";
const VIEW_KEY = "academy-labs-view";

function Floor({ labs, view }: { labs: SocLab[]; view: "3d" | "plan" }) {
  const floor = useSocFloor(labs);
  return (
    <div className="sw-wrap">
      {view === "3d" ? <SocOffice3D floor={floor} /> : <SocPlan floor={floor} />}
      <SocGuide floor={floor} mapFrame={view === "plan"} />
    </div>
  );
}

// The Labs page: the SOC floor in 3D, the same floor as a plan from above,
// or the plain card list. 3D falls back to the plan on a device without WebGL.
// The choice is remembered.
export function LabsView({ labs }: { labs: (LabMeta & { week?: string })[] }) {
  const [view, setView] = useState<View>("3d");
  const [webgl, setWebgl] = useState(true);
  useEffect(() => {
    const ok = canWebGL();
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem(VIEW_KEY);
    } catch {}
    // Storage and WebGL are browser-only, so the saved choice arrives after the first paint.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWebgl(ok);
    if (saved === "list" || saved === "plan") setView(saved);
    else if (!ok) setView("plan");
  }, []);
  const pick = (v: View) => {
    setView(v);
    try {
      window.localStorage.setItem(VIEW_KEY, v);
    } catch {}
  };

  const toggle = (
    <div className="lv-toggle" role="group" aria-label="Labs view">
      {webgl && (
        <button type="button" aria-pressed={view === "3d"} onClick={() => pick("3d")}>
          <Box aria-hidden /> 3D
        </button>
      )}
      <button type="button" aria-pressed={view === "plan"} onClick={() => pick("plan")}>
        <MapIcon aria-hidden /> Plan
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
          <p className="lg__sub">The PurveX Financial SOC. Walk the floor, sit at a workstation to work its lab, or stop by the Coach.</p>
        </div>
        {toggle}
      </header>
      <Floor labs={labs} view={view} />
    </div>
  );
}
