"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, Footprints, LayoutGrid, Map as MapIcon } from "lucide-react";
import "./soc-floor.css";
import "./soc-world.css";
import type { LabMeta } from "@/lib/academy-labs";
import { LabGallery } from "./lab-gallery";
import { LabMap } from "./lab-map";
import { SocLoading } from "./soc-loading";
import { useSocFloor, type SocLab } from "./use-soc-floor";
import { canWebGL } from "./soc-office-3d-check";

// The 3D office is the heaviest thing on the site, so it loads only here and
// only when it is shown. Its loading screen shows while the code downloads.
const SocOffice3D = dynamic(() => import("./soc-office-3d").then((m) => m.SocOffice3D), {
  ssr: false,
  loading: () => (
    <div className="sw sw--3d">
      <SocLoading />
    </div>
  ),
});

type View = "3d" | "map" | "list";
const VIEW_KEY = "academy-labs-view";

function Floor({ labs }: { labs: SocLab[] }) {
  const floor = useSocFloor(labs);
  return (
    <div className="sw-wrap">
      <SocOffice3D floor={floor} />
    </div>
  );
}

// The Labs page: the labs as a line map (the default) or the plain card list,
// and, for anyone who wants it, the SOC floor in 3D behind "Walk the floor".
// 3D is heavy and slower than a click, so nobody lands in it without asking;
// once someone chooses it, that choice is remembered like the others.
export function LabsView({ labs }: { labs: (LabMeta & { week?: string; phase?: string })[] }) {
  const [view, setView] = useState<View>("map");
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
    if (saved === "list") setView("list");
    else if (saved === "3d" && ok) setView("3d");
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
      {webgl &&
        (view === "3d" ? (
          <button type="button" className="lv-walk is-on" onClick={() => pick("map")}>
            <ArrowLeft aria-hidden /> Leave the floor
          </button>
        ) : (
          <button type="button" className="lv-walk" onClick={() => pick("3d")}>
            <Footprints aria-hidden /> Walk the floor
          </button>
        ))}
    </div>
  );

  if (view === "list") return <LabGallery labs={labs} tools={toggle} />;

  return (
    <div className="lv">
      <header className="lv__head">
        <div>
          <p className="lg__kicker">Hands-on</p>
          <h1>{view === "map" ? "Your lab route" : "The SOC floor"}</h1>
          <p className="lg__sub">
            {view === "map"
              ? "Every lab is a stop on one line, with a color for each week. Work it from start to finish."
              : "The PurveX Financial SOC. Walk the floor, talk to the team to learn the environment, and sit at a workstation to work its lab."}
          </p>
        </div>
        {toggle}
      </header>
      {view === "map" ? <LabMap labs={labs} /> : <Floor labs={labs} />}
    </div>
  );
}
