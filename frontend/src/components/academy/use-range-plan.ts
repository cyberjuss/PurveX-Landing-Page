"use client";

import { useEffect, useRef, useState } from "react";
import { academyFetch } from "@/lib/academy-client";

/** Whether the signed-in account is on Range Pro. Undefined until the first
 *  read lands, so a caller that must not show a Pro-only control by default
 *  (see ChallengeRecorder, gated through MissionPager's recordLabel) treats
 *  undefined the same as false rather than flashing the control on. */
export function useIsRangePro(): boolean {
  const [isPro, setIsPro] = useState(false);
  const asked = useRef(false);
  useEffect(() => {
    if (asked.current) return;
    asked.current = true;
    academyFetch("/academy/api/plan", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { plan?: string } | null) => setIsPro(d?.plan === "pro"))
      .catch(() => {});
  }, []);
  return isPro;
}
